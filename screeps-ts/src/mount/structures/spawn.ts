import { Helper } from 'helper'
// spawn 原型拓展
export default class SpawnExtension extends StructureSpawn {
    public work(): void {
        let me = this as StructureSpawn;
        // 是否可用，是否占用 暂不考虑取消出生的情况
        if (!me.isActive() || this.spawning) return;
        // 获取本房间的孵化队列
        let spawnTask = global.spawnTask.peek(me.room.name) as SpawnAsyncTaskMemory;
        if (!spawnTask) return;
        let spawnConfig = spawnTask.config;
        if (Game.creeps[spawnConfig.name]) {
            spawnConfig.name = Helper.getUniqueNameForCreep(spawnConfig.name);
        }
        let retcode: ScreepsReturnCode = this.spawnCreep(spawnConfig.body, spawnConfig.name, { memory: spawnConfig.memory });
        switch (retcode) {
            case OK:
                global.spawnTask.pop(me.room.name);
                // 触发装填任务
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                // rest for filling energy
                break;
            default:
                // 其他情况不处理
                global.spawnTask.pop(me.room.name);
                // log 一下问题
                break;
        }
    }
}