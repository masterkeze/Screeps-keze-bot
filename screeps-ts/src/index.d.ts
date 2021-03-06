// ============================================================================================
// 全局通用
/**
 * 资源包 {resourceType : value}
 */
type store = {
    [resourceType in ResourceConstant]?: number
}

/**
 * 有pos属性
 */
interface IHasPos {
    pos: RoomPosition
}

/**
 * 有store属性
 */
interface IHasStore {
    store: StoreDefinitionUnlimited
}

interface Pos {
    x: number
    y: number
    roomName: string
}

interface Coor {
    x: number
    y: number
}
// ============================================================================================
// 游戏内对象扩展

// 内存
interface Memory {
    lock?: LockCollection
    group?: GroupCollection
    spawnTasks?: AsyncTasksMemory
}

// Global
declare module NodeJS {
    // 全局对象
    interface Global {
        // 是否已经挂载拓展
        hasExtension?: boolean
        moment?: MomentCollection
        spawnTask?: AsyncTaskAction
        test?: Object
    }
}

/**
 * Room Memory结构
 */
interface RoomMemory {

}

interface Room {
    work(): void
    getSpawnQueue(): SpawnConfig[]
    getTerrainCache(): TerrainCahce
    spawn: StructureSpawn[]
    container: StructureContainer[]
    tower: StructureTower[]
    link: StructureLink[]
    extension: StructureExtension[]
    road: StructureRoad[]
    wall: StructureWall[]
    rampart: StructureRampart[]
    portal: StructurePortal[]
    lab: StructureLab[]
    deposit: Deposit[]
    source: Source[]
    powerBank: StructurePowerBank[]
    extractor: StructureExtractor
    observer: StructureObserver
    nuker: StructureNuker
    powerSpawn: StructurePowerSpawn
    factory: StructureFactory
    invaderCore: StructureInvaderCore
    mineral: Mineral
    my: boolean
    level: number
}

interface TerrainCahce {
    sourcePos?: Coor[]
    controllerPos?: Coor[]
    mineralPos?: Coor[]
    depositPos?: Coor[]
    powerBankPos?: Coor[]
    portalPos?: Coor[]
}

/**
 * Creep Memory结构
 */
interface CreepMemory {
    role: string
    groupID: string
    registered?: number
    state?: CreepState
}

interface StructureSpawn {
    work(): void
}

/**
 * Creep 拓展
 */
interface Creep {
    work(): void
    runState(): string
    getStateData(stateName: StateConstant): StateMemoryData
    getCurrentStateData(): StateMemoryData
    getCurrentState(): StateConstant
    getMomentStore(resourceType?: ResourceConstant): store | number
    getMomentStoreToWithdraw(resourceType: string): store | number
    getMomentStoreToTransfer(resourceType: string): number
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

interface PowerCreep {
    work(): void
    runState(): string
    getStateData(stateName: StateConstant): StateMemoryData
    getCurrentState(): StateConstant
    getCurrentStateData(): StateMemoryData
    getMomentStore(resourceType: string): store | number
    getMomentStoreToWithdraw(resourceType: string): store | number
    getMomentStoreToTransfer(resourceType: string): number
}
/**
 * Moment 相关方法
 * @returns number
 */
interface Source {
    getMomentStore(): number
}

/**
 * Moment 相关方法
 * @returns number
 */
interface Mineral {
    getMomentStore(): number
}

/**
 * Moment 相关方法
 * @returns number
 */
interface Structure {
    getMomentStore(resourceType?: string): store | number
    getMomentStoreToWithdraw(resourceType: string): store | number
    getMomentStoreToTransfer(resourceType: string): number
}

// ============================================================================================
// Creep 状态机

// 所有记录的动作
type ActionConstant = WorkActionConstant | CarryActionConstant | MoveActionConstant | AttackActionConstant | RangedAttackActionConstant | HealActionConstant | ClaimActionConstant

// work相关动作
type WorkActionConstant = "build" | "dismantle" | "harvest" | "repair" | "upgradeController"

// carry相关动作
type CarryActionConstant = "drop" | "pickup" | "transfer" | "withdraw"

// move相关动作
type MoveActionConstant = "move" | "moveTo" | "moveByPath"

// attack相关动作
type AttackActionConstant = "attack"

// rangedAttack相关动作
type RangedAttackActionConstant = "rangedAttack" | "rangedMassAttack"

// heal相关动作
type HealActionConstant = "heal" | "rangedHeal"

// claim相关动作
type ClaimActionConstant = "claimController" | "attackController" | "reserveController"

type BaseStateConstant = 'reach' | 'upgradeUntilEmpty' | 'harvestUntilFull' | 'transferOnce' | 'withdrawOnce' | 'buildUntilEmpty' | 'withdrawMulti' | 'harvestJustOnTime' //| 'transferMulti' 
type TaskStateConstant = 'centerTransfer'
type IdleState = "idle"
type StateConstant = BaseStateConstant | IdleState
type StateExport = {
    [state in StateConstant]?: () => IStateConfig
}

/**
 * 状态机返回的结果 0 : 结束该状态 1 : 继续该状态 2 : 执行后结束 3 : 执行后继续
 */
declare enum StateContinue {
    Exit = 0,
    Continue = 1,
}

/**
 * Action Wrapper 封装一下状态机action
 */
type StateActionWrapper = {
    [actionName in ActionConstant]?: (creep: Creep | PowerCreep) => StateContinue
}

/**
 * State Machine 需要提供的方法 onEnter 进入状态好时调用， 
 */
interface IStateConfig {
    onEnter(creep: Creep | PowerCreep, data: StateData): void
    actions: StateActionWrapper
    onExit(creep: Creep | PowerCreep): void
}

/**
 * Creep 状态信息 序列化后的信息，挂载于Memory
 */
interface CreepState {
    currentState: StateConstant
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
    containerID?: string
    targetPos?: Pos
    sourcePos?: Pos
    range?: number
    controllerID?: string
    resourceType?: ResourceConstant
    amount?: number
    reached?: 0 | 1
    store: store
}

/**
 * Creep 状态机初始化信息的基类
 */
interface StateData {
    targetPos: RoomPosition | { pos: RoomPosition }
    range?: number
}

/**
 * Creep 状态机初始化信息，需包含一种资源
 */
interface StateDataOneResource extends StateData {
    resourceType: ResourceConstant,
    amount: number
}
/**
 * Creep 状态机初始化信息，需包含一个资源包
 */
interface StateDataMultiResources extends StateData {
    store: store
}

// ============================================================================================
// Moment + Lock
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

// ============================================================================================
// 职责相关

type BaseRoleConstant = "primitive" //| "harvester" | "builder" | "hauler" | "distributer"

// 爆破手(拆迁) 治疗者 执行官(近战) 潜行者(一体机) 重炮手
type WarRoleConstant = "blaster" | "healer" | "executer" | "stalker" | "gunner"

type RoleConstant = BaseRoleConstant | WarRoleConstant

interface IRoleConfig {
    emit(creep: Creep): {
        newState: StateConstant
        data: StateData
    }
}

// ============================================================================================
// 组相关

type GroupConstant = "primitive" //| "build" | "harvest"

interface GroupCollection {
    [name: string]: GroupData
}

interface GroupData {
    name: string
    room: string
    type: GroupConstant
    roleConfig: GroupRoleConfig
    creeps: string[]
}

type GroupRoleConfig = {
    [roleName in RoleConstant]?: GroupRoleData
}

interface GroupInitData {
    room: string
    sourceID?: string
    sourcePos?: Pos
}

interface GroupRoleData {
    roleLimit: number
    roleBody: BodyPartConstant[]
}

interface IGroupConfig {
    init(name: string, data: GroupInitData): void
    update(): void
}

// ============================================================================================
// Spawn 异步任务

interface SpawnConfig {
    body: BodyPartConstant[]
    name: string
    memory: CreepMemory
}

interface SpawnAsyncTask extends AsyncTaskBase {
    config:SpawnConfig
}

interface SpawnAsyncTaskMemory extends AsyncTaskMemoryBase {
    config:SpawnConfig
}

/**
 * 每个房间维护一个队列
 */
interface AsyncTasksMemory {
    [roomName: string]: AsyncTaskMemoryBase[]
}

/**
 * 最终存在memory里的AsyncTask信息基类
 */
interface AsyncTaskMemoryBase {
    id: string
    priority: number
    ticksToExpired?: number
}

/**
 * 初始化AsyncTask的基类
 */
interface AsyncTaskBase {
    id: string
}

/**
 * AsyncTask交互接口
 */
interface AsyncTaskAction {
    /**
     * 外部方法
     * 添加事件,指定id,房间及事件
     * @returns OK|ERR_NAME_EXISTS
     */
    push(id: string, roomName: string, asyncTask: AsyncTaskBase): OK | ERR_NAME_EXISTS

    /**
     * 外部方法
     * 查看优先级最高的事件
     * @param  {string} roomName
     * @returns AsyncTaskBase
     */
    peek(roomName: string): AsyncTaskMemoryBase

    /**
     * 外部方法
     * 取出优先级最高的事件
     * @param  {string} roomName
     * @returns AsyncTaskBase
     */
    pop(roomName: string): AsyncTaskMemoryBase

    /**
     * 内部方法
     * 从memory加载回实例
     */
    load(): void

    /**
     * 内部方法
     * 从实例存回memory
     */
    save(): void

    /**
     * 内部方法
     * 清理过期任务
     */
    clean(): void

    /**
     * 内部方法
     * 分析出事件的优先级
     * @param  {AsyncTaskBase} asyncTask
     * @returns number
     */
    getPriority(asyncTask: AsyncTaskBase): number

    /**
     * 内部方法
     * 分析出事件的过期时间
     * @param  {AsyncTaskBase} asyncTask
     * @returns number
     */
    getTicksToExpired(asyncTask: AsyncTaskBase): number

}