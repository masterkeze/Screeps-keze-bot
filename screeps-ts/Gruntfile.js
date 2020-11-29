module.exports = function(grunt) {
    // 从 npm 载入任务
    grunt.loadNpmTasks("grunt-ts")
    // 配置任务
    grunt.initConfig({
        // typescripts 编译任务
        'ts': {
            default : {
                options: {
                    sourceMap: false,
                    // 编译到的目标版本
                    target: 'es5',
                    rootDir: "src/"
                },
                // 要进行编译的目录及文件
                src: ["src/*.ts"],
                // 编译好的文件的输出目录
                outDir: 'dist/'
            }
        }
    })
    // 将 ts 编译任务注册到默认执行命令
    grunt.registerTask('default',  [ 'ts' ])
}