const PHASES = {
	PREPARE: 'prepare',
	WITHDRAW: 'withdraw',
	TRANSFER: 'transfer',
	IDLE: 'idle'
};

module.exports = {
	/**
     * solve transfer tasks inside the room
     * transferOnce / withdrawOnce
     * @param {Creep} creep 
     */
	run: function(creep) {
		let groupID = creep.memory.groupID;
		if (!groupID) {
			console.log(creep.name + ' is not assigned with a groupID!');
			return;
		}
		let groupPlan = Memory.groups[groupID];
		if (!groupPlan) {
			console.log(creep.name + ' is not assigned with a valid group!');
			return;
		}
		// Assume the groupPlan is valid
		// Enroll to the group plan
		if (groupPlan.creeps.indexOf(creep.id) < 0 && creep.id) {
			groupPlan.creeps.push(creep.id);
		}

		let taskName = creep.memory.workingOn;
        let task = tasks[taskName];
        


		if (!task || !task.validate()) {
			// get a task to soleve
			task = getTransferTask(creep);
        }
        
		if (!task) {
			creep.memory.workingOn = null;
			creep.memory.phase = PHASES.IDLE;
			// clear stuff, and turn to idle state
		} else {

            let creepStore = creep.getStore();
            let usedCapacity = _.sum(Object.values(creepStore));
            let totalCapacity = creep.store.getCapacity();
            let unusedCapacity = totalCapacity - usedCapacity;

            if (totalCapacity < _.sum(Object.values(task.store))){
                console.log(`[warning] getTransferTask assigns an oversized task ${task.name} to ${creep.name}`);
            }

			const resourceType = Object.keys(task.store)[0];
			const amount = Math.min(totalCapacity,task.store[resourceType]);
			const currentState = creep.getState();
			let runResult, newState, config;

			// same task
			if (task.name == creep.memory.workingOn) {
				if (currentState) {
					runResult = creep.runState();
					if (runResult == currentState) {
						return;
					}
				}
			} else {
				creep.memory.workingOn = task.name;
				// register to the task
			}
			// transite state
			switch (creep.memory.phase) {
				case PHASES.TRANSFER:
					// transfer OK, task complete
					task.callback();
					// unregister the creep
                    creep.memory.phase = PHASES.IDLE;
                    creep.memory.workingOn = null;
					creep.transitionState('', {});
					break;
				case PHASES.WITHDRAW:
					newState = 'transferOnce';
					config = { target: task.target, resourceType: resourceType, amount: amount };
					creep.memory.phase = PHASES.TRANSFER;
					creep.transitionState(newState, config);
					break;
				case PHASES.PREPARE:
					newState = 'withdrawOnce';
					config = { source: task.source, resourceType: resourceType, amount: amount };
					creep.memory.phase = PHASES.WITHDRAW;
					creep.transitionState(newState, config);
					break;
				case PHASES.IDLE:
					if (unusedCapacity >= amount) {
						newState = 'withdrawOnce';
						config = { source: task.source, resourceType: resourceType, amount: amount };
						creep.memory.phase = PHASES.WITHDRAW;
						creep.transitionState(newState, config);
					}else{
                        let clearResourceType = Object.keys(creep.store)[0];
                        let clearAmount = creep.store[clearResourceType];
                        let solved = false;
                        if (creep.room.storage){
                            let storeFree = creep.room.storage.store.getCapacity() - _.sum(Object.values(creep.room.storage.getStore()));
                            if (storeFree >= clearAmount){
                                newState = 'transferOnce';
                                config = { target: creep.room.storage, resourceType: clearResourceType, amount: clearAmount };
                                creep.transitionState(newState, config);
                                solved = true;
                            }
                        }
                        if (!solved && creep.room.terminal){
                            let terminalFree = creep.room.terminal.store.getCapacity() - _.sum(Object.values(creep.room.terminal.getStore()));
                            if (terminalFree >= clearAmount){
                                newState = 'transferOnce';
                                config = { target: creep.room.terminal, resourceType: clearResourceType, amount: clearAmount };
                                creep.transitionState(newState, config);
                                solved = true;
                            }
                        }
                        if (!solved){
                            console.log(`[warning] ${creep.room.name} 爆仓了。`);
                            Game.notify(`[warning] ${creep.room.name} 爆仓了。`,30);
                            creep.drop(clearResourceType);
                        }
                    }
					break;
				default:
					break;
			}
		}
	}
};

/**
 * 
 * @param {Creep} creep 
 * @return {TransferTask} task
 */
function getTransferTask(creep) {
	/**
     * 匹配条件
     * 1. 就近原则
     * 2. 存活时间足够
     * 
     */
	return 1;
}
