import { Helper } from 'helper'
// spawn 原型拓展
export default class SpawnExtension extends StructureSpawn {
    public work(): void {
        // 是否可用，是否占用 暂不考虑取消出生的情况
        if (!this.isActive() || this.spawning) return;
        // 获取本房间的孵化队列
        let spawnConfigHeap: SpawnConfig[];
        if (spawnConfigHeap.length === 0) return;
        let spawnConfig = spawnConfigHeap[0];
        if (Game.creeps[spawnConfig.name]) {
            spawnConfig.name = Helper.getUniqueNameForCreep(spawnConfig.name);
        }
        let retcode: ScreepsReturnCode = this.spawnCreep(spawnConfig.body, spawnConfig.name, { memory: spawnConfig.memory });
        switch (retcode) {
            case OK:
                Helper.popSpawnQueue(spawnConfigHeap);
                // 触发装填任务
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                // rest for filling energy
                break;
            default:
                // 其他情况不处理
                Helper.popSpawnQueue(spawnConfigHeap);
                // log 一下问题
                break;
        }
    }
}