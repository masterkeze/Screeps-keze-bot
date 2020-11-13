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
        }
        if (!task) {
            creep.memory.workingOn = null;
            // clear stuff, and turn to idle state
        } else {
            // to solve a task, there are three
            if (task.name == creep.memory.workingOn){
                // continue the current state
            } else {
                // terminate
            }
        }

        const currentState = creep.getState();
        //creep.say(currentState);
        let runResult;
        if (currentState) {
            runResult = creep.runState();
            //creep.say(creep.getStore("energy"));
            if (runResult == currentState) {
                return;
            }
        }
        let newState, config;
    }
}


/**
 * 给creep找任务
 * @param {Creep} creep 
 */
function getTransferTask(creep){
    /**
     * 硬性条件
     * 1. 一次可以运完
     * 2. 存活时间足够
     * 3. 就近原则
     */
}