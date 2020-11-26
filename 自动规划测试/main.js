'use strict';
// load modules
require('./BuildingCache');
const eventHandler = require('./event');
module.exports.loop = function () {
    eventHandler.run();
    // run events
    // run creeps
    // run buildings
}