var planSteal = {
    update: function() {
        if (!Memory.groups){
            return;
        }
        var groups = Object.keys(Memory.groups);
        for (const group of groups) {
            if (group.startsWith("steal") && !Game.flags[Memory.groups[group].stealFlag]){
                console.log("clearing group "+group);
                delete Memory.groups[group];
            }
        }
    }
}
module.exports = planSteal;