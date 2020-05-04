var config = {
    
}


var prototypes = {
    load: function(){
        // if (Room.prototype.sender){

        // }
        Room.prototype.sender = function(resourceType,amount,destination,description=""){
            //console.log(this);
            if (!this.controller.my){
                console.log("Not the owner of the room!");
                return -1;
            }
            if (!this.terminal){
                console.log("No terminal found in this room");
                return -1;
            }
            if (!Memory.terminal){
                Memory.terminal = Object();
            }
            if (!Memory.terminal[this.name]){
                Memory.terminal[this.name] = {senders:[]};
            }
            Memory.terminal[this.name].senders.push({
                resourceType: resourceType,
                amount: amount,
                destination: destination
            });
            return 0;
        }

        Room.prototype.transfer = function(fromCode,ToCode,amount,resourceType){
            var taskName = fromCode+"_"+ToCode+"_"+resourceType;
            var room = this.name;
            if (!Memory.groups){
                Memory.groups = Object();
            }
            var groupPlan = Memory.groups["center_"+room];
            if (!groupPlan){
                console.log("No center plan in room "+room);
                return -1;
            }
            if (groupPlan.tasks[taskName]){
                console.log(taskName+" already exists! Failed to add center task.");
                return -1;
            }
            var fromID = 0;
            switch (fromCode) {
                case "T":
                    fromID = Memory.rooms[room].TerminalID;
                    break;
                case "S":
                    fromID = Memory.rooms[room].StorageID;
                    break;
                case "F":
                    fromID = Memory.rooms[room].FactoryID;
                    break;
                default:
                    break;
            }
            if (!fromID){
                console.log("no from id");
                return -1;
            }

            var toID = 0;
            switch (ToCode) {
                case "T":
                    toID = Memory.rooms[room].TerminalID;
                    break;
                case "S":
                    toID = Memory.rooms[room].StorageID;
                    break;
                case "F":
                    toID = Memory.rooms[room].FactoryID;
                    break;
                default:
                    break;
            }
            if (!toID){
                console.log("no to id");
                return -1;
            }

            var task = {
                name: taskName,
                room: room,
                resource : resourceType,
                amount : amount,
                FromID : fromID,
                ToID : toID,
                onSuspended : "delete",
                onFinished : "delete",
                suspended : false,
                finished : false
            };
            groupPlan.tasks[taskName] = task;
            groupPlan.waiting.push(taskName);
            return 0;
        }

        Room.prototype.lackOf = function(product,amount){
            var detail = COMMODITIES[product];
            if (!detail || amount <= 0){
                return -1;
            }
            var components = detail.components;
            var result = {};
            for (const resource of Object.keys(components)) {
                var tempStore = this.getStore(resource);
                if(tempStore < components[resource] * amount){
                    result[resource] = components[resource] * amount-tempStore;
                }
            }
            console.log(JSON.stringify(result));
            return result;
        }

        Room.prototype.addCenterTask = function(name,resource,amount,FromID,ToID,onSuspended="delete",onFinished="delete"){
            var room = this.name;
            if (!Memory.groups){
                Memory.groups = Object();
            }
            var groupPlan = Memory.groups["center_"+room];
            if (!groupPlan){
                console.log("No center plan in room "+room);
                return -1;
            }
            if (groupPlan.tasks[name]){
                console.log(name+" already exists! Failed to add center task.");
                return -1;
            }
            var task = {
                name: name,
                room: room,
                resource : resource,
                amount : amount,
                FromID : FromID,
                ToID : ToID,
                onSuspended : onSuspended,
                onFinished : onFinished,
                suspended : false,
                finished : false
            };
            groupPlan.tasks[name] = task;
            groupPlan.waiting.push(name);
            //console.log(name+ " task added!");
        }

        Room.prototype.produce = function(product,amount,name="temp"+Game.time,onSuspended="delete",onFinished="delete"){
            this.addFactoryOrder(product,amount,name,onSuspended,onFinished);
        }

        Room.prototype.addFactoryOrder = function(product,amount,name="temp"+Game.time,onSuspended="delete",onFinished="delete"){
            var room = this.name;
            if (!Memory.factory){
                Memory.factory = Object();
            }
            if (!Memory.factory[this.name]){
                Memory.factory[this.name] = {
                    orders:{},
                    waiting:[],
                    working:"",
                    level:0,
                    batteryEnabled:true
                };
            }
            var config = Memory.factory[this.name];

            if (config.orders[name]){
                console.log(name+" already exists! Failed to add center task.");
                return -1;
            }

            var order = {
                name: name,
                product: product,
                amount: amount,
                onSuspended : onSuspended,
                onFinished : onFinished,
                status : "new"
            };
            config.orders[name] = order;
            config.waiting.push(name);
            //console.log(JSON.stringify(order));
            console.log(room+" order added: "+product+" "+amount);
            return 0;
            //console.log(JSON.stringify(Memory.factory[room]));
            //config.waiting.push(name);
        }

        // Room.prototype.prepareAndSend = function(resourceType,amount,destination,description=""){

        // }
        Room.prototype.prepareAndProduce = function(product,amount,name = ""){
            if (!name){
                var taskName = product+"_"+amount;
            }else{
                var taskName = name;
            }
            
            return this.prepareOrder(product,amount,"delete","addFactoryOrder,"+product+","+amount+","+taskName);
        }
        Room.prototype.prepareOrder = function(product,amount,onSuspended="delete",onFinished="delete",append=true){
            if (amount <= 0){
                console.log("can't prepare negative amount");
                return -1;
            }
            const room = this.name;
            const factory = Game.getObjectById(Memory.rooms[room].FactoryID);
            const storage = Game.getObjectById(Memory.rooms[room].StorageID);
            const terminal = Game.getObjectById(Memory.rooms[room].TerminalID);
            if (!factory){
                console.log("No factory found in "+room);
                return -1;
            }

            const components = COMMODITIES[product].components;
            for (const key of Object.keys(components)) {
                var resourceType = key;
                var required = amount * components[key];
                if (append){
                    var diff = required;
                }else{
                    var diff = required - factory.store[resourceType];
                }
                if (diff > 0){
                    if (storage.store[resourceType] > diff){
                        this.addCenterTask("prepare_"+resourceType,resourceType,diff,storage.id,factory.id,onSuspended,onFinished);
                        console.log("prepare_"+resourceType+":"+diff+" task added!");
                    }else{
                        if (storage.store[resourceType] > 0){
                            this.addCenterTask("prepare_"+resourceType+"_S",resourceType,storage.store[resourceType],storage.id,factory.id,onSuspended,onFinished);
                            console.log("prepare_"+resourceType+"_S:"+storage.store[resourceType]+" task added!");
                        }
                        var remaining = Math.min(diff - storage.store[resourceType],terminal.store[resourceType]);
                        if (remaining > 0){
                            this.addCenterTask("prepare_"+resourceType+"_T",resourceType,remaining,terminal.id,factory.id,onSuspended,onFinished);
                            console.log("prepare_"+resourceType+"_T:"+remaining+" task added!");
                        }
                    }

                }
            }
            return 0;
        }

        Room.prototype.getStore = function(resource){
            var structures = this.find(FIND_MY_STRUCTURES,{filter:function(structure){
                return structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_TERMINAL || structure.structureType == STRUCTURE_FACTORY
            }});
            var creeps = this.find(FIND_MY_CREEPS);
            var powercreeps = this.find(FIND_MY_POWER_CREEPS);
            var stores = structures.concat(creeps);
            stores = stores.concat(powercreeps);
            const reducer = (accumulator, currentValue) => accumulator + parseInt(currentValue.store[resource]);
            return stores.reduce(reducer,0);
        }

        Room.prototype.getTasks = function(){
            if (Memory.groups["center_"+this.name]){
                return Memory.groups["center_"+this.name].tasks;
            }else{
                return -1;
            }
            
        }

        Room.prototype.clearFactory = function(){
            const room = this.name;
            const factory = Game.getObjectById(Memory.rooms[room].FactoryID);
            if (factory.store.getUsedCapacity() > 0){
                var resources = Object.keys(factory.store);
                for (const resource of resources) {
                    this.transfer("F","T",factory.store[resource],resource);
                    console.log("clearing factory "+resource+" "+factory.store[resource]);
                }
            }
            return 0;
        }

        Room.prototype.fillNuke = function(){
            var room = Memory.rooms[this.name];
            if (!room.NukerID || !room.StorageID) {
                console.log("No nuke in room "+this.name);
                return -1;
            }
            const storage = Game.getObjectById(room.StorageID);
            const terminal = Game.getObjectById(room.TerminalID);
            const nuker = Game.getObjectById(room.NukerID);
            var g_required = nuker.store.getCapacity(RESOURCE_GHODIUM) - nuker.store[RESOURCE_GHODIUM];

            if(terminal && terminal.store[RESOURCE_GHODIUM] > 0 && g_required > 0){
                this.addCenterTask("fill_nuke_g",RESOURCE_GHODIUM,Math.min(terminal.store[RESOURCE_GHODIUM],g_required),terminal.id,nuker.id);
                g_required -= Math.min(terminal.store[RESOURCE_GHODIUM],g_required);
            }
            if(storage.store[RESOURCE_GHODIUM] > 0 && g_required > 0){
                this.addCenterTask("fill_nuke_g",RESOURCE_GHODIUM,Math.min(storage.store[RESOURCE_GHODIUM],g_required),storage.id,nuker.id);
                g_required -= Math.min(storage.store[RESOURCE_GHODIUM],g_required);
            }
            if (g_required > 0){
                console.log(this.name + " needs G:"+g_required);
            }

            var e_required = nuker.store.getFreeCapacity("energy");

            if(storage.store["energy"] > 0 && e_required > 0){
                this.addCenterTask("fill_nuke_e","energy",Math.min(storage.store["energy"],e_required),storage.id,nuker.id);
                e_required -= Math.min(storage.store["energy"],e_required);
            }

            if(terminal && terminal.store["energy"] > 0 && e_required > 0){
                this.addCenterTask("fill_nuke_e","energy",Math.min(terminal.store["energy"],e_required),terminal.id,nuker.id);
                e_required -= Math.min(terminal.store["energy"],e_required);
            }
            if (e_required > 0){
                console.log(this.name + " needs energy:"+e_required);
            }
            return 0;
        }

        Room.prototype.addStealPlan = function(stealFlag){
            var planName = stealFlag;
            var room = Memory.rooms[this.name];
            if (!Memory.groups[planName]){
                Memory.groups[planName] = {
                    groupType: 'steal',
                    stealFlag: stealFlag,
                    roomName: this.name,
                    groupID: planName,
                    SpawnID: room.SpawnIDs[0],
                    roles: ["stealer"],
                    roleLimit: [3],
                    roleBody: [[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]],
                    spawnAhead: [0],
                    creeps: [],
                    StorageID: room.StorageID
                }
            }
        }

        Room.prototype.costAnalysis = function(product,amount){
            var orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: product}).filter(order => order.amount > 0).sort(function(a, b) {
                return b.price - a.price;
            });;
            if (orders.length > 0){
                console.log(product+":\t"+COMMODITIES[product].amount*amount+"\t"+orders[0].price+"\t"+COMMODITIES[product].amount*amount*orders[0].price);
            }else{
                console.log(product+":\t"+COMMODITIES[product].amount*amount);
            }
            var decomposed = this.decompose(product,amount);
            for (const key of Object.keys(decomposed)) {
                var orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: key}).filter(order => order.amount > 0).sort(function(a, b) {
                    return b.price - a.price;
                });;
                if (orders.length > 0){
                    console.log(key+":\t"+decomposed[key]+"\t"+orders[0].price+"\t"+decomposed[key]*orders[0].price);
                }else{
                    console.log(key+":\t"+decomposed[key]);
                }
            }
            return 0;
        }

        Room.prototype.handle = function(str){
            var paraList = str.split(",");
            if (paraList.length > 0){
                var handleType = paraList[0];
                switch (handleType) {
                    case 'addCenterTask':
                        return this.addCenterTask(paraList.slice(1));
                    case 'addFactoryOrder':
                        return this.addFactoryOrder(paraList[1],paraList[2],paraList[3]);
                    case 'transfer':
                        return this.transfer(paraList.slice(1));
                    case 'sender':
                        return this.sender(paraList.slice(1));
                    default:
                        break;
                }
            }
            return -1;
        }

        Room.prototype.stopFactory = function(){
            const room = this.name;
            if (Memory.factory[room]){
                var config = Memory.factory[room];
                config.orders = {};
                config.waiting = [];
                config.working = "";
                // if (config.working){
                //     if(config.orders[config.working]){
                //         delete config.orders[config.working];
                //     }
                //     config.working = "";
                // }
                this.clearFactory();
            }
            
        }

        Room.prototype.decompose = function(product,amount,level){
            const noDecom = [RESOURCE_ENERGY,RESOURCE_POWER,RESOURCE_HYDROGEN,RESOURCE_OXYGEN,RESOURCE_UTRIUM,
                RESOURCE_KEANIUM,RESOURCE_LEMERGIUM,RESOURCE_ZYNTHIUM,RESOURCE_CATALYST,RESOURCE_GHODIUM,
                RESOURCE_SILICON,RESOURCE_METAL,RESOURCE_BIOMASS,RESOURCE_MIST,RESOURCE_ZYNTHIUM_BAR,
                RESOURCE_UTRIUM_BAR,RESOURCE_OXIDANT,RESOURCE_REDUCTANT,RESOURCE_LEMERGIUM_BAR,RESOURCE_KEANIUM_BAR,RESOURCE_GHODIUM_MELT,RESOURCE_PURIFIER,RESOURCE_ALLOY];
            const details = COMMODITIES[product];
            if (noDecom.indexOf(product) >= 0 || (details.level && details.level <= level)){
                var result = {};
                result[product] = amount;
                return result;
            }
            const components = details.components;
            const count = Math.ceil(amount/details.amount);
            var result = {};
            for (const key of Object.keys(components)) {
                if (noDecom.indexOf(key) >= 0){
                    if (!result[key]){
                        result[key] = count * components[key];
                    }else{
                        result[key] += count * components[key];
                    }
                    
                }else{
                    var subResult = this.decompose(key,count * components[key],level);
                    for (const subkey of Object.keys(subResult)) {
                        if (!result[subkey]){
                            result[subkey] = subResult[subkey];
                        }else{
                            result[subkey] += subResult[subkey];
                        }
                    }
                }
            }
            return result;
        }
    }
}
module.exports = prototypes;