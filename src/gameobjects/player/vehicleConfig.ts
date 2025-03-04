import { DriveSystem } from "../vehicles/raycastVehicle/raycastVehicleObject";

export interface VehicleConfig {
    // wheel
    frictionSlip: number;
    rollInfluence: number;
    customSlidingRotationalSpeed: number;
    maxSteerVal: number;
    
    maxForce: number;
    maxEngineForce: number;
    topSpeedForHigherTorque: number;
    driveSystem: DriveSystem;
}