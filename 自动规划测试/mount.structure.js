'use strict';
module.exports = function () {
    _.assign(Structure.prototype, structureExtension);
}

const structureExtension = {
    transferEnergyAndLog(targetLink,amount=0){
        var transferAmount;
        if (!amount){
            transferAmount = this.store.energy;
        }else{
            transferAmount = amount;
        }

        if (transferAmount == 0){
            return "wait";
        }
        let momentTransfer = targetLink.getMomentOnResource("transfer","energy");
        if ( transferAmount > targetLink.store.getFreeCapacity("energy") + 200 - momentTransfer){
            return "wait";
        }
        let result = this.transferEnergy(targetLink,transferAmount);
        if (result == OK){
            targetLink.setMomentOnResource("transfer","energy",transferAmount);
        }
        return result;
    }
}

