var planDistributer = {
    update: function() {
        //Memory.groups = Object();
        const rooms = Object.keys(Game.rooms);
        if (!Memory.rooms){
            Memory.rooms = Object();
        }
        if (!Memory.groups){
            return;
        }
        //console.log(JSON.stringify(rooms));
        for (var i=0; i<rooms.length;i++) {
            if (!Memory.rooms[rooms[i]]){
                continue;
            }
            const room = Memory.rooms[rooms[i]];
            if (!room){
                continue;
            }
            const planName = "distribute_"+room.roomName;
            if (room.StorageID){
                if (!room.SpawnIDs){
                    console.log(room.roomName+" has no spawn!")
                    continue;
                }
                if (!Memory.groups[planName]){
                    Memory.groups[planName] = {
                        groupType: 'distribute',
                        roomName: room.roomName,
                        groupID: planName,
                        SourceID: room.StorageID,
                        LinkID: room.SpawnIDs[0],
                        TargetID: room.SpawnIDs[0],
                        SpawnID: room.SpawnIDs[0],
                        roles: ["distributer"],
                        roleLimit: [2],
                        roleBody: [[CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]],
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
                if (Memory.groups[planName].usingPC) continue;
                Memory.groups[planName].roleLimit[0] = 1;
                if (Game.rooms[room.roomName].energyAvailable >= 600){
                    Memory.groups[planName].roleBody[0] = [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE];
                }else{
                    Memory.groups[planName].roleBody[0] = [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE];
                }
                // update spawnAhead time
                // Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + roleBody.length * 3;
            }else{
                if (Memory.groups[planName]){
                    Memory.groups[planName].roleLimit[0] = 0;
                }
                // ignore this room
            }


        }
    }
}
module.exports = planDistributer;