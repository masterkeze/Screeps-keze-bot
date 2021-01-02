import { mount } from './mount'
import { setup, teardown, powerCreepRunner, creepRunner, roomRunner } from './utils'

global.test = {
    a: function () {
        console.log("hahahah");
    }
}
// screeps 代码入口
module.exports.loop = function (): void {
    // 挂载依赖
    mount();
    // 事前维护
    // setup();
    // 执行creep
    // creepRunner(Game.creeps);
    // powerCreepRunner(Game.powerCreeps);
    // 执行房间，建筑
    roomRunner(Game.rooms);
    // 事后清理
    // teardown();
}



