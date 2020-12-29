/**
 * 最终存在memory里的event信息基类
 */
interface EventMemoryBase {
    id:string
    priority:number
    ticksToExpired?:number
}

/**
 * 初始化event的基类
 */
interface EventBase {
    id:string
}


/**
 * event交互接口
 */
interface EventInterface {
    
    /**
     * 外部方法
     * 添加事件,指定id,房间及事件
     * @returns OK|ERR_NAME_EXISTS
     */
    push(id:string,roomName:string,event:EventBase):OK|ERR_NAME_EXISTS

    /**
     * 外部方法
     * 查看优先级最高的事件
     * @param  {string} roomName
     * @returns EventBase
     */
    peek(roomName:string):EventBase

    /**
     * 外部方法
     * 取出优先级最高的事件
     * @param  {string} roomName
     * @returns EventBase
     */
    pop(roomName:string):EventBase

    /**
     * 内部方法
     * 从memory加载回实例
     */
    load():void

    /**
     * 内部方法
     * 从实例存回memory
     */
    save():void
    
    /**
     * 内部方法
     * 分析出事件的优先级
     * @param  {EventBase} event
     * @returns number
     */
    getPriority(event:EventBase):number

    /**
     * 内部方法
     * 分析出事件的过期时间
     * @param  {EventBase} event
     * @returns number
     */
    getTicksToExpired(event:EventBase):number
    
    /**
     * 内部方法
     * 串行化成可以存储的信息
     * @param  {EventBase} event
     * @returns EventMemoryBase
     */
    serialize(event:EventBase):EventMemoryBase
    
    /**
     * 内部方法
     * 实例化成外部可用的对象
     * @param  {EventMemoryBase} eventMemory
     * @returns EventBase
     */
    deserialize(eventMemory:EventMemoryBase):EventBase
}