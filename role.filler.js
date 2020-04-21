var roleFiller = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity() > 0) {
	        var sources = creep.room.find(FIND_SOURCES);
	        if (Memory.totolStore > 800 && creep.room.find(FIND_MY_CREEPS).length >= Memory.targetCreeps && sources[0].energy == 0){
                var sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN||structure.structureType == STRUCTURE_EXTENSION) &&
                            structure.store[RESOURCE_ENERGY] > 0;
                        }
                });
                //var sources = creep.room.find(FIND_SOURCES);
                var closest = creep.pos.findClosestByRange(sources);
                if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
	        }else{
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
	        }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && structure.id == "5e3237c8edfc95fb4569e9e8";
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleFiller;