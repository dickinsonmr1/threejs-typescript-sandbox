import { DriveSystem } from "../vehicles/raycastVehicle/raycastVehicleObject";

export interface VehicleConfig {
    // wheel
    frictionSlip: number;
    rollInfluence: number;
    customSlidingRotationalSpeed: number;
    
    maxSteerVal: number;
    
    lowSpeedForce: number; // max torque at low speed for faster acceleration
    highSpeedForce: number; // reduced torque at higher speed
    topSpeedForHigherTorque: number; // speed at which torque reduction starts
    driveSystem: DriveSystem;
}