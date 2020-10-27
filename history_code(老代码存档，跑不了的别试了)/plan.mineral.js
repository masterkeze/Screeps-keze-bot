var planMineral = {
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
            const planName = "mineral_"+room.roomName;
            if (room.ExtractorID && room.MineralID){
                const ExtractorID = room.ExtractorID;
                const MineralID = room.MineralID;
                if (!room.SpawnIDs){
                    console.log(room.roomName+" has no spawn!")
                    continue;
                }
                const energyCapacityAvailable = room.energyCapacityAvailable;
                if (energyCapacityAvailable < 650){
                    console.log(room.roomName+" Energy Capacity not enough to use mineral plan");
                    continue;
                }
                if (!Memory.groups[planName]){
                    const container = Game.getObjectById(ExtractorID).pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER }});
                    
                    if(container.length ==0){
                        //console.log("No container found neer to mineral in room "+room.roomName);
                        continue;
                    }
                    const ContainerID = container[0].id;
                    Memory.groups[planName] = {
                        groupType: 'mineral',
                        roomName: room.roomName,
                        groupID: planName,
                        SourceID: MineralID,
                        ContainerID: ContainerID,
                        TargetID: room.StorageID,
                        SpawnID: room.SpawnIDs[0],
                        roles: ["harvester","transferer"],
                        roleLimit: [1,1],
                        roleBody: [[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],[CARRY,CARRY,MOVE]],
                        spawnAhead: [0,0],
                        creeps: []
                    };
                    const extractor = Game.getObjectById(ExtractorID);
                    const spawn = Game.getObjectById(Memory.groups[planName].SpawnID);
                    const target = Game.getObjectById(Memory.groups[planName].TargetID);
                    //console.log(JSON.stringify(Game.rooms[room.roomName]));
                    const distance = Game.rooms[room.roomName].findPath(spawn.pos, extractor.pos,{ignoreCreeps: true}).length;
                    Memory.groups[planName].distance = distance;
                    const transferDistance = Game.rooms[room.roomName].findPath(target.pos, extractor.pos,{ignoreCreeps: true}).length;
                    Memory.groups[planName].transferDistance = transferDistance;
                    console.log(planName+" plan initialized");
                }
                const storage = Game.getObjectById(room.StorageID);
                const Mineral = Game.getObjectById(MineralID);
                if (Mineral.mineralAmount == 0 || storage.store.getFreeCapacity()<200000 || storage.store[RESOURCE_ENERGY] < 80000){
                    Memory.groups[planName].roleLimit = [0,0];
                    continue;
                }else{
                    Memory.groups[planName].roleLimit = [1,1];
                }
                if (storage.store.getFreeCapacity()<300000){
                    Memory.groups[planName].TargetID = room.TerminalID;
                }else{
                    Memory.groups[planName].TargetID = room.StorageID;
                }
                // update role body
                const workBody = [WORK,WORK,MOVE];
                const workNum = Math.min(16,Math.floor(room.energyCapacityAvailable*0.9/250));
                var roleBody = [CARRY];
                for (let i = 0; i < workNum; i++) {
                    roleBody = roleBody.concat(workBody);
                }
                Memory.groups[planName].roleBody[0] = roleBody;
                Memory.groups[planName].spawnAhead[0] = Memory.groups[planName].distance + roleBody.length * 3;
                const baseBody = [CARRY,MOVE,CARRY];
                const multiplier = Math.min(Math.ceil(Memory.groups[planName].transferDistance*workNum/125),Math.floor(energyCapacityAvailable/150));
                var roleBody = [];
                for (let i = 0; i < multiplier; i++) {
                    roleBody = roleBody.concat(baseBody);
                }
                Memory.groups[planName].roleBody[1] = roleBody;
                // update spawnAhead time
                Memory.groups[planName].spawnAhead[1] = Memory.groups[planName].distance + roleBody.length * 3;
            }else{
                // ignore this room
            }


        }
    }
}
module.exports = planMineral;