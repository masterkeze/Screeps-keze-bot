var roleUpgradeSupplier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var groupID = creep.memory.groupID;
        if (!groupID){
            console.log(creep.name+" is not assigned with a groupID!");
            return;
        } 
        var groupPlan = Memory.groups[groupID];
        if (!groupPlan){
            console.log(creep.name+" is not assigned with a valid group!");
            return;
        }
        // Assume the groupPlan is valid
        // Enroll to the group plan
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
            groupPlan.creeps.push(creep.id);
        }
        var container = Game.getObjectById(groupPlan.ContainerID);
        if (!container){
            console.log(creep.name+" is not assigned with a valid container!");
            return;
        }
        var source = Game.getObjectById(groupPlan.SourceID);
        if (!source){
            console.log(creep.name+" is not assigned with a valid source!");
            return;
        }
	    if((creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting) && source.store[RESOURCE_ENERGY] >= groupPlan.sourceLimit) {
            creep.memory.harvesting = true;
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            if(creep.store.getFreeCapacity() == 0){
                creep.memory.harvesting = false;
                creep.say('transfer');
            }
        }
        else {
            if(creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        // pick up dropped stuff or withdraw tomb
        var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0 && dropped.resourceType == RESOURCE_ENERGY) {
            creep.pickup(dropped);
        }
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_ENERGY] > 0) {
            creep.withdraw(tomb,RESOURCE_ENERGY);
        }
	}
};

module.exports = roleUpgradeSupplier;