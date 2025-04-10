import { VehicleConfig } from "./config/vehicleConfig";
import { ChassisObject } from "./chassisObject";
import * as CANNON from 'cannon-es'

export interface IPlayerVehicle {
    getChassis(): ChassisObject;
    getModel(): THREE.Group;
    getWheelModels(): THREE.Group[];
    
    getCannonVehicleChassisBody(): CANNON.Body | undefined; 

    getRaycastVehicle(): CANNON.RaycastVehicle;

    vehicleOverrideConfig: VehicleConfig;

    getCurrentSpeed(): number;
    getForwardVelocity(): number;

    tryTurn(x: number): void;
    tryTightTurn(x: number): void;
    tryAccelerate(): void;
    tryAccelerateWithJoystick(y: number): void;
    tryStopAccelerate(): void;
    tryBrake(): void;
    tryReverse(): void;
    tryReverseWithJoystick(y: number): void;
    tryStopReverse(): void;
    tryTurnLeft(): void;
    tryStopTurnLeft(): void;
    tryTurnRight(): void;
    tryStopTurnRight(): void;

    applyImpulseWhileWheelsAreDisabled(impulse: CANNON.Vec3): void;

    tryJump(): void;
    tryTurbo(): void;

    resetPosition(position: THREE.Vector3): void;
    respawnPosition(x: number, y: number, z: number): void;

    update(): void;

    setAcceptInput(isActive: boolean): void;
}