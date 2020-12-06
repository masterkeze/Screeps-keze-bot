import states from 'state'
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
        if (!this.memory.role){
            // log 没找到role
            return;
        }

        // 注册creep
        if (this.memory.groupID){
            if (!this.memory.registered){
                this.memory.registered = this.register(this.memory.groupID);
            }
            if (!this.memory.registered){
                // log 没找到对应组
                return;
            }
        }

        // 执行当前状态
        let newState:string = this.runCurrentState();

    }

    public register(groupID:string): number{
        return 1;
    }

    public runCurrentState(){
        if (!this.memory.state){
            this.memory.state = {currentState:"",data:{}};
        }
        let currentState = this.memory.state.currentState;
        if (!currentState){
            return "";
        }
        
        const stateConfig :IStateConfig = states[currentState]();
        let newState = stateConfig.update(this);
    }
}