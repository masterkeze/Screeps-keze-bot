var roleTransferer = {
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
        var container = Game.getObjectById(groupPlan.ContainerID);
        if (!container){
            console.log(creep.name+" is not assigned with a valid container!");
            return;
        }
        var target = Game.getObjectById(groupPlan.TargetID);
        if (!target){
            console.log(creep.name+" is not assigned with a valid target!");
            return;
        }
        
        var resources = Object.keys(container.store);
        if (resources.length>0){
            creep.memory.ResourceType = resources[0];
        }
        // working
        if(creep.store.getUsedCapacity() == 0 || creep.memory.harvesting) {
            // try to harvest
            
            creep.memory.harvesting = true;
            
            if(creep.pos.isNearTo(container)) {
                if(groupPlan.containerLock == creep.id || groupPlan.containerLock == 0 || !groupPlan.containerLock || !Game.getObjectById(groupPlan.containerLock)){
                    groupPlan.containerLock = creep.id;
                    creep.withdraw(container,creep.memory.ResourceType);
                }
            }else{
                creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'},ignoreCreeps: true,reusePath: 30});
            }
            if(creep.store.getFreeCapacity() == 0){
                
                creep.memory.harvesting = false;
                creep.say('transfer');
                groupPlan.containerLock = 0;
            }
        }else {
            
            // transfer to the target
            // console.log("transferer:"+creep.id+" transfer target:"+target.id);
            //console.log(JSON.stringify(target.store.getFreeCapacity()));
            if(creep.transfer(target, creep.memory.ResourceType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},ignoreCreeps: true,reusePath: 30});
            }
        }
        // pick up dropped stuff or withdraw tomb
        // var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        var tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES);
        // if(creep.pos.isNearTo(dropped) && creep.store.getFreeCapacity() > 0 && dropped.resourceType == creep.memory.ResourceType) {
        //     creep.pickup(dropped);
        // }
        if(creep.pos.isNearTo(tomb) && creep.store.getFreeCapacity() > 0 && tomb.store[creep.memory.ResourceType] > 0) {
            creep.withdraw(tomb,creep.memory.ResourceType);
        }
	}
};

module.exports = roleTransferer;