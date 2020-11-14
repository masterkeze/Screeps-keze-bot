const PHASES = {
    PREPARE : "prepare",
    WITHDRAW : "withdraw",
    TRANSFER : "transfer",
    IDLE : "idle"
}

module.exports = {
    /**
     * solve transfer tasks inside the room
     * transferOnce / withdrawOnce
     * @param {Creep} creep 
     */
    run: function (creep) {
        let groupID = creep.memory.groupID;
        if (!groupID) {
            console.log(creep.name + " is not assigned with a groupID!");
            return;
        }
        let groupPlan = Memory.groups[groupID];
        if (!groupPlan) {
            console.log(creep.name + " is not assigned with a valid group!");
            return;
        }
        // Assume the groupPlan is valid
        // Enroll to the group plan
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id) {
            groupPlan.creeps.push(creep.id);
        }

        let taskName = creep.memory.workingOn;
        let task = tasks[taskName];
        if (!task || !task.validate()) {
            // get a task to soleve
            task = getTransferTask(creep);
            creep.memory.phase = PHASES.PREPARE;
        }
        if (!task) {
            creep.memory.workingOn = null;
            creep.memory.phase = PHASES.IDLE;
            // clear stuff, and turn to idle state
        } else {
            const resourceType = Object.keys(task.store)[0];
            const amount = task.store[resourceType];
            const currentState = creep.getState();
            let runResult,newState,config;
            let creepStore = creep.getStore();
            let usedCapacity = _.sum(Object.values(creepStore));
            let totalCapacity = creep.store.getCapacity();
            let unusedCapacity = totalCapacity - usedCapacity;
            // same task
            if (task.name == creep.memory.workingOn){
                if (currentState){
                    runResult = creep.runState();
                    if (runResult == currentState){
                        return;
                    }
                }
            } else {
                creep.memory.workingOn = task.name;
                // register to the task
            }
            // transite state
            switch (creep.memory.phase) {
                case PHASES.TRANSFER:
                    // transfer OK, task complete
                    task.callback();
                    // unregister the creep
                    creep.memory.phase = PHASES.IDLE;
                    creep.transitionState("",{});
                    break;
                case PHASES.WITHDRAW:
                    newState = "transferOnce";
                    config = {target : task.target, resourceType : resourceType, amount : amount};
                    creep.memory.phase = PHASES.TRANSFER;
                    creep.transitionState(newState,config);
                    break;
                case PHASES.PREPARE:
                    newState = "withdrawOnce";
                    config = {source : task.source,resourceType : resourceType,amount : amount};
                    creep.memory.phase = PHASES.WITHDRAW;
                    creep.transitionState(newState,config);
                    break;
                case PHASES.IDLE:
                    if (unusedCapacity >= amount){
                        newState = "withdrawOnce";
                        config = {source : task.source,resourceType : resourceType,amount : amount};
                        creep.memory.phase = PHASES.WITHDRAW;
                        creep.transitionState(newState,config);
                    }
                    break;
                default:
                    break;
            }
        }
    }
}


/**
 * 
 * @param {Creep} creep 
 * @return {TransferTask} task
 */
function getTransferTask(creep){
    /**
     * 匹配条件
     * 1. 就近原则
     * 2. 存活时间足够
     * 
     */
    return 1;
}