/**
 * 全局统计信息扫描器
 * 负责搜集关于 cpu、memory、GCL、GPL 的相关信息
 */
module.exports = {
    run : function () {
        // 每 20 tick 运行一次
        if (Game.time % 20) return 
      
        if (!Memory.stats) Memory.stats = {}
        
        // 统计 GCL / GPL 的升级百分比和等级
        Memory.stats.gcl = (Game.gcl.progress / Game.gcl.progressTotal) * 100
        Memory.stats.gclLevel = Game.gcl.level
        Memory.stats.gpl = (Game.gpl.progress / Game.gpl.progressTotal) * 100
        Memory.stats.gplLevel = Game.gpl.level
        // CPU 的当前使用量
        Memory.stats.cpu.total = Game.cpu.getUsed()
        // bucket 当前剩余量
        Memory.stats.bucket = Game.cpu.bucket
        Memory.stats.credits = Game.market.credits
        Memory.stats.creepNum = Object.keys(Game.creeps).length
        for (const roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my){
                if (!Memory.stats.storage){
                    Memory.stats.storage = {}
                }
                if (room.storage){
                    Memory.stats.storage[roomName] = room.storage.store.getUsedCapacity()
                }
                if (!Memory.stats.terminal){
                    Memory.stats.terminal = {}
                }
                if (room.terminal){
                    Memory.stats.terminal[roomName] = room.terminal.store.getUsedCapacity()
                }

            }
        }
    }
}
