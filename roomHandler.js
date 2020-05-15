/**
 * 
 * @param {string} roomName
 * @returns {int}
 */
var roomHandler = function(roomName){
    const roomObj = Game.rooms[roomName];
    if (!roomObj){

    }
    if (!Memory.rooms){
        Memory.rooms = {};
    }
    if (roomObj.controller && roomObj.controller.my){
        const room = Memory.rooms[roomName];
        if (!room){
            console.log("No statistics for room "+roomName);
            updateStatistics(roomName);
            return -1;
        }
        // task sender
        // regular check
    
    
    
        // task handler
        // structures
        // spawn
        if (room.SpawnIDs){
            runSpawn(roomName);
        }else{
            // send email
            console.log("No spawn for room "+roomName);
            return -1;
        }
        // powerspawn
        if (room.PowerSpawnID){
            var powerspawn = Game.getObjectById(room.PowerSpawnID);
            if (powerspawn){
                runPowerspawn(powerspawn);
            }
        }
        // links
        if (room.LinksFrom && room.LinksTo){
            var linksFrom = [];
            var linksTo = [];
            for (const LinkID of room.LinksFrom) {
                var link = Game.getObjectById(LinkID);
                if (link){
                    linksFrom.push(link);
                }
            }
            for (const LinkID of room.LinksTo) {
                var link = Game.getObjectById(LinkID);
                if (link){
                    linksTo.push(link);
                }
            }
            if (linksFrom.length>=0 && linksTo.length>=0){
                runLink(linksFrom,linksTo);
            }
        }
        // towers
        if (room.TowerIDs){
            var towers = [];
            for (const TowerID of room.TowerIDs) {
                var tower = Game.getObjectById(TowerID);
                if (tower){
                    towers.push(tower);
                }
            }
            if (towers.length>0){
                runTower(towers);
            }
        }
        // factory
        if (room.FactoryID){
            const factory = Game.getObjectById(room.FactoryID);
            runFactory(factory);
        }
        // terminal
        if (room.TerminalID){
            const terminal = Game.getObjectById(room.TerminalID);
            runTerminal(terminal);
            runMarket(terminal);
        }
        // creeps
        // PC
        // normal creeps
    }else{
        // maybe cache some rooms
    }
}

module.exports = roomHandler;