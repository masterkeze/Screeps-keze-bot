var roleDistributer = {
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
        // var target = Game.getObjectById(groupPlan.TargetID);
        // if (!target){
        //     console.log(creep.name+" is not assigned with a valid target!");
        //     return;
        // }
        // var link = Game.getObjectById(groupPlan.LinkID);
        // if (!link){
        //     console.log(creep.name+" is not assigned with a valid link!");
        //     return;
        // }
        if(creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting) {
            creep.memory.harvesting = true;
            if (source.store[RESOURCE_ENERGY] == 0){
                const restLoc = Game.rooms[groupPlan.roomName].find(FIND_FLAGS,{filter: (flag) => flag.color == COLOR_YELLOW});
                creep.moveTo(restLoc[0]);
            }else{
                if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            if(creep.store.getFreeCapacity() == 0){
                creep.memory.harvesting = false;
            }
        }else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN
                        || (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 300 && structure.id != "")
                        )) 
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if(targets.length > 0) {
                var closest = creep.pos.findClosestByRange(targets);
                if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {ignoreSwamps: true, visualizePathStyle: {stroke: '#ffffff'}});
                }
            }else{

                const restLoc = Game.rooms[groupPlan.roomName].find(FIND_FLAGS,{filter: (flag) => flag.color == COLOR_YELLOW});
                creep.moveTo(restLoc[0]);
            }
            // pick up dropped stuff or withdraw tomb

            // var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            // if (creep.pickup(dropped) == ERR_NOT_IN_RANGE){
            //     creep.moveTo(dropped);
            //     creep.memory.harvesting = false;
            //     //creep.memory.harvesting = false;
            // }
        }

        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        // if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0) {
        //     creep.pickup(dropped);
        // }
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_ENERGY] > 0) {
            creep.withdraw(tomb,RESOURCE_ENERGY);
        }
	}
};

module.exports = roleDistributer;