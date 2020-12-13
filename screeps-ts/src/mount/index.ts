import mountCreep from './creep'
/**
 * 挂载所有的属性和方法
 */

export function mount (): void {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展');

        // 挂载前置工作
        workBeforeMount();
        // mount packeges
        mountCreep();
        // 挂载完成后工作
        workAfterMount();
    }
}

function workBeforeMount() {

}

function workAfterMount() {

}