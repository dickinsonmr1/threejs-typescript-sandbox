import { DriveSystem } from "../vehicles/raycastVehicle/raycastVehicleObject";
import * as CANNON from 'cannon-es'

export interface VehicleConfig {
    comment: string;
    // wheel

    frontWheelHeight: number;
    rearWheelHeight: number;

    frontWheelRadius: number;
    rearWheelRadius: number;
    
    wheelMass: number;

    frictionSlip: number;
    rollInfluence: number;
    customSlidingRotationalSpeed: number;
    
    suspensionStiffness: number;
    suspensionRestLength: number;
    
    maxSteerVal: number;

    chassisMass: number;
    chassisDimensions: number[];
    
    lowSpeedForce: number; // max torque at low speed for faster acceleration
    highSpeedForce: number; // reduced torque at higher speed
    topSpeedForHigherTorque: number; // speed at which torque reduction starts
    driveSystem: DriveSystem;
}