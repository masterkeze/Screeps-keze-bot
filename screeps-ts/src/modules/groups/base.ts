const groupDefaultPriority : {
    [group in GroupConstant]: number 
} = {
    primitive: 1,
    // harvest: 2,
    // build: 3
}

/**
 * 基础组信息
 */
const groups: {
    [group in GroupConstant]: () => IGroupConfig
} = {
    primitive: (): IGroupConfig => ({
        init(name:string,data:GroupInitData): void {
            if (Memory.group[name]){
                
            }
        },
        update(): void {

        }
    }),

    // harvest: (): IGroupConfig => ({
    //     init(): void {

    //     },
    //     update(): void {

    //     }
    // }),

    // build: (): IGroupConfig => ({
    //     init(): void {

    //     },
    //     update(): void {

    //     }
    // })
}

export default groups;