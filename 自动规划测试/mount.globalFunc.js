'use strict';
module.exports = function () {
    _.assign(global, globalExtension)
}

const globalExtension = {
    getBodyPart : function(string){
        let parts = string.split("/");
        var output = [];
        var seperator,bodyName, bodyCount;
        for (const partString of parts) {
            seperator = partString.indexOf(":");
            bodyName = partString.substring(0,seperator);
            bodyCount = parseInt(partString.substring(seperator+1));
            //console.log(bodyName,bodyCount);
            if (BODYPARTS_ALL.includes(bodyName) && bodyCount){
                output = output.concat(Array(bodyCount).fill(bodyName));
            }
        }
        return output;
    },
    checkMarket : function(orderType,resourceType,maxLine=5){
        if (orderType != "buy" && orderType != "sell"){
            return false;
        }
        let supportOrders = Game.market.getAllOrders({type: orderType, resourceType: resourceType}).filter(order => order.amount > 0);
        if (orderType == "buy"){
            let sortedBuyOrders = supportOrders.sort(function(a, b) {
                return  b.price - a.price;
            });
            console.log(`order count : ${supportOrders.length}`);
            let count = Math.min(maxLine,sortedBuyOrders.length);
            for (let buyIndex = 0; buyIndex < count; buyIndex++) {
                const buyOrder = sortedBuyOrders[buyIndex];
                console.log(`${buyOrder.price}\t${buyOrder.remainingAmount}\t${buyOrder.roomName}\t${buyOrder.id}`);
            }
        }else{
            let sortedSellOrders = supportOrders.sort(function(a, b) {
                return  a.price - b.price;
            });
            console.log(`order count : ${supportOrders.length}`);
            let count = Math.min(maxLine,sortedSellOrders.length);
            for (let sellIndex = 0; sellIndex < count; sellIndex++) {
                const sellOrder = sortedSellOrders[sellIndex];
                console.log(`${sellOrder.price}\t${sellOrder.remainingAmount}\t${sellOrder.roomName}\t${sellOrder.id}`);
            }
        }
        return OK;
    },
    deal : function(orderID,amount,roomName){
        let terminal = Game.rooms[roomName].terminal;
        if (terminal){
            return Game.market.deal(orderID,amount,roomName);
        }else{
            return "No terminal in that room";
        }
    },
    createOrder : function(type,resourceType,price,totalAmount,roomName){
        return Game.market.createOrder({
                    type: type,
                    resourceType: resourceType,
                    price: price,
                    totalAmount: totalAmount,
                    roomName: roomName   
                });
    },
    createBuyOrder : function(resourceType,price,totalAmount,roomName){
        return Game.market.createOrder({
                    type: "buy",
                    resourceType: resourceType,
                    price: price,
                    totalAmount: totalAmount,
                    roomName: roomName   
                });
    },
    createSellOrder : function(resourceType,price,totalAmount,roomName){
        return Game.market.createOrder({
                    type: "sell",
                    resourceType: resourceType,
                    price: price,
                    totalAmount: totalAmount,
                    roomName: roomName   
                });
    },
    send : function(fromRoom,resourceType,amount,ToRoom){
        const terminal = Game.rooms[fromRoom].terminal;
        if(terminal){
            return terminal.send(resourceType,amount,ToRoom);
        }
        return "No terminal";
    },
    sender : function(fromRoom,resourceType,amount,ToRoom){
        const fromRoomObj = Game.rooms[fromRoom];
        return fromRoomObj.sender(resourceType,amount,ToRoom);
    },
    extend : function(orderID,amount){
        return Game.market.extendOrder(orderID,amount);
    },
    myOrders : function(){
        return JSON.stringify(Game.market.orders);
    },
}