const mountGlobalAKA = require('./mount.globalAKA');
const mountGlobalFunc = require('./mount.globalFunc');
const mountMoment = require('./mount.moment');
const mountCreep = require('./mount.creep');
const mountCreepState = require('./mount.creep.state');
const mountStructure = require('./mount.structure');

// 挂载所有的额外属性和方法
function mount() {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展');
        global.hasExtension = true;
        mountGlobalAKA();
        mountGlobalFunc();
        mountMoment();
        mountCreep();
        mountCreepState();
        mountStructure();
    }
}

const eventHandler = require('./event');
eventHandler.register(mount);