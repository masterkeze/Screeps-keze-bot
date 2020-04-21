function getBodyPartWCM(WorkNum,CarryNum,MoveNum){
    var bodyPart = [];
    for (let i = 0; i < WorkNum ; i++) {
        bodyPart.push(WORK);
    }
    for (let i = 0; i < CarryNum ; i++) {
        bodyPart.push(CARRY);
    }
    for (let i = 0; i < MoveNum ; i++) {
        bodyPart.push(MOVE);
    }
    return bodyPart;
}

function getSpawn(roomName,roleBody){
    var spawnObj = null;
    if (!Memory.rooms[roomName]){
        console.log("No statistics for room "+roomName);
        return spawnObj;
    }
    if (!Memory.rooms[roomName].SpawnIDs || Memory.rooms[roomName].SpawnIDs.length == 0){
        //console.log("No spawns for room "+roomName);
        return spawnObj;
    }
    for (let i = 0; i < Memory.rooms[roomName].SpawnIDs.length ; i++) {
        var spawnObj = Game.getObjectById(Memory.rooms[roomName].SpawnIDs[i]);
        if (spawnObj && spawnObj.spawnCreep(roleBody, 'testtest', { dryRun: true }) == 0){
            return spawnObj;
        }
    }
    return null;
}


function initPlan6(GroupID,SpawnID,SourceID){
    // buildTeam
    var spawnObj = Game.getObjectById(SpawnID);
    var sourceObj = Game.getObjectById(SourceID);
    if (spawnObj && sourceObj){
        var groupPlan = {
            roomName: 'W29S22',
            groupType: 'r_buildTeam',
            SourceID: SourceID,
            SpawnID: SpawnID,
            GroupID: GroupID,
            roles: ["r_builder"],
            roleBody: [[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]],
            roleLimit: [2],
            spawnAhead: [200],
            creeps: []
        };
        Memory.groups[GroupID] = groupPlan;
        return 0;
    }else{
        return -1;
    }
}

function updateStructures(){
    var towers = [];
    for (const structure in Game.structures) {
        if (Game.structures[structure].structureType == STRUCTURE_TOWER){
            towers.push(Game.structures[structure].id);
            //console.log(Game.structures[structure].id);
        }
    }
    Memory.towers = towers;
}
require('超级移动优化');
global.detail = function(resourceType){
    console.log(JSON.stringify(COMMODITIES[resourceType]));
}

global.groups = function(){
    var GroupIDs = Object.keys(Memory.groups);
    Memory.groupTypes = {};
    for (var i=0; i<GroupIDs.length;i++) {
        var GroupID = GroupIDs[i];
        var groupPlan = Memory.groups[GroupID];
        if (!Memory.groupTypes[groupPlan.groupType]){
            Memory.groupTypes[groupPlan.groupType] = [GroupID];
        }else{
            Memory.groupTypes[groupPlan.groupType].push(GroupID);
        }
        console.log(GroupID+":"+groupPlan.groupType);
    }
    
}

global.scan = function(resourceType){
    for (const roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        if (room.controller && room.controller.my){
            console.log(roomName+":"+room.getStore(resourceType));
        }
        // if(room.controller.my){
            
        // }
    }
}

module.exports.loop = function () {

    require("prototype.Room").load();
    const statistics = require("statistics");
    const towerExp = require("tower");
    const linkfromExp = require("linkFrom");
    const factoryExp = require("factory");
    const powerSpawnExp = require("powerSpawn");

    require("observe").run(Game.getObjectById("5e703e4c580590b6adecce4e"));
    //console.log('spawn uses:',(end-start));
    require("market").run();
    statistics.update();
    powerSpawnExp.run();
    factoryExp.run();
    

    Memory.towers.forEach(tower => {
        towerExp.run(Game.getObjectById(tower));
    });
    require("terminal").run();

    // var GroupID = "r_build_5bbcab489099fc012e63336c";
    // if (Memory.groups[GroupID]){
    //     delete Memory.groups[GroupID];
    //     //initPlan6(GroupID,"5e6f266df748461ba6ab32c9","5bbcab489099fc012e63336c");
    // }
    // var GroupID = "r_build_5bbcab489099fc012e63336b";
    // if (Memory.groups[GroupID]){
    //     delete Memory.groups[GroupID];
    //     //initPlan6(GroupID,"5e6f266df748461ba6ab32c9","5bbcab489099fc012e63336b");
    // }

    //updateStructures();
    // if (Game.time % 5000 == 0){
    //     updateStructures();
    // }
    // if (Game.time % 100 == 0){
    //     Game.market.createOrder({
    //         type: ORDER_BUY,
    //         resourceType: RESOURCE_ENERGY,
    //         price: 0.1,
    //         totalAmount: 1,
    //         roomName: "W29S22"   
    //     });
    // }

    var roleContainer = [];
    var roles = ['pureharvester','picker','distributer','repairer','upgrader','builder','filler','harvester','transferer','upgradeSupplier','attacker','r_harvester','r_transferer','claimer','r_builder','primitive','deposit','cmanager','stealer'];
    for (var i=0; i<roles.length;i++) {
        var role = roles[i];
        roleContainer.push(require('role.'+role));
    }

    var plans = ['distribute','primitive','source','build','upgrade','mineral','center','deposit','steal'];
    for (var i=0; i<plans.length;i++){
        var plan = plans[i];
        require('plan.'+plan).update();
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var creepRole = creep.memory.role;
        //console.log(roleContainer.length,roles.length);
        if (!creepRole){
            continue;
        }
        if (roles.indexOf(creepRole) >= 0){
            //console.log(creepRole);
            roleContainer[roles.indexOf(creepRole)].run(creep);
        }
    }
    
    // run links
    for (const roomName of Object.keys(Game.rooms)) {
        if (!Memory.rooms[roomName] || !Memory.rooms[roomName].LinksFrom){
            continue;
        }
        for (const LinkID of Memory.rooms[roomName].LinksFrom) {
            const link = Game.getObjectById(LinkID);
            if (link){
                linkfromExp.run(link);
            }
        }
    }

    //console.log(p1.ticksToLive);
    for(var name in Memory.creeps) {
        
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (!Memory.groups){
        Memory.groups = Object();
    }
    
    // maintain creeps in groups
    var GroupIDs = Object.keys(Memory.groups);
    var spawningFlag = false;
    for (var i=0; i<GroupIDs.length;i++) {
        var GroupID = GroupIDs[i];
        //console.log("maintaining "+GroupID);
        // clear useless group
        if(!Game.getObjectById(GroupID)){
            //console.log("clearing group memory "+GroupID);
            //delete Memory.groups[GroupID];
            //continue;
        }
        // clear non-existing creep
        var groupPlan = Memory.groups[GroupID];
        if (groupPlan.usingPC) continue;
        while (groupPlan.creeps.length > 0 && !Game.getObjectById(groupPlan.creeps[0])){
            groupPlan.creeps = groupPlan.creeps.slice(1);
        }
        //console.log("clear memory OK ");
        if(groupPlan.roles.length == 0) continue;
        // var spawnObj = Game.getObjectById(groupPlan.SpawnID);
        
        // //console.log(result);
        // if(!spawnObj || spawningFlag ){ 
        //     //console.log(groupPlan.SpawnID+" not able to spawn");
        //     continue;
        // }
        //console.log("ready to spawn");
        // get statistic data
        var currentCount = [];
        var currentLiveTick = [];
        var roles = groupPlan.roles;
        for (var j = 0; j < groupPlan.roles.length; j++) {
            currentCount.push(0);
            currentLiveTick.push(1500);
        }
        for (var j=0; j < groupPlan.creeps.length;j++){

            var creepId = groupPlan.creeps[j];
            var creep = Game.getObjectById(creepId);
            if (!creep || !creep.memory.role){
                continue;
            }
            var roleIndex = roles.indexOf(creep.memory.role);
            if (roleIndex >= 0){
                currentCount[roleIndex] += 1;
                currentLiveTick[roleIndex] = Math.min(currentLiveTick[roleIndex],creep.ticksToLive);
            }
        }
        // console.log(currentCount);
        // console.log(currentLiveTick);
        // creep generation
        // if (groupPlan.groupType !="DistributeTeam"){
        //     continue;
        // }
        for (var j = 0; j < groupPlan.roles.length; j++) {
            var role = groupPlan.roles[j];
            var roleBody = groupPlan.roleBody[j];
            var newName = role + Game.time +"_"+i+"_"+j;
            var spawnObj = getSpawn(groupPlan.roomName,roleBody);
            if (!spawnObj){
                continue;
            }
            if (currentCount[j] < groupPlan.roleLimit[j] || (currentLiveTick[j] < groupPlan.spawnAhead[j] && currentCount[j] == groupPlan.roleLimit[j])){
                spawnObj.spawnCreep(roleBody, newName, {memory: {role: role, groupID: GroupID}});
                console.log('Spawning new : ' + newName + ' for group : '+GroupID);
            }
        }
    }
    require("status").run();
    //console.log(Game.cpu.getUsed())
}