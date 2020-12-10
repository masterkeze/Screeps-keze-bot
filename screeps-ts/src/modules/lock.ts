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
    /**
     * 通过对象标识，获取对象的锁信息
     * @param  {string} id
     */
    export function get(id: string): Lock {
        init(id);
        return Memory.lock[id];
    }
    /**
     * 给对象加锁，指定名称与上锁的资源包，这里不做控制，只做记录，如果重名，则会报错
     * @param  {string} id
     * @param  {string} name
     * @param  {store} store
     */
    export function add(id: string, name: string, store: store): OK | ERR_NAME_EXISTS | ERR_NOT_FOUND {
        if (!name) return ERR_NOT_FOUND;
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
    /**
     * 给对象添加匿名锁，不做控制，会返回随机生成的锁名称
     * @param  {string} id
     * @param  {store} store
     */
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
    /**
     * 释放对象的锁，如果锁不存在则返回ERR_NOT_FOUND
     * @param  {string} id
     * @param  {string} name
     */
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