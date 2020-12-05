"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mount_1 = require("./mount");
var utils_1 = require("./utils");
module.exports.loop = function () {
    mount_1.mount();
    utils_1.setup();
    utils_1.creepRunner(Game.creeps);
    utils_1.powerCreepRunner(Game.powerCreeps);
    utils_1.roomRunner(Game.rooms);
    utils_1.teardown();
};
