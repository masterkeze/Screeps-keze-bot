var roleAttacker = {
    /** @param {Creep} creep **/
    run: function(creep) {
        /**
         * 
            Game.spawns["JOJO"].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],'deposit1', {memory: {role: 'deposit'}})
            Game.spawns["GUFFY"].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],'deposit1', {memory: {role: 'deposit'}})
         */
        var groupID = creep.memory.groupID;
        if (!groupID){
            console.log(creep.name+" is not assigned with a groupID!");
            return;
        } 
        var groupPlan = Memory.groups[groupID];
        if (!groupPlan){
            console.log(creep.name+" is not assigned with a valid group!");
            return;
        }
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
            groupPlan.creeps.push(creep.id);
        }
        const flag = Game.flags[groupID];
 
        

        if (creep.pos.isNearTo(flag)){
            if (!creep.memory.ticksBack){
                creep.memory.ticksBack = 1515 - creep.ticksToLive;
            }
            var deposit = creep.pos.findClosestByRange(FIND_DEPOSITS);
            const pb = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType == STRUCTURE_POWER_BANK;
                }
            });
            const healer = Game.getObjectById(creep.memory.healer);
            healer.heal(creep);
        }else{
            creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'}})
        }
	}
};

module.exports = roleAttacker;