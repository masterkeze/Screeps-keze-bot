var roleStealer = {
    /** @param {Creep} creep **/
    run: function(creep) {
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
        if (!flag){
            console("No flag for "+groupID);
        }
        if (!creep.memory.ticksBack){
            var ticksBack = 0;
        }else{
            var ticksBack = creep.memory.ticksBack;
        }
        if ((creep.store.getUsedCapacity() == 0 || creep.memory.harvesting) && creep.ticksToLive >= ticksBack){
            creep.memory.harvesting = true;
            creep.memory.dontPullMe = false;
            if (creep.pos.isNearTo(flag)){
                if (!creep.memory.ticksBack){
                    creep.memory.ticksBack = 1515 - creep.ticksToLive;
                }
                var look = creep.room.lookForAt(LOOK_STRUCTURES, flag);
                
                //console.log(JSON.stringify(look));
                var target = false;
                for (const obj of look) {
                    if (obj.store){
                        target = obj;
                        break;
                    }
                }
                if (target){
                    creep.say("target found!");
                    if (target.store.getUsedCapacity() > 0){
                        creep.withdraw(target,Object.keys(target.store)[0]);
                    }
                }

            }else{
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30})
            }
            if(creep.store.getFreeCapacity() == 0 || creep.ticksToLive < ticksBack || (target && target.store.getUsedCapacity() == 0)){
                creep.memory.harvesting = false;
                creep.memory.dontPullMe = false;
                creep.say('back');
            }
            if (target && target.store.getUsedCapacity() == 0){
                groupPlan.roleLimit = [0];
            }
        }else{
            creep.memory.harvesting = false;
            creep.memory.dontPullMe = false;
            if(creep.transfer(storage,Object.keys(creep.store)[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30});
            }
            if (creep.ticksToLive < 2*ticksBack+5 && creep.store.getFreeCapacity() != 0){
                creep.suicide();
            }
        }


    }
};

module.exports = roleStealer;