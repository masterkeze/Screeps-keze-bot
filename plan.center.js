var planCenter = {
    update: function() {
        if (Game.time % 23 == 0){
            var cpuStart = Game.cpu.getUsed();
        }
        const rooms = Object.keys(Game.rooms);
        if (!Memory.rooms){
            return;
        }
        if (!Memory.groups){
            return;
        }
        //console.log(JSON.stringify(rooms));
        for (var i=0; i<rooms.length;i++) {
            var room = Memory.rooms[rooms[i]];
            var roomObj = Game.rooms[rooms[i]];
            if (!room){
                continue;
            }
            var planName = "center_"+room.roomName;
            if(Game.flags[planName]){
                if (!room.SpawnIDs){
                    console.log(room.roomName+" has no spawn!");
                    continue;
                }
                if (!Memory.groups[planName]){
                    Memory.groups[planName] = {
                        groupType: 'center',
                        roomName: room.roomName,
                        groupID: planName,
                        tasks: new Object(),
                        waiting: [],
                        processing: [],
                        suspended: [],
                        SpawnID: room.SpawnIDs[0],
                        roles: ["cmanager"],
                        roleLimit: [1],
                        roleBody: [[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE]],
                        spawnAhead: [0],
                        creeps: [],
                        StorageID: room.StorageID,
                        TerminalID: room.TerminalID,
                        FactoryID: room.FactoryID,
                        CenterLinkID: room.CenterLinkID,
                        PowerSpawnID: room.PowerSpawnID
                    }
                }
                if (!Memory.groups[planName].PowerSpawnID || Memory.groups[planName].PowerSpawnID == room.CenterLinkID){
                    Memory.groups[planName].PowerSpawnID = room.PowerSpawnID;
                }
                if (!Memory.groups[planName].CenterLinkID){
                    Memory.groups[planName].CenterLinkID = room.CenterLinkID;
                }
                if (Memory.groups[planName].waiting.length == 0 && Memory.groups[planName].processing.length == 0 && Memory.groups[planName].suspended.length == 0 && Object.keys(Memory.groups[planName].tasks).length > 0){
                    console.log("reset "+planName);
                    Memory.groups[planName].tasks = {};
                }

                const groupPlan = Memory.groups[planName];
                //groupPlan.roleBody = [[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE]];
                //groupPlan.spawnAhead = [51];
                const storage = Game.getObjectById(groupPlan.StorageID);
                const terminal = Game.getObjectById(groupPlan.TerminalID);
                const factory = Game.getObjectById(room.FactoryID);
                var taskName = "energy_S_T";
                if ((!groupPlan.tasks[taskName]) && storage.store[RESOURCE_ENERGY] > 100000 && terminal.store[RESOURCE_ENERGY] < 20000){
                    
                    Game.rooms[room.roomName].addCenterTask(taskName,RESOURCE_ENERGY,20000 - terminal.store[RESOURCE_ENERGY],groupPlan.StorageID,groupPlan.TerminalID);
                }
                var taskName = "energy_T_S";
                if ((!groupPlan.tasks[taskName]) && terminal.store[RESOURCE_ENERGY] > 20000 && storage.store[RESOURCE_ENERGY] < 300000){
                    
                    Game.rooms[room.roomName].addCenterTask(taskName,RESOURCE_ENERGY,terminal.store[RESOURCE_ENERGY] - 20000,groupPlan.TerminalID,groupPlan.StorageID);
                }


                if (groupPlan.CenterLinkID){
                    const link = Game.getObjectById(groupPlan.CenterLinkID);
                    var taskName = "link_out_"+room.roomName;
                    if ((!groupPlan.tasks[taskName]) && link.store[RESOURCE_ENERGY] >= 200){
                        roomObj.addCenterTask(taskName,RESOURCE_ENERGY,link.store[RESOURCE_ENERGY],groupPlan.CenterLinkID,groupPlan.StorageID);
                    }
                }
                if (groupPlan.PowerSpawnID){
                    const powerSpawn = Game.getObjectById(groupPlan.PowerSpawnID);
                    var taskName = "powerSpawn_E_"+room.roomName;
                    if (powerSpawn && (!groupPlan.tasks[taskName]) && powerSpawn.store[RESOURCE_ENERGY] <=400 && storage.store[RESOURCE_ENERGY] > 200000){
                        roomObj.addCenterTask(taskName,RESOURCE_ENERGY,powerSpawn.store.getFreeCapacity(RESOURCE_ENERGY),groupPlan.StorageID,groupPlan.PowerSpawnID);
                    }
                    var taskName ="powerSpawn_P_"+room.roomName;
                    var powerAmount = powerSpawn.store.getFreeCapacity(RESOURCE_POWER);
    
                    var fromID = 0;
                    if (storage.store[RESOURCE_POWER] > powerAmount){
                        fromID = groupPlan.StorageID;
                    }else if(terminal.store[RESOURCE_POWER] >= powerAmount){
                        fromID = groupPlan.TerminalID;
                    }
                    //console.log(powerAmount);
                    if (fromID && (!groupPlan.tasks[taskName]) && powerAmount >= 90 ){
                        roomObj.addCenterTask(taskName,RESOURCE_POWER,powerAmount,fromID,groupPlan.PowerSpawnID);
                    }
                }


                if (!room.FactoryID || !Memory.factory[room.roomName]){
                    continue;
                }

                var mineralType = room.MineralType;

                if (mineralType && Game.time % 1013 == 0 && Memory.factory[room.roomName].waiting.length == 0 && !Memory.factory[room.roomName].working){
                    var product = Object.keys(COMMODITIES[mineralType].components)[0];
                    var taskName = "regular_"+product;
                    if (storage.store["energy"] > 100000 && !Memory.factory[room.roomName].orders[taskName]){
                        //console.log("check room "+room.roomName);
                        if (roomObj.getStore(mineralType) > 100000){
                            roomObj.prepareOrder(product,50,"delete","addFactoryOrder,"+product+",50,"+taskName);
                        }
                    }

                    var productStore = factory.store[product];
                    if (productStore > 0){
                        roomObj.transfer("F","T",productStore,product);
                    }

                }
                if (Game.time % 513 == 0 && Memory.factory[room.roomName].waiting.length == 0 && !Memory.factory[room.roomName].working){
                    var taskName = "regular_battery";
                    if (storage.store["energy"] > 800000 && !Memory.factory[room.roomName].orders[taskName]){
                        //console.log("check room "+room.roomName);
                        roomObj.prepareOrder("battery",50,"delete","addFactoryOrder,battery,50,"+taskName);
                    }
                    if (factory.store["battery"] > 0){
                        roomObj.clearFactory();
                        roomObj.transfer("F","T",factory.store["battery"],"battery");
                    }
                    
                }

                if (Game.time % 317 == 0 && Memory.factory[room.roomName].waiting.length == 0 && !Memory.factory[room.roomName].working){
                    console.log("check room "+room.roomName);
                    var taskName = "decompose_battery";
                    if (roomObj.getStore("battery") > 50 && !Memory.factory[room.roomName].orders[taskName] && storage.store["energy"] < 400000){
                        roomObj.clearFactory();
                        roomObj.prepareAndProduce("energy",60);
                    }
                    
                }




                
                // if (room.roomName == "W26S23"){
                //     //const groupPlan = Memory.groups[planName];
                //     if (!groupPlan.FactoryID){
                //         groupPlan.FactoryID = room.FactoryID;
                //     }
                //     const storage = Game.getObjectById(groupPlan.StorageID);
                //     const terminal = Game.getObjectById(groupPlan.TerminalID);
                //     const factory = Game.getObjectById(groupPlan.FactoryID);
                //     var taskName = "Z_S_T";
                //     if ((!groupPlan.tasks[taskName]) && storage.store[RESOURCE_ZYNTHIUM] > 300000){
                //         var task = {
                //             "FromID" : groupPlan.StorageID,
                //             "ToID" : groupPlan.TerminalID,
                //             resource : RESOURCE_ZYNTHIUM,
                //             amount : storage.store[RESOURCE_ZYNTHIUM] - 300000
                //         };
                //         console.log(JSON.stringify(task));
                //         Memory.groups[planName].tasks[taskName] = task;
                //         Memory.groups[planName].waiting.push(taskName);
                //     }else if(groupPlan.tasks[taskName]){
                //         var taskIndex = groupPlan.suspended.indexOf(taskName);
                //         if (taskIndex>-1){
                //             groupPlan.suspended.splice(taskIndex, 1);
                            
                //             delete groupPlan.tasks[taskName];
                //             // groupPlan.waiting.push(taskName);
                //             // groupPlan.tasks[taskName].amount = 400;
                //         }
                //     }
                // }


            }else{
                continue;
            }
        }
        if (Game.time % 23 == 0){
            var cpuEnd = Game.cpu.getUsed();
            Memory.stats.cpu.center = cpuEnd - cpuStart;
        }
    }
}
module.exports = planCenter;