'use strict';
module.exports = function () {
    _.assign(global, Group);
}
// creation function
function createGroup(type,room,data){
    let output = {
        type : type,
        room : room,
        data : data
    };
    return output;
}
// index by room
let groupCache = {};
// Singleton Object
const Group = {
    get: function (groupID) {
        return Memory.groups[groupID];
    },
    set: function (groupID, config) {
        if (!Memory.groups) {
            Memory.groups = {};
        }
        Memory.groups[groupID] = config;
    },
    register: function (groupID, creep) {
        let groupContent = this.get(groupID);
        if (!groupContent || !creep){
            return ERR_INVALID_ARGS;
        }
        if (!groupContent.creeps){
            groupContent.creeps = [creep.name];
        }else{
            groupContent.creeps.push(creep.name);
        }
    },

}