import { stat } from "fs";

/**
 * 基础状态机
 */
const states: {
    [state in BaseStateConstant]: () => IStateConfig
} = {
    /**
     * 抵达某处
     */
    reach: (): IStateConfig => ({
        onEnter: reachOnEnter,
        actions: {
            moveTo: reachAction
        },
        onExit(creep: Creep): void { }
    }),
    upgrade: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateData_upgrade): void {
            reachOnEnter(creep, data);
            let stateData = creep.getStateData(creep.getCurrentState());
            stateData.range = 3;
        },
        actions: {
            moveTo: reachAction,
            other(creep: Creep): StateContinue {
                if (creep.store.energy == 0) {
                    return StateContinue.Exit;
                }
                let stateData = creep.getStateData(creep.getCurrentState());
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.controllerID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let founds = targetPos.lookFor(LOOK_STRUCTURES);
                        if (founds.length == 0) {
                            return StateContinue.Exit;
                        }
                        let controllerID: string = "";
                        for (const found of founds) {
                            if (found instanceof StructureController) {
                                controllerID = found.id;
                            }
                        }
                        if (!controllerID) {
                            return StateContinue.Exit;
                        }
                        stateData.controllerID = controllerID;
                    }
                    let controller = Game.getObjectById(stateData.controllerID) as StructureController;
                    creep.upgradeController(controller);
                    if (creep.getActiveBodyparts(WORK) >= creep.store.energy) {
                        return StateContinue.Exit;
                    } else {
                        return StateContinue.Continue;
                    }
                } else {
                    return StateContinue.Continue;
                }
            }
        },
        onExit(creep: Creep): void { }
    }),
}

export default states;

function reachOnEnter(creep: Creep, data: StateData_reach): void {
    let stateData = creep.getStateData(creep.getCurrentState());

    if (data.targetPos instanceof RoomPosition) {
        stateData.targetPos = {
            x: data.targetPos.x,
            y: data.targetPos.y,
            roomName: data.targetPos.roomName
        }
    } else {
        stateData.targetPos = {
            x: data.targetPos.pos.x,
            y: data.targetPos.pos.y,
            roomName: data.targetPos.pos.roomName
        }
    }
    let range = 0;
    if (stateData.range) {
        range = stateData.range;
    }
    stateData.range = range;
}

function reachAction(creep: Creep | PowerCreep): StateContinue {
    let stateData = creep.getStateData(creep.getCurrentState());
    if (creep.pos.roomName == stateData.targetPos.roomName) {
        if (creep.pos.inRangeTo(stateData.targetPos.x, stateData.targetPos.y, stateData.range)) {
            return StateContinue.Exit;
        }
    }
    creep.moveTo(new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName), { range: stateData.range });
    return StateContinue.Continue;
}