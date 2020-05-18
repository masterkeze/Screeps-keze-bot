# Screeps-keze-bot
orginal bot for Screeps 

todo list
- [ ] 房间统计信息修改，只更新建筑ID相关,linksFrom\linksTo只处理新增的link，不重置其他信息
- [ ] 任务数据类型设计
- [ ] 任务完成、失败触发函数- 思考中
- [ ] Memory 结构重新设计
  - [ ] 中央任务池，中央任务
    - [ ] 资源锁 - 思考中
    - [ ] 中央任务发布 addCenterTask(roomName,...) 成功则返回OK，失败则返回标准错误码
    - [ ] （简化）填充容器 prepare(目标容器,资源,资源数,callback)
  - [ ] 工厂任务池，工厂任务
  - [ ] 终端任务池，终端任务
  - [ ] 孵化任务池，孵化任务
- [ ] 运行逻辑重构
  - [ ] 中央运输 runCenter(string roomName) // 从任务池找负责的creep
  - [ ] 工厂加工 runFactory(obj factory) // 一次5组，自己prepare，自己搬出产物，自己要求PC点等级
  - [ ] 终端处理 runTerminal(obj terminal)
  - [ ] 塔 runTower(arr[obj tower] towers) 
  - [ ] 链接 runLink(arr[obj link] linksFrom, arr[obj link] linksTo)
    - [ ] 中央链接不单独列出，应当放到linksFrom或者linksTo中


容错性：有多少送多少，不够也不要紧，下次再请求


高级工厂的特殊性：工厂激活至少1000tick，长期激活浪费ops，工厂如何处理原料不够的订单？
