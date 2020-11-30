/**
 * 单tick操作记录，记录多个对象操作同一个对象时的细节信息。
 * 目的：更精确的储量，伤害统计
 * 用途：
 * 1.填完ext之后再，可以立刻检查到ext容量为“满”，无需等1tick确认。
 * 2.塔球协同时，实现集火，或者更优的目标选择。
 */
interface MomentDetail {
    // 本tick中其他对象向这个对象送入的资源
    transfer ?: Object
    // 本tick中其他对象从这个对象取走的资源
    withdraw ?: Object
    // 本tick的资源变化合计
    resourcesChange ?: Object
    // 本tick中其他对象向这个对象造成的总伤害量
    attack ?: number
    // 本tick中其他对象向这个对象提供的总治疗量
    heal ?: number
    // 本tick中这个对象的hits变化合计
    hitsChange ?: number
}
interface Moment {
    now : number
    data ?: {
        [structureID: string] : MomentDetail
    }
}

declare module NodeJS {
    // 全局对象
    interface Global {
        // 是否已经挂载拓展
        hasExtension: boolean
        moment ?: Moment
    }
}