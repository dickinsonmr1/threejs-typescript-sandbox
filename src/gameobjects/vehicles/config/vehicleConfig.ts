import { DriveSystem } from "../raycastVehicle/raycastVehicleObject";

export interface VehicleConfig {

    vehicleTypeEnum: number;
    vehicleName: string;
    asset: string;
    health: number;
    special: number;
    speed: number;
    defensiveSpecial: number;
    
    comment: string;
    
    // wheel properties
    frontWheelHeight: number;
    rearWheelHeight: number;

    frontWheelRadius: number;
    rearWheelRadius: number;

    frontWheelOffset: number[];
    rearWheelOffset: number[];

    frontWheelModelScale: number[];
    rearWheelModelScale: number[];

    wheelMass: number;

    frictionSlip: number;
    rollInfluence: number;
    customSlidingRotationalSpeed: number;
    
    suspensionStiffness: number;
    suspensionRestLength: number;
    
    maxSteerVal: number;

    // chassis properties
    chassisMass: number;
    chassisDimensions: number[];
    centerOfMassAdjust: number[];

    modelScale: number[];
    modelOffset: number[];

    hasEmergencyLights1?: boolean;
    hasEmergencyLights2?: boolean;
    offsetLeft1?: number[];
    offsetRight1?: number[];
    offsetLeft2?: number[];
    offsetRight2?: number[];
    
    //
    lowSpeedForce: number; // max torque at low speed for faster acceleration
    highSpeedForce: number; // reduced torque at higher speed
    topSpeedForHigherTorque: number; // speed at which torque reduction starts
    driveSystem: DriveSystem;

    // TODO: move other config items here such as brake light offsets
}