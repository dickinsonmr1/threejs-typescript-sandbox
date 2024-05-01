import { Quaternion } from "cannon-es";
import { Vector3 } from "three";

export interface IPlayerVehicle {
    // TODO: implement    
    getChassisPosition(): Vector3;
    getChassisQuaternion(): Quaternion;
    getModelQuaternion(): Quaternion;
    getModelMesh(): THREE.Mesh;
    getModel(): THREE.Group;
    
    tryAccelerate(): void;
    tryStopAccelerate(): void;
    tryReverse(): void;
    tryStopReverse(): void;
    tryTurnLeft(): void;
    tryStopTurnLeft(): void;
    tryTurnRight(): void;
    tryStopTurnRight(): void;

    update(): void;
}