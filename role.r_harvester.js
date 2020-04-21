var roleR_harvester = {
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
        // if (!groupPlan.acitve){
        //     return;
        // }
        // Assume the groupPlan is valid
        // Enroll to the group plan
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
            groupPlan.creeps.push(creep.id);
        }
        if (!groupPlan.Sourceloc){
            console.log(creep.name+" is not assigned with a valid source location!");
            return;
        }
        
        //console.log(creep.harvest(source) == ERR_NOT_IN_RANGE);
        creep.moveTo(new RoomPosition(groupPlan.Sourceloc.x, groupPlan.Sourceloc.y, groupPlan.Sourceloc.roomName), {visualizePathStyle: {stroke: '#ffaa00'}});
        var source = creep.pos.findClosestByRange(FIND_SOURCES);
        creep.harvest(source);
        var friends = creep.room.find(FIND_MY_CREEPS,{filter:(creep)=>{return creep.memory.role == 'r_transferer';}});
        var closest = creep.pos.findClosestByRange(friends);
        if(creep.pos.isNearTo(closest) && creep.store[RESOURCE_ENERGY] > 0) {
            creep.transfer(closest, RESOURCE_ENERGY);
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

module.exports = roleR_harvester;