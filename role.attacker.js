var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = Game.getObjectById("5e3272cbbe0a857e8fef9039");
        // var targets = creep.room.find(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return structure.structureType == STRUCTURE_EXTENSION;
        //     }
        // });
        // var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        // if (target){
        //     if(creep.attack(target) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(target);
        //     }
        // }
        //creep.moveTo(Game.flags.Flag3);
	}
};

module.exports = roleAttacker;