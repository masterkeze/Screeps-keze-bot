/**
 * 基础组信息
 */
const groups: {
    [group in GroupConstant]: () => IGroupConfig
} = {
    primitive: (): IGroupConfig => ({
        init(groupData: GroupData): void {

        },
        update(): void {

        }
    }),

    harvest: (): IGroupConfig => ({
        init(): void {

        },
        update(): void {

        }
    }),

    build: (): IGroupConfig => ({
        init(): void {

        },
        update(): void {

        }
    })
}

export default groups;