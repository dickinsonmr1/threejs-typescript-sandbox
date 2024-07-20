import { ChassisObject } from "./chassisObject";
import * as CANNON from 'cannon-es'

export interface IPlayerVehicle {
    getChassis(): ChassisObject;
    getModel(): THREE.Group;
    getWheelModels(): THREE.Group[];
    
    getCannonVehicleChassisBody(): CANNON.Body | undefined; 

    tryTurn(x: number): void;
    tryTightTurn(x: number): void;
    tryAccelerate(): void;
    tryStopAccelerate(): void;
    tryReverse(): void;
    tryStopReverse(): void;
    tryTurnLeft(): void;
    tryStopTurnLeft(): void;
    tryTurnRight(): void;
    tryStopTurnRight(): void;

    tryJump(): void;
    tryTurbo(): void;

    resetPosition(position: THREE.Vector3): void;
    respawnPosition(x: number, y: number, z: number): void;

    update(): void;
}