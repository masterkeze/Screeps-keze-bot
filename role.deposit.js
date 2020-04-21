var roleDeposit = {
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
        var storage = Game.getObjectById(groupPlan.StorageID);
        if (!storage){
            console.log(creep.name+" is not assigned with a valid StorageID!");
            return;
        }
        const flag = Game.flags[groupID];
        if (!creep.memory.ticksBack){
            var ticksBack = 0;
        }else{
            var ticksBack = creep.memory.ticksBack;
        }
        
        if((creep.store[RESOURCE_METAL] == 0 || creep.memory.harvesting) && creep.ticksToLive >= ticksBack) {
            creep.memory.harvesting = true;
            creep.memory.dontPullMe = true;
            if (creep.pos.isNearTo(flag)){
                if (!creep.memory.ticksBack){
                    creep.memory.ticksBack = 1515 - creep.ticksToLive;
                }
                var deposit = creep.pos.findClosestByRange(FIND_DEPOSITS);
                creep.harvest(deposit);
                if (deposit.cooldown > 70){
                    groupPlan.roleBody = [[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]];
                }
                if (deposit.cooldown >= 80){
                    groupPlan.roleLimit = [0];
                }
            }else{
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30})
            }
            if(creep.store.getFreeCapacity() == 0 || creep.ticksToLive < ticksBack){
                creep.memory.harvesting = false;
                creep.memory.dontPullMe = false;
                creep.say('back');
            }
        }else{
            creep.memory.harvesting = false;
            creep.memory.dontPullMe = false;
            if(creep.transfer(storage,RESOURCE_METAL) == ERR_NOT_IN_RANGE){
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30});
            }
                
        }
        if (creep.ticksToLive < ticksBack && creep.store[RESOURCE_METAL] == 0){
            creep.suicide();
        }
        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_METAL] > 0) {
            creep.withdraw(tomb,RESOURCE_METAL);
        }
	}
};

module.exports = roleDeposit;