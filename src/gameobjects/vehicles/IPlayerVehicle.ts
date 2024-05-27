import { ChassisObject } from "./chassisObject";
import * as CANNON from 'cannon-es'

export interface IPlayerVehicle {
    getChassis(): ChassisObject;
    getModel(): THREE.Group;
    getCannonVehicleChassisBody(): CANNON.Body | undefined; 

    tryTurn(x: number): void;
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

    resetPosition(): void;

    update(): void;
}