// screeps 代码入口
module.exports.loop = function (): void {
    console.log(sayHello('world!'))
    let a = Game.creeps["a"];
    a.moveTo(new RoomPosition(1,1,""))
}

// 定义一个 ts 风格的方法
function sayHello(str: string): string {
    return 'hello' + str
}

function testCreep(moment: Moment): string {

    return "";
}