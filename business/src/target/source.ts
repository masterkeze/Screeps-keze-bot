// 要有位置存储信息-memory
// 采集位置获取
// 房间位置注册
// 发布招聘需求


Creep.prototype.workForSource = function (s: Source) {
    let source = s instanceof Source ? s : null;
    if (!source) {
        this.free();
        return
    }
}

const sourceTask = {
    run: (s: Source) => {
        let creeps: Creep[] = getCreeps();
        if (s.energy > 0) {
            creeps.forEach((creep) => {
                
                creep.workForSource(s)
            });
        }
    }
}

function getCreeps(): Creep[] {
    let creeps: Creep[] = [];
    return creeps;
}