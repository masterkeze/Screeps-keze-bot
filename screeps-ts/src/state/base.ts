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
            let reachData = data;
            reachData.range = 1;
            reachOnEnter(creep, reachData);
        },
        actions: {
            moveTo: reachOnceAction,
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
                    if (creep.pos.getRangeTo(controller) > 3) {
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
            let reachData = data;
            reachData.range = 1;
            reachOnEnter(creep, reachData);
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
                        if (!sourceID) {
                            return StateContinue.Exit;
                        }
                        stateData.sourceID = sourceID;
                    }
                    let source = Game.getObjectById(stateData.sourceID) as Source;
                    if (creep.pos.getRangeTo(source) > 1) {
                        return StateContinue.Continue;
                    }
                    if (source.energy == 0) {
                        // wait for regeneration
                        return StateContinue.Continue;
                    }
                    // 执行
                    let retCode = creep.harvest(source);
                    if (retCode == ERR_NOT_OWNER) {
                        // 取消外矿任务 或派出 claimer 或其他
                        return StateContinue.Exit;
                    }
                    if (creep.getMomentStore(RESOURCE_ENERGY) as number >= creep.store.getCapacity(RESOURCE_ENERGY)) {
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
            let reachData = data;
            reachData.range = 1;
            reachOnEnter(creep, reachData);
            let stateData = creep.getCurrentStateData();
            stateData.resourceType = data.resourceType;
            stateData.amount = data.amount;
        },
        actions: {
            moveTo: reachAction,
            transfer(creep: Creep): StateContinue {
                let stateData = creep.getCurrentStateData();
                let resourceType = stateData.resourceType;
                let amount = stateData.amount;
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.targetID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let targetID = getHasStoreTargetIDAt(targetPos);
                        if (!targetID) {
                            return StateContinue.Exit;
                        }
                        stateData.targetID = targetID;
                    }
                    let target = Game.getObjectById(stateData.targetID) as StructureStorage;
                    if (creep.pos.getRangeTo(target) > 1) {
                        return StateContinue.Continue;
                    }
                    // 执行
                    creep.transfer(target, resourceType, amount);
                    return StateContinue.Exit;
                } else {
                    return StateContinue.Continue;
                }
            }
        },
        onExit(creep: Creep): void { }
    }),
    withdrawOnce: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateDataOneResource): void {
            let reachData = data;
            reachData.range = 1;
            reachOnEnter(creep, reachData);
            let stateData = creep.getCurrentStateData();
            stateData.resourceType = data.resourceType;
            stateData.amount = data.amount;
        },
        actions: {
            moveTo: reachAction,
            withdraw(creep: Creep): StateContinue {
                let stateData = creep.getCurrentStateData();
                let resourceType = stateData.resourceType;
                let amount = stateData.amount;
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.targetID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let targetID = getHasStoreTargetIDAt(targetPos);
                        if (!targetID) {
                            return StateContinue.Exit;
                        }
                        stateData.targetID = targetID;
                    }
                    let target = Game.getObjectById(stateData.targetID) as StructureStorage;
                    if (creep.pos.getRangeTo(target) > 1) {
                        return StateContinue.Continue;
                    }
                    // 执行
                    creep.withdraw(target, resourceType, amount);
                    return StateContinue.Exit;
                } else {
                    return StateContinue.Continue;
                }
            }
        },
        onExit(creep: Creep): void { }
    }),
    buildUntilEmpty: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateData): void {
            let reachData = data;
            reachData.range = 3;
            reachOnEnter(creep, reachData);
        },
        actions: {
            moveTo: reachOnceAction,
            build(creep: Creep): StateContinue {
                let stateData = creep.getCurrentStateData();
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.targetID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let targetID = getConstructionSiteIDAt(targetPos);
                        if (!targetID) {
                            return StateContinue.Exit;
                        }
                        stateData.targetID = targetID;
                    }
                    let target = Game.getObjectById(stateData.targetID) as ConstructionSite;
                    if (!target) {
                        return StateContinue.Exit;
                    }
                    if (creep.pos.getRangeTo(target) > 3) {
                        return StateContinue.Continue;
                    }
                    // 执行
                    creep.build(target);
                    if (creep.getMomentStore(RESOURCE_ENERGY) == 0) {
                        return StateContinue.Exit;
                    }
                    return StateContinue.Continue;
                } else {
                    return StateContinue.Continue;
                }
            }
        },
        onExit(creep: Creep): void { }
    }),
    withdrawMulti: (): IStateConfig => ({
        onEnter(creep: Creep, data: StateDataMultiResources): void {
            let reachData = data;
            reachData.range = 1;
            reachOnEnter(creep, reachData);
            let stateData = creep.getCurrentStateData();
            stateData.store = data.store;
        },
        actions: {
            moveTo: reachAction,
            withdraw(creep: Creep): StateContinue {
                let stateData = creep.getCurrentStateData();
                let store = stateData.store;
                let resourceTypes = Object.keys(store);
                if (resourceTypes.length == 0) {
                    return StateContinue.Exit;
                }
                let resourceType = resourceTypes[0] as ResourceConstant;
                let amount = store[resourceType];
                if (creep.store.getFreeCapacity(resourceType) == 0) {
                    return StateContinue.Exit;
                }
                let withdrawAmount = Math.min(amount, creep.store.getFreeCapacity(resourceType));

                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.targetID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let targetID = getHasStoreTargetIDAt(targetPos);
                        if (!targetID) {
                            return StateContinue.Exit;
                        }
                        stateData.targetID = targetID;
                    }
                    let target = Game.getObjectById(stateData.targetID) as StructureStorage;
                    if (!target) {
                        return StateContinue.Exit;
                    }
                    if (creep.pos.getRangeTo(target) > 1) {
                        return StateContinue.Continue;
                    }
                    withdrawAmount = Math.min(withdrawAmount,target.store[resourceType]);
                    // 执行
                    creep.withdraw(target, resourceType, withdrawAmount);
                    if (withdrawAmount == amount) {
                        delete store[resourceType];
                        return StateContinue.Continue;
                    } else {
                        return StateContinue.Exit;
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

function getSourceIDAt(pos: RoomPosition): string {
    let founds = pos.lookFor(LOOK_SOURCES);
    if (founds.length == 0) {
        return "";
    } else {
        return founds[0].id;
    }
}

function getConstructionSiteIDAt(pos: RoomPosition): string {
    let founds = pos.lookFor(LOOK_CONSTRUCTION_SITES);
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

function getHasStoreTargetIDAt(pos: RoomPosition) {
    let structureFounds = pos.lookFor(LOOK_STRUCTURES) as any[];
    let creepFounds = pos.lookFor(LOOK_CREEPS) as any[];
    let founds = structureFounds.concat(creepFounds);
    if (founds.length == 0) {
        return "";
    }
    let output: string = "";
    for (const found of founds) {
        if ("store" in found) {
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

function reachOnceAction(creep: Creep | PowerCreep): StateContinue {
    let stateData = creep.getCurrentStateData();
    if (!stateData.reached) {
        if (creep.pos.roomName == stateData.targetPos.roomName) {
            if (creep.pos.inRangeTo(stateData.targetPos.x, stateData.targetPos.y, 1)) {
                stateData.reached = 1;
                return StateContinue.Exit;
            }
        }
        creep.moveTo(new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName), { range: 1 });
        creep.room.visual.line(creep.pos.x, creep.pos.y, stateData.targetPos.x, stateData.targetPos.y);
        return StateContinue.Continue;
    } else {
        if (creep.pos.roomName != stateData.targetPos.roomName || !creep.pos.inRangeTo(stateData.targetPos.x, stateData.targetPos.y, stateData.range)) {
            stateData.reached = 0;
            creep.moveTo(new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName), { range: 1 });
            creep.room.visual.line(creep.pos.x, creep.pos.y, stateData.targetPos.x, stateData.targetPos.y);
            return StateContinue.Continue;
        }
        return StateContinue.Exit;
    }
}