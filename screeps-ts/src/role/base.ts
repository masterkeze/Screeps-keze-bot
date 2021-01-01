import { Helper } from 'helper'
import { Group } from 'modules/group';

const roles: {
    [role in BaseRoleConstant]: () => IRoleConfig
} = {
    primitive: (): IRoleConfig => ({
        /**
         * Primitive 原始人，负责早期房间维护的“唯一”职业，身兼数职，集“采集”，“运输”，“建造”，“填充”，“升级” 为一体
         * @param  {Creep} creep
         */
        emit(creep: Creep): ({ newState: StateConstant, data: StateData }) {
            let newState: StateConstant;
            let targetPos: RoomPosition | { pos: RoomPosition };

            let energyStore = creep.getMomentStore(RESOURCE_ENERGY) as number;

            if (energyStore == 0){
            }

            return { newState: newState, data: { targetPos: targetPos } };
        }
    })
}

export default roles;