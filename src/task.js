'use strict';
require('mount.lock');

class Task {
	constructor(name, type = 'default', source = null, store = {}) {
		this.name = name;
		this.type = type;
		this.source = source;
		this.store = store;
		this.created = Game.time;
		this.subTasks = [];
		this.callbacks = [];
		this.locks = [];
	}
	serialize() {
		return {
			name: this.name,
			type: this.type,
			source: this.source.id,
			store: this.store,
			created: this.created,
			subTasks: this.subTasks,
			callbacks: this.callbacks,
			locks: this.locks
		};
	}
	deserialize(taskData) {
		this.name = taskData.name;
		this.type = taskData.type;
		this.source = Game.getObjectById(taskData.source);
		this.store = taskData.store;
		this.created = taskData.created;
		this.subTasks = taskData.subTasks;
		this.callbacks = taskData.callbacks;
		this.locks = taskData.locks;
	}
	addLock(lockingStore) {
		let lockName = this.source.addAnonymousLock(lockingStore);
		if (lockName) {
			this.locks.push(lockName);
			return OK;
		}
		return ERR_INVALID_ARGS;
	}
	mergeLocks() {
		if (this.locks.length > 1) {
			for (let i = 0; i < this.locks.length; i++) {
				const lockName = this.locks[i];
				if (this.source.hasLock(lockName)) {
					let lockingStore = this.source.getLockingStore(lockName);
					if (Object.keys(lockingStore).length > 0) {
						lockingStores.push(lockingStore);
					}
					this.source.releaseLock(lockName);
				}
			}
			let lockingSum = storeSum(lockingStores);
			this.addLock(lockingSum);
			saveTask(this);
		}
		return OK;
	}
	releaseLocks(){
		this.locks.forEach((lockName)=>{
			this.source.releaseLock(lockName);
		})
		this.locks = [];
		saveTask(this);
	}
	// 每个类型要单独写
	split(store) {
		// need to be rewritten.
	}
	validate() {
		if (this.source && Game.getObjectById(this.source.id)) {
			return true;
		} else {
			return false;
		}
	}
	/**
     * be subtask of another task
     * @param {Task} task 
     */
	waitedBy(task) {
		// can't be waitedBy itself
		if (task.name == this.name) {
			return ERR_INVALID_TARGET;
		}
		// dead lock
		if (task.name in this.subTasks || this.name in task.callbacks) {
			return ERR_INVALID_TARGET;
		}
		if (!(this.name in task.subTasks)) {
			task.subTasks.push(this.name);
		}
		if (!(task.name in this.callbacks)) {
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
	waitFor(task) {
		// can't wait for itself
		if (task.name == this.name) {
			return ERR_INVALID_TARGET;
		}
		// dead lock
		if (this.name in task.subTasks || task.name in this.callbacks) {
			return ERR_INVALID_TARGET;
		}
		if (!(this.name in task.callbacks)) {
			task.callbacks.push(this.name);
		}
		if (!(task.name in this.subTasks)) {
			this.subTasks.push(task.name);
		}
		saveTask(this);
		saveTask(task);
		return OK;
	}
	callback() {
		// release all locks
		let lockingStores = [];
		for (let i = 0; i < this.locks.length; i++) {
			const lockName = this.locks[i];
			if (this.source.hasLock(lockName)) {
				let lockingStore = this.source.getLockingStore(lockName);
				if (Object.keys(lockingStore).length > 0) {
					lockingStores.push(lockingStore);
				}
			}
		}
		this.releaseLocks();
		console.log(JSON.stringify(lockingStores));
		let lockingSum = storeSum(lockingStores);
		let resourceTypes = Object.keys(lockingSum);
		console.log(JSON.stringify(lockingSum));
		// callback
		this.callbacks.forEach((taskName) => {
			let task = global.tasks[taskName];
			if (task) {
				task.subTasks = task.subTasks.filter((subTaskName) => {
					return subTaskName != this.name;
				});
				if (resourceTypes.length > 0) {
					task.addLock(lockingSum);
					task.store = storeSum([ task.store, lockingSum ]);
				}
				saveTask(task);
			}
		});
		this.callbacks = [];

		saveTask(this);
		return OK;
	}
}

// transfer one resource type from one source to one target
class TransferTask extends Task {
	constructor(name, source = null, resourceType = null, amount = null, target = null) {
		let store = {};
		if (resourceType && amount) {
			store[resourceType] = amount;
		}
		super(name, 'transfer', source, store);
		this.target = target;
		if (this.validate()) {
			if (this.addLock(store) == OK) {
				console.log(
					`发布任务成功 ${this.name} [room ${this.source.room.name}] 从 [${this.source.structureType}] 向 [${this
						.target.structureType}] 运输 ${amount} [${resourceType}]`
				);
			} else {
				console.log(
					`发布任务失败 ${this.name} 加资源锁失败 [room ${this.source.room.name}] 从 [${this.source
						.structureType}] 向 [${this.target.structureType}] 运输 ${amount} [${resourceType}]`
				);
			}
		}
	}
	serialize() {
		let serializedData = super.serialize();
		serializedData.target = this.target.id;
		return serializedData;
	}
	deserialize(taskData) {
		super.deserialize(taskData);
		this.target = Game.getObjectById(taskData.target);
	}
	validate() {
		if (super.validate() && this.target && Game.getObjectById(this.target.id)) {
			return true;
		} else {
			return false;
		}
	}
	split(store) {
		if (Object.keys(store) == 0 || Object.keys(this.store) == 0 || this.locks.length == 0) {
			if (this.locks.length == 0) {
				console.log('没有锁');
			}
			return ERR_INVALID_ARGS;
		}
		let remainingStore = storeDiff(this.store, store);
		if (_.sum(Object.values(remainingStore)) <= 0) {
			console.log(
				`拆分任务失败 [room ${this.source.room.name}] [task ${this.name}] 尝试从 [${JSON.stringify(
					this.store
				)}] 拆分 [${JSON.stringify(store)}]`
			);
			return ERR_INVALID_ARGS;
		}
		this.mergeLocks();
		// copy data
		let newTaskName = getTaskName(this.type);
		let resourceType = Object.keys(store)[0];
		let newTask = new TransferTask(newTaskName, this.source, resourceType, store[resourceType], this.target);

		// add locks
		this.store = remainingStore;
		this.source.releaseLock(this.locks[0]);
		this.locks = [];
		this.addLock(remainingStore);

		this.callbacks.forEach((taskName) => {
			let task = global.tasks[taskName];
			if (task) {
				task.waitFor(newTask);
			}
		});

		// console.log(JSON.stringify(newTask.serialize()));
		// console.log(JSON.stringify(this.serialize()));
		saveTask(this);
		return newTask;
	}
}

class GatherPlan {
	constructor(source, store, target) {
		this.source = source;
		this.store = store;
		this.target = target;
	}
	validate() {
		if (
			this.source &&
			Game.getObjectById(this.source.id) &&
			this.target &&
			Game.getObjectById(this.target.id) &&
			_.sum(Object.values(this.store))
		) {
			return true;
		} else {
			return false;
		}
	}
}

// gather multibple resources from several sources
class GatherTask extends Task {
	constructor(name, source = null, store = null) {
		super(name, 'gather', source, store);
		this.totalStore = {};
	}
	/**
     * 
     * @param {GatherPlan} plan 
     */
	addPlan(plan) {
		if (!plan.validate()) {
			return ERR_INVALID_ARGS;
		}
		if (plan.target.id != this.source.id) {
			// the target of the plan doesn't match the source of this gather task
			return ERR_INVALID_TARGET;
		}
		let planStore = plan.store;
		let planSource = plan.source;
		let taskName = null;
		let transferTask = null;
		for (const [ resourceType, value ] of Object.entries(planStore)) {
			if (value > 0) {
				taskName = getTaskName('transfer');
				transferTask = new TransferTask(taskName, planSource, resourceType, value, this.source);
				this.waitFor(transferTask);
				this.totalStore[resourceType] = this.totalStore[resourceType]
					? this.totalStore[resourceType] + value
					: value;
			}
		}
		saveTask(this);
		return OK;
	}
	serialize() {
		let serializedData = super.serialize();
		serializedData.totalStore = this.totalStore;
		return serializedData;
	}
	deserialize(taskData) {
		super.deserialize(taskData);
		this.totalStore = taskData.totalStore;
	}
}

class SendTask extends Task {
	constructor(name, source = null, resourceType = null, amount = null, toRoom = null) {
		let store = {};
		if (resourceType && amount) {
			store[resourceType] = amount;
		}
		super(name, 'send', source, store);
		this.toRoom = toRoom;
		this.transactionCost = null;
		if (this.validate()) {
			this.transactionCost = Game.market.calcTransactionCost(amount, this.store.room.name, toRoom);
		}
	}
	serialize() {
		let serializedData = super.serialize();
		serializedData.toRoom = this.toRoom;
		serializedData.transactionCost = this.transactionCost;
		return serializedData;
	}
	deserialize(taskData) {
		super.deserialize(taskData);
		this.toRoom = taskData.toRoom;
		this.transactionCost = taskData.transactionCost;
	}
	validate() {
		if (super.validate() && this.toRoom && this.transactionCost) {
			return true;
		} else {
			return false;
		}
	}
}

// class ShareTask extends Task{
//     constructor(name,)
// }

function loadTasks() {
	// load tasks from memory
	if (!Memory.tasks) {
		Memory.tasks = {};
	}
	global.tasks = {};
	let taskNames = Object.keys(Memory.tasks);
	taskNames.forEach((taskName) => {
		try {
			let type = Memory.tasks[taskName].type;
			let task;
			switch (type) {
				case 'transfer':
					task = new TransferTask(taskName);
					break;
				case 'send':
					task = new SendTask(taskName);
					break;
				case 'gather':
					task = new GatherTask(taskName);
					break;
				default:
					task = new Task(taskName);
					break;
			}
			if (task && recoverTask(task) == OK && task.validate()) {
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

Room.prototype.createTransferTask = function(source, resourceType, amount, target) {
	if (
		!source ||
		!target ||
		!Game.getObjectById(source.id) ||
		!Game.getObjectById(target.id) ||
		!resourceType ||
		!amount
	) {
		return null;
	}
	let taskName = getTaskName('transfer');
	let task = new TransferTask(taskName, source, resourceType, amount, target);
	saveTask(task);
	return task;
};

Room.prototype.createGatherTask = function(source, store, target) {
	if (!source || !target || !Game.getObjectById(source.id) || !Game.getObjectById(target.id)) {
		return null;
	}
	let taskName = getTaskName('gather');
	let task = new GatherTask(taskName, target, {});
	let gatherPlan = new GatherPlan(source, store, target);
	task.addPlan(gatherPlan);
	saveTask(task);
	return task;
};

let taskCache = {
	lastUpdated : Game.time
};

Room.prototype.getTransferTasks = function(){

}

global.createTransferStore = function(source, store, target) {
	const transferStore = new TransferStore(source, store, target);
	if (transferStore.validate()) {
		return transferStore;
	} else {
		return null;
	}
};

function getTaskName(type = 'default') {
	let randomText = '';
	let taskName = type + '_' + randomText;
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	while (!randomText || !isUnique(taskName)) {
		randomText = '';
		for (let i = 0; i < 6; i++) {
			randomText += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		taskName = type + '_' + randomText;
	}
	return taskName;
}
/**
 * @param {string} taskName 
 */
function isUnique(taskName) {
	if (Memory.tasks[taskName]) {
		return false;
	} else {
		return true;
	}
}
/**
 * @param  {Task} task
 */
function saveTask(task) {
	if (!Memory.tasks) {
		Memory.tasks = {};
	}
	global.tasks[task.name] = task;
	Memory.tasks[task.name] = task.serialize();
	// console.log("saving "+JSON.stringify(task.serialize()));
}
/**
 * @param  {Task} task
 */
function recoverTask(task) {
	let taskData = Memory.tasks ? Memory.tasks[task.name] : null;
	if (taskData) {
		task.deserialize(taskData);
		return OK;
	} else {
		return ERR_NOT_FOUND;
	}
}
/**
 * 
 * @param {Task} task 
 */
function deleteTask(task) {
	task.callback();
	let taskName = task.name;
	if (global.tasks && global.tasks[taskName]) {
		delete global.tasks[taskName];
	}
	if (Memory.tasks && Memory.tasks[taskName]) {
		delete Memory.tasks[taskName];
	}
}
/**
 * clear outdate tasks and invalid tasks
 */
function clearInvalidTasks() {
	//console.log("Clearing invalid tasks");
	let taskNames = Object.keys(global.tasks);
	taskNames.forEach((taskName) => {
		let task = global.tasks[taskName];
		if (!task || !task instanceof Task) {
			delete global.tasks[taskName];
			if (Memory.tasks && Memory.tasks[taskName]) {
				delete Memory.tasks[taskName];
			}
		}
		if (task instanceof Task && !task.validate()) {
			deleteTask(task);
		}
	});
}

/**
 * 日常维护任务，要做的事
 * 1. 清理掉不合法的任务，这些任务直接callback
 * 2. 清理已完成的任务，可能要挂载触发器
 * 3. 进行中的任务，如果负责执行的creep没了，变成待执行状态
 * 4. 等待中的任务，检查是否还有子任务，如果有子任务则继续等待
 * 5. 没有子任务的[等待中]或[新]任务，如果可执行，则变为待执行状态
 * 6. 没有子任务的[等待中]或[新]任务，如果不可执行，则分别按顺序使用 direct solve, global solve来生成子任务。
 * 7. 没有找到解的任务，清理掉。
 * 8. 任何超时的任务，清理掉。
 */
function handleTasks() {
	clearInvalidTasks();
	let taskNames = Object.keys(global.tasks);
	taskNames.forEach((taskName) => {
		let task = global.tasks[taskName];

	});
}

/**
 * 返回空[]或者[GatherPlan]
 * @param {Structure} target 
 * @param {Store} store 
 */
function simpleSolve(target,store){
	return new GatherPlan(source,store,target);
}

/**
 * store1 - store2, negative values are allowed
 * @param {Store} store1 
 * @param {Store} store2 
 */
function storeDiff(store1, store2) {
	let resourceTypes = [ ...new Set(Object.keys(store1).concat(Object.keys(store2))) ];
	let result = {};
	resourceTypes.forEach((resourceType) => {
		let value1 = store1[resourceType] ? store1[resourceType] : 0;
		let value2 = store2[resourceType] ? store2[resourceType] : 0;
		let diff = value1 - value2;
		if (diff) {
			result[resourceType] = diff;
		}
	});
	return result;
}
/**
 * sum store[]
 * @param {Store[]} storeArr 
 */
function storeSum(storeArr) {
	let result = {};
	storeArr.forEach((store) => {
		result = storeDiff(result, storeDiff({}, store));
	});
	return result;
}

// load once global reset
loadTasks();
// register as an keep running event
let eventHandler = require('event');
eventHandler.register(clearInvalidTasks);
