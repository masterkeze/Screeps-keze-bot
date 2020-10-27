var roleTransferer = {
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

        if (!groupPlan.Sourceloc){
            console.log(creep.name+" is not assigned with a valid source location!");
            return;
        }
        // if (!groupPlan.acitve){
        //     return;
        // }
        var target = Game.getObjectById(groupPlan.TargetID);
        if (!target){
            console.log(creep.name+" is not assigned with a valid target!");
            return;
        }
        // working
        // console.log(groupPlan.Sourceloc.x);
        if(creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting) {
            // try to harvest
            creep.memory.harvesting = true;
            //console.log(creep.pos.getRangeTo(groupPlan.Sourceloc));
            var target = "";
            if(creep.pos.getRangeTo(new RoomPosition(groupPlan.Sourceloc.x, groupPlan.Sourceloc.y, groupPlan.Sourceloc.roomName)) <= 2) {
                //console.log(groupPlan.Sourceloc);
                var drops = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4);
                var closest = creep.pos.findClosestByRange(drops);
                if (creep.pickup(closest) == ERR_NOT_IN_RANGE){
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                }else{
                    creep.say("waiting");
                }
            }else{
                creep.moveTo(new RoomPosition(groupPlan.Sourceloc.x, groupPlan.Sourceloc.y, groupPlan.Sourceloc.roomName), {visualizePathStyle: {stroke: '#ffffff'}});
            }
            if(creep.store.getFreeCapacity() == 0){
                creep.memory.harvesting = false;
                creep.say('transfer');
            }
        }else {
            
            // transfer to the target
            // console.log("transferer:"+creep.id+" transfer target:"+target.id);
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
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

module.exports = roleTransferer;