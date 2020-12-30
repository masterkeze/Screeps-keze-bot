import { PriorityQueue } from 'modules/priorityQueue'
let spawnTaskManager = global.spawnTask as SpawnAsyncTaskManager;
interface SpawnAsyncTask extends AsyncTaskBase {

}

interface SpawnAsyncTaskMemory extends AsyncTaskMemoryBase {

}

interface InternalStorage {
    [roomName: string]: PriorityQueue
}

class SpawnAsyncTaskManager implements AsyncTaskAction {
    _dict: InternalStorage = {};
    constructor() {
        this.load();
    }
    
    public get value() : string {
        return 
    }
    
    push(id, roomName, asyncTask: SpawnAsyncTask) {

        return OK;
    }
    peek(roomName): AsyncTaskBase {
        let queue: PriorityQueue = this._dict[roomName];
        let raw: SpawnAsyncTaskMemory = queue.peek();
        let output: SpawnAsyncTask = this.deserialize(raw);
        return output;
    }
    pop(roomName) {
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
        Memory.spawnTasks = {}
        for (const [roomName, queue] of Object.entries(this._dict)) {
            Memory.spawnTasks[roomName] = queue._heap;
        }
    }
    clean(){

    }
    getPriority(AsyncTask: SpawnAsyncTask) {
        return 0;
    }
    getTicksToExpired(AsyncTask: SpawnAsyncTask) {
        return Game.time + 50000;
    }
    serialize(AsyncTask) {
        let output: AsyncTaskMemoryBase;
        return output;
    }
    deserialize(AsyncTaskMemory) {
        let output: AsyncTaskBase;
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
}



