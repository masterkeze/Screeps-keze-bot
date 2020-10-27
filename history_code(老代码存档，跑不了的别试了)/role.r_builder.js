var roleR_builder = {
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

        if((creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting)) {
            creep.memory.harvesting = true;
            
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'},reusePath:100,ignoreCreeps:true});
            }else{
                creep.memory.dontPullMe = true;
            }
            // if (creep.withdraw(source,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            //     creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            // }
            if(creep.store.getFreeCapacity() == 0){
                creep.memory.harvesting = false;
                creep.memory.dontPullMe = false;
                creep.say('build');
            }
        }else{
            //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) 
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) || (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400 );
                }
            });
            if (target){
                if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.dontPullMe = false;
                }else{
                    creep.memory.dontPullMe = true;
                }
            }else{
                var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(target) {
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.dontPullMe = false;
                    }else{
                        creep.memory.dontPullMe = true;
                    }
                }else{
                    var closestDamagedStructure;
                    // var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    //     filter: (structure) => structure.structureType != STRUCTURE_WALL && structure.hits + 200 <= structure.hitsMax
                    // });
                    if (closestDamagedStructure){
                        if(creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closestDamagedStructure, {visualizePathStyle: {stroke: '#ffaa00'}});
                            creep.memory.dontPullMe = false;
                        }else{
                            creep.memory.dontPullMe = true;
                        }
                    }else{
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
                            creep.memory.dontPullMe = false;
                        }else{
                            creep.memory.dontPullMe = true;
                        }
                    }
                }
            }
        }
        // pick up dropped stuff or withdraw tomb
        var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        // var container = Game.getObjectById("5e3a388e1bfbaa44d5a3b9ef");
        // if(creep.pos.isNearTo(container) && container.store.getFreeCapacity() > 0) {
        //     //creep.cancelOrder();
        //     creep.transfer(container,RESOURCE_ENERGY);
        // }
        if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0) {
            creep.pickup(dropped);
        }
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_ENERGY] > 0) {
            creep.withdraw(tomb,RESOURCE_ENERGY);
        }
	}
};

var groupPlan = {};

module.exports = roleR_builder;