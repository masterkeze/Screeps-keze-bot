var roleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        //Game.spawns["KAZE"].spawnCreep([CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE],'claim1', {memory: {role: 'claimer'}})
        // var groupID = creep.memory.groupID;
        // if (!groupID){
        //     console.log(creep.name+" is not assigned with a groupID!");
        //     return;
        // } 
        // var groupPlan = Memory.groups[groupID];
        // if (!groupPlan){
        //     console.log(creep.name+" is not assigned with a valid group!");
        //     return;
        // }
        // // Assume the groupPlan is valid
        // // Enroll to the group plan
        // if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
        //     groupPlan.creeps.push(creep.id);
        // }
        // var target = Game.getObjectById(groupPlan.TargetID);
        // if (!target){
        //     console.log(creep.name+" is not assigned with a valid target!");
        //     return;
        // }
        const room = Game.rooms['W31S23']
        if (!room) {
            creep.moveTo(new RoomPosition(25, 25, 'W31S23'),{visualizePathStyle: {stroke: '#ffffff'},reusePath:100})
        }
        else {
            if (creep.claimController(room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(room.controller)
            }
        }
	}
};

module.exports = roleClaimer;