class Lock{
    /**
     * create Lock instance
     * @param {string} name 
     * @param {Structure} structure
     * @param {Store} store 
     */
    constructor(name,structure,store){
        this.name = name;
        this.structure = structure;
        this.store = store;
        this.created = Game.time;
    }
    serialize(){
        return {
            name : this.name,
            store : this.store,
            structure : this.structure.id,
            created : this.created,
        }
    }
    deserialize(lockData){
        this.name = lockData.name;
        this.store = lockData.store;
        this.structure = Game.getObjectById(lockData.structure);
        this.created = lockData.created;
    }
    validate(){
        if (this.structure && Game.getObjectById(this.structure.id)){
            return true;
        }else{
            return false;
        }
    }
}
/**
 * store1 - store2, negative values are allowed
 * @param {Store} store1 
 * @param {Store} store2 
 */
function storeDiff(store1,store2){
    let resourceTypes = [...new Set(Object.keys(store1).concat(Object.keys(store2)))];
    let result = {};
    resourceTypes.forEach((resourceType) => {
        let value1 = store1[resourceType] ? store1[resourceType] : 0;
        let value2 = store2[resourceType] ? store2[resourceType] : 0;
        let diff = value1 - value2;
        if (diff){
            result[resourceType] = diff;
        }
    });
    return result;
}
/**
 * sum store[]
 * @param {Store[]} storeArr 
 */
function storeSum(storeArr){
    let result = {};
    storeArr.forEach((store)=>{
        result = storeDiff(result,storeDiff({},store));
    })
    return result;
}