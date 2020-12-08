import { EMLINK } from "constants";

export function setup(){

}

export function teardown(){

}

interface powerCreepHashMap{
    [creepName: string]: PowerCreep
}

export function powerCreepRunner(hashMap: powerCreepHashMap){

}

interface creepHashMap{
    [creepName: string]: Creep
}

export function creepRunner(hashMap: creepHashMap){
    Object.values(hashMap).forEach(creep=>{
        creep.work();
    });
}

interface roomHashMap{
    [roomName:string]:Room
}

export function roomRunner(hashMap: roomHashMap){

}



/**
 * 把 obj2 的原型合并到 obj1 的原型上
 * 如果原型的键以 Getter 结尾，则将会把其挂载为 getter 属性
 * @param obj1 要挂载到的对象
 * @param obj2 要进行挂载的对象
 */
export const assignPrototype = function(obj1: {[key: string]: any}, obj2: {[key: string]: any}) {
    Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
        if (key.includes('Getter')) {
            Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                get: obj2.prototype[key],
                enumerable: false,
                configurable: true
            })
        }
        else obj1.prototype[key] = obj2.prototype[key]
    })
}


export namespace Helper {
    export function storeAdd(store1: store, store2: store): store {
        let output: store;
        Object.keys(store1).forEach(resourceType => {
            let value = store1[resourceType];
            if (value) output[resourceType] = value;
        });
        Object.keys(store2).forEach(resourceType => {
            let value = store2[resourceType];
            if (value) {
                if (output[resourceType]) {
                    output[resourceType] += value;
                } else {
                    output[resourceType] = value;
                }
            }
        });
        return output;
    }
    export function storeMinus(store1: store, store2: store): store{
        let output: store;
        Object.keys(store1).forEach(resourceType => {
            let value = store1[resourceType];
            if (value) output[resourceType] = value;
        });
        Object.keys(store2).forEach(resourceType => {
            let value = store2[resourceType];
            if (value) {
                if (output[resourceType]) {
                    output[resourceType] -= value;
                } else {
                    output[resourceType] = -1*value;
                }
            }
        });
        return output;
    }
    export function intersection(setA:Set<any>,setB:Set<any>): Set<any>{
        let _intersection:Set<any> = new Set();
        for (let elem of setB){
            if (setA.has(elem)){
                _intersection.add(elem);
            }
        }
        return _intersection;
    }
}