let whitelist = ["E3S19","E13S21","E14S21","E15S22","E15S23","E16S21","E17S21","E18S24","E21S21","W19N11","W49S21"];
var marketMod = {
    run: function() {
        if (Game.time % 23 == 0){
            var cpuStart = Game.cpu.getUsed();
        }
        
        // let supportOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_ENERGY}).filter(order => order.amount > 0).sort(function(a, b) {
        //     return  b.price - a.price;
        // });
        // let supportOrder;
        // for (const order of supportOrders) {
        //     if (whitelist.indexOf(order.roomName) >= 0 && order.price >= 0.15){
        //         supportOrder = order;
        //         //console.log(JSON.stringify(order));
        //         break;
        //     }
        // }
        
        // Game.market.createOrder({
        //     type: ORDER_SELL,
        //     resourceType: "purifier",
        //     price: 0.9,
        //     totalAmount: 100000,
        //     roomName: "W31S23"   
        // });

        // Game.market.createOrder({
        //     type: ORDER_BUY,
        //     resourceType: "ghodium_melt",
        //     price: 5.0,
        //     totalAmount: 5100,
        //     roomName: "W29S22"   
        // });
        
        // Game.market.createOrder({
        //     type: ORDER_BUY,
        //     resourceType: "power",
        //     price: 4.5,
        //     totalAmount: 100000,
        //     roomName: "W29S22"   
        // });

        // Game.market.createOrder({
        //     type: ORDER_BUY,
        //     resourceType: RESOURCE_ZYNTHIUM_BAR,
        //     price: 0.33,
        //     totalAmount: 50000,
        //     roomName: "W28S22"   
        // });

        // Game.market.createOrder({
        //     type: ORDER_BUY,
        //     resourceType: RESOURCE_UTRIUM_BAR,
        //     price: 0.33,
        //     totalAmount: 50000,
        //     roomName: "W28S22"   
        // });

        const rooms = Object.keys(Game.rooms);
        //console.log(JSON.stringify(orders));
        // var powerOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER}).filter(order => order.amount > 0).sort(function(a, b) {
        //     return a.price - b.price;
        // });
        
        for (var i=0; i<rooms.length;i++) {
            if (Memory.rooms[rooms[i]] && Memory.rooms[rooms[i]].TerminalID){
                var target = rooms[i];
                // if (rooms[i] == "W29S22" || rooms[i] == "W28S22"|| rooms[i] == "W26S23"){
                //     //console.log(JSON.stringify(powerOrders));
                //     if (powerOrders.length > 0 && powerOrders[0].price <= 4.75){
                //         var toDeal = powerOrders[0];
                //         if (toDeal.price < 4.55){
                //             Game.market.deal(toDeal.id,5000,rooms[i]);
                //         }else if (toDeal.price < 4.75 && Game.rooms[target].terminal.store[RESOURCE_POWER] < 2000){
                //             Game.market.deal(toDeal.id,toDeal.amount,rooms[i]);
                //         }
                //     }
                // }


                // if (supportOrder){
                //     if (Game.rooms[target].terminal.store["energy"]>=20000 && Game.rooms[target].storage.store["energy"]>=200000){
                //         Game.market.deal(supportOrder.id,Math.min(10000,supportOrder.amount),target);
                //     }
                // }

                if (target == "W29S22"){

                    if (Game.rooms[target].terminal.store["frame"] >= 1){
                        var frameOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: "frame"}).filter(order => order.amount > 0).sort(function(a, b) {
                            return b.price - a.price ;
                        });
                        if (frameOrders.length > 0){
                            var toDeal = frameOrders[0];
                            if (toDeal.price >= 18000){
                                Game.market.deal(toDeal.id,Math.min(toDeal.amount,Game.rooms[target].terminal.store["frame"]),target);
                            }
                        }
                    }
                }

                // if (target == "W28S22"){
                //     if (Game.rooms[target].terminal.store["composite"] >= 3000){
                //         var compositeOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: "composite"}).filter(order => order.amount > 0).sort(function(a, b) {
                //             return b.price - a.price ;
                //         });
                //         if (compositeOrders.length > 0){
                //             var toDeal = compositeOrders[0];
                //             if (toDeal.price >= 5.1){
                //                 Game.market.deal(toDeal.id,Math.min(toDeal.amount,Game.rooms[target].terminal.store["composite"]),target);
                //             }
                //         }
                //     }
                // }

                // var lowestid = "";
                // var amount = 0;
                // var highestprice = 0;
                // var energyCost = 0;
                // var orderPrice = 0;
                // var orderCost = 0;
                // for(const order of orders){
                //     const cost = Game.market.calcTransactionCost(1000, target, order.roomName)/1000;
                //     const price = order.price/(1+cost);
                //     if(price > highestprice){
                //         highestprice = price;
                //         lowestid = order.id;
                //         amount = order.amount;
                //         energyCost = amount*cost;
                //         orderPrice = order.price;
                //         orderCost = cost;
                //     }
                    
                // }
                // //console.log(lowestid,orderPrice,highestprice,amount,energyCost,orderCost);
                // // console.log(lowestid, Math.min(Game.rooms[target].terminal.store[RESOURCE_ENERGY]/(1+orderCost),amount+energyCost), target);
                // if (highestprice >= 0.05 && Game.rooms[target].terminal.store[RESOURCE_ENERGY] > 50000){
                //     Game.market.deal(lowestid, Math.min(Game.rooms[target].terminal.store[RESOURCE_ENERGY]/(1+orderCost),amount), target);
                // }
            }
        }
        
        if (Game.time % 23 == 0){
            var cpuEnd = Game.cpu.getUsed();
            Memory.stats.cpu.market = cpuEnd - cpuStart;
        }
        
        
	}
};

module.exports = marketMod;