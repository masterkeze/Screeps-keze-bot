import { Helper } from 'helper'

const Aconfliction = new Set(["harvest", "attack", "build", "repair", "dismantle", "attackController", "rangedHeal", "heal"]);
const Rconfliction = new Set(["rangedAttack", "rangedMassAttack", "build", "repair", "rangedHeal"]);
const Mconfliction = new Set(["move","moveTo","moveByPath"]);

export namespace Moment {
    /**
     * 初始化 global.moment，重置成当前tick的moment
     */
    export function init(): void {
        if (!global.moment || global.moment.now != Game.time) {
            global.moment = {
                now: Game.time,
                data: {}
            }
        }
    }
    /**
     * 根据对象ID返回对应的Moment，如果没有，则初始化。
     * @param  {string} objectID
     * @returns Moment
     */
    export function get(objectID: string): Moment {
        init();
        if (!global.moment.data[objectID]) {
            global.moment.data[objectID] = {
                in: {},
                out: {},
                resourcesChange: {},
                damaged: 0,
                healed: 0,
                hitsChange: 0,
                actions: []
            }
        }
        return global.moment.data[objectID];
    }
    /**
     * 设置对象的资源变化，in 表示注入资源 out 表示取出资源
     * @param  {string} objectID
     * @param  {"in"|"out"} key
     * @param  {store} store
     */
    export function setStoreChange(objectID: string, key: "in" | "out", store: store): void {
        let moment = get(objectID);
        switch (key) {
            case "in":
                moment.in = Helper.storeAdd(moment.in, store);
                moment.resourcesChange = Helper.storeAdd(moment.resourcesChange, store);
                break;
            case "out":
                moment.out = Helper.storeAdd(moment.out, store);
                moment.resourcesChange = Helper.storeMinus(moment.resourcesChange, store);
                break;
            default:
                break;
        }
    }
    /**
     * 设置对象的血量变化，damaged 表示受到的伤害，healed 表示受到的治疗
     * @param  {string} objectID
     * @param  {"damaged"|"healed"} key
     * @param  {number} hits
     */
    export function setHitsChange(objectID: string, key: "damaged" | "healed", hits: number): void {
        let moment = get(objectID);
        switch (key) {
            case "damaged":
                moment.damaged += hits;
                moment.hitsChange -= hits;
                break;
            case "healed":
                moment.healed += hits;
                moment.hitsChange += hits;
                break;
            default:
                break;
        }
    }
    /**
     * 设置对象执行的动作，如果要执行的动作和已注册的动作冲突，则返回ERR_BUSY
     * @param  {string} objectID
     * @param  {ActionConstant} key
     * @returns OK | ERR_BUSY
     */
    export function setAction(objectID: string, key: ActionConstant): OK | ERR_BUSY {
        let moment = get(objectID);
        let currentSet = new Set(moment.actions);
        if (currentSet.has(key)) return ERR_BUSY;
        currentSet = currentSet.add(key);
        if (Helper.intersection(currentSet,Aconfliction).size > 1) return ERR_BUSY;
        if (Helper.intersection(currentSet,Rconfliction).size > 1) return ERR_BUSY;
        if (Helper.intersection(currentSet,Mconfliction).size > 1) return ERR_BUSY;
        moment.actions.push(key);
        return OK;
    }
}