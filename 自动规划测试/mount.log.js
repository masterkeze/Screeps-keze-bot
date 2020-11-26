'use strict';
module.exports = function () {
    _.assign(global, logExtension)
}

// 通知的强度 30分钟 60分钟 120分钟
const NOTIFY_LEVEL = {
    1 : 30,
    2 : 60,
    3 : 120,
    4 : 240
}

const logExtension = {
    logError(moduleName,msgbody,notify=true,notifyLevel=1) {
        let msg = `[Error] ${Game.time} [${moduleName}]: ${msgbody}`
        console.log(msg);
        if (notify){
            Game.notify(msg,NOTIFY_LEVEL[notifyLevel]);
        }
    },
    logWarn(moduleName,msgbody,notify=false,notifyLevel=4) {
        let msg = `[Warn] ${Game.time} [${moduleName}]: ${msgbody}`
        console.log(msg);
        if (notify){
            Game.notify(msg,NOTIFY_LEVEL[notifyLevel]);
        }
    }
}