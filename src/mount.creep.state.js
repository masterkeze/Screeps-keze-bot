'use strict';
module.exports = function () {
    _.assign(Creep.prototype, creepExtension);
    _.assign(PowerCreep.prototype, creepExtension);
}


const creepExtension = {
    getStateData(state){
        return this.getData()[state];
    },
    getState(){
        return this.getDataReadOnly().currentState;
    },
    setState(state){
        let data = this.getData();
        data.currentState = state;
        this.saveData(data);
    },
    runState(){
        const currentState = this.getState();
        try {
            const result = this.updateState(currentState);
            return result;
        } catch (error) {
            return false;
        }
    },
    transitionState(state,config){
        const currentState = this.getState();
        if (currentState){
            this.exitState(currentState);
        }
        this.setState(state);
        if (state){
            this.enterState(state,config);
        }
        //console.log(`[test log] ${this.room.name}:${this.name} transitionState from ${currentState} to ${state}`);
    },
    enterState(state,config){
        //console.log(JSON.stringify(this.getStateData("repairRampart")));
        try {
            //console.log(`[debug] ${this.room.name}:${this.name} [enterState] ${state}`);
            if (state){
                return this.states[state].onEnter.call(this,config);
            }
            
        } catch (error) {
            console.log(`[error] ${this.room.name}:${this.name} [enterState] ${state}, info:${error}`);//${JSON.stringify(config)}
        }
    },
    updateState(state){
        try {
            return this.states[state].update.call(this);
        } catch (error) {
            console.log(`[error] ${this.room.name}:${this.name} [updateState] ${state} info:${error}`);
        }
    },
    exitState(state){
        try {
            this.setState(false);
            return this.states[state].onExit.call(this);
        } catch (error) {
            console.log(`[error] ${this.room.name}:${this.name} [exitState] ${state} info:${error}`);
        }
    },
    states : {
        withdrawOnce : {
            /**
             * @param {source,resourceType,amount} config 
             */
            onEnter : function (config){
                const source = config.source;
                const sourceID = source.id;
                const resourceType = config.resourceType;
                const amount = config.amount;
                // if (this.store.getFreeCapacity(resourceType) == 0){
                //     console.log('[creep:withdrawOnce] 在creep满载时被调用！');
                //     return false;
                // }
                this.saveStateData("withdrawOnce",{sourceID : sourceID, resourceType : resourceType, amount : amount});
                this.setMovingTarget(source);
                this.keepMoving();
            },
            update : function (){
                const config = this.getStateData("withdrawOnce");
                const sourceID = config.sourceID;
                const source = Game.getObjectById(sourceID);
                const resourceType = config.resourceType;
                const amount = config.amount;
                if (this.pos.getRangeTo(source) > 1){
                    this.keepMoving();
                    return "withdrawOnce";
                }else{
                    if (amount){
                        this.withdrawAndLog(source,resourceType,amount);
                    }else{
                        this.withdrawAndLog(source,resourceType);
                    }
                    this.clearMoving();
                    return false;
                }
            },
            onExit : function () {}
        },
        transferOnce : {
            /**
             * @param {target,resourceType,amount} config 
             */
            onEnter : function (config){
                const target = config.target;
                const targetID = target.id;
                const resourceType = config.resourceType;
                const amount = config.amount;
                // if (this.store.getFreeCapacity(resourceType) == 0){
                //     console.log('[creep:transferOnce] 在creep满载时被调用！');
                //     return false;
                // }
                this.saveStateData("transferOnce",{targetID : targetID, resourceType : resourceType, amount : amount});
                this.setMovingTarget(target);
                this.keepMoving();
            },
            update : function (){
                const config = this.getStateData("transferOnce");
                const targetID = config.targetID;
                const target = Game.getObjectById(targetID);
                const resourceType = config.resourceType;
                const amount = config.amount;
                if (this.pos.getRangeTo(target) > 1){
                    this.keepMoving();
                    return "transferOnce";
                }else{
                    if (amount){
                        this.transferAndLog(target,resourceType,amount);
                    }else{
                        this.transferAndLog(target,resourceType);
                    }
                    this.clearMoving();
                    return false;
                }
            },
            onExit : function () {}
        },
        reach : {
            /**
             * @param {target} config 
             */
            onEnter : function(config){
                const target = config.target;
                const targetID = target.id;
                var range = config.range;
                if (!range){
                    range = 3;
                }
                //console.log(JSON.stringify(this.getData()));
                this.saveStateData("reach",{targetID : targetID});
                this.setMovingStrategy("reach");
                this.keepMoving();
            },
            update : function(){
                const config = this.getStateData("reach");
                const targetID = config.targetID;
                const target = Game.getObjectById(targetID);
                if (target){
                    if (this.pos.getRangeTo(target) > 1){
                        this.keepMoving();
                        //this.say("reaching "+this.pos.getRangeTo(rampart));
                        return "reach";
                    }else{
                        return false;
                    }
                }else{
                    console.log(`[ALARM] ${this.room.name}:${this.name} [reach] target not found`);
                    return false;
                }
            },
            onExit : function(){}
        },
        buildConstruction : {
            /**
             * @param {target} config 
             */
            onEnter : function(config){
                const target = config.target;
                const targetID = target.id;
                //console.log(JSON.stringify(this.getData()));
                this.saveStateData("buildConstruction",{targetID : targetID});
                this.setMovingStrategy("reachOnce");
                this.setMovingTarget(target,3);
                this.keepMoving();
            },
            update : function(){

                const config = this.getStateData("buildConstruction");
                const targetID = config.targetID;
                const target = Game.getObjectById(targetID);
                if (target){
                    if (this.pos.getRangeTo(target) > 3){
                        this.keepMoving();
                        //this.say("reaching "+this.pos.getRangeTo(rampart));
                        return "buildConstruction";
                    }else{
                        this.buildAndLog(target);
                        if (this.getStore("energy") == 0){
                            this.clearMoving();
                            return false;
                        }else{
                            this.keepMoving();
                            return "buildConstruction";
                        }
                    }
                }else{
                    console.log(`[ALARM] ${this.room.name}:${this.name} [buildConstruction] construction site not found`);
                    return false;
                }
            },
            onExit : function(){}
        },
        repairRampart : {
            /**
             * @param {rampart,rampartHits} config 
             */
            onEnter : function(config){
                const rampart = config.rampart;
                const rampartHits = config.rampartHits;
                const rampartID = rampart.id;
                //console.log(JSON.stringify(this.getData()));
                this.saveStateData("repairRampart",{rampartID : rampartID, rampartHits : rampartHits});
                this.setMovingStrategy("reachOnce");
                this.setMovingTarget(rampart,3);
                this.keepMoving();
            },
            update : function(){

                const config = this.getStateData("repairRampart");
                const rampartID = config.rampartID;
                const rampart = Game.getObjectById(rampartID);
                const rampartHits = config.rampartHits;
                if (rampart){
                    if (this.pos.getRangeTo(rampart) > 3){
                        this.keepMoving();
                        //this.say("reaching "+this.pos.getRangeTo(rampart));
                        return "repairRampart";
                    }else{
                        this.repairAndLog(rampart);
                        if (rampart.hits >= rampartHits || this.getStore("energy") == 0){
                            this.clearMoving();
                            return false;
                        }else{
                            this.keepMoving();
                            return "repairRampart";
                        }
                    }
                }else{
                    console.log(`[ALARM] ${this.room.name}:${this.name} [repairRampart] rampart not found`);
                    return false;
                }
            },
            onExit : function(){}
        }
    }
}