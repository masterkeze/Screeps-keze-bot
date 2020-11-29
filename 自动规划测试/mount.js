// 挂载整合过的包
const mountUtils = require('./mount.utils');
const mountGlobal = require('./mount.global');

let packages=[mountUtils,mountGlobal];

module.exports = function() {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展');
        global.hasExtension = true;
        packages.forEach((package)=>{
            try {
                package.forEach((mount)=>{
                    try {
                        mount();
                    } catch (error) {
                        global.logError("挂载扩展",`${mount.name} 出错:${error}`);
                    }
                });
            } catch (error) {
                global.logError("挂载模块包",`${package.name} 出错:${error}`);
            }
        });
    }
}