

var planDeposit = {
    update: function() {
        if (!Memory.groups){
            return;
        }
        // var groups = Object.keys(Memory.groups);
        // for (const group of groups) {
        //     if (group.startsWith("deposit") && (Memory.groups[group].creeps.length == 0)){
        //         console.log("clearing group "+group);
        //         delete Memory.groups[group];
        //     }
        // }
    }
}
module.exports = planDeposit;