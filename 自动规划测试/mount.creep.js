'use strict';
module.exports = function () {
    _.assign(Creep.prototype, creepExtension);
    _.assign(PowerCreep.prototype, creepExtension);
}

const creepExtension = {
    getData(){
        return JSON.parse(JSON.stringify(this.memory));
    },
    saveData(data){
        this.memory = data;
    },
    saveStateData(state,data){
        this.memory[state] = data;
    },
    getDataReadOnly(){
        return this.memory;
    },
    repairAndLog(target){
        var result = OK;
        var store = this.getStore("energy");
        let works = this.getActiveBodyparts(WORK);
        var resourceDelta = Math.min(store,works);
        var hitsDelta = resourceDelta * 100;
        result = this.repair(target);
        if(result == OK){
            target.setMomentOnHits("heal",hitsDelta);
            this.setMomentOnResource("withdraw","energy",resourceDelta);
        }
        return result;
    },
    withdrawAndLog(target, resourceType, amount){
        var result = OK;
        if (amount){
            result = this.withdraw(target, resourceType,amount);
        }else{
            result = this.withdraw(target, resourceType);
        }
        if (result == OK){
            let delta = 0;
            if (amount){
                delta = amount;
            }else{
                delta = Math.min(this.store.getFreeCapacity(resourceType),target.store[resourceType]);
            }
            target.setMomentOnResource("withdraw",resourceType,delta);
            this.setMomentOnResource("transfer",resourceType,delta);
        }
        return result;
    },
    transferAndLog(target, resourceType, amount){
        var result = OK;
        if (amount){
            result = this.transfer(target, resourceType,amount);
        }else{
            result = this.transfer(target, resourceType);
        }
        if (result == OK){
            let delta = 0;
            if (amount){
                delta = amount;
            }else{
                delta = Math.min(this.store[resourceType],target.store.getFreeCapacity(resourceType));
            }
            target.setMomentOnResource("transfer",resourceType,delta);
            this.setMomentOnResource("withdraw",resourceType,delta);
        }
        return result;
    },
    buildAndLog(target){
        var result = this.build(target);
        if (result == OK){
            this.setMomentOnResource("withdraw",RESOURCE_ENERGY,Math.min(this.store[RESOURCE_ENERGY],this.getActiveBodyparts(WORK)));
        }
        return result;
    },
    setMovingStrategy(strategy){
        let data = this.getData();
        data.movingStrategy = strategy;
        this.saveData(data);
    },
    getMovingStrategy(){
        return this.getDataReadOnly().movingStrategy;
    },
    setMovingTarget(target,range=1){
        // Initialize
        let data = this.getData();
        let movingStrategy = data.movingStrategy;
        data.moving = {target:target.id,range:range};
        switch (movingStrategy) {
            case "reach":
                this.reach(target,range);
                break;
            case "reachOnce":
                this.reachOnce(target,range);
                break;
            default:
                data.movingStrategy = "reach";
                this.reach(target,range);
                break;
        }
        this.saveData(data);
    },
    keepMoving(){
        // runtime
        let data = this.getData();
        if (!data.moving){
            return;
        }
        let movingStrategy = data.movingStrategy;
        let target = Game.getObjectById(data.moving.target);
        let range = data.moving.range;
        switch (movingStrategy) {
            case "reach":
                this.reach(target,range);
                break;
            case "reachOnce":
                this.reachOnce(target,range);
                break;
            default:
                break;
        }

    },
    clearMoving(){
        // Exit
        let data = this.getData();
        data.moving = {};
        this.saveData(data);
    },
    reach(target,range){
        if (this.pos.getRangeTo(target) > range){
            this.moveTo(target,{range:range});
        }
    },
    reachOnce(target,range){
        let data = this.getData();
        let distance = this.pos.getRangeTo(target);
        //this.say(distance);
        if (!data.moving.reachOnceFlag && distance == 1){
            data.moving.reachOnceFlag = true;
            this.say("reached!");
        }
        if (data.moving.reachOnceFlag && distance > range){
            data.moving.reachOnceFlag = false;
        }
        if (!data.moving.reachOnceFlag){
            this.moveTo(target,{range:1});
        }
        this.saveData(data);
    },

}