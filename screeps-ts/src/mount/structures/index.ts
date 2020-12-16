import { assignPrototype } from "utils"
import SpawnExtension from "./spawn"

/**
 * 挂载 creep 拓展
 */
export default () => {
    assignPrototype(StructureSpawn, SpawnExtension);
}