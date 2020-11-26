
Game.rooms.forEach(room => {
    if (room.controller && room.controller.my && room.controller.level == 8){
        let structs = room.find(FIND_MY_STRUCTURES);
        structs.forEach(sturct => {
            sturct.destory();
        });
        let creeps = room.find(FIND_MY_CREEPS);
        creeps.forEach(creep => {
            creep.suicide();
        });
        room.controller.unclaim();
    }
});