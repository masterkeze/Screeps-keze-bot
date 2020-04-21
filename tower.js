var tower = {
    /** @param {Tower} tower **/
    //|| (structure.structureType == STRUCTURE_RAMPART && structure.hits <2000)
    run: function(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits + 200 <= structure.hitsMax) || (structure.structureType == STRUCTURE_WALL && structure.hits <2000) 
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
    
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }else{
            var closestDamagedFriendly = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (creep) => creep.hits < creep.hitsMax
            });
            if (closestDamagedFriendly){
                tower.heal(closestDamagedFriendly);
            }
        }
    }
}

module.exports = tower;