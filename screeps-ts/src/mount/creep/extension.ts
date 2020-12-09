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
     * 返回moment store,如果传了resourceType，则返回具体的数值，否则返回store
     * @param  {string} resourceType
     * @returns store|number
     */
    public getMomentStore(resourceType?: string): store | number {
        let moment = Moment.get(this.id);
        if (resourceType) {
            return moment.resourcesChange[resourceType] + this.store[resourceType];
        } else {
            return Helper.storeAdd(moment.resourcesChange, JSON.parse(JSON.stringify(this.store)) as store);
        }
    }
    public getLockedStore(resourceType?: string): store | number {
        let lock = Lock.get(this.id);
        return lock.total;
    }
    public getUnlockedStore(resourceType?: string): store | number {
        let lock = Lock.get(this.id);
        return lock.total;
    }
    public addLock(name: string, store: store): OK | ERR_NAME_EXISTS | ERR_INVALID_ARGS {
        let lock = Lock.get(this.id);
        // 需要校验store的有效性
        // 1. 不为空
        let resourceTypes = Object.keys(store);
        if (resourceTypes.length == 0) return ERR_INVALID_ARGS;
        // 2. 不为负
        let minValue = Math.min(...Object.values(store));
        if (minValue <= 0) return ERR_INVALID_ARGS;

        return OK;
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

    public runCurrentState() {
        if (!this.memory.state) {
            this.memory.state = { currentState: "", data: {} };
        }
        let currentState = this.memory.state.currentState;
        if (!currentState) {
            return "";
        }

        const stateConfig: IStateConfig = states[currentState]();
    }

    public move(target: DirectionConstant | Creep): CreepMoveReturnCode | OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS {
        if (target instanceof Creep) {

        } else {
            this.say(directions[target - 1], true);
        }
        return this._move(target);
    }

    public moveTo(
        target: RoomPosition | { pos: RoomPosition },
        opts?: MoveToOpts,
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        return this._moveTo(target, opts);
    }
}