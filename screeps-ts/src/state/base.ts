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
    upgradeUntilEmpty: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateData): void {
            let stateData = data;
            stateData.range = 1;
            reachOnEnter(creep, stateData);
        },
        actions: {
            moveTo: reachAction,
            upgradeController(creep: Creep): StateContinue {
                if (creep.store.energy == 0) {
                    return StateContinue.Exit;
                }
                let stateData = creep.getCurrentStateData();
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.controllerID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let controllerID: string = getStructureIdAt(targetPos, STRUCTURE_CONTROLLER);
                        if (!controllerID) {
                            return StateContinue.Exit;
                        }
                        stateData.controllerID = controllerID;
                    }
                    let controller = Game.getObjectById(stateData.controllerID) as StructureController;
                    if (creep.pos.getRangeTo(controller) > 3){
                        return StateContinue.Continue;
                    }
                    // 执行
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
    harvestUntilFull: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateData): void {
            let stateData = data;
            stateData.range = 1;
            reachOnEnter(creep, stateData);
        },
        actions: {
            moveTo: reachAction,
            harvest(creep: Creep): StateContinue {
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    return StateContinue.Exit;
                }
                let stateData = creep.getCurrentStateData();
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.sourceID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let sourceID = getSourceIDAt(targetPos);
                        if (!sourceID){
                            return StateContinue.Exit;
                        }
                        stateData.sourceID = sourceID;
                    }
                    let source = Game.getObjectById(stateData.sourceID) as Source;
                    if (creep.pos.getRangeTo(source) > 1){
                        return StateContinue.Continue;
                    }
                    if (source.energy == 0){
                        // wait for regeneration
                        return StateContinue.Continue;
                    }
                    // if (stateData.harvestMode == 1){
                    //     if ((source.energy/source.ticksToRegeneration) < creep.getActiveBodyparts(WORK)*2){
                    //         return StateContinue.Exit;
                    //     }
                    // }
                    // 执行
                    let retCode = creep.harvest(source);
                    if (retCode == ERR_NOT_OWNER){
                        // 取消外矿任务 或派出 claimer 或其他
                        return StateContinue.Exit;
                    }
                    if (creep.getMomentStore(RESOURCE_ENERGY) as number >= creep.store.getCapacity(RESOURCE_ENERGY)){
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
    transferOnce: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateDataOneResource): void {
            let stateData = data;
            stateData.range = 1;
            reachOnEnter(creep, stateData);
        },
        actions:{
            moveTo: reachAction,
            transfer(creep: Creep): StateContinue {
            }
        },
        onExit(creep: Creep): void {}
    })
}

export default states;

function getSourceIDAt(pos: RoomPosition): string {
    let founds = pos.lookFor(LOOK_SOURCES);
    if (founds.length == 0) {
        return "";
    } else {
        return founds[0].id;
    }
}

function getStructureIdAt(pos: RoomPosition, structureType: StructureConstant): string {
    let founds = pos.lookFor(LOOK_STRUCTURES);
    if (founds.length == 0) {
        return "";
    }
    let output: string = "";
    for (const found of founds) {
        if (found instanceof Structure && found.structureType == structureType) {
            output = found.id;
            break;
        }
    }
    return output;
}

function reachOnEnter(creep: Creep, data: StateData): void {
    let stateData = creep.getCurrentStateData();

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
    let stateData = creep.getCurrentStateData();
    if (creep.pos.roomName == stateData.targetPos.roomName) {
        if (creep.pos.inRangeTo(stateData.targetPos.x, stateData.targetPos.y, stateData.range)) {
            return StateContinue.Exit;
        }
    }
    creep.moveTo(new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName), { range: stateData.range });
    creep.room.visual.line(creep.pos.x, creep.pos.y, stateData.targetPos.x, stateData.targetPos.y);
    return StateContinue.Continue;
}