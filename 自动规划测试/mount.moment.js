'use strict';
module.exports = function () {
    _.assign(Structure.prototype, momentExtension);
    _.assign(Creep.prototype, momentExtension);
    _.assign(PowerCreep.prototype, momentExtension);
}

const momentExtension = {
    initMoment(){
        if (!global.moment || !global.moment.now || global.moment.now != Game.time){
            global.moment = {now:Game.time};
        }
        let moment = global.moment;
        if (!moment[this.id]){
            moment[this.id] = {
                withdraw : {},
                transfer : {},
                resourceChange : {},
                attack : 0,
                heal : 0,
                hitsChange : 0
            };
        }
    },
    setMomentOnHits(action,hits){
        if (!global.moment || !global.moment.now || global.moment.now != Game.time || !global.moment[this.id]){
            this.initMoment();
        }
        let momentDetail = global.moment[this.id];
        switch (action) {
            case "heal":
                if (!momentDetail.heal){
                    momentDetail.heal = hits;
                }else{
                    momentDetail.heal += hits;
                }
                if (!momentDetail.attack){
                    momentDetail.attack = 0;
                }
                momentDetail.hitsChange = momentDetail.heal - momentDetail.attack;
                break;
            default:
                break;
        }
    },
    setMomentOnResource(action,resourceType,amount){
        if (!global.moment || !global.moment.now || global.moment.now != Game.time || !global.moment[this.id]){
            this.initMoment();
        }
        let momentDetail = global.moment[this.id];
        switch (action) {
            case "withdraw":
                let withdrawDetail = momentDetail.withdraw;
                if (!withdrawDetail[resourceType]){
                    withdrawDetail[resourceType] = 0;
                }
                withdrawDetail[resourceType] += amount;
                let withdrawChange = momentDetail.resourceChange;
                if (!withdrawChange[resourceType]){
                    withdrawChange[resourceType] = 0;
                }
                withdrawChange[resourceType] -= amount;
                break;
            case "transfer":
                var transferDetail = momentDetail.transfer;
                if (!transferDetail[resourceType]){
                    transferDetail[resourceType] = 0;
                }
                transferDetail[resourceType] += amount;
                let transferChange = momentDetail.resourceChange;
                if (!transferChange[resourceType]){
                    transferChange[resourceType] = 0;
                }
                transferChange[resourceType] += amount;
                break;
            default:
                break;
        }
        return OK;
    },
    getMomentOnResource(action,resourceType){
        if (!global.moment || !global.moment.now || global.moment.now != Game.time || !global.moment[this.id]){
            this.initMoment();
            return 0;
        }
        let momentDetail = global.moment[this.id];
        switch (action) {
            case "withdraw":
                let withdrawDetail = momentDetail.withdraw;
                if (!withdrawDetail[resourceType]){
                    withdrawDetail[resourceType] = 0;
                }
                return withdrawDetail[resourceType];
            case "transfer":
                let transferDetail = momentDetail.transfer;
                if (!transferDetail[resourceType]){
                    transferDetail[resourceType] = 0;
                }
                return transferDetail[resourceType];
            default:
                break;
        }
        return 0;
    },
    getMoment(){
        if (!global.moment || !global.moment.now || global.moment.now != Game.time || !global.moment[this.id]){
            this.initMoment();
            return 0;
        }else{
            return global.moment[this.id];
        }
    },
    getStore(resourceType){
        var store = JSON.parse(JSON.stringify(this.store));
        const moment = this.getMoment();
        if (moment){
            if (moment.withdraw){
                const withdrawDetail = moment.withdraw;
                for (const [resourceType, value] of Object.entries(withdrawDetail)) {
                    if (store[resourceType]){
                        store[resourceType] -= value;
                    }else{
                        store[resourceType] = -value;
                    }
                }
            }
            if (moment.transfer){
                const transferDetail = moment.transfer;
                for (const [resourceType, value] of Object.entries(transferDetail)) {
                    // if (this.store.getFreeCapacity(resourceType) >= value){
                        
                    // }
                    if (!store[resourceType]){
                        store[resourceType] = value;
                    }else{
                        store[resourceType] += value;
                    }
                }
            }
        }
        if (resourceType){
            if (store && store[resourceType]){
                return store[resourceType]
            }else{
                return 0;
            }
        }
        return store;
    }
}