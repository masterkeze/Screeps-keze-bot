var roleCManager = {
    /** @param {Creep} creep **/
    run: function(creep) {
        const roomName = creep.room.name;
        const room = Game.rooms[roomName];
        var groupID = creep.memory.groupID;
        if (!groupID){
            console.log(creep.name+" is not assigned with a groupID!");
            return;
        } 
        var groupPlan = Memory.groups[groupID];
        if (!groupPlan){
            console.log(creep.name+" is not assigned with a valid group!");
            return;
        }

        // Assume the groupPlan is valid
        // Enroll to the group plan
        if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id){
            groupPlan.creeps.push(creep.id);
        }
        // const centerFlag = Game.flags["center_"+roomName];
        // if(creep.pos.getRangeTo(centerFlag) > 0){
        //     creep.memory.working = false;
        // }
        if (!creep.memory.working){
            const centerFlag = Game.flags["center_"+roomName];
            if (!centerFlag){
                console.log("center flag required");
            }
            const distance = creep.pos.getRangeTo(centerFlag);
            if (distance > 0){
                creep.moveTo(centerFlag, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 30});
            }else{
                creep.memory.working = true;
                creep.memory.dontPullMe = true;
            }
        }

        if (creep.memory.working){
            //check center link capacity
            const room = Game.rooms[roomName];
            const storage = Game.getObjectById(groupPlan.StorageID);
            const terminal = Game.getObjectById(groupPlan.TerminalID);
            // if (groupPlan.CenterLinkID){
            //     const link = Game.getObjectById(groupPlan.CenterLinkID);
            //     var taskName = "link_out_"+roomName;
            //     if ((!groupPlan.tasks[taskName]) && link.store[RESOURCE_ENERGY] >= 200){
            //         room.addCenterTask(taskName,RESOURCE_ENERGY,link.store[RESOURCE_ENERGY],groupPlan.CenterLinkID,groupPlan.StorageID);
            //     }
            // }
            // if (groupPlan.PowerSpawnID){
            //     const powerSpawn = Game.getObjectById(groupPlan.PowerSpawnID);
            //     var taskName = "powerSpawn_E_"+roomName;
            //     if (powerSpawn && (!groupPlan.tasks[taskName]) && powerSpawn.store[RESOURCE_ENERGY] <=400 && storage.store[RESOURCE_ENERGY] > 200000){
            //         room.addCenterTask(taskName,RESOURCE_ENERGY,powerSpawn.store.getFreeCapacity(RESOURCE_ENERGY),groupPlan.StorageID,groupPlan.PowerSpawnID);
            //     }
            //     var taskName ="powerSpawn_P_"+roomName;
            //     var powerAmount = powerSpawn.store.getFreeCapacity(RESOURCE_POWER);

            //     var fromID = 0;
            //     if (storage.store[RESOURCE_POWER] > powerAmount){
            //         fromID = groupPlan.StorageID;
            //     }else if(terminal.store[RESOURCE_POWER] >= powerAmount){
            //         fromID = groupPlan.TerminalID;
            //     }
            //     //console.log(powerAmount);
            //     if (fromID && (!groupPlan.tasks[taskName]) && powerAmount >= 90 ){
            //         room.addCenterTask(taskName,RESOURCE_POWER,powerAmount,fromID,groupPlan.PowerSpawnID);
            //     }
            // }

            // check work list
            var tasks = groupPlan.tasks;
            var waiting = groupPlan.waiting;
            var processing = groupPlan.processing;
            var suspended = groupPlan.suspended;
            if (processing.length == 0 && creep.store.getUsedCapacity()>0){
                creep.transfer(storage,Object.keys(creep.store)[0]);
            }
            if (processing.length>0){
                var taskName = processing.shift();
                var toProcess = tasks[taskName];
                var creepStore = creep.store[toProcess.resource];
                var target = Game.getObjectById(toProcess.ToID);
                if (creepStore > 0){
                    var result = creep.transfer(target,toProcess.resource,creepStore);
                    switch (result) {
                        case OK:
                            
                            if (creepStore >=  toProcess.amount){
                                creep.say("完成"+taskName);
                                // 任务完成，移出处理列表
                                if (!toProcess.onFinished || toProcess.onFinished == "delete"){
                                    delete tasks[taskName];
                                }else{
                                    room.handle(toProcess.onFinished);
                                    delete tasks[taskName];
                                }
                            } else{
                                // 任务未完成，回到等待列表末尾
                                toProcess.amount -= creepStore;
                                creep.say(toProcess.resource+":"+creepStore);
                                waiting.push(taskName);
                            }
                            break;
                        default:
                            console.log(taskName+" task in "+roomName+" transfer error:"+result);
                            if (creep.transfer(storage,toProcess.resource,creepStore) == OK){
                                // storage is not full, transfer resource to storage 
                            }else if(creep.transfer(terminal,toProcess.resource,creepStore) == OK){
                                // terminal is not full, transfer resource to terminal
                            }else{
                                // drop the resource
                                console.log("ALARM! No available capacity for "+roomName);
                                creep.drop(toProcess.resource);
                            }
                            if (!toProcess.onSuspended || toProcess.onSuspended == "delete"){
                                delete tasks[taskName];
                            }else{
                                room.handle(toProcess.onSuspended);
                                delete tasks[taskName];
                            }
                            break;
                    }
                }else{
                    waiting.push(taskName);
                }
            }
            if(waiting.length > 0 && processing.length == 0 && creep.store.getFreeCapacity() > 100 && creep.ticksToLive > 2){
                var taskName = waiting.shift();
                var toProcess = tasks[taskName];
                var creepStore = Math.min(creep.store.getFreeCapacity(),toProcess.amount);
                var target = Game.getObjectById(toProcess.FromID);
                if (creepStore>0){
                    var result = creep.withdraw(target,toProcess.resource,creepStore);
                    switch (result) {
                        case OK:
                            //creep.say("取出");
                            processing.push(taskName);
                            break;
                    
                        default:
                            //console.log(taskName+" task in "+roomName+" suspended, lack of "+toProcess.resource);
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
                    room.handle(toProcess.onSuspended);
                    delete tasks[taskName];
                }
            }
            // if (suspended.length>0){
            //     waiting.push(suspended.shift());
            // }
            // if (waiting.length > 0 && !tasks[waiting[0]]){
            //     waiting.shift();
            // }
            // 更新回groupPlan
            // Memory.groups[groupID].tasks = tasks;
            // Memory.groups[groupID].waiting = waiting;
            // Memory.groups[groupID].processing = processing;
            // Memory.groups[groupID].suspended = suspended;
        }

    }
}
module.exports = roleCManager;