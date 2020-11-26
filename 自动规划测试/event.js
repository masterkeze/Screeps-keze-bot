// handle functions need to be executed every tick or every few ticks
// 只接受runtime添加的函数，如果是模块自带的载入函数或者清理函数，应当直接hard-code进载入代码统一管理
if (!global.events){
    global.events = {};
}
if (!Memory.events){
    Memory.events = {};
}
module.exports = {
    /**
     * register functions after global reset
     * @param {function} fn 
     * @param {number} period 
     */
    register : function(fn,period=0){
        if (!fn.name){
            return ERR_NOT_FOUND;
        }
        if (global.events[fn.name]){
            return ERR_NAME_EXISTS;
        }
        global.events[fn.name] = fn;
        let config = {
            period : period,
            lastCalled : null
        }
        if (!Memory.events[fn.name] || Memory.events[fn.name].period != period){
            Memory.events[fn.name] = config;
        }
        return OK;
    },
    run : function(){
        let toDelete = [];
        for (const [functionName, config] of Object.entries(Memory.events)) {
            let toRun = global.events[functionName];
            if (!toRun){
                toDelete.push(functionName);
                continue;
            }
            if (!config.period || !config.lastCalled || config.lastCalled + config.period < Game.time){
                // run the event
                try {
                    toRun();
                    config.lastCalled = Game.time;
                } catch (error) {
                    config.log = `[error] ${Game.time}:${error}`;
                }
            }
        }
        toDelete.forEach((functionName)=>{
            delete Memory.events[functionName];
        });
    }
}