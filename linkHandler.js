module.exports = global.runLink = function(linksFrom,linksTo){
    for (let link of linksFrom) {
        if (!link.cooldown && link.store[RESOURCE_ENERGY]>=400){
            for (let target of linksTo) {
                let result = link.transferEnergy(target);
                if (result === OK){
                    break;
                }
            }
        }
    }
}