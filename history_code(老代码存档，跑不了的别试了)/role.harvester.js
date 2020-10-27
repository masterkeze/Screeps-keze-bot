var roleHarvester = {
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

        // Assume the groupPlan is valid
        // Enroll to the group plan
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
            groupPlan.creeps.push(creep.id);
        }
        var source = Game.getObjectById(groupPlan.SourceID);
        if (!source){
            console.log(creep.name+" is not assigned with a valid source!");
            return;
        }
        if (!creep.memory.idleTicks){
            if(source.energyCapacity){
                var harvestSpeed = creep.getActiveBodyparts(WORK) * 2;
                var generationSpeed = source.energyCapacity / 300;
                creep.memory.idleTicks = Math.max(Math.floor(harvestSpeed/generationSpeed),1);
            }
        }
        if (!creep.memory.randomIndex){
            creep.memory.randomIndex = Game.time % creep.memory.idleTicks;
        }

        if ( source.energyCapacity && source.energyCapacity != source.energy && creep.memory.idleTicks > 1 && source.energy / source.ticksToRegeneration < source.energyCapacity / 300 && (Game.time + creep.memory.randomIndex) % creep.memory.idleTicks != 0){
            return;
        }

        var link = Game.getObjectById(groupPlan.LinkID);
        if (link){
            var container = link;
        }else{
            var container = Game.getObjectById(groupPlan.ContainerID);
            if (!container){
                console.log(creep.name+" is not assigned with a valid container!");
                return;
            }
        }

        if (!creep.memory.harvesting){
            if (creep.pos.getRangeTo(source) >= 1){
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'},reusePath: 5});;
            }else{
                creep.memory.harvesting = true;
                creep.memory.dontPullMe = true;
            }
        }else{
            creep.memory.dontPullMe = true;
        }
        if (creep.pos.getRangeTo(container) > 1){
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'},reusePath: 5});;
        }
        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        // if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0) {
        //     creep.pickup(dropped);
        // }
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[RESOURCE_ENERGY] > 0) {
            creep.withdraw(tomb,RESOURCE_ENERGY);
        }
        if (container.store.getFreeCapacity()>0 || (link && container.store.getFreeCapacity(RESOURCE_ENERGY)>0)){
            creep.memory.dontPullMe = true;
            creep.harvest(source);
        }
        // var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        // if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0 && dropped.resourceType == RESOURCE_ENERGY) {
        //     creep.pickup(dropped);
        // }
        if (creep.store.getUsedCapacity() > 30){
            creep.transfer(container,Object.keys(creep.store)[0]);
        }
	}
};

module.exports = roleHarvester;