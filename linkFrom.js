var linkFrom = {
    /** @param {Tower} tower **/
    //|| (structure.structureType == STRUCTURE_RAMPART && structure.hits <2000)
    run: function(link) {
        if (link.store[RESOURCE_ENERGY]<400){
            return;
        }
        if (!Memory.rooms[link.room.name]){
            return;
        }

        var centerLink = Game.getObjectById(Memory.rooms[link.room.name].CenterLinkID);
        var controllerLink = Game.getObjectById(Memory.rooms[link.room.name].ControllerLinkID);
        if(controllerLink && controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400){
            link.transferEnergy(controllerLink);
            return;
        }
        if(centerLink && centerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400){
            link.transferEnergy(centerLink);
            return;
        }
        // var LinksTo = Memory.rooms[link.room.name].LinksTo;
        // for (const TargetID of LinksTo) {
        //     const LinkTo = Game.getObjectById(TargetID);
        //     if (LinkTo && LinkTo.store.getFreeCapacity(RESOURCE_ENERGY) >= 400){
        //         link.transferEnergy(LinkTo);
        //     }
        // }
    }
}

module.exports = linkFrom;