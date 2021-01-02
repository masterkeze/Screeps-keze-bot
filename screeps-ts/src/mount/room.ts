import { assignPrototype } from "utils";
import {} from "./structures";
// spawn 原型拓展
class RoomExtension extends Room {
    public work(): void {
        let spawns = this.spawn;
        spawns.forEach((spawn)=>{
            spawn.work();
        })
    }
    public destroyWalls(): void{
        let walls = this[STRUCTURE_WALL];
        if (walls){
            walls.forEach(wall => {
                wall.destroy();
            });
        }
    }
    public getSpawnQueue(): SpawnConfig[] {
        let a: SpawnConfig[];
        return a;
    }
    public getTerrainCache(): TerrainCahce {
        let a: TerrainCahce;
        return a;
    }
}

export default () => {
    assignPrototype(Room, RoomExtension);
}