var rolePicker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.room.name != "W29S22"){
            creep.moveTo(new RoomPosition(24, 47, 'W29S22'));
        }else{
            if (creep.pos.y < 40){
                creep.moveTo(new RoomPosition(24, 47, 'W29S22'));
            }else{
                if(creep.store[RESOURCE_ENERGY] == 0 || creep.memory.harvesting) {
                    creep.memory.harvesting = true;
                    var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES,
                    {filter: (resource) => resource.resourceType == RESOURCE_ENERGY && resource.pos.y >= 40});
                    if (!target) return;
                    if(creep.pos.isNearTo(target)) {
                        if(Memory.picking == creep.id || Memory.picking == 0 || !Memory.picking){
                            Memory.picking = creep.id;
                            creep.pickup(target);
                        }
                    }else{
                        if (target.pos.y >= 40){
                            creep.moveTo(target);
                        }
                    }
                    if(creep.store.getFreeCapacity() == 0){
                        creep.memory.harvesting = false;
                        Memory.picking = 0;
                    }
                }else {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_STORAGE &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                            }
                    });
                    if(targets.length > 0) {
                        var closest = creep.pos.findClosestByRange(targets);
                        if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }else{
                        creep.moveTo(Game.flags.Flag4);
                        var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
                        if(creep.pos.isNearTo(target)) {
                            creep.pickup(target);
                        }
                        if(creep.pos.isNearTo(tomb)) {
                            creep.withdraw(tomb,RESOURCE_ENERGY);
                        }
                    }
                }
            }
        }
	}
};

module.exports = rolePicker;