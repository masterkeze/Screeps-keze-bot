'use strict';
require("./mount.moment");
module.exports = function () {
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
                console.log("getStore 为空");
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