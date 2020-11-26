'use strict';
// 统一管理基础通用方法:
const globalLog = require('./mount.log');
const moment = require('./mount.moment');
const lock = require('./mount.lock');
const mountCreep = require('./mount.creep');
const mountCreepState = require('./mount.creep.state');
const mountSturecture = require('./mount.structure');
const mounts = [globalLog,moment,lock,mountCreep,mountCreepState,mountSturecture];
module.export = mounts;