import { PriorityQueue } from 'modules/priorityQueue'

const EXPIRE_PERIOD:number = 50000;

interface InternalStorage {
    [roomName: string]: PriorityQueue
}

class SpawnAsyncTaskManager implements AsyncTaskAction {
    _dict:InternalStorage = {};
    push(id, roomName, asyncTask: SpawnAsyncTask) {
        if (!this._dict[roomName]){
            this._dict[roomName] = new PriorityQueue(((a: SpawnAsyncTaskMemory, b: SpawnAsyncTaskMemory) => a.priority > b.priority), []);
        }
        let queue: PriorityQueue = this._dict[roomName];
        let priority = this.getPriority(asyncTask);
        let ticksToExpired = this.getTicksToExpired(asyncTask); 
        let preparedTask:any = asyncTask;
        preparedTask.priority = priority;
        preparedTask.ticksToExpired = ticksToExpired;
        queue.push(asyncTask);
        console.log("pushing spawn task");
        return OK;
    }
    peek(roomName:string): SpawnAsyncTaskMemory {
        let queue: PriorityQueue = this._dict[roomName];
        if (!queue){
            this._dict[roomName] = new PriorityQueue(((a: SpawnAsyncTaskMemory, b: SpawnAsyncTaskMemory) => a.priority > b.priority), []);
            return null;
        }
        let raw: SpawnAsyncTaskMemory = queue.peek();
        console.log("peeking spawn task");
        return raw;
    }
    pop(roomName:string): SpawnAsyncTaskMemory {
        let queue: PriorityQueue = this._dict[roomName];
        if (!queue){
            this._dict[roomName] = new PriorityQueue(((a: SpawnAsyncTaskMemory, b: SpawnAsyncTaskMemory) => a.priority > b.priority), []);
            return null;
        }
        let raw: SpawnAsyncTaskMemory = queue.pop();
        console.log("poping spawn task");
        return raw;
    }
    load() {
        for (const [roomName, heap] of Object.entries(Memory.spawnTasks)) {
            this._dict[roomName] = new PriorityQueue(((a: SpawnAsyncTaskMemory, b: SpawnAsyncTaskMemory) => a.priority > b.priority), heap);
        }
        console.log("loading spawn task");
    }
    save() {
        Memory.spawnTasks = {};
        for (const [roomName, queue] of Object.entries(this._dict)) {
            Memory.spawnTasks[roomName] = queue._heap;
        }
        console.log("saving spawn task");
    }
    clean(){
        for (const [roomName, queue] of Object.entries(this._dict)) {
            let heap:AsyncTaskMemoryBase[] = queue._heap;
            heap = heap.filter((element)=>{return (element.ticksToExpired) && (element.ticksToExpired >= Game.time)});
        }
        this.save();
        console.log("cleaning spawn task");
    }
    getPriority(asyncTask: SpawnAsyncTask) {
        return 0;
    }
    getTicksToExpired(asyncTask: SpawnAsyncTask) {
        return Game.time + EXPIRE_PERIOD;
    }
}

export namespace SpawnAsyncTaskExport {
    export function init(){
        if (!Memory.spawnTasks) {
            Memory.spawnTasks = {};
        }
    }
    /**
     * 挂载到global上，并初始化单例
     */
    export function mount() {
        global.spawnTask = new SpawnAsyncTaskManager();
        global.spawnTask.save();
        //global.spawnTask.peek("a");
    }
}



