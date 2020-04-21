var rolepureharvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
            var source = Game.getObjectById(creep.memory.source);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                //creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                creep.moveTo(Game.flags.Flag5);
            }
            
        }
};

module.exports = rolepureharvester;