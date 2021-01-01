import { PriorityQueue } from 'modules/priorityQueue'
let spawnTaskManager = global.spawnTask as SpawnAsyncTaskManager;
const EXPIRE_PERIOD:number = 50000;

interface SpawnAsyncTask extends AsyncTaskBase {
    config:SpawnConfig
}

interface SpawnAsyncTaskMemory extends AsyncTaskMemoryBase {
    config:SpawnConfig
}

interface InternalStorage {
    [roomName: string]: PriorityQueue
}

class SpawnAsyncTaskManager implements AsyncTaskAction {
    _dict: InternalStorage = {};
    constructor() {
        this.load();
    }
        
    push(id, roomName, asyncTask: SpawnAsyncTask) {

        return OK;
    }
    peek(roomName:string): SpawnAsyncTask {
        let queue: PriorityQueue = this._dict[roomName];
        let raw: SpawnAsyncTaskMemory = queue.peek();
        let output: SpawnAsyncTask = this.deserialize(raw);
        return output;
    }
    pop(roomName:string): SpawnAsyncTask {
        let queue: PriorityQueue = this._dict[roomName];
        let raw: SpawnAsyncTaskMemory = queue.pop();
        let output: SpawnAsyncTask = this.deserialize(raw);
        return output;
    }
    load() {
        for (const [roomName, heap] of Object.entries(Memory.spawnTasks)) {
            this._dict[roomName] = new PriorityQueue(((a: SpawnAsyncTaskMemory, b: SpawnAsyncTaskMemory) => a.priority > b.priority), heap);
        }
    }
    save() {
        Memory.spawnTasks = {};
        for (const [roomName, queue] of Object.entries(this._dict)) {
            Memory.spawnTasks[roomName] = queue._heap;
        }
    }
    clean(){
        for (const [roomName, queue] of Object.entries(this._dict)) {
            let heap:AsyncTaskMemoryBase[] = queue._heap;
            heap = heap.filter((element)=>{return (element.ticksToExpired) && (element.ticksToExpired >= Game.time)});
        }
        this.save();
    }
    getPriority(AsyncTask: SpawnAsyncTask) {
        return 0;
    }
    getTicksToExpired(AsyncTask: SpawnAsyncTask) {
        return Game.time + EXPIRE_PERIOD;
    }
    serialize(AsyncTask) {
        let output: SpawnAsyncTaskMemory;
        return output;
    }
    deserialize(AsyncTaskMemory) {
        let output: SpawnAsyncTask;
        return output;
    }
}

export namespace SpawnAsyncTaskExport {
    /**
     * 挂载到global上，并初始化单例
     */
    export function load() {
        if (!Memory.spawnTasks) {
            Memory.spawnTasks = {};
        }
        global.spawnTask = new SpawnAsyncTaskManager();
        spawnTaskManager = global.spawnTask as SpawnAsyncTaskManager;
    }
    export function push(id: string, roomName: string, asyncTask: SpawnAsyncTask) {
        return spawnTaskManager.push(id, roomName, asyncTask);
    }
    export function peek(roomName: string) {
        return spawnTaskManager.peek(roomName);
    }
    export function pop(roomName: string) {
        return spawnTaskManager.pop(roomName);
    }
}



