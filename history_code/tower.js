var tower = {
    /** @param {Tower} tower **/
    //|| (structure.structureType == STRUCTURE_RAMPART && structure.hits <2000)
    run: function() {
        // var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        //     filter: (structure) => (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits + 200 <= structure.hitsMax) || (structure.structureType == STRUCTURE_WALL && structure.hits <2000) 
        // });
        // if(closestDamagedStructure) {
        //     tower.repair(closestDamagedStructure);
        // }
    
        // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if(closestHostile) {
        //     tower.attack(closestHostile);
        // }else{
        //     var closestDamagedFriendly = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
        //         filter: (creep) => creep.hits < creep.hitsMax
        //     });
        //     if (closestDamagedFriendly){
        //         tower.heal(closestDamagedFriendly);
        //     }
        // }

        for (const roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my){
                var towers = room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_TOWER }
                });
                if (towers.length > 0){
                    var DamagedStructures = room.find(FIND_STRUCTURES, {
                            filter: (structure) => (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.hits + 200 <= structure.hitsMax) || (structure.structureType == STRUCTURE_WALL && structure.hits <2000) ||(structure.structureType == STRUCTURE_RAMPART && structure.hits < 1000) 
                    });
                    if (DamagedStructures.length > 0){
                        towers[0].repair(DamagedStructures[0]);
                    }
                    var hostiles = room.find(FIND_HOSTILE_CREEPS);
                    if (hostiles.length > 0){
                        for (const tower of towers) {
                            tower.attack(hostiles[0]);
                        }
                    }else{
                        var DamagedFriendly = room.find(FIND_MY_CREEPS, {
                            filter: (creep) => creep.hits < creep.hitsMax
                        });
                        if (DamagedFriendly.length > 0){
                            towers[0].heal(DamagedFriendly[0]);
                        }
                    }
                }

            }
            // if(room.controller.my){
                
            // }
        }

    }
}

module.exports = tower;