var roleUpgrader = {

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
        var source = Game.getObjectById(groupPlan.SourceID);
        if (!source){
            console.log(creep.name+" is not assigned with a valid source!");
            return;
        }
        var controller = Game.getObjectById(groupPlan.ControllerID);
        if (!controller){
            console.log(creep.name+" is not assigned with a valid controller!");
            return;
        }
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }
        //creep.say(creep.upgradeController(controller));
	    if(creep.memory.upgrading) {
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }else{
                creep.memory.dontPullMe = true;
            }
            if(creep.store[RESOURCE_ENERGY] <= creep.getActiveBodyparts(WORK)){
                creep.withdraw(source, RESOURCE_ENERGY);
            }
        }
        else {
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        // pick up dropped stuff or withdraw tomb
        // var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        // var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        // if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0 && dropped.resourceType == RESOURCE_ENERGY) {
        //     creep.pickup(dropped);
        // }
        // if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_ENERGY] > 0) {
        //     creep.withdraw(tomb,RESOURCE_ENERGY);
        // }
        // if(creep.pos.x==source.pos.x && creep.pos.y==source.pos.y){
        //     creep.moveTo(controller);
        // }
	}
};
module.exports = roleUpgrader;
