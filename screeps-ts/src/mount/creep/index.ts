import { assignPrototype } from "utils"
import CreepExtension from "./extension"

/**
 * 挂载 creep 拓展
 */
export default () => {
    
    if (!Creep.prototype._attack){
        Creep.prototype._attack = Creep.prototype.attack;
        Creep.prototype._attackController = Creep.prototype.attackController;
        Creep.prototype._build = Creep.prototype.build;
        Creep.prototype._dismantle = Creep.prototype.dismantle;
        Creep.prototype._drop = Creep.prototype.drop;
        Creep.prototype._harvest = Creep.prototype.harvest;
        Creep.prototype._heal = Creep.prototype.heal;
        Creep.prototype._move = Creep.prototype.move;
        Creep.prototype._moveTo = Creep.prototype.moveTo;
        Creep.prototype._moveByPath = Creep.prototype.moveByPath;
        Creep.prototype._pickup = Creep.prototype.pickup;
        Creep.prototype._pull = Creep.prototype.pull;
        Creep.prototype._rangedAttack = Creep.prototype.rangedAttack;
        Creep.prototype._rangedHeal = Creep.prototype.rangedHeal;
        Creep.prototype._rangedMassAttack = Creep.prototype.rangedMassAttack;
        Creep.prototype._repair = Creep.prototype.repair;
        Creep.prototype._transfer = Creep.prototype.transfer;
        Creep.prototype._upgradeController = Creep.prototype.upgradeController;
        Creep.prototype._withdraw = Creep.prototype.withdraw;
    }

    assignPrototype(Creep, CreepExtension);
}