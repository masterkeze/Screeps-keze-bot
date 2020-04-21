function updateStructures(){
    var towers = [];
    for (const structure in Game.structures) {
        if (Game.structures[structure].structureType == STRUCTURE_TOWER){
            towers.push(Game.structures[structure].id);
            //console.log(Game.structures[structure].id);
        }
    }
    Memory.towers = towers;
}


var statistics = {
    update: function() {
        const rooms = Object.keys(Game.rooms);
        if (!Memory.rooms){
            Memory.rooms = Object();
        }
        //console.log(JSON.stringify(rooms));
        for (var i=0; i<rooms.length;i++) {
            const room = Game.rooms[rooms[i]];
            const myStructureCount = room.find(FIND_MY_STRUCTURES).length;
            if (myStructureCount == 0){
                continue;
            }
            if (Memory.rooms[room.name] && Memory.rooms[room.name].myStructureCount && Memory.rooms[room.name].myStructureCount == myStructureCount){
                continue;
            }
            console.log("Update statistics for room "+room.name);
            updateStructures();
            var statistics = Object();
            statistics.roomName = room.name;
            statistics.energyAvailable = room.energyAvailable;
            statistics.energyCapacityAvailable = room.energyCapacityAvailable;
            statistics.myStructureCount = myStructureCount;
            if (room.storage) {
                statistics.StorageID = room.storage.id;
            }else{
                statistics.StorageID = 0;
            }
            if (room.terminal) {
                statistics.TerminalID = room.terminal.id;
            }else{
                statistics.TerminalID = 0;
            }
            if (room.controller) {
                statistics.ControllerID = room.controller.id;
                if (room.controller.isPowerEnabled){
                    statistics.isPowerEnabled = true;
                }else{
                    statistics.isPowerEnabled = false;
                }
            }else{
                statistics.ControllerID = 0;
            }
            const terrain = new Room.Terrain(room.name);
            const sources = room.find(FIND_SOURCES);
            statistics.SourceIDs = [];
            statistics.sourcePlain = [];
            if (sources){
                for (const source of sources) {
                    statistics.SourceIDs.push(source.id);
                    var plainCount = 0;
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if(terrain.get(source.pos.x-1+i,source.pos.y-1+j) == 0){
                                plainCount += 1;
                            }
                        }
                        
                    }
                    statistics.sourcePlain.push(plainCount);
                }
            }
            const towers = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_TOWER;}});
            statistics.TowerIDs = [];
            if (towers){
                for (const tower of towers){
                    statistics.TowerIDs.push(tower.id);
                }
            }
            const containers = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_CONTAINER;}});
            statistics.ContainerIDs = [];
            if (containers){
                for (const container of containers){
                    statistics.ContainerIDs.push(container.id);
                }
            }
            const spwans = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_SPAWN;}});
            statistics.SpawnIDs = [];
            if (spwans){
                for (const spawn of spwans){
                    statistics.SpawnIDs.push(spawn.id);
                }
            }
            const links = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_LINK;}});
            statistics.LinkIDs = [];
            statistics.LinksFrom = [];
            statistics.LinksTo = [];
            if (links){
                for (const link of links){
                    if (room.storage){
                        if (link.pos.findInRange(FIND_SOURCES,3).length>0){
                            statistics.LinksFrom.push(link.id);
                            continue;
                        }
                        if (link.pos.getRangeTo(room.storage)<=3){
                            statistics.CenterLinkID = link.id;
                            continue;
                        }
                        if (link.pos.getRangeTo(room.controller)<=3){
                            statistics.ControllerLinkID = link.id;
                            continue;
                        }
                        statistics.LinksTo.push(link.id);
                    }
                    statistics.LinkIDs.push(link.id);
                }
            }
            const labs = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_LAB;}});
            statistics.LabIDs = [];
            if (labs){
                for (const lab of labs){
                    statistics.LabIDs.push(lab.id);
                }
            }
            const minerals = room.find(FIND_MINERALS);
            if (minerals.length>0){
                const mineral = minerals[0];
                statistics.MineralID = mineral.id;
                statistics.MineralType = mineral.mineralType;
            }

            const extractors = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_EXTRACTOR;}});
            if(extractors.length>0){
                const extractor = extractors[0];
                statistics.ExtractorID = extractor.id;
            }

            const factories = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_FACTORY;}})
            if (factories.length>0){
                statistics.FactoryID = factories[0].id;
            }else{
                statistics.FactoryID = 0;
            }

            const powerSpawns = room.find(FIND_MY_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_POWER_SPAWN;}})
            if (powerSpawns.length>0){
                statistics.PowerSpawnID = powerSpawns[0].id;
            }else{
                statistics.PowerSpawnID = 0;
            }
            Memory.rooms[room.name] = statistics;
            //console.log(JSON.stringify(LabIDs));
        }
    }
}
module.exports = statistics;