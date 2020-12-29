/**
 * Market 模块的职责
 * 1. 出售/购买物品时,挂单+调整价格
 * 2. 找到生产附加值最高的商品
 * 3. 套利：低买高卖
 */
export namespace Market {
    
}


/**
 * 套利模块
 * 设定资源类型，确定这些资源不会被使用。需要有向终端自动填充能量的功能
 * 套利的来源在于买单和卖单的价差，power交易特别明显
 * 需要考虑交易成本 挂单5%，deal的路费。
 * 调价调低会亏损手续费。
 * 单据操作的限制，1tick能否挂多张单。一张单1tick可以操作几次。
 * 1tick 可以挂N个单。
 */

// Game.market.createOrder({
//     type: ORDER_BUY,
//     resourceType: RESOURCE_POWER,
//     price: 13,
//     totalAmount: 10,
//     roomName: "W28S22"   
// });

// Game.market.createOrder({
//     type: ORDER_BUY,
//     resourceType: RESOURCE_POWER,
//     price: 13,
//     totalAmount: 10,
//     roomName: "W29S22"   
// });

// Game.market.changeOrderPrice("5fe5c9dad15af740e8f3c6a2",13.001);
// Game.market.extendOrder("5fe5c9dad15af740e8f3c6a2",1);