import * as THREE from "three";
import * as CANNON from 'cannon-es'

export class Utility {
    constructor() {

    }

    static CannonVec3ToThreeVec3(position: CANNON.Vec3): THREE.Vector3 {
        return new THREE.Vector3(position.x, position.y, position.z);
    }

    static CannonQuaternionToThreeQuaternion(quaternion: CANNON.Quaternion): THREE.Quaternion {
        return new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }
}