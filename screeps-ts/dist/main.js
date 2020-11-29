module.exports.loop = function () {
    console.log(sayHello('world!'));
};
function sayHello(str) {
    return 'hello' + str;
}
