import states from 'state'
import roles from 'role'
import { Moment } from 'modules/moment'
import { Lock } from 'modules/lock'
import { Helper } from 'helper'
import { Group } from 'modules/group'
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
        if (!this.memory.registered) {
            Group.register(this);
        }
        // 执行当前状态
        let stateContinue: StateContinue = this.runCurrentState();
        while (stateContinue == StateContinue.Exit) {
            let roleConfig: IRoleConfig = roles[this.memory.role]();
            let { newState, data } = roleConfig.emit(this);
            this.transiteState(newState, data);
            if (newState == "idle") {
                break;
            }
            stateContinue = this.runCurrentState();
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
    /**
     * 获得特定state的存储信息
     * @param  {string} state
     * @returns returnthis
     */
    public getStateData(state: string): StateMemoryData {
        if (!this.memory.state) {
            this.memory.state = { currentState: "idle", data: {} };
        }
        return this.memory.state.data[state];
    }
    /**
     * 获得当前处于的状态，默认为idel
     */
    public getCurrentState(): StateConstant {
        if (!this.memory.state) {
            this.memory.state = { currentState: "idle", data: {} };
        }
        let currentState = this.memory.state.currentState as StateConstant;
        if (!currentState) {
            return "idle";
        } else {
            return currentState;
        }
    }
    /**
     * 获取当前状态对应的存储信息
     */
    public getCurrentStateData(): StateMemoryData {
        return this.getStateData(this.getCurrentState());
    }
    /**
     * 手动设置当前状态
     * @param  {StateConstant} state
     */
    public setCurrentState(state: StateConstant): void {
        if (!this.memory.state) {
            this.memory.state = { currentState: state, data: {} };
        } else {
            this.memory.state.currentState = state;
        }
    }
    /**
     * 执行当前的状态的所有action
     * 会检测这个state下所有的action与已经安排的action是否有冲突
     * 当且仅当所有的action都没有冲突，且所有的action都返回StateContinue.Exit时，说明该状态已完结。
     */
    public runCurrentState(): StateContinue {
        let currentState = this.getCurrentState();
        if (currentState == "idle") {
            return StateContinue.Exit;
        }
        let stateConfig: IStateConfig = states[currentState]();
        let actions = stateConfig.actions;
        let actionNames: ActionConstant[] = Object.keys(actions) as ActionConstant[];
        let stateContinue: StateContinue = StateContinue.Exit;
        for (const actionName of actionNames) {
            if (Moment.testAction(this.id, actionName)) {
                let action = actions[actionName];
                let actionReturnCode = action(this);
                if (actionReturnCode == StateContinue.Continue) {
                    stateContinue = StateContinue.Continue;
                }
            } else {
                stateContinue = StateContinue.Continue;
            }
        }
        return stateContinue;
    }
    /**
     * 状态转移，从currentState转移到指定的新state，会依次调用老状态的onExit和新状态的onEnter
     * @param  {StateConstant} newState
     * @param  {StateData} data
     */
    public transiteState(newState: StateConstant, data: StateData) {
        let currentState = this.getCurrentState();
        if (currentState) {
            let stateConfig: IStateConfig = states[currentState]();
            stateConfig.onExit(this);
        }
        if (newState) {
            this.setCurrentState(newState);
            let newStateConfig: IStateConfig = states[newState]();
            newStateConfig.onEnter(this, data);
        } else {
            this.setCurrentState("idle");
        }
    }
    /**
     * say 方向，动作注册
     * @param  {DirectionConstant|Creep} target
     */
    public move(target: DirectionConstant | Creep): CreepMoveReturnCode | OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS {
        if (target instanceof Creep) {

        } else {
            this.say(directions[target - 1], true);
        }
        let retCode = this._move(target);
        if (retCode == OK) Moment.setAction(this.id, "move");
        return retCode;
    }
    /**
     * withdraw成功时记录到moment中，动作注册
     * @param  {Structure|Tombstone|Ruin} target
     * @param  {ResourceConstant} resourceType
     * @param  {number} amount?
     */
    public withdraw(target: Structure | Tombstone | Ruin, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode {
        let returnCode = this._withdraw(target, resourceType, amount);
        if (returnCode == OK) {
            Moment.setAction(this.id,"withdraw");
            let delta: number = 0;
            if (amount) {
                delta = amount;
            } else {
                let targetStore = target as IHasStore;
                delta = Math.min(this.store.getFreeCapacity(resourceType), targetStore.store[resourceType]);
            }
            let storeChange: store = {};
            storeChange[resourceType] = delta;
            Moment.setStoreChange(this.id, "in", storeChange);
            Moment.setStoreChange(target.id, "out", storeChange);
        }
        return returnCode;
    }
    /**
     * transfer成功时记录到Moment中，动作注册
     * @param  {AnyCreep|Structure} target
     * @param  {ResourceConstant} resourceType
     * @param  {number} amount?
     */
    public transfer(target: AnyCreep | Structure, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode {
        let returnCode = this._transfer(target, resourceType, amount);
        if (returnCode == OK) {
            Moment.setAction(this.id,"transfer");
            let delta: number = 0;
            if (amount) {
                delta = amount;
            } else {
                let targetStore = target as IHasStore;
                delta = Math.min(targetStore.store.getFreeCapacity(resourceType), this.store[resourceType]);
            }
            let storeChange: store = {};
            storeChange[resourceType] = delta;
            Moment.setStoreChange(this.id, "out", storeChange);
            Moment.setStoreChange(target.id, "in", storeChange);
        }
        return returnCode;
    }
    /**
     * upgrade成功时记录到Moment中，动作注册
     * @param  {StructureController} target
     */
    public upgradeController(target: StructureController): ScreepsReturnCode {
        let returnCode = this._upgradeController(target);
        if (returnCode == OK){
            Moment.setAction(this.id,"upgradeController");
            // 先不考虑boost
            let delta = Math.min(this.store[RESOURCE_ENERGY],this.getActiveBodyparts(WORK));
            let storeChange: store = {};
            storeChange[RESOURCE_ENERGY] = delta;
            Moment.setStoreChange(this.id, "out", storeChange);
        }
        return returnCode;
    }
}