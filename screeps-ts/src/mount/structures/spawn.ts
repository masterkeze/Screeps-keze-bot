import {Helper} from 'helper'
// spawn 原型拓展
export default class SpawnExtension extends StructureSpawn {
    public work():void{
        // 是否可用，是否占用 暂不考虑取消出生的情况
        if (!this.isActive() || this.spawning) return;
        // 获取本房间的孵化队列
        let spawnConfigHeap : SpawnConfig[];
        if (spawnConfigHeap.length === 0) return;
        let spawnConfig = spawnConfigHeap[0];
        let retcode:ScreepsReturnCode = this.spawnCreep(spawnConfig.body,spawnConfig.name,{memory:spawnConfig.memory});
        if (retcode == OK){
            Helper.popSpawnQueue(spawnConfigHeap);
            // 触发一些其他的工作
        }
    }
}