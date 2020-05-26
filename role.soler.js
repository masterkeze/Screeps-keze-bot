//Game.spawns["HENSHIN"].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],'soler1', {memory: {role: 'soler', target:'ATTACK'}})
//Game.spawns["HENSHIN"].spawnCreep([MOVE],'soler1', {memory: {role: 'soler', target:'ATTACK'}})

var roleSoler = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.target || !Game.flags[creep.memory.target]){
            console.log("please assign a target for "+creep.name);
            return;
        }
        const target = Game.flags[creep.memory.target];
        // console.log(target.);
        // return;
        if(creep.hits < creep.hitsMax){
            creep.heal(creep);
        }
        if(target.pos.roomName != creep.room.name){
            creep.moveTo(target);
        }else{
            var spawn;
            if (!creep.memory.spawnID || !(Game.getObjectById(creep.memory.spawnID))){
                var creeps = creep.room.find(FIND_HOSTILE_CREEPS);
                if (creeps.length > 0){
                    spawn = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                }else{
                    var spawns = creep.room.find(FIND_HOSTILE_SPAWNS);
                    if(spawns.length>0){
                        spawn = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
                    }
                }
                if (spawn){
                    creep.memory.spawnID = spawn.id;
                }
                
            }else{
                spawn = Game.getObjectById(creep.memory.spawnID);
            }
            if (!spawn){
                delete creep.memory.path;
                creep.say("wow");
                return;
            }

            // if (!creep.memory.path){
            //     let StructureCostMat = new PathFinder.CostMatrix;
            //     let totalStructures = creep.room.find(FIND_STRUCTURES);
            //     let x,y;
            //     for (let s of totalStructures) {
            //         if(s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL){
            //             x = s.pos.x; y = s.pos.y;
            //             StructureCostMat.set(x, y, 255);
            //         }
            //     }
            //     PathFinder.use(true);
            //     const path = creep.room.findPath(creep.pos, spawn.pos, {
            //         costCallback: function(roomName,costMatrix){
            //             return StructureCostMat
            //         },ignoreDestructibleStructures: false,
            //     });
            //     creep.memory.path = Room.serializePath(path);
            //     console.log(JSON.stringify(StructureCostMat));
            //     console.log(JSON.stringify(path));
            // }



            if(creep.pos.getRangeTo(spawn) > 1){
                creep.moveTo(spawn,{ignoreSwamps: true,maxOps : 20000,ignoreDestructibleStructures:false,visualizePathStyle: {stroke: '#ffffff'}})
            }else{
                creep.attack(spawn);
            }
        }
    }
}
module.exports = roleSoler;