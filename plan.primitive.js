var planPrimitive = {
    update: function() {
        //Memory.groups = Object();
        const rooms = Object.keys(Game.rooms);
        if (!Memory.rooms){
            Memory.rooms = Object();
        }
        
        //console.log(JSON.stringify(rooms));
        for (var i=0; i<rooms.length;i++) {
            const room = Memory.rooms[rooms[i]];
            if (!room){
                continue;
            }
            if (room.myStructureCount == 0){
                continue;
            }
            for (let index = 0; index < room.SourceIDs.length; index++) {
                const SourceID = room.SourceIDs[index];
                const planName = "primitive_"+room.roomName+"_"+SourceID;
                if (!room.StorageID){
                    if (!room.SpawnIDs){
                        console.log(room.roomName+" has no spawn!")
                        continue;
                    }
                    if (!Memory.groups[planName]){
                        Memory.groups[planName] = {
                            groupType: 'primitive',
                            roomName: room.roomName,
                            groupID: planName,
                            SourceID: SourceID,
                            SpawnID: room.SpawnIDs[0],
                            roles: ["primitive"],
                            roleLimit: [2],
                            roleBody: [[WORK,CARRY,MOVE]],
                            spawnAhead: [0],
                            creeps: []
                        };
                        const source = Game.getObjectById(SourceID);
                        const spawn = Game.getObjectById(Memory.groups[planName].SpawnID);
                        //console.log(JSON.stringify(Game.rooms[room.roomName]));
                        const distance = Game.rooms[room.roomName].findPath(spawn.pos, source.pos,{ignoreCreeps: true}).length;
                        Memory.groups[planName].distance = distance;
                        //console.log(JSON.stringify(Memory.groups[planName]));
                    }
                    // update role body
                    const energyCapacityAvailable = room.energyCapacityAvailable;
                    const baseBody = [WORK,CARRY,MOVE];
                    const multiplier = Math.min(5,Math.floor(energyCapacityAvailable/200));
                    //const multiplier = 1;
                    var roleBody = [];
                    for (let i = 0; i < multiplier; i++) {
                        roleBody = roleBody.concat(baseBody);
                    }
                    //Memory.groups[planName].creeps = [];
                    Memory.groups[planName].roleBody[0] = roleBody;
                    Memory.groups[planName].roleLimit[0] = Math.min(4,(room.sourcePlain[index])*2);
                    // update spawnAhead time
                    Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + roleBody.length * 3;
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
module.exports = planPrimitive;