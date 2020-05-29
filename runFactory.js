global.runFactory = function(factory){
    if (!factory || !factory.isActive()){
        return ERR_INVALID_TARGET;
    }

    // CHECK CENTER PLAN
    let roomName = factory.room.name;
    let roomObj = Game.rooms[roomName];
    if (!roomObj.storage || !roomObj.terminal){
        return -1;
    }
    if (!Memory.groups || !Memory.groups["center_"+roomName]){
        return -1;
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
        };
    }
    let config = Memory.factory[roomName];

    if(!config.working){
        // Get an order to work on
        while (!config.working && config.waiting.length > 0) {
            config.working = config.waiting.shift();
            // check the validation of the order
            let order = config.orders[config.working];
            let validation = true;
            if (!order){
                validation = false;
                console.log("No detail for order "+config.working);
            }else{
                if (!order.amount || order.amount <= 0){
                    validation = false;
                    console.log("Wrong amount for order "+config.working);
                }
                if(!order.product || !COMMODITIES[order.product]){
                    validation = false;
                    console.log("Wrong amount for order "+config.working);
                }
                let product_detail = COMMODITIES[order.product];
                if(product_detail.level && factory.level && product_detail.level != factory.level){
                    validation = false;
                    console.log("Wrong product level for order "+config.working);
                }
            }
            if (!validation){
                config.working = "";
                // trigger error function if exists
            }
        }
    }
    // No order to work on
    let order = config.orders[config.working];
    if (!order){
        // idle
        return OK;
    }
    // Split order
    if (order.amount > 10){
        // Split 5 amount order from the original order
        let order_shadow = { ...order };
        order_shadow.name = order.name + "split";
        order.amount -= 10;
        order_shadow.amount = 10;
        order_shadow.status = "new";
        config.working = order_shadow.name;
        config.waiting.unshift(order.name);
        if(order_shadow.onFinished){
            order_shadow.onFinished = "delete";
        }
        config.orders[config.working] = order_shadow;
        order = order_shadow;
    }
    // Handle order
    if (order.amount == 0){
        console.log(roomName+" complete order:"+order.name);
        if (!order.onFinished || order.onFinished == "delete"){
            if (order.product == "energy"){
                roomObj.transfer("F","S",factory.store.energy,"energy");
            }
            delete config.orders[config.working];
        }else{
            roomObj.handle(order.onFinished);
            delete config.orders[config.working];
        }
        config.working = "";
    }

    if (!order.status||order.status == "new"){
        let product_detail = COMMODITIES[order.product];
        let product_components = product_detail.components;
        for (const resource of Object.keys(product_components)) {
            let diff = factory.store[resource] - product_components[resource]*order.amount;
            let total = roomObj.storage.store[resource]+roomObj.terminal.store[resource];
            if (total < diff){
                // Component not enough
                // suspend order
                if (!order.onSuspended || order.onSuspended == "delete"){
                    console.log("suspend order "+order.name+": lack ["+(diff-total).toString()+"] "+resource);
                    delete config.orders[config.working];
                }else{
                    room.handle(order.onSuspended);
                    delete config.orders[config.working];
                }
            }
            if (diff > 0){
                roomObj.transfer("F","S",diff,resource);
            }
            if (diff < 0){
                let remaining = -1*diff;

                let storageStore = roomObj.storage.store[resource];
                if (storageStore > 0){
                    if (storageStore>=remaining){
                        roomObj.transfer("S","F",remaining,resource);
                        remaining = 0;
                    }else{
                        roomObj.transfer("S","F",storageStore,resource);
                        remaining = remaining-storageStore;
                    }
                }
                if (remaining>0){
                    roomObj.transfer("T","F",remaining,resource);
                }
            }
        }
        for (const resource of Object.keys(factory.store)) {
            if (!product_components[resource]){
                roomObj.transfer("F","S",factory.store[resource],resource);
            }
        }
        order.status = "preparing";
        return OK;
    }

    if (factory.cooldown && config.working){
        return ERR_BUSY;
    }

    if (order.status == "preparing" && !factory.cooldown){
        let prepared = true;
        let product_detail = COMMODITIES[order.product];
        let product_components = product_detail.components;
        for (const resource of Object.keys(product_components)) {
            let diff = factory.store[resource] - product_components[resource]*order.amount;
            if (diff < 0){
                prepared = false;
                break;
            }
        }
        if(prepared){
            order.status = "working";
        }
    }
    //console.log(order.status,factory.cooldown);
    if (order.status == "working" && !factory.cooldown){
        
        let result = factory.produce(order.product);
        switch (result) {
            case OK:
                order.amount -= 1;
                if (order.amount <= 0){

                }
                return OK;
            case ERR_BUSY:
                // need PWR_OPERATE_FACTORY 
                let centerPlan = Memory.groups["center_"+roomName];
                if (centerPlan.PC && Game.powerCreeps[centerPlan.PC]){
                    let PC = Game.powerCreeps[centerPlan.PC];
                    PC.usePower(PWR_OPERATE_FACTORY,factory);
                    return OK;
                }else{
                    // suspend order
                    if (!order.onSuspended || order.onSuspended == "delete"){
                        console.log("suspend order "+order.name+" can't power the factory");
                        //room.clearFactory();
                        delete config.orders[config.working];
                    }else{
                        room.handle(order.onSuspended);
                        delete config.orders[config.working];
                    }
                    // suspend order
                }
            default:
                break;
        }
    }


    // Handle components
    // Handle op_factory
}
