class Task {
    constructor(name,type="default",source=null,store={}){
        this.name = name
        this.type = type;
        this.source = source;
        this.store = store;
        this.created = Game.time;
        this.subTasks = [];
        this.callbacks = [];
    }
    serialize(){
        return {
            name : this.name,
            type : this.type,
            source : this.source.id,
            store : this.store,
            created : this.created,
            subTasks : this.subTasks,
            callbacks : this.callbacks
        }
    }
    deserialize(taskData){
        this.name = taskData.name;
        this.type = taskData.type;
        this.source = Game.getObjectById(taskData.source);
        this.store = taskData.store;
        this.created = taskData.created;
        this.subTasks = taskData.subTasks;
        this.callbacks = taskData.callbacks;
    }
    validate(){
        if (this.source && Game.getObjectById(this.source.id)){
            return true;
        }else{
            return false;
        }
    }
    /**
     * be subtask of another task
     * @param {Task} task 
     */
    waitedBy(task){
        // can't be waitedBy itself
        if (task.name == this.name){
            return ERR_INVALID_TARGET;
        }
        // dead lock
        if (task.name in this.subTasks || this.name in task.callbacks){
            return ERR_INVALID_TARGET;
        }
        if (!(this.name in task.subTasks)){
            task.subTasks.push(this.name);
        }
        if (!(task.name in this.callbacks)){
            this.callbacks.push(task.name);
        }
        saveTask(this);
        saveTask(task);
        return OK;
    }
    /**
     * be callback of another task
     * @param {Task} task 
     */
    waitFor(task){
        // can't wait for itself
        if (task.name == this.name){
            return ERR_INVALID_TARGET;
        }
        // dead lock
        if (this.name in task.subTasks || task.name in this.callbacks){
            return ERR_INVALID_TARGET;
        }
        if (!(this.name in task.callbacks)){
            task.callbacks.push(this.name);
        }
        if (!(task.name in this.subTasks)){
            this.subTasks.push(task.name);
        }
        saveTask(this);
        saveTask(task);
        return OK;
    }
    callback(){

    }
    delete(){
        this.subTasks.forEach(taskName => {
            let task = global.tasks[taskName];
            if (task){
                task.callbacks = task.callbacks.filter((callbackTaskName)=>{return callbackTaskName != taskName});
            }
        });
    }
}

class TransferTask extends Task {
    constructor(name,source=null,store=null,target=null){
        super(name,"transfer",source,store);
        this.target = target;
    }
    serialize(){
        let serializedData = super.serialize();
        serializedData.target = this.target.id;
        return serializedData;
    }
    deserialize(taskData){
        super.deserialize(taskData);
        this.target = Game.getObjectById(taskData.target);
    }
    validate(){
        if (super.validate() && this.target && Game.getObjectById(this.target.id)){
            return true;
        }else{
            return false;
        }
    }
}

class SendTask extends Task{
    constructor(name,source=null,store=null,toRoom=null){
        super(name,"send",source,store);
        this.toRoom = toRoom;
    }
    serialize(){
        let serializedData = super.serialize();
        serializedData.toRoom = this.toRoom;
        return serializedData;
    }
    deserialize(taskData){
        super.deserialize(taskData);
        this.toRoom = taskData.toRoom;
    }
    validate(){
        if (super.validate() && this.toRoom){
            return true;
        }else{
            return false;
        }
    }
}

function loadTasks(){
    // load tasks from memory
    if (!Memory.tasks){
        Memory.tasks = {}
    }
    global.tasks = {}
    let taskNames = Object.keys(Memory.tasks);
    taskNames.forEach(taskName => {
        try {
            let type = Memory.tasks[taskName].type;
            let task;
            switch (type) {
                case "transfer":
                    task = new TransferTask(taskName);
                    break;
                case "send":
                    task = new SendTask(taskName);
                    break;
                default:
                    task = new Task(taskName);
                    break;
            }
            if (task && recoverTask(task) == OK && task.validate()){
                global.tasks[taskName] = task;
            } else {
                console.log(`clear task [${taskName}] memory : can't recover from memory`);
                delete Memory.tasks[taskName];
            }
        } catch (error) {
            console.log(`clear task [${taskName}] memory : ${error}`);
            delete Memory.tasks[taskName];
        }
    });
}

Room.prototype.createTransferTask = function(source,store,target){
    if (!source || !target || !Game.getObjectById(source.id) || !Game.getObjectById(target.id)){
        return null;
    }
    let taskName = getTaskName("transfer");
    let task = new TransferTask(taskName,source,store,target);
    saveTask(task);
    return task;
}


function getTaskName(type = "default"){
    let randomText = "";
    let taskName = type + "_" + randomText;
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    while (!randomText || !isUnique(taskName)){
        randomText = "";
        for (let i = 0; i < 6; i++){
            randomText += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        taskName = type + "_" + randomText;
    }
    return taskName;
}
/**
 * @param {string} taskName 
 */
function isUnique(taskName){
    if (Memory.tasks[taskName]){
        return false;
    }else{
        return true;
    }
}
/**
 * @param  {Task} task
 */
function saveTask(task){
    if (!Memory.tasks){
        Memory.tasks = {};
    }
    global.tasks = task;
    Memory.tasks[task.name] = task.serialize();
}
/**
 * @param  {Task} task
 */
function recoverTask(task){
    let taskData = Memory.tasks?Memory.tasks[task.name]:null;
    if (taskData){
        task.deserialize(taskData);
        return OK;
    }else{
        return ERR_NOT_FOUND;
    }
}

loadTasks();