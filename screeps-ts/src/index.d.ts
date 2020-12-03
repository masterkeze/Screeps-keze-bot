/**
 * 资源包 {resourceType : value}
 */
interface store {
    [resourceType: string]: number
}

/**
 * 记录单tick操作汇总，记录多个对象操作同一个对象时的细节信息。
 * 目的：更精确的储量，伤害统计
 * 用途：
 * 1.填完ext之后再，可以立刻检查到ext容量为“满”，无需等1tick确认。
 * 2.塔球协同时，实现集火，或者更优的目标选择。
 */
interface Moment {
    // 本tick中其他对象向这个对象送入的资源
    transfer?: Object
    // 本tick中其他对象从这个对象取走的资源
    withdraw?: Object
    // 本tick的资源变化合计
    resourcesChange?: Object
    // 本tick中其他对象向这个对象造成的总伤害量
    attack?: number
    // 本tick中其他对象向这个对象提供的总治疗量
    heal?: number
    // 本tick中这个对象的hits变化合计
    hitsChange?: number
}

/**
 * 存储Moment的对象，用于挂载于global
 */
interface MomentCollection {
    now: number
    data?: {
        [structureID: string]: Moment
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
    store: store
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
    totalStore : store
}

/**
 * 发送任务数据结构
 */
interface SendTaskData extends TaskData {
    toRoom : string
    transactionCost : number
}

/**
 * Creep Memory结构
 */
interface CreepMemory {
    role : string
    groupID ?: string
}

/**
 * Creep 状态信息
 */
interface CreepState {
    currentState : string
    data : {
        [stateName: string] : StateData
    }
}

/**
 * Creep 状态机具体信息基类, 每个状态都至少有一个目标物
 */
interface StateData {
    targetID : string
}

/**
 * Creep 状态机 withdrawOnce数据类型
 */
interface StateData_withdrawOnce extends StateData {
    resourceType : string
    amount : number
}

/**
 * Creep 状态机 transferOnce数据类型
 */
interface StateData_transferOnce extends StateData {
    resourceType : string
    amount : number
}


/**
 * Creep 状态机 reach数据类型
 */
interface StateData_reach extends StateData {
    range : number
}

/**
 * Creep 状态机 buildConstruction数据类型
 */
interface StateData_buildConstruction extends StateData {
    range : number
}

declare module NodeJS {
    // 全局对象
    interface Global {
        // 是否已经挂载拓展
        hasExtension?: boolean
        moment?: Moment
    }
}