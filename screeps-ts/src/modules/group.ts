import groups from './groups';

export namespace Group {
    export function init(room: string,type: GroupConstant): void {
        if (!Memory.group) {
            Memory.group = {}
        }

    }
    export function getConfig(name: string){
        
    }
    export function register(creep: Creep):void{
        creep.memory.registered = 1;
    }
}