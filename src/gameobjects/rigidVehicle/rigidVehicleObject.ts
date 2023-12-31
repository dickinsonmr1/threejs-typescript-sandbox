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

        const centerOfMassAdjust = new CANNON.Vec3(0, -0.2, 0);

        var chassisDimensions = new CANNON.Vec3(1, 0.5, 2);

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

        const wheelRadius = 0.25;
        const mass = 1;
        const axisWidth = 1; //7;
        //const wheelShape = new CANNON.Sphere(1.5);
        //const wheelMaterial = new CANNON.Material('wheel');
        const down = new CANNON.Vec3(0, -1, 0);
        
        const chassisHalfLength = chassisDimensions.x / 2;

        const sphereWheelObject1 = new SphereWheelObject(scene, wheelRadius, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
          body: sphereWheelObject1.wheelBody,
          position: new CANNON.Vec3(-chassisHalfLength, 0, axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, 1),
          direction: down,
        });
        this.wheels.push(sphereWheelObject1);

        const sphereWheelObject2 = new SphereWheelObject(scene, wheelRadius, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
          body: sphereWheelObject2.wheelBody,
          position: new CANNON.Vec3(-chassisHalfLength, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, -1),
          direction: down,
        });
        this.wheels.push(sphereWheelObject2);

        const sphereWheelObject3 = new SphereWheelObject(scene, wheelRadius, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
          body: sphereWheelObject3.wheelBody,
          position: new CANNON.Vec3(chassisHalfLength, 0, axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, 1),
          direction: down,
        });
        this.wheels.push(sphereWheelObject3);

        const sphereWheelObject4 = new SphereWheelObject(scene, wheelRadius, world, wheelMaterial, mass);
        this.rigidVehicleObject.addWheel({
          body: sphereWheelObject4.wheelBody,
          position: new CANNON.Vec3(chassisHalfLength, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, -1),
          direction: down,
        });
        this.wheels.push(sphereWheelObject4);
      
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