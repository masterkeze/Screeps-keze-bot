import mountBuildingCache from 'modules/buildingCache'
import mountCreep from './creep'
import mountRoom from './room'
import mountStructures from './structures'
import {Moment} from 'modules/moment'
import {SpawnAsyncTaskExport} from 'modules/asyncTasks/spawnTask'

/**
 * 挂载所有的属性和方法
 */

export function mount (): void {
    if (!global.hasExtension) {
        global.hasExtension = true;
        console.log('[mount] 重新挂载拓展');
        // 挂载前置工作
        workBeforeMount();
        // mount packeges
        mountBuildingCache();
        Moment.mount();
        SpawnAsyncTaskExport.mount();
        mountCreep();
        mountRoom();
        mountStructures();
        // 挂载完成后工作
        workAfterMount();
    }
}

function workBeforeMount() {

}

function workAfterMount() {

}