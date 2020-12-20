import { Helper } from "helper";

const groupDefaultPriority: {
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
        init(name: string, data: GroupInitData): OK | ERR_NAME_EXISTS | ERR_NOT_FOUND {
            if (Memory.group[name]) {
                // error log: tring to initialize a group that already exists
                return ERR_NAME_EXISTS;
            }
            let roomObj = Game.rooms[data.room];
            let sourceId = data.sourceID;
            let source = Game.getObjectById(sourceId) as Source;
            if (!source) {
                return ERR_NOT_FOUND;
            }
            let groupData: GroupData = {
                name: name,
                type: "primitive",
                room: data.room,
                roleConfig: {
                    primitive: {
                        roleLimit: 3,
                        roleBody: Helper.getBodyArray("1w1c2m"),
                    }
                },
                creeps: []
            }
            setGroupData(name,groupData);
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


function setGroupData(name: string, data: GroupData): void {
    Memory.group[name] = data;
}

function getGroupData(name: string): GroupData {
    if (Memory.group[name]) { return Memory.group[name] };
}