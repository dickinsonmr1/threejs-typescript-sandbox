import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
import { BoxObject } from "../boxObject";
import { CylinderObject } from "../cylinderObject";
//import { WheelObject } from "./wheelObject";
import { ChassisObject } from "../chassisObject";
import { SphereWheelObject } from "./sphereWheelObject";

export class RigidVehicleObject {
    
    wheels: SphereWheelObject[] = [];
    chassis: ChassisObject;

    rigidVehicleObject?: CANNON.RigidVehicle;

    constructor(scene: THREE.Scene,
        position: THREE.Vector3,
        color: number = 0xffffff,
        world: CANNON.World,
        wheelMaterial: CANNON.Material) {

        const centerOfMassAdjust = new CANNON.Vec3(0, 0, 0);

        var chassisDimensions = new CANNON.Vec3(1, 0.25, 0.25);

        this.chassis = new ChassisObject(
            scene,
            chassisDimensions,
            position,
            world,
            new CANNON.Material(), 
            1,
            centerOfMassAdjust
        );

        this.rigidVehicleObject = new CANNON.RigidVehicle({
            chassisBody: this.chassis.body
        });

        const wheelRadius = 0.3;
        const mass = 1;
        const axisWidth = 1; //7;
        //const wheelShape = new CANNON.Sphere(1.5);
        //const wheelMaterial = new CANNON.Material('wheel');
        const down = new CANNON.Vec3(0, -1, 0);
        
        const chassisHalfLength = chassisDimensions.x / 2;

        // front left
        const frontLeftWheel = new SphereWheelObject(scene, wheelRadius, 0x00ff00, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
            body: frontLeftWheel.wheelBody,
            position: new CANNON.Vec3(-chassisHalfLength, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });
        this.wheels.push(frontLeftWheel);

        // front right
        const frontRightWheel = new SphereWheelObject(scene, wheelRadius, 0x00ff00, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
            body: frontRightWheel.wheelBody,
            position: new CANNON.Vec3(-chassisHalfLength, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });
        this.wheels.push(frontRightWheel);
        
        // rear left
        const rearLeftWheel = new SphereWheelObject(scene, wheelRadius, 0xff0000, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
            body: rearLeftWheel.wheelBody,
            position: new CANNON.Vec3(chassisHalfLength, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down,
        });
        this.wheels.push(rearLeftWheel);

        // rear right
        const rearRightWheel = new SphereWheelObject(scene, wheelRadius, 0xff0000, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
            body: rearRightWheel.wheelBody,
            position: new CANNON.Vec3(chassisHalfLength, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down,
        });
        this.wheels.push(rearRightWheel);
      
        this.rigidVehicleObject.addToWorld(world);
		/*
        this.rigidVehicleObject.wheelBodies.forEach(wheel => {
            //this.wheels.push();
		});
        */
    }

    getPosition() {
        return this.chassis.mesh.position;
    }

    update() {

        this.chassis.update();            
        this.wheels.forEach(x => x.update());           
    }
}