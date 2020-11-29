// load modules
require('./BuildingCache');
let mount = require('./mount');

module.exports.loop = function () {
    // 挂载依赖
    mount();
    // run creeps
    // run buildings
}