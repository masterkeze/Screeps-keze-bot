var planBuilder = {
    update: function() {
        //Memory.groups = Object();
        if (!Memory.rooms){
            Memory.rooms = Object();
        }
        
        for (const roomName in Game.rooms) {
            const roomObj = Game.rooms[roomName];
            const room = Memory.rooms[roomName];
            if (roomObj.controller && roomObj.controller.my){
                const planName = "build_"+roomName;
                if (!room){
                    continue;
                }
                if (room.StorageID){
                    if (!room.SpawnIDs){
                        console.log(room.roomName+" has no spawn!")
                        continue;
                    }
                    if (!Memory.groups[planName]){
                        Memory.groups[planName] = {
                            groupType: 'build',
                            roomName: room.roomName,
                            groupID: planName,
                            SourceID: room.StorageID,
                            SpawnID: room.SpawnIDs[0],
                            roles: ["builder"],
                            sourceLimit: 2000,
                            roleLimit: [1],
                            roleBody: [[WORK,CARRY,MOVE]],
                            spawnAhead: [0],
                            creeps: []
                        };
                        const source = Game.getObjectById(room.StorageID);
                        const spawn = Game.getObjectById(Memory.groups[planName].SpawnID);
                        //console.log(JSON.stringify(Game.rooms[room.roomName]));
                        const distance = Game.rooms[room.roomName].findPath(spawn.pos, source.pos,{ignoreCreeps: true}).length;
                        Memory.groups[planName].distance = distance;
                        //console.log(JSON.stringify(Memory.groups[planName]));
                    }
                    if (Game.time % 317 == 0){
                        if (roomObj.controller.level == 8){
                            Memory.groups[planName].roleBody[0] = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
                        }else{
                            const energyCapacityAvailable = room.energyCapacityAvailable;
                            const baseBody = [WORK,CARRY,MOVE];
                            const multiplier = Math.min(10,Math.floor(energyCapacityAvailable/250));
                            var roleBody = [];
                            for (let i = 0; i < multiplier; i++) {
                                roleBody = roleBody.concat(baseBody);
                            }
                            Memory.groups[planName].roleBody[0] = roleBody;
                            // update spawnAhead time
                            Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + roleBody.length * 3;
                        }
                        // update role body
    
                        if (Game.rooms[room.roomName].find(FIND_CONSTRUCTION_SITES).length > 0) {
                            Memory.groups[planName].roleLimit[0] = 1;
                        }else{
                            var ramparts = Game.rooms[room.roomName].find(FIND_STRUCTURES, {
                                filter: (structure) => (structure.structureType == STRUCTURE_RAMPART && structure.hits < 30000) 
                            });
                            if (ramparts.length > 0){
                                Memory.groups[planName].walling = true;
                            }
                            if (!Memory.groups[planName].walling){
                                Memory.groups[planName].roleLimit[0] = 0;
                            }else{
                                Memory.groups[planName].roleLimit[0] = 1;
                            }
                        }
                    }

                }else{
                    if (Memory.groups[planName]){
                        Memory.groups[planName].roleLimit[0] = 0;
                    }
                    // ignore this room
                }
            }
        }
    }
}
module.exports = planBuilder;