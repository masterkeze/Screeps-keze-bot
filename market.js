var marketMod = {
    run: function() {

        // Game.market.createOrder({
        //     type: ORDER_SELL,
        //     resourceType: RESOURCE_ZYNTHIUM,
        //     price: 0.065,
        //     totalAmount: 50000,
        //     roomName: "W26S23"   
        // });

        const rooms = Object.keys(Game.rooms);
        var orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER});
        orders.sort(function (a, b) {
            return a.price - b.price;
        });
        //console.log(JSON.stringify(orders));
        var orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_ENERGY});
        var powerOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER}).filter(order => order.amount > 0).sort(function(a, b) {
            return a.price - b.price;
        });
        
        for (var i=0; i<rooms.length;i++) {
            if (Memory.rooms[rooms[i]] && Memory.rooms[rooms[i]].TerminalID){
                var target = rooms[i];
                if (rooms[i] == "W29S22" || rooms[i] == "W28S22"|| rooms[i] == "W26S23"){
                    //console.log(JSON.stringify(powerOrders));
                    if (powerOrders.length > 0){
                        var toDeal = powerOrders[0];
                        if (toDeal.price < 4.2){
                            Game.market.deal(toDeal.id,5000,rooms[i]);
                        }else if (toDeal.price < 4.45 && Game.rooms[target].terminal.store[RESOURCE_POWER] < 2000){
                            Game.market.deal(toDeal.id,toDeal.amount,rooms[i]);
                        }
                    }
                }
                if (target == "W29S22"){

                    if (Game.rooms[target].terminal.store["frame"] >= 1){
                        var frameOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: "frame"}).filter(order => order.amount > 0).sort(function(a, b) {
                            return b.price - a.price ;
                        });
                        if (frameOrders.length > 0){
                            var toDeal = frameOrders[0];
                            if (toDeal.price >= 12000){
                                Game.market.deal(toDeal.id,Math.min(toDeal.amount,Game.rooms[target].terminal.store["frame"]),target);
                            }
                        }
                    }
                }

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
        

        
	}
};

module.exports = marketMod;