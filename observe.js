

var observe = {
//"W30S21","W30S22","W29S22","W29S22",
    run : function(observer){
        const config = {
            bindRoom:["W29S22","W29S22","W29S22","W26S19","W26S19","W26S19","W26S19","W26S19","W26S19","W26S19"],
            observeList:["W30S23","W30S24","W30S25","W27S20","W26S20","W25S20","W24S20","W23S20","W22S20","W21S20"]
        }
        const length = config.observeList.length;
        const index = Game.time % length;
        const target = config.observeList[index];
        observer.observeRoom(target)

        const lastIndex = ((Game.time % length)+length-1)%length;
        const lastTarget = config.observeList[lastIndex];
        const room = Game.rooms[lastTarget];
        if (room){
            const terrain = new Room.Terrain(room.name);
            //console.log("observing "+lastTarget);
            const deposits = room.find(FIND_DEPOSITS,{filter:(mineral)=>{return mineral.cooldown < 40;}});
            if (deposits.length>0){
                //console.log("Find deposit in room "+lastTarget);
                var runRoom = config.bindRoom[lastIndex];
                for (const deposit of deposits) {
                    var x = deposit.pos.x;
                    var y = deposit.pos.y;
                    var look = room.lookForAt(LOOK_FLAGS, deposit);
                    var name = 'deposit_'+lastTarget+"_"+x+"_"+y;
                    if (look.length == 0){
                        room.createFlag(x,y,name);
                    }
                    if (!Memory.groups[name]){
                        var plainCount = 0;
                        for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < 3; j++) {
                                if(terrain.get(deposit.pos.x-1+i,deposit.pos.y-1+j) == 0){
                                    plainCount += 1;
                                }
                            }
                        }
                        var runRoomObj = Memory.rooms[runRoom];
                        Memory.groups[name] = {
                            groupType: 'deposit',
                            roomName: runRoom,
                            groupID: name,
                            StorageID: runRoomObj.StorageID,
                            SpawnID: runRoomObj.SpawnIDs[0],
                            roles: ["deposit"],
                            roleLimit: [Math.min(4,plainCount)],
                            roleBody: [[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]],
                            spawnAhead: [0],
                            creeps: []
                        }
                        console.log(name+" group created!");
                    }
                }
            }
        }else{
            console.log("can't access room "+lastTarget);
        }
    }
}

module.exports = observe;