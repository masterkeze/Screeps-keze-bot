"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mount = void 0;
function mount() {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展');
        workBeforeMount();
        workAfterMount();
    }
}
exports.mount = mount;
function workBeforeMount() {
}
function workAfterMount() {
}
