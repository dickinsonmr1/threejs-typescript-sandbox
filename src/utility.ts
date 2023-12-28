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

    
    static ThreeVec3ToCannonVec3(position: THREE.Vector3): CANNON.Vec3 {
        return new CANNON.Vec3(position.x, position.y, position.z);
    }
}