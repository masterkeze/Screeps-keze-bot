import { Helper } from 'utils';

export namespace Group {
    export function init(room: string,type: GroupConstant): void {
        if (!Memory.group) {
            Memory.group = {}
        }

    }
}