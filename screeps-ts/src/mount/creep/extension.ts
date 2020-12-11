import states from 'state'
import { Moment } from 'modules/moment'
import { Lock } from 'modules/lock'
import { Helper } from 'utils'
const directions: string = '↑↗→↘↓↙←↖';
// creep 原型拓展
export default class CreepExtension extends Creep {
    /**
     * creep 通用执行结构
     * 1. 注册至group
     * 2. 执行当前状态
     * 3. 请求role，获取新状态
     * 4. 状态流转
     * 5. 如果新状态已结束，重复34
     */
    public work(): void {
        if (!this.memory.role) {
            // log 没找到role
            return;
        }

        // 注册creep
        if (this.memory.groupID) {
            if (!this.memory.registered) {
                this.memory.registered = this.register(this.memory.groupID);
            }
            if (!this.memory.registered) {
                // log 没找到对应组
                return;
            }
        }

        // 执行当前状态
        let newState: string = this.runCurrentState();

    }
    /**
     * 返回moment 储量
     * @param  {string} resourceType
     * @returns 如果传了resourceType，则返回具体的数值，否则返回store
     */
    public getMomentStore(resourceType?: string): store | number {
        let moment = Moment.get(this.id);
        if (resourceType) {
            let momentStore = moment.resourcesChange[resourceType];
            let actualStore = this.store[resourceType];
            if (!momentStore) momentStore = 0;
            if (!actualStore) actualStore = 0;
            return momentStore + actualStore;
        } else {
            return Helper.storeAdd(moment.resourcesChange, JSON.parse(JSON.stringify(this.store)) as store);
        }
    }
    /**
     * 返回上锁的储量
     * @param  {string} resourceType?
     * @returns 如果传了resourceType，则返回具体的数值，否则返回store
     */
    public getLockedStore(resourceType?: string): store | number {
        let lock = Lock.get(this.id);
        if (resourceType) {
            if (lock.total[resourceType]) {
                return lock.total[resourceType];
            } else {
                return 0;
            }
        } else {
            return lock.total;
        }
    }
    /**
     * 返回未上锁的储量 = moment储量 - 上锁的储量
     * @param  {string} resourceType?
     * @returns 如果传了resourceType，则返回具体的数值，否则返回store
     */
    public getUnlockedStore(resourceType?: string): store | number {
        let momentStore = this.getMomentStore(resourceType);
        let lockedStore = this.getLockedStore(resourceType);
        if (resourceType) {
            momentStore = momentStore as number;
            lockedStore = lockedStore as number;
            return momentStore - lockedStore;
        } else {
            momentStore = momentStore as store;
            lockedStore = lockedStore as store;
            return Helper.storeMinus(momentStore, lockedStore);
        }
    }
    /**
     * 给对象加锁
     * @param  {string} name
     * @param  {store} store
     */
    public addLock(name: string, store: store): OK | ERR_NAME_EXISTS | ERR_INVALID_ARGS | ERR_NOT_FOUND {
        // 需要校验store的有效性
        // 1. 不为空
        let resourceTypes = Object.keys(store);
        if (resourceTypes.length == 0) return ERR_INVALID_ARGS;
        // 2. 不为负
        let minValue = Math.min(...Object.values(store));
        if (minValue < 0) return ERR_INVALID_ARGS;
        // 3. 空间是否足够
        let storeDiff = Helper.storeMinus(this.getUnlockedStore() as store, store);
        let minStoreDiff = Math.min(...Object.values(storeDiff));
        if (minStoreDiff < 0) return ERR_INVALID_ARGS;
        // 加锁
        return Lock.add(this.id, name, store);
    }

    public register(groupID: string): number {
        return 1;
    }

    public getStateData(state: string): StateMemoryData {
        if (!this.memory.state) {
            this.memory.state = { currentState: "", data: {} };
        }
        return this.memory.state.data[state];
    }

    public runCurrentState():""|StateConstant {
        if (!this.memory.state) {
            this.memory.state = { currentState: "", data: {} };
        }
        let currentState = this.memory.state.currentState as StateConstant;
        if (!currentState) {
            return "";
        }

        let stateConfig: IStateConfig = states[currentState]();
        let actions = stateConfig.actions;
        let actionNames: ActionConstant[] = Object.keys(actions) as ActionConstant[];
        let stateContinue: StateContinue = StateContinue.Exit;
        for (const actionName of actionNames) {
            if (Moment.setAction(this.id, actionName) == OK) {
                let action = actions[actionName];
                let actionReturnCode = action(this);
                if (actionReturnCode == StateContinue.Continue) {
                    stateContinue = StateContinue.Continue;
                }
            } else {
                stateContinue = StateContinue.Continue;
            }
        }

        if (stateContinue == StateContinue.Continue) {
            return currentState;
        } else {
            return "";
        }
    }

    public move(target: DirectionConstant | Creep): CreepMoveReturnCode | OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS {
        if (target instanceof Creep) {

        } else {
            this.say(directions[target - 1], true);
        }
        return this._move(target);
    }
    /**
     * withdraw成功时记录到moment中
     * @param  {Structure|Tombstone|Ruin} target
     * @param  {ResourceConstant} resourceType
     * @param  {number} amount?
     */
    public withdraw(target: Structure | Tombstone | Ruin, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode{
        let returnCode = this._withdraw(target,resourceType,amount);
        if (returnCode == OK){
            let delta:number = 0;
            if (amount){
                delta = amount;
            }else{
                let targetStore = target as IHasStore;
                delta = Math.min(this.store.getFreeCapacity(resourceType),targetStore.store[resourceType]);
            }
            let storeChange:store = {};
            storeChange[resourceType] = delta;
            Moment.setStoreChange(this.id,"in",storeChange);
            Moment.setStoreChange(target.id,"out",storeChange);
        }
        return returnCode;
    }
}