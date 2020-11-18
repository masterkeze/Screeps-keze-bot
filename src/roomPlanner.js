const plan = [    
    "e5 e5 e5 e4 e4 r4 e4 e4 e3 e3 e3",
    "e5 r5 r5 e5 r5 e4 r4 e4 e3 r3 e3",
    "e5 e5 e5 r5 s7 n8 t5 r4 e2 r3 e2",
    "e6 e5 r5 e5 r5 e4 t7 t3 r2 e2 e2",
    "e6 r6 e6 L5 T6 r4 e4 r4 s1 r2 e2",
    "r6 e6 e6 p8 r6 S4 r4 e4 l6 l6 r2",
    "e6 r6 e6 r6 f7 r5 e4 l8 l6 r6 l7",
    "e7 e7 r6 e6 e6 e6 r6 l8 r6 l7 l7",
    "e7 r6 e7 r6 t8 t8 s8 r6 l8 l8 e8",
    "e7 r6 e7 e7 r6 t8 r6 e8 r6 r6 e8",
    "e7 e7 e7 e8 e8 r6 e8 e8 e8 e8 e8"
]

const mapping = {
    e : STRUCTURE_EXTENSION,
    r : STRUCTURE_ROAD,
    n : STRUCTURE_NUKER,
    s : STRUCTURE_SPAWN,
    t : STRUCTURE_TOWER,
    T : STRUCTURE_TERMINAL,
    S : STRUCTURE_STORAGE,
    L : STRUCTURE_LINK,
    l : STRUCTURE_LAB,
    p : STRUCTURE_POWER_SPAWN,
    f : STRUCTURE_FACTORY
}

Room.prototype.clearSites = function(){
    let sites = this.find(FIND_CONSTRUCTION_SITES,{
        filter:function(site){
            return site.progress == 0;
        }
    });
    sites.forEach((site)=>{
        site.remove();
    });
}

Room.prototype.roomPlan = function(x,y){
    if ( x - 5 <= 0 || x + 5 >= 49 || y - 5 <= 0 || y + 5 >= 49){
        console.log(`[roomPlan] NO PLACE to plan ${this.name} at (${x},${y})`);
        return ERR_INVALID_TARGET;
    }
    if (!this.controller || !this.controller.my){
        console.log(`[roomPlan] can't plan unOwned room ${this.name}`);
        return ERR_INVALID_TARGET;
    }
    const baseX = x - 5;
    const baseY = y - 5;
    let level = this.controller.level;
    for (let row = 0; row < plan.length; row++) {
        const planString = plan[row];
        let planDetail = planString.split(' ');
        for (let column = 0; column < planDetail.length; column++) {
            const planCode = planDetail[column];
            let tempX = baseX + column;
            let tempY = baseY + row;
            let structureType = mapping[planCode[0]];
            let enableLevel = planCode[1];
            if (level < enableLevel){
                continue;
            }
            let siteFounds = this.lookForAt(LOOK_CONSTRUCTION_SITES,tempX,tempY);
            if (siteFounds.length > 0){
                if (siteFounds[0].structureType != structureType){
                    console.log(`[roomPlan] ${this.name} conflict at (${tempX},${tempY})`);
                }
                continue;
            }
            let structureFounds = this.lookForAt(LOOK_STRUCTURES,tempX,tempY);
            let needToCreate = true;
            let isConflict = false;
            for (const structureFound of structureFounds) {
                if (structureFound.structureType == structureType){
                    needToCreate = false;
                    break;
                }
                if (structureFound.structureType == STRUCTURE_RAMPART || structureFound.structureType == STRUCTURE_ROAD){
                    continue;
                }else{
                    needToCreate = false;
                    isConflict = true;
                    break;
                }
            }
            if (needToCreate){
                let result = this.createConstructionSite(tempX,tempY,structureType);
                if (result != OK){
                    console.log(`[roomPlan] ${this.name} fail to create ${structureType} site at (${tempX},${tempY}), error code: ${result}`);
                }
            }
            if (isConflict){
                console.log(`[roomPlan] ${this.name} conflict at (${tempX},${tempY})`);
            }
        }
    }
    return OK;
}