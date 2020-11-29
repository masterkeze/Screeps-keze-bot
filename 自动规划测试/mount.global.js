'use strict';
// 统一管理全局模块:
// 缩写
const globalAKA = require('./mount.globalAKA');
// 控制台指令
const globalFunc = require('./mount.globalFunc');

const mounts = [globalAKA,globalFunc];
module.exports = mounts;
