'use strict';

function powerCreepRunner(hashMap) {
    Object.values(hashMap).forEach(powerCreep => {
        powerCreep.work();
    });
}
function creepRunner(hashMap) {
    Object.values(hashMap).forEach(creep => {
        creep.work();
    });
}
function roomRunner(hashMap) {
    Object.values(hashMap).forEach(room => {
        room.work();
    });
}
/**
 * 把 obj2 的原型合并到 obj1 的原型上
 * 如果原型的键以 Getter 结尾，则将会把其挂载为 getter 属性
 * @param obj1 要挂载到的对象
 * @param obj2 要进行挂载的对象
 */
const assignPrototype = function (obj1, obj2) {
    Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
        if (key.includes('Getter')) {
            Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                get: obj2.prototype[key],
                enumerable: false,
                configurable: true
            });
        }
        else
            obj1.prototype[key] = obj2.prototype[key];
    });
};

/**
 * 基础状态机
 */
const states = {
    /**
     * 抵达某处
     */
    reach: () => ({
        onEnter: reachOnEnter,
        actions: {
            moveTo: reachAction
        },
        onExit(creep) { }
    }),
    upgrade: () => ({
        onEnter(creep, data) {
            reachOnEnter(creep, data);
            let stateData = creep.getStateData(creep.getCurrentState());
            stateData.range = 3;
        },
        actions: {
            moveTo: reachAction,
            other(creep) {
                if (creep.store.energy == 0) {
                    return StateContinue.Exit;
                }
                let stateData = creep.getStateData(creep.getCurrentState());
                if (creep.pos.roomName == stateData.targetPos.roomName) {
                    if (!stateData.controllerID) {
                        let targetPos = new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName);
                        let founds = targetPos.lookFor(LOOK_STRUCTURES);
                        if (founds.length == 0) {
                            return StateContinue.Exit;
                        }
                        let controllerID = "";
                        for (const found of founds) {
                            if (found instanceof StructureController) {
                                controllerID = found.id;
                            }
                        }
                        if (!controllerID) {
                            return StateContinue.Exit;
                        }
                        stateData.controllerID = controllerID;
                    }
                    let controller = Game.getObjectById(stateData.controllerID);
                    creep.upgradeController(controller);
                    if (creep.getActiveBodyparts(WORK) >= creep.store.energy) {
                        return StateContinue.Exit;
                    }
                    else {
                        return StateContinue.Continue;
                    }
                }
                else {
                    return StateContinue.Continue;
                }
            }
        },
        onExit(creep) { }
    }),
};
function reachOnEnter(creep, data) {
    let stateData = creep.getStateData(creep.getCurrentState());
    if (data.targetPos instanceof RoomPosition) {
        stateData.targetPos = {
            x: data.targetPos.x,
            y: data.targetPos.y,
            roomName: data.targetPos.roomName
        };
    }
    else {
        stateData.targetPos = {
            x: data.targetPos.pos.x,
            y: data.targetPos.pos.y,
            roomName: data.targetPos.pos.roomName
        };
    }
    let range = 0;
    if (stateData.range) {
        range = stateData.range;
    }
    stateData.range = range;
}
function reachAction(creep) {
    let stateData = creep.getStateData(creep.getCurrentState());
    if (creep.pos.roomName == stateData.targetPos.roomName) {
        if (creep.pos.inRangeTo(stateData.targetPos.x, stateData.targetPos.y, stateData.range)) {
            return StateContinue.Exit;
        }
    }
    creep.moveTo(new RoomPosition(stateData.targetPos.x, stateData.targetPos.y, stateData.targetPos.roomName), { range: stateData.range });
    return StateContinue.Continue;
}

const stateExport = Object.assign({}, states);

var Helper;
(function (Helper) {
    function storeAdd(store1, store2) {
        let output;
        Object.keys(store1).forEach(resourceType => {
            let value = store1[resourceType];
            if (value)
                output[resourceType] = value;
        });
        Object.keys(store2).forEach(resourceType => {
            let value = store2[resourceType];
            if (value) {
                if (output[resourceType]) ;
                else {
                    output[resourceType] = value;
                }
            }
        });
        return output;
    }
    Helper.storeAdd = storeAdd;
    function storeMinus(store1, store2) {
        let output;
        Object.keys(store1).forEach(resourceType => {
            let value = store1[resourceType];
            if (value)
                output[resourceType] = value;
        });
        Object.keys(store2).forEach(resourceType => {
            let value = store2[resourceType];
            if (value) {
                if (output[resourceType]) ;
                else {
                    output[resourceType] = -1 * value;
                }
            }
        });
        return output;
    }
    Helper.storeMinus = storeMinus;
    function intersection(setA, setB) {
        let _intersection = new Set();
        for (let elem of setB) {
            if (setA.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    }
    Helper.intersection = intersection;
})(Helper || (Helper = {}));

const Aconfliction = new Set(["harvest", "attack", "build", "repair", "dismantle", "attackController", "rangedHeal", "heal"]);
const Rconfliction = new Set(["rangedAttack", "rangedMassAttack", "build", "repair", "rangedHeal"]);
const Mconfliction = new Set(["move", "moveTo", "moveByPath"]);
var Moment;
(function (Moment) {
    /**
     * 初始化 global.moment，重置成当前tick的moment
     */
    function init() {
        if (!global.moment || global.moment.now != Game.time) {
            global.moment = {
                now: Game.time,
                data: {}
            };
        }
    }
    Moment.init = init;
    /**
     * 根据对象ID返回对应的Moment，如果没有，则初始化。
     * @param  {string} objectID
     * @returns Moment
     */
    function get(objectID) {
        init();
        if (!global.moment.data[objectID]) {
            global.moment.data[objectID] = {
                in: {},
                out: {},
                resourcesChange: {},
                damaged: 0,
                healed: 0,
                hitsChange: 0,
                actions: []
            };
        }
        return global.moment.data[objectID];
    }
    Moment.get = get;
    /**
     * 设置对象的资源变化，in 表示注入资源 out 表示取出资源
     * @param  {string} objectID
     * @param  {"in"|"out"} key
     * @param  {store} store
     */
    function setStoreChange(objectID, key, store) {
        let moment = get(objectID);
        switch (key) {
            case "in":
                moment.in = Helper.storeAdd(moment.in, store);
                moment.resourcesChange = Helper.storeAdd(moment.resourcesChange, store);
                break;
            case "out":
                moment.out = Helper.storeAdd(moment.out, store);
                moment.resourcesChange = Helper.storeMinus(moment.resourcesChange, store);
                break;
        }
    }
    Moment.setStoreChange = setStoreChange;
    /**
     * 设置对象的血量变化，damaged 表示受到的伤害，healed 表示受到的治疗
     * @param  {string} objectID
     * @param  {"damaged"|"healed"} key
     * @param  {number} hits
     */
    function setHitsChange(objectID, key, hits) {
        let moment = get(objectID);
        switch (key) {
            case "damaged":
                moment.damaged += hits;
                moment.hitsChange -= hits;
                break;
            case "healed":
                moment.healed += hits;
                moment.hitsChange += hits;
                break;
        }
    }
    Moment.setHitsChange = setHitsChange;
    /**
     * 设置对象执行的动作，如果要执行的动作和已注册的动作冲突，则返回ERR_BUSY
     * @param  {string} objectID
     * @param  {ActionConstant} key
     * @returns OK | ERR_BUSY
     */
    function setAction(objectID, key) {
        let moment = get(objectID);
        let currentSet = new Set(moment.actions);
        if (currentSet.has(key))
            return ERR_BUSY;
        currentSet = currentSet.add(key);
        if (Helper.intersection(currentSet, Aconfliction).size > 1)
            return ERR_BUSY;
        if (Helper.intersection(currentSet, Rconfliction).size > 1)
            return ERR_BUSY;
        if (Helper.intersection(currentSet, Mconfliction).size > 1)
            return ERR_BUSY;
        moment.actions.push(key);
        return OK;
    }
    Moment.setAction = setAction;
})(Moment || (Moment = {}));

var Lock;
(function (Lock) {
    /**
     * 通过对象标识，获取对象的锁信息
     * @param  {string} id
     */
    function init(id) {
        if (!Memory.lock) {
            Memory.lock = {};
        }
        if (!Memory.lock[id]) {
            Memory.lock[id] = {
                total: {},
                detail: {}
            };
        }
    }
    Lock.init = init;
    /**
     * 通过对象标识，获取对象的锁信息
     * @param  {string} id
     */
    function get(id) {
        init(id);
        return Memory.lock[id];
    }
    Lock.get = get;
    /**
     * 给对象加锁，指定名称与上锁的资源包，这里不做控制，只做记录，如果重名，则会报错
     * @param  {string} id
     * @param  {string} name
     * @param  {store} store
     */
    function add(id, name, store) {
        if (!name)
            return ERR_NOT_FOUND;
        let lock = get(id);
        let lockDetail = lock.detail;
        if (lockDetail[name]) {
            return ERR_NAME_EXISTS;
        }
        else {
            lockDetail[name] = store;
            lock.total = Helper.storeAdd(lock.total, store);
            return OK;
        }
    }
    Lock.add = add;
    /**
     * 给对象添加匿名锁，不做控制，会返回随机生成的锁名称
     * @param  {string} id
     * @param  {store} store
     */
    function addAnonymous(id, store) {
        let lock = get(id);
        let lockDetail = lock.detail;
        let iterator = 1;
        let baseName = Game.time.toString();
        let newName = baseName + '_' + iterator.toString();
        while (lockDetail[newName]) {
            iterator += 1;
            newName = baseName + '_' + iterator.toString();
        }
        lockDetail[newName] = store;
        lock.total = Helper.storeAdd(lock.total, store);
        return newName;
    }
    Lock.addAnonymous = addAnonymous;
    /**
     * 释放对象的锁，如果锁不存在则返回ERR_NOT_FOUND
     * @param  {string} id
     * @param  {string} name
     */
    function release(id, name) {
        let lock = get(id);
        let lockDetail = lock.detail;
        if (!lockDetail[name]) {
            return ERR_NOT_FOUND;
        }
        lock.total = Helper.storeMinus(lock.total, lockDetail[name]);
        delete lockDetail[name];
        return OK;
    }
    Lock.release = release;
})(Lock || (Lock = {}));

const directions = '↑↗→↘↓↙←↖';
// creep 原型拓展
class CreepExtension extends Creep {
    /**
     * creep 通用执行结构
     * 1. 注册至group
     * 2. 执行当前状态
     * 3. 请求role，获取新状态
     * 4. 状态流转
     * 5. 如果新状态已结束，重复34
     */
    work() {
        if (!this.memory.role) {
            // log 没找到role
            return;
        }
        // 注册creep
        if (this.memory.groupID) {
            if (!this.memory.registered) {
                this.memory.registered = this.register(this.memory.groupID);
            }
            if (!this.memory.registered) {
                // log 没找到对应组
                return;
            }
        }
        // 执行当前状态
        let newState = this.runCurrentState();
    }
    /**
     * 返回moment 储量
     * @param  {string} resourceType
     * @returns 如果传了resourceType，则返回具体的数值，否则返回store
     */
    getMomentStore(resourceType) {
        let moment = Moment.get(this.id);
        if (resourceType) {
            let momentStore = moment.resourcesChange[resourceType];
            let actualStore = this.store[resourceType];
            if (!momentStore)
                momentStore = 0;
            if (!actualStore)
                actualStore = 0;
            return momentStore + actualStore;
        }
        else {
            return Helper.storeAdd(moment.resourcesChange, JSON.parse(JSON.stringify(this.store)));
        }
    }
    /**
     * 返回上锁的储量
     * @param  {string} resourceType?
     * @returns 如果传了resourceType，则返回具体的数值，否则返回store
     */
    getLockedStore(resourceType) {
        let lock = Lock.get(this.id);
        if (resourceType) {
            if (lock.total[resourceType]) {
                return lock.total[resourceType];
            }
            else {
                return 0;
            }
        }
        else {
            return lock.total;
        }
    }
    /**
     * 返回未上锁的储量 = moment储量 - 上锁的储量
     * @param  {string} resourceType?
     * @returns 如果传了resourceType，则返回具体的数值，否则返回store
     */
    getUnlockedStore(resourceType) {
        let momentStore = this.getMomentStore(resourceType);
        let lockedStore = this.getLockedStore(resourceType);
        if (resourceType) {
            momentStore = momentStore;
            lockedStore = lockedStore;
            return momentStore - lockedStore;
        }
        else {
            momentStore = momentStore;
            lockedStore = lockedStore;
            return Helper.storeMinus(momentStore, lockedStore);
        }
    }
    /**
     * 给对象加锁
     * @param  {string} name
     * @param  {store} store
     */
    addLock(name, store) {
        // 需要校验store的有效性
        // 1. 不为空
        let resourceTypes = Object.keys(store);
        if (resourceTypes.length == 0)
            return ERR_INVALID_ARGS;
        // 2. 不为负
        let minValue = Math.min(...Object.values(store));
        if (minValue < 0)
            return ERR_INVALID_ARGS;
        // 3. 空间是否足够
        let storeDiff = Helper.storeMinus(this.getUnlockedStore(), store);
        let minStoreDiff = Math.min(...Object.values(storeDiff));
        if (minStoreDiff < 0)
            return ERR_INVALID_ARGS;
        // 加锁
        return Lock.add(this.id, name, store);
    }
    register(groupID) {
        return 1;
    }
    getStateData(state) {
        if (!this.memory.state) {
            this.memory.state = { currentState: "", data: {} };
        }
        return this.memory.state.data[state];
    }
    getCurrentState() {
        if (!this.memory.state) {
            this.memory.state = { currentState: "", data: {} };
        }
        let currentState = this.memory.state.currentState;
        if (!currentState) {
            return "";
        }
        else {
            return currentState;
        }
    }
    runCurrentState() {
        let currentState = this.getCurrentState();
        let stateConfig = stateExport[currentState]();
        let actions = stateConfig.actions;
        let actionNames = Object.keys(actions);
        let stateContinue = StateContinue.Exit;
        for (const actionName of actionNames) {
            if (Moment.setAction(this.id, actionName) == OK) {
                let action = actions[actionName];
                let actionReturnCode = action(this);
                if (actionReturnCode == StateContinue.Continue) {
                    stateContinue = StateContinue.Continue;
                }
            }
            else {
                stateContinue = StateContinue.Continue;
            }
        }
        if (stateContinue == StateContinue.Continue) {
            return currentState;
        }
        else {
            return "";
        }
    }
    move(target) {
        if (target instanceof Creep) ;
        else {
            this.say(directions[target - 1], true);
        }
        return this._move(target);
    }
    /**
     * withdraw成功时记录到moment中
     * @param  {Structure|Tombstone|Ruin} target
     * @param  {ResourceConstant} resourceType
     * @param  {number} amount?
     */
    withdraw(target, resourceType, amount) {
        let returnCode = this._withdraw(target, resourceType, amount);
        if (returnCode == OK) {
            let delta = 0;
            if (amount) {
                delta = amount;
            }
            else {
                let targetStore = target;
                delta = Math.min(this.store.getFreeCapacity(resourceType), targetStore.store[resourceType]);
            }
            let storeChange = {};
            storeChange[resourceType] = delta;
            Moment.setStoreChange(this.id, "in", storeChange);
            Moment.setStoreChange(target.id, "out", storeChange);
        }
        return returnCode;
    }
}

/**
 * 挂载 creep 拓展
 */
var mountCreep = () => {
    if (!Creep.prototype._attack) {
        Creep.prototype._attack = Creep.prototype.attack;
        Creep.prototype._attackController = Creep.prototype.attackController;
        Creep.prototype._build = Creep.prototype.build;
        Creep.prototype._dismantle = Creep.prototype.dismantle;
        Creep.prototype._drop = Creep.prototype.drop;
        Creep.prototype._harvest = Creep.prototype.harvest;
        Creep.prototype._heal = Creep.prototype.heal;
        Creep.prototype._move = Creep.prototype.move;
        Creep.prototype._moveTo = Creep.prototype.moveTo;
        Creep.prototype._moveByPath = Creep.prototype.moveByPath;
        Creep.prototype._pickup = Creep.prototype.pickup;
        Creep.prototype._pull = Creep.prototype.pull;
        Creep.prototype._rangedAttack = Creep.prototype.rangedAttack;
        Creep.prototype._rangedHeal = Creep.prototype.rangedHeal;
        Creep.prototype._rangedMassAttack = Creep.prototype.rangedMassAttack;
        Creep.prototype._repair = Creep.prototype.repair;
        Creep.prototype._transfer = Creep.prototype.transfer;
        Creep.prototype._upgradeController = Creep.prototype.upgradeController;
        Creep.prototype._withdraw = Creep.prototype.withdraw;
    }
    assignPrototype(Creep, CreepExtension);
};

/**
 * 挂载所有的属性和方法
 */
function mount() {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展');
        // mount packeges
        mountCreep();
    }
}

// screeps 代码入口
module.exports.loop = function () {
    // 挂载依赖
    mount();
    // 执行creep
    creepRunner(Game.creeps);
    powerCreepRunner(Game.powerCreeps);
    // 执行房间，建筑
    roomRunner(Game.rooms);
};
//# sourceMappingURL=main.js.map
