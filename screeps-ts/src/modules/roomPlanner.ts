const plan = [    
    "e5 e5 e5 e4 e4 r4 e4 e4 e3 e3 e3",
    "e5 r5 r5 e5 r5 e4 r4 e4 e3 r3 e3",
    "e5 e5 e5 r5 s7 n8 t5 r4 e2 r3 e2",
    "e6 e5 r5 e5 r5 e4 t7 t3 r2 e2 e2",
    "e6 r6 e6 L5 T6 r4 e4 r4 s1 r2 e2",
    "r6 e6 e6 p8 r6 S4 r4 e4 l6 l6 r2",
    "e6 r6 e6 r6 f7 r5 e4 l8 l6 r6 l7",
    "e7 e7 r6 e6 e6 e6 r6 l8 r6 l7 l7",
    "e7 r6 e7 r6 t8 t8 s8 r6 l8 l8 e8",
    "e7 r6 e7 e7 r6 t8 r6 e8 r6 r6 e8",
    "e7 e7 e7 e8 e8 r6 e8 e8 e8 e8 e8"
]

const mapping = {
    e : STRUCTURE_EXTENSION,
    r : STRUCTURE_ROAD,
    n : STRUCTURE_NUKER,
    s : STRUCTURE_SPAWN,
    t : STRUCTURE_TOWER,
    T : STRUCTURE_TERMINAL,
    S : STRUCTURE_STORAGE,
    L : STRUCTURE_LINK,
    l : STRUCTURE_LAB,
    p : STRUCTURE_POWER_SPAWN,
    f : STRUCTURE_FACTORY
}

function getBasePos(room:Room,targeLength:number):Coor[]{
    let output:Coor[] = [];
    
    return output;
}