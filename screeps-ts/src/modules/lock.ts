import { Helper } from 'utils';

export namespace Lock {
    export function init(id: string): void {
        if (!Memory.lock) {
            Memory.lock = {}
        }
        if (!Memory.lock[id]) {
            Memory.lock[id] = {
                total: {},
                detail: {}
            }
        }
    }
    export function get(id: string): Lock {
        init(id);
        return Memory.lock[id];
    }
    export function add(id: string, name: string, store: store): OK | ERR_NAME_EXISTS {
        let lock = get(id);
        let lockDetail = lock.detail;
        if (lockDetail[name]) {
            return ERR_NAME_EXISTS;
        } else {
            lockDetail[name] = store;
            lock.total = Helper.storeAdd(lock.total, store);
            return OK;
        }
    }
    export function addAnonymous(id: string, store: store): string {
        let lock = get(id);
        let lockDetail = lock.detail;
        let iterator = 1;
        let baseName = Game.time.toString();
        let newName = baseName+'_'+iterator.toString();
        while(lockDetail[newName]){
            iterator += 1;
            newName = baseName+'_'+iterator.toString();
        }
        lockDetail[newName] = store;
        lock.total = Helper.storeAdd(lock.total, store);
        return newName;
    }
    export function release(id: string, name: string):OK|ERR_NOT_FOUND{
        let lock = get(id);
        let lockDetail = lock.detail;
        if (!lockDetail[name]){
            return ERR_NOT_FOUND;
        }
        lock.total = Helper.storeMinus(lock.total, lockDetail[name]);
        delete lockDetail[name];
        return OK;
    }
}