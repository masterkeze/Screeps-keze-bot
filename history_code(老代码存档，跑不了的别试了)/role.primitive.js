var rolePrimitive = {
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
            console.log("enroll new creep!");
            groupPlan.creeps.push(creep.id);
        }
        var source = Game.getObjectById(groupPlan.SourceID);
        if (!source){
            console.log(creep.name+" is not assigned with a valid source!");
            return;
        }

        if((creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting)) {
            creep.memory.harvesting = true;
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'},reusePath:5});
            }
            if (creep.withdraw(source,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'},reusePath:5});
            }
            if(creep.store.getFreeCapacity() == 0){
                creep.memory.harvesting = false;
                creep.memory.upgrading = false;
                creep.memory.building = false;
                creep.say('work');
            }
        }else{
            //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            // var targets = creep.room.find(FIND_STRUCTURES, {
            //     filter: (structure) => {
            //         return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_STORAGE
            //             || (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 200))
            //             && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            //     }
            // });
            var targets = [];
            if (targets.length>0 && !creep.memory.upgrading && !creep.memory.building){
                //creep.say('transfer');
                var target = creep.pos.findClosestByRange(targets);
                if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'},reusePath:30});
                }
            }else{
                var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(target && !creep.memory.upgrading) {
                    //creep.say('build');
                    creep.memory.building = true;
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'},reusePath:30});
                    }
                    if (creep.store[RESOURCE_ENERGY] == 0){
                        creep.memory.building = false;
                    }
                }else{
                    //creep.say('upgrade');
                    //creep.moveTo(Game.flags.Flag7);
                    creep.memory.building = false;
                    creep.memory.upgrading = true;
                    if(creep.pos.getRangeTo(creep.room.controller)>2) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'},reusePath:30});
                    }
                    creep.upgradeController(creep.room.controller)
                    if (creep.store[RESOURCE_ENERGY] == 0){
                        creep.memory.upgrading = false;
                    }
                }
            }
        }
        // pick up dropped stuff or withdraw tomb
        var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0) {
            creep.pickup(dropped);
        }
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_ENERGY] > 0) {
            creep.withdraw(tomb,RESOURCE_ENERGY);
        }
	}
}
module.exports = rolePrimitive;