var planUpgrade = {
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
            const planName = "upgrade_"+room.roomName;

            if (room.StorageID){
                if (!room.SpawnIDs){
                    console.log(room.roomName+" has no spawn!")
                    continue;
                }
                if (!Memory.groups[planName]){
                    const links = Game.rooms[room.roomName].controller.pos.findInRange(FIND_MY_STRUCTURES,5,{filter: (structure) => {
                        return structure.structureType == STRUCTURE_LINK}});
                    if (links.length > 0){
                        var SourceID = links[0].id;
                    }else{
                        const containers = Game.rooms[room.roomName].controller.pos.findInRange(FIND_STRUCTURES,5,{filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER}});
                        //console.log(containers);
                        if (containers.length > 0){
                            var SourceID = containers[0].id;
                        }else{
                            continue;
                        }
                    }
                    Memory.groups[planName] = {
                        groupType: 'upgrade',
                        roomName: room.roomName,
                        groupID: planName,
                        ContainerID: room.StorageID,
                        TargetID: SourceID,
                        SourceID: SourceID,
                        ControllerID: room.ControllerID,
                        SpawnID: room.SpawnIDs[0],
                        roles: ["upgrader","transferer"],
                        roleLimit: [2,1],
                        roleBody: [[WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]],
                        spawnAhead: [0,0],
                        creeps: []
                    };
                    if (links.length>0){
                        Memory.groups[planName].roleLimit[1] = 0;
                    }
                    const controller = Game.getObjectById(room.ControllerID);
                    const spawn = Game.getObjectById(Memory.groups[planName].SpawnID);
                    //console.log(JSON.stringify(Game.rooms[room.roomName]));
                    const distance = Game.rooms[room.roomName].findPath(spawn.pos, controller.pos,{ignoreCreeps: true}).length;
                    Memory.groups[planName].distance = distance;
                    Memory.groups[planName].spawnAhead[0] = distance + 30;
                    //console.log(JSON.stringify(Memory.groups[planName]));
                }
                const links = Game.rooms[room.roomName].controller.pos.findInRange(FIND_MY_STRUCTURES,5,{filter: (structure) => {
                    return structure.structureType == STRUCTURE_LINK}});
                const Store = Game.rooms[room.roomName].storage.store[RESOURCE_ENERGY];
                if (Game.rooms[room.roomName].controller.level == 8){
                    //console.log(Game.rooms[room.roomName].controller.ticksToDowngrade < 100000);
                    if (Game.rooms[room.roomName].controller.ticksToDowngrade < 120000 && Store < 500000){
                        Memory.groups[planName].roleLimit[0] = 1;
                        Memory.groups[planName].roleBody[0] = [WORK,WORK,CARRY,MOVE];
                        continue;
                    }else if (Store >= 500000){
                        //console.log("set upgrade rolelimt to 0");
                        Memory.groups[planName].roleLimit[0] = 1;
                        Memory.groups[planName].roleBody[0] = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                        continue;
                    }else{
                        Memory.groups[planName].roleLimit[0] = 0;
                    }
                }else{
                    Memory.groups[planName].roleLimit[0] = Math.min(3,Math.ceil(Store/50000));
                }
                if (room.roomName == "W31S23"){
                    Memory.groups[planName].roleLimit[0] = 1;
                    Memory.groups[planName].roleBody[0] = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                    Memory.groups[planName].roleLimit[1] = 0;
                    Memory.groups[planName].roleBody[1] = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
                }
                if (links.length > 0){
                    Memory.groups[planName].SourceID = links[0].id;
                    Memory.groups[planName].roleLimit[1] = 0;
                    continue;
                }
                // if (!Game.getObjectById(Memory.groups[planName].SourceID)){
                //     Memory.groups[planName].roleLimit = [0,0];
                // }
                // //update role body
                // const energyCapacityAvailable = room.energyCapacityAvailable;
                // const baseBody = [CARRY,CARRY,MOVE];
                // const multiplier = Math.ceil(Memory.groups[planName].distance/5);
                // var roleBody = [];
                // for (let i = 0; i < multiplier; i++) {
                //     roleBody = roleBody.concat(baseBody);
                // }
                // if (roleBody.length == 0){
                //     roleBody = [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE];
                // }
                // Memory.groups[planName].roleBody[1] = roleBody;
                // Memory.groups[planName].roleLimit[1] = 1;
                // // update spawnAhead time
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
module.exports = planUpgrade;