var order = {
    name: "W26S23_regular_zbar",
    room: roomName,
    product: RESOURCE_ZYNTHIUM_BAR,
    amount: 10000, // # of products
};
var task = {
    name: taskName,
    room: roomName,
    resource : RESOURCE_TYPE,
    amount : amount,
    FromID : FromID,
    ToID : ToID,
    onSuspended : "delete",
    onFinished : "delete",
    suspended : true,
    finished : true
};
var request = {
    room: roomName,

}
/**
 * 需要一个主程序来控制所有房间的订单，及运输任务
 * 1. 需要同时处理多种资源
 * 2. 事件之间要形成链条
 * 3. 因为中央模块的特性，传输任务必须按顺序提交（往factory填东西）
 * 4. 是否需要reservation，为容器保留一定的容量
 * 5. prototype.Room.js 是否加入room.request(resourceType,amount)
 * 6. request holder
Fixtures	2	W29S22
Oxidant	0	W29S22,W26S19
Alloy	0	W29S22,W26S19
Composite	1	W26S23
Tube	1	W26S23
Utrium bar	0	
Zynthium bar	0	W26S23
Metal	0	W29S22,W26S19
Oxygen	0	W29S22,W26S19
Battery	0	ALL
Energy	0	ALL
Hydrogen	0	W28S22
Reductant	0	W28S22

 */