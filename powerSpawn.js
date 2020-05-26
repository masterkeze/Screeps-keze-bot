var PCs = ["GGEZ","ZYCNB","ZOFIA"];
var rooms = ["W29S22","W28S22","W26S23"];
var powerSpwan = {
    run: function(){
        if (Game.time % 23 == 0){
            var cpuStart = Game.cpu.getUsed();
        }
        for (let i = 0; i < rooms.length; i++) {
            var PCName = PCs[i];
            var room = Memory.rooms[rooms[i]];
            var roomObj = Game.rooms[rooms[i]];

            var powerSpawn = Game.getObjectById(room.PowerSpawnID);
            powerSpawn.processPower();

            var storage = Game.getObjectById(room.StorageID);
            var terminal = Game.getObjectById(room.TerminalID);
            var controller = Game.getObjectById(room.ControllerID);
            var factory = Game.getObjectById(room.FactoryID);
            
            var PC = Game.powerCreeps[PCName];
            if (!PC){
                continue;
            }
            if (!PC.ticksToLive){
                //console.log("PC not alive");
                //console.log(PC.spawn(powerSpawn));
                if(PC.spawn(powerSpawn) == -11){
                    var groupPlan = Memory.groups["center_"+rooms[i]];
                    //console.log(JSON.stringify(groupPlan.usingPC));
                    groupPlan.usingPC = false;
                    groupPlan.PC = PCName;
                    groupPlan.roleLimit = [1];
                    groupPlan.roleBody = [[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE]];
                    continue;
                }
                continue;
            }

            if (PC.ticksToLive < 500){
                PC.say("renew!");
                PC.renew(powerSpawn);
            }
            if (!controller.isPowerEnabled){
                const controller = PC.room.controller;
                if (PC.pos.getRangeTo(controller) > 1){
                    PC.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30});
                }else{
                    PC.enableRoom(controller);
                }
                continue;
            }

            var workForSource = false;
            if(PC.powers[PWR_REGEN_SOURCE]){
                PC.memory.working = false;
                var sources = PC.room.find(FIND_SOURCES);
                if(sources.length > 0){
                    for (const source of sources) {
                        var distance = PC.pos.getRangeTo(source);
                        if (PC.powers[PWR_REGEN_SOURCE].cooldown > distance) continue;
                        if(!source.effects || !source.effects[0] || source.effects[0].ticksRemaining <= distance+3){
                            workForSource = true;
                            if (distance <= 3){
                                if (PC.usePower(PWR_REGEN_SOURCE,source) != OK){
                                    workForSource = false;
                                }
                            }else{
                                PC.moveTo(source,{range:3});
                            }
                            break;
                            
                        }
                    }
                }
            }
            if (workForSource) continue;
            //PC.memory.working = true;
            var workFlag = Game.flags["PC_"+rooms[i]];
            if (PC.memory.workAsCenter){
                workFlag = Game.flags["center_"+rooms[i]];
                var groupPlan = Memory.groups["center_"+rooms[i]];
                groupPlan.usingPC = true;
                groupPlan.PC = PCName;
                //groupPlan.creeps=[PC.id];
            }

            if (PC.memory.workAsDistribute && PC.powers[PWR_OPERATE_EXTENSION]){
                //var opt_ext_level = PC.powers[PWR_OPERATE_EXTENSION].level;
                var distributePlan = Memory.groups["distribute_"+rooms[i]];
                //var opt_ext_threshold = Math.min(POWER_INFO[PWR_OPERATE_EXTENSION].effect[opt_ext_level-1],0.5);
                var opt_ext_threshold = 0.2;
                distributePlan.usingPC = false;
            }
            
            if (!workFlag){
                console.log("No PC flag for room "+rooms[i]);
                continue;
            }
            if (!PC.memory.working || PC.pos.getRangeTo(workFlag) > 0){
                if (PC.pos.getRangeTo(workFlag) > 0){
                    PC.moveTo(workFlag, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30});
                    PC.memory.working = false;
                    continue;
                }else{
                    PC.memory.dontPullMe = true;
                    PC.memory.working = true;
                }
            }
            // working
            if (PC.memory.working){
                if (PC.store[RESOURCE_OPS] < 100){
                    var addup = 100 - PC.store[RESOURCE_OPS];
                    if (PC.withdraw(storage,RESOURCE_OPS,addup) == ERR_NOT_IN_RANGE){
                        PC.withdraw(terminal,RESOURCE_OPS,addup);
                    }
                }
                if (PC.powers[PWR_GENERATE_OPS].cooldown == 0 && PC.store.getFreeCapacity() > 10){
                    PC.usePower(PWR_GENERATE_OPS);
                    if (PC.store[RESOURCE_OPS] > 150){
                        var freeup = PC.store[RESOURCE_OPS] - 100;
                        if (PC.transfer(storage,RESOURCE_OPS,freeup) == ERR_NOT_IN_RANGE){
                            PC.transfer(terminal,RESOURCE_OPS,freeup);
                        }
                    }
                }

                if (PC.memory.workAsDistribute && PC.powers[PWR_OPERATE_EXTENSION]){
                    if ((roomObj.energyCapacityAvailable - roomObj.energyAvailable) / roomObj.energyCapacityAvailable > opt_ext_threshold){
                        PC.usePower(PWR_OPERATE_EXTENSION,storage);
                    }

                }

                if (PC.memory.workAsCenter){
                    // check work list
                    var tasks = groupPlan.tasks;
                    var waiting = groupPlan.waiting;
                    var processing = groupPlan.processing;
                    var suspended = groupPlan.suspended;
                    if (processing.length == 0 && PC.store.getUsedCapacity()>0){
                        for (const resource_occupied of Object.keys(PC.store)) {
                            if (resource_occupied != RESOURCE_OPS){
                                PC.transfer(storage,resource_occupied);
                                break;
                            }
                        }
                        
                    }
                    if (processing.length>0){
                        var taskName = processing.shift();
                        var toProcess = tasks[taskName];
                        var creepStore = PC.store[toProcess.resource];
                        var target = Game.getObjectById(toProcess.ToID);
                        if (creepStore > 0){
                            var result = PC.transfer(target,toProcess.resource,creepStore);
                            switch (result) {
                                case OK:
                                    
                                    if (creepStore >=  toProcess.amount){
                                        PC.say("完成"+taskName);
                                        // 任务完成，移出处理列表
                                        if (!toProcess.onFinished || toProcess.onFinished == "delete"){
                                            delete tasks[taskName];
                                        }else{
                                            roomObj.handle(toProcess.onFinished);
                                            delete tasks[taskName];
                                        }
                                    } else{
                                        // 任务未完成，回到等待列表末尾
                                        toProcess.amount -= creepStore;
                                        PC.say(toProcess.resource+":"+creepStore);
                                        waiting.push(taskName);
                                    }
                                    break;
                                default:
                                    console.log(taskName+" task in "+rooms[i]+" transfer error:"+result);
                                    console.log(JSON.stringify(toProcess));
                                    if (PC.transfer(storage,toProcess.resource,creepStore) == OK){
                                        // storage is not full, transfer resource to storage 
                                    }else if(PC.transfer(terminal,toProcess.resource,creepStore) == OK){
                                        // terminal is not full, transfer resource to terminal
                                    }else{
                                        // drop the resource
                                        console.log("ALARM! No available capacity for "+rooms[i]);
                                        PC.drop(toProcess.resource);
                                    }
                                    if (!toProcess.onSuspended || toProcess.onSuspended == "delete"){
                                        delete tasks[taskName];
                                    }else{
                                        roomObj.handle(toProcess.onSuspended);
                                        delete tasks[taskName];
                                    }
                                    break;
                            }
                        }else{
                            waiting.push(taskName);
                        }
                    }
                    if(waiting.length > 0 && processing.length == 0 && PC.store.getFreeCapacity() > 100 && PC.ticksToLive > 2){
                        var taskName = waiting.shift();
                        var toProcess = tasks[taskName];
                        var creepStore = Math.min(PC.store.getFreeCapacity(),toProcess.amount);
                        var target = Game.getObjectById(toProcess.FromID);
                        if (creepStore>0){
                            var result = PC.withdraw(target,toProcess.resource,creepStore);
                            switch (result) {
                                case OK:
                                    //PC.say("取出");
                                    processing.push(taskName);
                                    break;
                            
                                default:
                                    //console.log(taskName+" task in "+rooms[i]+" suspended, lack of "+toProcess.resource);
                                    if (!toProcess.onSuspended || toProcess.onSuspended == "delete"){
                                        delete tasks[taskName];
                                    }else{
                                        room.handle(toProcess.onSuspended);
                                        delete tasks[taskName];
                                    }
                                    break;
                            }
                        }else{
                            console.log(taskName+" task amount <= 0 invalid");
                            roomObj.handle(toProcess.onSuspended);
                            delete tasks[taskName];
                        }
                    }
                }
            }


            // if(controller.isPowerEnabled){
            //     if (PC.powers["1"].cooldown == 0){
    
            //         if (PC.store.getFreeCapacity(RESOURCE_OPS) <= 2){
            //             if (PC.pos.getRangeTo(storage) > 1){
            //                 PC.transfer(terminal,RESOURCE_OPS,PC.store[RESOURCE_OPS]);
            //             }else{
            //                 PC.transfer(storage,RESOURCE_OPS,PC.store[RESOURCE_OPS]);
            //             }

            //         }
            //         PC.usePower(PWR_GENERATE_OPS);
            //         // PC.transfer(storage,RESOURCE_OPS,PC.store[RESOURCE_OPS]);
            //     }
            //     if (PC.pos.getRangeTo(Game.flags["PC_"+room]) > 0){
            //         PC.moveTo(Game.flags["PC_"+room], {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30});
            //         PC.memory.dontPullMe = true;
            //     }
            // }else{

            // }
        }
        if (Game.time % 23 == 0){
            var cpuEnd = Game.cpu.getUsed();
            Memory.stats.cpu.powerSpawn = cpuEnd - cpuStart;
        }
        
    }
};

module.exports = powerSpwan;