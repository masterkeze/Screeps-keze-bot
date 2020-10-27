var rampartHits = 500000;

var roleBuilder = {

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

        if((creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting) && source.store[RESOURCE_ENERGY] >= 1000) {
            creep.memory.harvesting = true;
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            if(creep.store.getFreeCapacity() == 0){
                creep.memory.harvesting = false;
                creep.say('build');
            }
        }else{
            //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {range:3,visualizePathStyle: {stroke: '#ffffff'},});
                }
                if (creep.store[RESOURCE_ENERGY] <= creep.getActiveBodyparts(WORK) * 5){
                    creep.withdraw(source, RESOURCE_ENERGY)
                }
            }else{
                if (!creep.memory.rampartID && !creep.memory.noRampart){
                    var ramparts = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => (structure.structureType == STRUCTURE_RAMPART && structure.hits < rampartHits-50000) 
                    });
                    if (ramparts.length > 0){
                        groupPlan.walling = true;
                        creep.memory.rampartID = ramparts[0].id;
                    }else{
                        creep.memory.noRampart = true;
                        groupPlan.walling = false;
                    }
                }
                if (creep.memory.rampartID){
                    const rampart = Game.getObjectById(creep.memory.rampartID);
                    if (creep.repair(rampart) == ERR_NOT_IN_RANGE){
                        creep.moveTo(rampart,{range:3});
                    }
                    if (rampart.hits > rampartHits){
                        creep.memory.rampartID = 0;
                        groupPlan.walling = false;
                    }
                }

                // if (ramparts.length > 0){
                //     groupPlan.walling = true;
                //     if (creep.repair(ramparts[0]) == ERR_NOT_IN_RANGE){
                //         creep.moveTo(ramparts[0]);
                //     }
                // }else{
                //     groupPlan.walling = false;
                // }
                //creep.moveTo(Game.flags.Flag7);
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
};

module.exports = roleBuilder;