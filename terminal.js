var sender = {
    resourceType: "energy",
    amount: 1000,
    destination: "W29S22"
}

var terminal = {
    run: function(){
        if (Game.time % 23 == 0){
            var cpuStart = Game.cpu.getUsed();
        }
        var rooms = ["W29S22","W28S22","W26S23","W26S19","W31S23"];
        for (const roomName of rooms) {
            //console.log(roomName);
            var room = Memory.rooms[roomName];
            var roomObj = Game.rooms[roomName];
            var centerPlan = Memory.groups["center_"+roomName];
            var terminal = Game.getObjectById(room.TerminalID);
            var storage = Game.getObjectById(room.StorageID);
            var factory = Game.getObjectById(room.FactoryID);
            if (!terminal){
                console.log("No terminal in room:"+roomName);
                continue;
            }
            if (!Memory.terminal){
                Memory.terminal = Object();
            }
            if (!Memory.terminal[roomName]){
                Memory.terminal[roomName] = {senders:[]};
            }
            var senders = Memory.terminal[roomName].senders;
            if (terminal.cooldown || senders.length == 0){
                continue;
            }

            for (const processing of senders) {
                if (!processing.destination || !COMMODITIES[processing.resourceType]){
                    senders.shift();
                    break;
                }
                var cost = Game.market.calcTransactionCost(processing.amount, roomName, processing.destination);
                processing.cost = cost;
                if (processing.resourceType == RESOURCE_ENERGY){
                    if (terminal.store[RESOURCE_ENERGY] >= processing.amount && terminal.store[RESOURCE_ENERGY] < processing.amount + cost){
                        var taskName = "energy_S_T";
                        if (!centerPlan.tasks[taskName] && storage.store[RESOURCE_ENERGY] > 100000){
                            roomObj.addCenterTask(taskName,RESOURCE_ENERGY,cost,storage.id,terminal.id);
                        }
                    }
                }else{
                    if (terminal.store[RESOURCE_ENERGY] < cost){
                        var taskName = "energy_S_T";
                        if (!centerPlan.tasks[taskName] && storage.store[RESOURCE_ENERGY] > 100000){
                            roomObj.addCenterTask(taskName,RESOURCE_ENERGY,cost - terminal.store[RESOURCE_ENERGY],storage.id,terminal.id);
                        }
                    }
                }
                if (terminal.store[processing.resourceType] < processing.amount){
                    var taskName = "terminal_fill_"+processing.resourceType;
                    if (!centerPlan.tasks[taskName]){
                        if (factory && factory.store[processing.resourceType] > 0){
                            roomObj.addCenterTask(taskName,processing.resourceType,Math.min(processing.amount-terminal.store[processing.resourceType],factory.store[processing.resourceType]),factory.id,terminal.id);
                            continue;
                        }
                        if (roomObj.getStore(processing.resourceType) >= processing.amount){
                        // if (storage && storage.store[processing.resourceType] >= processing.amount-terminal.store[processing.resourceType]){
                            roomObj.addCenterTask(taskName,processing.resourceType,processing.amount-terminal.store[processing.resourceType],storage.id,terminal.id);
                        }else{
                            console.log(roomName+" send failed, lack of "+processing.resourceType);
                            senders.shift();
                            break;
                        }
                    }
                }
                if (processing.resourceType == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] < cost + processing.amount) continue;
                if (terminal.store[RESOURCE_ENERGY] < cost || terminal.store[processing.resourceType] < processing.amount) continue;
                if (terminal.send(processing.resourceType,processing.amount,processing.destination) == OK) {
                    senders.shift();
                    console.log("sending "+processing.amount+" "+processing.resourceType+" from "+roomName+" to "+processing.destination);
                    break;
                }else{
                    senders.shift();
                    console.log("error on sender:"+JSON.stringify(processing));
                };
            }

        }
        if (Game.time % 23 == 0){
            var cpuEnd = Game.cpu.getUsed();
            Memory.stats.cpu.terminal = cpuEnd - cpuStart;
        }
    }
};

module.exports = terminal;