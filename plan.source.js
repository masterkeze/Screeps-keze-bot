var planSource = {
    update: function() {
        //Memory.groups = Object();
        const rooms = Object.keys(Game.rooms);
        if (!Memory.rooms){
            Memory.rooms = Object();
        }
        if (!Memory.groups){
            Memory.groups = Object();
        }
        //console.log(JSON.stringify(rooms));
        for (var i=0; i<rooms.length;i++) {
            const room = Memory.rooms[rooms[i]];
            if (!room){
                continue;
            }
            for (const SourceID of room.SourceIDs) {
                const planName = "source_"+room.roomName+"_"+SourceID;
                if (room.StorageID){
                    if (!room.SpawnIDs){
                        console.log(room.roomName+" has no spawn!")
                        continue;
                    }
                    const energyCapacityAvailable = room.energyCapacityAvailable;
                    if (energyCapacityAvailable < 650){
                        console.log("Energy Capacity not enough to use source plan");
                        continue;
                    }
                    if (!Memory.groups[planName]){
                        console.log("create source group for room "+room.roomName);
                        const source = Game.getObjectById(SourceID);
                        const links = source.pos.findInRange(FIND_MY_STRUCTURES,3,{filter: (structure) => {
                            return structure.structureType == STRUCTURE_LINK}});
                        var LinkID = 0;
                        var ContainerID = 0;
                        if (links.length > 0){
                            LinkID = links[0].id;
                        }else{
                            const container = Game.getObjectById(SourceID).pos.findInRange(FIND_STRUCTURES, 2, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_CONTAINER }});
                            if(container.length ==0){
                                //console.log("No container found neer to source "+SourceID+" in room "+room.roomName);
                                continue;
                            }else{
                                ContainerID = container[0].id;
                            }
                        }
                        
                        Memory.groups[planName] = {
                            groupType: 'source',
                            roomName: room.roomName,
                            groupID: planName,
                            SourceID: SourceID,
                            ContainerID: ContainerID,
                            TargetID: room.StorageID,
                            LinkID: LinkID,
                            SpawnID: room.SpawnIDs[0],
                            roles: ["harvester","transferer"],
                            roleLimit: [1,1],
                            roleBody: [[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],[CARRY,CARRY,MOVE]],
                            spawnAhead: [0],
                            creeps: []
                        };
                        
                        const spawn = Game.getObjectById(Memory.groups[planName].SpawnID);
                        const target = Game.getObjectById(Memory.groups[planName].TargetID);
                        //console.log(JSON.stringify(Game.rooms[room.roomName]));
                        const distance = Game.rooms[room.roomName].findPath(spawn.pos, source.pos,{ignoreCreeps: true}).length;
                        Memory.groups[planName].distance = distance;
                        const transferDistance = Game.rooms[room.roomName].findPath(target.pos, source.pos,{ignoreCreeps: true}).length;
                        Memory.groups[planName].transferDistance = transferDistance;
                        Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + 24;
                        //console.log(JSON.stringify(Memory.groups[planName]));
                    }
                    const source = Game.getObjectById(SourceID);
                    const links = source.pos.findInRange(FIND_MY_STRUCTURES,2,{filter: (structure) => {
                        return structure.structureType == STRUCTURE_LINK}});
                    if (links.length > 0){
                        Memory.groups[planName].LinkID = links[0].id;
                        Memory.groups[planName].roleLimit = [1,0];
                    }else{
                        Memory.groups[planName].LinkID = null;
                        Memory.groups[planName].roleLimit = [1,1];
                    }
                    if (Game.rooms[room.roomName].controller.level == 8 && room.roomName == "W29S22"){
                        Memory.groups[planName].roleBody[0] = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                        Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + Memory.groups[planName].roleBody[0].length * 3;
                    }else if((Game.rooms[room.roomName].controller.level == 8){
                        Memory.groups[planName].roleBody[0] = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                        Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + Memory.groups[planName].roleBody[0].length * 3;
                    }
                    // update role body

                    // const baseBody = [CARRY,CARRY,MOVE];
                    // const multiplier = Math.min(Math.ceil(Memory.groups[planName].transferDistance/5),Math.floor(energyCapacityAvailable/150));
                    // var roleBody = [];
                    // for (let i = 0; i < multiplier; i++) {
                    //     roleBody = roleBody.concat(baseBody);
                    // }
                    // Memory.groups[planName].roleBody[0] = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
                    // Memory.groups[planName].roleBody[1] = roleBody;
                    // // update spawnAhead time
                    // Memory.groups[planName].spawnAhead[1] = Memory.groups[planName].distance + roleBody.length * 3;
                    // Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + Memory.groups[planName].roleBody[0].length * 3;
                }else{
                    // ignore this room
                }
            }

        }
    }
}
module.exports = planSource;