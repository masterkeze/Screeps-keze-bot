/**
 * 基础状态机
 */
const states: {
    [state in BaseStateConstant]: () => IStateConfig
} = {
    /**
     * 抵达某处
     */
    reach: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateData_reach): StateContinue {
            return 0;
        },
        update(creep): StateContinue {
            return 0;
        },
        onExit(creep): void {

        }
    }),
    /**
     * 升级控制器
     */
    upgrade: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateData_upgrade): StateContinue {
            let stateData = creep.getStateData("upgrade");
            stateData.targetID = data.target.id;
            return 0;
        },
        update(creep): StateContinue {
            return 0;            
        },
        onExit(creep): void {

        }
    }),
    /**
     * 取一次资源
     */
    withdrawOnce:():IStateConfig=>({
        onEnter(creep:Creep,data:StateData_withdrawOnce):StateContinue{
            return 0
        },
        update(creep): StateContinue {
            return 0;            
        },
        onExit(creep): void {

        }
    })
}

export default states;
