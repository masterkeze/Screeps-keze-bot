class SpawnEventManager implements EventAction{
    push(id,roomName,event){
        
        return OK;
    }
    peek(roomName){
        let output:EventBase;
        return output;
    }
    pop(roomName){
        let output:EventBase;
        return output;
    }
    load(){}
    save(){}
    getPriority(event){
        return 0;
    }
    getTicksToExpired(event){
        return 0;
    }
    serialize(event){
        let output:EventMemoryBase;
        return output;
    }
    deserialize(eventMemory){
        let output:EventBase;
        return output;
    }
}

let spawnEventManager:SpawnEventManager = new SpawnEventManager();

export namespace SpawnEvent {
    export function push(id:string,roomName:String,event:EventBase){
        return spawnEventManager.push(id,roomName,event);
    }
}



