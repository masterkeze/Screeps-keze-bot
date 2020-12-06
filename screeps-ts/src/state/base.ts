/**
 * 基础状态机
 */
const states : {
    [state in BaseStateConstant]:()=>IStateConfig
} = {
    /**
     * 抵达某处
     */
    reach : ():IStateConfig =>({
        onEnter(creep:Creep,data:StateData_reach):void{

        },
        update(creep):StateContinue{
            return 0
        },
        onExit(creep):void{

        }
    }),
    /**
     * 升级控制器
     */
}

export default states;
