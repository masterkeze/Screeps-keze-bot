// var rooms = ["W26S23"];
// var ignoreDecompose = ["Z","O","L","U","X","H"];
// var orderTemplate = {
//     name: "W26S23_regular_zbar",
//     product: RESOURCE_ZYNTHIUM_BAR,
//     amount: 10000
// };
// Memory.factory[roomName].orders.push(
//     {
//         name: "W26S23_regular_zbar",
//         product: RESOURCE_ZYNTHIUM_BAR,
//         amount: 10000,
//         status: "new" // new, working, finished
//     }
// );

function validate(order){
    return order.product && COMMODITIES[order.product] && order.amount > 0;
}

function totalAmount(order){
    var reuslt = {components:0,product:0};
    var detail = COMMODITIES[order.product];
    reuslt.product = order.amount * detail.amount;
    for (const key of Object.keys(detail.components)) {
        reuslt.components += detail.components[key];
    }
    return reuslt;
}

function readyForProduce(factory,order){
    var detail = COMMODITIES[order.product];
    for (const key of Object.keys(detail.components)) {
        if(factory.store[key] < detail.components[key]){// * order.amount
            //console.log(order.name+" not ready");
            return 0;
        };
    }
    //console.log(order.name+" ready");
    return 1;
}

function enoughForProduce(room,order){

}

var factory = {
    run: function(){
        //return;
        var rooms = ["W29S22","W28S22","W26S23","W26S19","W31S23"];
        for (const roomName of rooms) {
            //console.log(roomName);
            const room = Game.rooms[roomName];
            const factory = Game.getObjectById(Memory.rooms[roomName].FactoryID);
            if (!factory){
                console.log("No factory in room:"+roomName);
                continue;
            }
            if (!Memory.factory){
                Memory.factory = Object();
            }
            if (!Memory.factory[roomName]){
                Memory.factory[roomName] = Object();
            }
            if (!Memory.factory[roomName].orders){
                Memory.factory[roomName] = {
                    orders:{},
                    waiting:[],
                    working:"",
                    level:0,
                    batteryEnabled:true
                };
            }

            var config = Memory.factory[roomName];
            // if (roomName == "W26S23"){
            //     if (config.orders.length>1){
            //         config.orders = [];
            //     }
            //     var orderName = "Zbar_test";
            //     if (config.orders.length == 0 && factory.store[RESOURCE_ZYNTHIUM_BAR] < 6000){
            //         var order = {
            //             name: orderName,
            //             product: RESOURCE_ZYNTHIUM_BAR,
            //             amount: (6000-factory.store[RESOURCE_ZYNTHIUM_BAR])/100,
            //             status: "new" // new, working, finished
            //         };
            //         console.log(JSON.stringify(order));
            //         config.orders.push(order);
            //     }
            // }


            if (factory.cooldown || (config.waiting.length == 0 && !config.working)){
                continue;
            }
            if (Object.keys(config.orders).length == 0){
                config.working = "";
                config.waiting = [];
                continue;
            }
            //console.log(JSON.stringify(config));
            if (!config.working && config.waiting.length > 0){
                config.working = config.waiting.shift();
            }
            if (!config.working && config.waiting.length == 0){
                console.log("clear order pool "+roomName);
                config.working = "";
                config.orders = {};
                continue;
            }

            let order = config.orders[config.working];
            if (!order) {
                config.working = "";
                console.log("Invalid task "+config.working+" "+roomName);
                continue;
            }
            if (!order.status || order.status == "new"){
                // validate order
                if (!validate(order)){
                    console.log("Invalid task "+config.working+" "+roomName);
                    delete config.orders[config.working];
                    config.working = "";
                    continue;
                }
                let orderAmount = totalAmount(order);
                if (orderAmount.product > 50000 || orderAmount.components > 50000){
                    // split the order
                    let tempAmount = order.amount;
                    order.amount = order.amount/2;
                    tempAmount = tempAmount - order.amount;
                    var newOrder = {
                        name: order.name+"_split"+Game.time,
                        product: product,
                        amount: tempAmount,
                        onSuspended : order.onSuspended,
                        onFinished : order.onFinished,
                        status : "new"
                    }
                    order.onFinished = "delete";
                    config.orders[newOrder.name] = newOrder;
                    config.waiting.push(newOrder.name);
                    console.log("Split task "+config.working+" "+roomName);
                    continue;
                }
                if (readyForProduce(factory,order)){
                    order.status == "working";
                }else{
                    // preparing order
                    order.status == "preparing";
                }
                
            }
            if (order.status == "preparing"){
                if (readyForProduce(factory,order)){
                    order.status == "working";
                }
            }
            if (order.status = "working"){
                var result = factory.produce(order.product);
                //console.log("working on "+order.product);
                if (result == OK){
                    order.amount -= 1;
                    if (order.amount <= 0){
                        console.log("complete order:"+order.name);
                        if (!order.onFinished || order.onFinished == "delete"){
                            if (order.product = "energy"){
                                room.transfer("F","S",factory.store.energy,"energy");
                            }else{
                                room.clearFactory();
                            }
                            delete config.orders[config.working];
                        }else{
                            room.handle(order.onFinished);
                            delete config.orders[config.working];
                        }
                    }
                    continue;
                }else{
                    //console.log(JSON.stringify(details));
                    if (COMMODITIES[order.product].level){
                        if (Memory.groups && Memory.groups["center_"+roomName] && Memory.groups["center_"+roomName].PC){
                            var PCName = Memory.groups["center_"+roomName].PC;
                            var PC = Game.powerCreeps[PCName];
                            if (PC){
                                PC.usePower(PWR_OPERATE_FACTORY,factory);
                                break;
                            }
                        }

                    }
                    if (!order.onSuspended || order.onSuspended == "delete"){
                        console.log("suspend order "+order.name);
                        delete config.orders[config.working];
                    }else{
                        room.handle(order.onSuspended);
                        delete config.orders[config.working];
                    }
                    continue;
                }
            }
            // check each order
            // for (let orderIndex = 0; orderIndex < config.orders.length; orderIndex++) {
            //     const order = config.orders[orderIndex];
            //     if (!order){
            //         config.orders.splice(orderIndex,1);
            //         continue; 
            //     }

            //     if (!order.amount){
            //         config.orders.splice(orderIndex,1);
            //         continue; 
            //     }
            //     if (order.amount <= 0){
            //         config.orders.splice(orderIndex,1);
            //         continue; 
            //     }
            //     var details = COMMODITIES[order.product];
            //     if (!details){
            //         config.orders.splice(orderIndex,1);
            //         continue; 
            //     }
            //     var produceCount = Math.ceil(order.amount/details.amount);
            //     var result = factory.produce(order.product);
            //     if (result == OK){
            //         order.amount -= 1;
            //         if (order.amount <= 0){
            //             config.orders.splice(orderIndex, 1);
            //             console.log("complete order:"+order.name);

            //             if (!order.onFinished || order.onFinished == "delete"){
            //                 delete order;
            //             }else{
            //                 room.handle(order.onFinished);
            //                 delete order;
            //             }
            //         }
            //         break;
            //     }else{
            //         //console.log(JSON.stringify(details));
            //         if (details.level){
            //             if (Memory.groups && Memory.groups["center_"+roomName] && Memory.groups["center_"+roomName].PC){
            //                 var PCName = Memory.groups["center_"+roomName].PC;
            //                 var PC = Game.powerCreeps[PCName];
            //                 if (PC){
            //                     PC.usePower(PWR_OPERATE_FACTORY,factory);
            //                     break;
            //                 }
            //             }

            //         }
            //         config.orders.splice(orderIndex, 1);
            //         if (!order.onSuspended || order.onSuspended == "delete"){
            //             console.log("suspend order "+order.name);
            //             delete order;
            //         }else{
            //             room.handle(order.onSuspended);
            //             delete order;
            //         }
            //         break;
            //     }
            // }

        }
    }
};

module.exports = factory;