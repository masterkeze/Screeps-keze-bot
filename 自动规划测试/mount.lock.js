'use strict';
module.exports = function(){
    _.assign(Structure.prototype, lockExtension);
}

const lockExtension = {
    getLock(){
        if (!Memory.lock){
            Memory.lock = {}
        }
        const id = this.id;
        if (!Memory.lock[id]){
            Memory.lock[id] = {
                total : {},
                detail : {}
            }
        }
        return Memory.lock[id];
    },

    showLock(){
        return JSON.stringify(this.getLock());
    },

    getLockedStore(resourceType){
        let lockedStore = this.getLock();
        let lockedTotal = lockedStore.total;
        if (resourceType){
            if (lockedTotal[resourceType]){
                return lockedTotal[resourceType];
            }else{
                return 0;
            }
        }else{
            return lockedTotal;
        }
    },
    getUnlockedStore(resourceType){
        if (resourceType){
            return Math.max(this.getStore(resourceType) - this.getLockedStore(resourceType),0);
        }else{
            let realStore = this.getStore();
            let unlockedStore = {};
            for (const type of Object.keys(realStore)) {
                unlockedStore[type] = this.getUnlockedStore(type);
            }
            return unlockedStore;
        }
    },
    addAnonymousLock(lockingStore){
        let lockedStore = this.getLock();
        let lockedDetail = lockedStore.detail;
        let resourceType = Object.keys(lockingStore)[0];
        let index = 1;
        let lockName = `${resourceType}-${Game.time}`;
        while (lockedDetail[lockName]){
            lockName = `${resourceType}-${Game.time}-${index}`;
            index += 1;
        }
        let result = this.addLock(lockName,lockingStore);
        if (result == OK){
            return lockName;
        }else{
            return null;
        }
    },
    addLock(name,lockingStore){
        var lockedStore = this.getLock();
        var lockedTotal = lockedStore.total;
        var lockedDetail = lockedStore.detail;

        if (lockedDetail[name]){
            console.log("已有同名锁");
            return ERR_NAME_EXISTS;
        }

        var newLock = {};
        const realStore = this.getStore();
        //console.log(JSON.stringify(realStore));
        //console.log(JSON.stringify(lockingStore));
        for (const [resourceType, value] of Object.entries(lockingStore)) {
            if (value && value < 0){
                return ERR_INVALID_ARGS;
            }
            if (!value){
                continue;
            }
            if (!realStore[resourceType]){
                console.log(`${this.structureType} 中没有${resourceType}来加锁`);
                return ERR_NOT_ENOUGH_RESOURCES;
            }
            if (lockedTotal[resourceType]){
                if (realStore[resourceType] - lockedTotal[resourceType] >= value){
                    newLock[resourceType] = value;
                }else{
                    return ERR_NOT_ENOUGH_RESOURCES;
                }
            }else{
                if (realStore[resourceType] >= value){
                    newLock[resourceType] = value;
                }else{
                    return ERR_NOT_ENOUGH_RESOURCES;
                }
            }
        }
        if (Object.keys(newLock).length == 0){
            return ERR_INVALID_ARGS;
        }

        for (const [resourceType, value] of Object.entries(newLock)) {
            if (!lockedTotal[resourceType]){
                lockedTotal[resourceType] = value;
            }else{
                lockedTotal[resourceType] += value;
            }

        }
        lockedDetail[name] = newLock;
        return OK;
    },

    releaseLock(name){
        var lockedStore = this.getLock();
        var lockedTotal = lockedStore.total;
        var lockedDetail = lockedStore.detail;
        const toDelete = lockedDetail[name];
        if (!toDelete){
            return ERR_NOT_FOUND;
        }else{
            for (const [resourceType, value] of Object.entries(toDelete)) {
                lockedTotal[resourceType] -= value;
            }
            delete lockedDetail[name];
            return OK;
        }
    },

    hasLock(name){
        let lockedStore = this.getLock();
        let lockedDetail = lockedStore.detail;
        if (lockedDetail[name]){
            return true;
        }else{
            return false;
        }
    },

    getLockingStore(name){
        let lockedStore = this.getLock();
        let lockedDetail = lockedStore.detail;
        if (lockedDetail[name]){
            return lockedDetail[name];
        }else{
            return {};
        }
    },

    resetLock(){
        if (!Memory.lock){
            Memory.lock = {}
        }
        const id = this.id;
        Memory.lock[id] = {
            total : {},
            detail : {}
        }
        return OK;
    }
}