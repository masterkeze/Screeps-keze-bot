/**
 * 资源包 {resourceType : value}
 */
interface store {
    [resourceType: string]: number
}

// 所有记录的动作
type ActionConstant = "harvest" | "attack" | "build" | "repair" | "dismantle" | "attackController" | "rangedHeal" | "heal" | "rangedAttack" | "rangedMassAttack" | "move" | "moveTo" | "moveByPath" | "other"

/**
 * 记录单tick操作汇总，记录多个对象操作同一个对象时的细节信息。
 * 目的：更精确的储量，伤害统计
 * 用途：
 * 1.填完ext之后再，可以立刻检查到ext容量为“满”，无需等1tick确认。
 * 2.塔球协同时，实现集火，或者更优的目标选择。
 */
interface Moment {
    // 本tick中其他对象向这个对象送入的资源
    in?: store
    // 本tick中其他对象从这个对象取走的资源
    out?: store
    // 本tick的资源变化合计
    resourcesChange?: store
    // 本tick中其他对象向这个对象造成的总伤害量
    damaged?: number
    // 本tick中其他对象向这个对象提供的总治疗量
    healed?: number
    // 本tick中这个对象的hits变化合计
    hitsChange?: number
    // 动作记录
    actions?: Array<ActionConstant>
}

/**
 * 存储Moment的对象，用于挂载于global
 */
interface MomentCollection {
    now: number
    data?: {
        [objectID: string]: Moment
    }
}

/**
 * 记录该建筑上被加的锁
 */
interface LockDetail {
    [lockName: string]: store
}

/**
 * 记录该建筑上被加的锁
 */
interface Lock {
    total: store
    detail: LockDetail
}

/**
 * 存储Lock对象，用于挂载于memory
 */
interface LockCollection {
    [structureID: string]: Lock
}

/**
 * 序列化的基础任务数据结构
 */
interface TaskData {
    name: string
    type: string
    source: string
    store: StoreDefinition
    created: number
    subTasks: string[]
    callbacks: string[]
    locks: string[]
}

/**
 * 点对点运输任务数据结构
 */
interface TransferTaskData extends TaskData {
    target: string
}

/**
 * 多资源运输任务数据结构
 */
interface GatherTaskData extends TaskData {
    totalStore: store
}

/**
 * 发送任务数据结构
 */
interface SendTaskData extends TaskData {
    toRoom: string
    transactionCost: number
}

/**
 * Creep Memory结构
 */
interface CreepMemory {
    role: string
    groupID?: string
    registered?: number
    state?: CreepState
}

type BaseStateConstant = 'reach' //| 'upgrade' | 'withdrawOnce'
type StateConstant = BaseStateConstant
type StateExport = {
    [state in StateConstant]: (creep:Creep|PowerCreep) => IStateConfig
}

/**
 * 状态机返回的结果 0 : 结束该状态 1 : 继续该状态
 */
type StateContinue = 0 | 1

/**
 * Action Wrapper 封装一下状态机action
 */
type StateActionWrapper = {
    [actionName in ActionConstant] ?: (creep: Creep|PowerCreep) => StateContinue
}

/**
 * State Machine 需要提供的方法 onEnter 进入状态好时调用， 
 */
interface IStateConfig {
    onEnter(creep: Creep|PowerCreep, data: StateData): StateContinue
    actions: StateActionWrapper
    onExit(creep: Creep|PowerCreep): void
}

/**
 * Creep 状态信息 序列化后的信息，挂载于Memory
 */
interface CreepState {
    currentState: string
    data: {
        [stateName: string]: StateMemoryData
    }
}

/**
 * Creep 状态机序列化信息的基类
 */
interface StateMemoryData {
    targetID?: string
    sourceID?: string
}

/**
 * Creep 状态机初始化信息的基类
 */
interface StateData { }

/**
 * Creep 状态机 提取一次 source : Structure | Tombstone | Ruin
 */
interface StateData_withdrawOnce {
    source: Structure | Tombstone | Ruin
}

/**
 * Creep 状态机 升级 target : StructureController
 */
interface StateData_upgrade {
    target: StructureController
}

/**
 * Creep 状态机 抵达 target : RoomPosition | {pos:RoomPosition}
 */
interface StateData_reach {
    target: RoomPosition | { pos: RoomPosition }
}

declare module NodeJS {
    // 全局对象
    interface Global {
        // 是否已经挂载拓展
        hasExtension?: boolean
        moment?: MomentCollection
    }
}


// 内存对象
interface Memory {
    lock?: LockCollection
}

/**
 * Creep 拓展
 */
interface Creep {
    work(): void
    runState(): string
    getStateData(stateName: string): StateMemoryData
    getMomentStore(resourceType: string): store | number
    // rewrite actions
    _attack(target: AnyCreep | Structure): CreepActionReturnCode
    _attackController(target: StructureController): CreepActionReturnCode
    _build(target: ConstructionSite): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH
    _dismantle(target: Structure): CreepActionReturnCode
    _drop(resourceType: ResourceConstant, amount?: number): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_ENOUGH_RESOURCES
    _harvest(target: Source | Mineral | Deposit): CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES
    _heal(target: AnyCreep): CreepActionReturnCode
    _move(target: DirectionConstant | Creep): CreepMoveReturnCode | OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS
    _moveTo(
        target: RoomPosition | { pos: RoomPosition },
        opts?: MoveToOpts,
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND
    _moveByPath(path: PathStep[] | RoomPosition[] | string): CreepMoveReturnCode | ERR_NOT_FOUND | ERR_INVALID_ARGS
    _pickup(target: Resource): CreepActionReturnCode | ERR_FULL
    _pull(target: Creep): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE | ERR_NO_BODYPART
    _rangedAttack(target: AnyCreep | Structure): CreepActionReturnCode
    _rangedHeal(target: AnyCreep): CreepActionReturnCode
    _rangedMassAttack(): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NO_BODYPART
    _repair(target: Structure): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES
    _transfer(target: AnyCreep | Structure, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode
    _upgradeController(target: StructureController): ScreepsReturnCode
    _withdraw(target: Structure | Tombstone | Ruin, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode
}
