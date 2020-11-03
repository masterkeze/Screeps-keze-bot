module.exports = {
    /**
     * solve tasks inside the room
     * @param {Creep} creep 
     */
    run : function(creep){
        let groupID = creep.memory.groupID;
        if (!groupID){
            console.log(creep.name+" is not assigned with a groupID!");
            return;
        } 
        let groupPlan = Memory.groups[groupID];
        if (!groupPlan){
            console.log(creep.name+" is not assigned with a valid group!");
            return;
        }
        // Assume the groupPlan is valid
        // Enroll to the group plan
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
            groupPlan.creeps.push(creep.id);
        }
        const currentState = creep.getState();
        //creep.say(currentState);
        let runResult;
        if (currentState){
            runResult = creep.runState();
            //creep.say(creep.getStore("energy"));
            if (runResult == currentState){
                return;
            }
        }
        let newState,config;
    }
}