class Vector3_DATA {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    constructor(x?: number, y?: number, z?: number) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
}

class BOXCOLLIDER_DATA {
    pos: Vector3_DATA;
    eul: Vector3_DATA;
    size: Vector3_DATA;
    center: Vector3_DATA;
    constructor(
        pos: Vector3_DATA, eul: Vector3_DATA,
        size: Vector3_DATA, center: Vector3_DATA) {
        this.pos = pos;
        this.eul = eul;
        this.size = size;
        this.center = center;
    }
}

class RIGIDBODY_DATA {
    group: number;
    mask: number;
    type: number;
    constructor(group: number, mask: number, type: number) {
        this.group = group;
        this.mask = mask;
        this.type = type;
    }
}


export { Vector3_DATA, BOXCOLLIDER_DATA, RIGIDBODY_DATA }