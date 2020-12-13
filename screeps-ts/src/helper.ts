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