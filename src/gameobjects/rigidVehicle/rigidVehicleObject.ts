import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { ChassisObject } from "../chassisObject";
import { SphereWheelObject } from "./sphereWheelObject";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Utility } from "../../utility";

export class RigidVehicleObject {
    
    wheels: SphereWheelObject[] = [];
    chassis: ChassisObject;

    rigidVehicleObject?: CANNON.RigidVehicle;

    model?: THREE.Group;
    modelOffset?: THREE.Vector3;

    private readonly maxForceRigidBodyVehicle: number = 15;
    private readonly rigidMaxSteerVal: number = Math.PI / 12;

    constructor(scene: THREE.Scene,
        position: THREE.Vector3,
        world: CANNON.World,
        chassisDimensions: CANNON.Vec3,        
        centerOfMassAdjust: CANNON.Vec3,
        chassisMass: number,
        wheelMaterial: CANNON.Material,
        wheelRadius: number,
        wheelOffset: CANNON.Vec3,
        wheelMass: number,
        modelData?: GLTF,
        modelScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
        modelOffset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {

        this.chassis = new ChassisObject(
            scene,
            chassisDimensions,
            position,
            world,
            new CANNON.Material(), 
            chassisMass,
            centerOfMassAdjust
        );

        this.rigidVehicleObject = new CANNON.RigidVehicle({
            chassisBody: this.chassis.body
        });
        
        const axisWidth = chassisDimensions.z * 2; //0.75;
        const down = new CANNON.Vec3(0, -1, 0);
        
        const chassisLength = chassisDimensions.x;
        //const chassisHalfLength = chassisDimensions.x / 2;

        // front left
        const frontLeftWheel = new SphereWheelObject(
            scene,
            wheelRadius,
            0x00ff00,
            world,
            wheelMaterial,
            wheelMass
        );
        this.rigidVehicleObject.addWheel({
            body: frontLeftWheel.wheelBody,
            position: new CANNON.Vec3(-chassisLength, 0, axisWidth / 2).vadd(wheelOffset),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });
        this.wheels.push(frontLeftWheel);

        // front right
        const frontRightWheel = new SphereWheelObject(
            scene,
            wheelRadius,
            0x00ff00,
            world,
            wheelMaterial,
            wheelMass
        );
        this.rigidVehicleObject.addWheel({
            body: frontRightWheel.wheelBody,
            position: new CANNON.Vec3(-chassisLength, 0, -axisWidth / 2).vadd(wheelOffset),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });
        this.wheels.push(frontRightWheel);        
        
        // rear left
        const rearLeftWheel = new SphereWheelObject(
            scene,
            wheelRadius,
            0xff0000,
            world,
            wheelMaterial,
            wheelMass
        );
        this.rigidVehicleObject.addWheel({
            body: rearLeftWheel.wheelBody,
            position: new CANNON.Vec3(chassisLength, 0, axisWidth / 2).vadd(wheelOffset),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down,
        });
        this.wheels.push(rearLeftWheel);

        // rear right
        const rearRightWheel = new SphereWheelObject(
            scene,
            wheelRadius,
            0xff0000,
            world,
            wheelMaterial,
            wheelMass
        );
        this.rigidVehicleObject.addWheel({
            body: rearRightWheel.wheelBody,
            position: new CANNON.Vec3(chassisLength, 0, -axisWidth / 2).vadd(wheelOffset),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down,
        });
        this.wheels.push(rearRightWheel);        
      
        this.rigidVehicleObject.addToWorld(world);


        if(modelData != null) {
            this.model = modelData.scene;//.children[0];
            this.modelOffset = modelOffset;

            this.model.position.set(position.x + modelOffset.x, position.y + modelOffset.y, position.z + modelOffset.z);
            this.model.scale.set(modelScale.x, modelScale.y, modelScale.z);         
            this.model.rotateY(Math.PI / 2);
        }
    }

    getPosition() {
        return this.chassis.mesh.position;
    }

    resetPosition(): void {
        if(!this.rigidVehicleObject) return;

        this.rigidVehicleObject.chassisBody.position.y = 5;
        //this.rigidVehicleObject.chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
    }

    tryTurnLeft(): void {
        // front wheels
        this.rigidVehicleObject?.setSteeringValue(this.rigidMaxSteerVal, 0);
        this.rigidVehicleObject?.setSteeringValue(this.rigidMaxSteerVal, 1);

        // rear wheels
        this.rigidVehicleObject?.setSteeringValue(-this.rigidMaxSteerVal, 2);
        this.rigidVehicleObject?.setSteeringValue(-this.rigidMaxSteerVal, 3);
    }
    tryStopTurnLeft(): void {
        // front wheels
        this.rigidVehicleObject?.setSteeringValue(0, 0);
        this.rigidVehicleObject?.setSteeringValue(0, 1);

        // rear wheels
        this.rigidVehicleObject?.setSteeringValue(0, 2);
        this.rigidVehicleObject?.setSteeringValue(0, 3);
    }

    tryTurnRight(): void {
        // front wheels
        this.rigidVehicleObject?.setSteeringValue(-this.rigidMaxSteerVal, 0);
        this.rigidVehicleObject?.setSteeringValue(-this.rigidMaxSteerVal, 1);

        // rear wheels
        this.rigidVehicleObject?.setSteeringValue(this.rigidMaxSteerVal, 2);
        this.rigidVehicleObject?.setSteeringValue(this.rigidMaxSteerVal, 3);
    }
    tryStopTurnRight(): void {
        // front wheels
        this.rigidVehicleObject?.setSteeringValue(0, 0);
        this.rigidVehicleObject?.setSteeringValue(0, 1);

        // rear wheels
        this.rigidVehicleObject?.setSteeringValue(0, 2);
        this.rigidVehicleObject?.setSteeringValue(0, 3);
    }

    tryAccelerate(): void {
        // rear wheels
        this.rigidVehicleObject?.setWheelForce(-this.maxForceRigidBodyVehicle, 2);
        this.rigidVehicleObject?.setWheelForce(-this.maxForceRigidBodyVehicle, 3);
    }
    tryStopAccelerate(): void {
       // rear wheels
       this.rigidVehicleObject?.setWheelForce(0, 2);
       this.rigidVehicleObject?.setWheelForce(0, 3);
    }

    tryReverse(): void {
        // rear wheels
        this.rigidVehicleObject?.setWheelForce(this.maxForceRigidBodyVehicle, 2);
        this.rigidVehicleObject?.setWheelForce(this.maxForceRigidBodyVehicle, 3);
    }
    tryStopReverse(): void {
        // rear wheels
        this.rigidVehicleObject?.setWheelForce(0, 2);
        this.rigidVehicleObject?.setWheelForce(0, 3);
    }

    update() {
        this.chassis.update();            
        this.wheels.forEach(x => x.update());   
        
        if(this.model != null && this.modelOffset != null) {            
            
            this.model.position.copy(Utility.CannonVec3ToThreeVec3(this.chassis.body.position));//.add(this.modelOffset));
            this.model.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.chassis.body.quaternion));

            /*
            var temp = new THREE.Quaternion().multiplyQuaternions(
                Utility.CannonQuaternionToThreeQuaternion(this.chassis.body.quaternion),
                new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2)
            );
            this.model.quaternion.copy(temp);
            */
            
        }
    }
}