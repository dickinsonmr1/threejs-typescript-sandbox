import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../../utility";
import { RaycastWheelObject } from "./raycastWheelObject";
import { ChassisObject } from "../chassisObject";

export class RaycastVehicleObject {
    
    wheels: RaycastWheelObject[] = [];
    chassis: ChassisObject;

    raycastVehicle?: CANNON.RaycastVehicle;
    
    private readonly maxSteerVal: number = 0.5;
    private readonly maxForce: number = 1000;

    //mesh: THREE.Mesh;
    //body?: CANNON.Body;

    //meshMaterial: THREE.Material;
    //physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        position: THREE.Vector3,
        color: number = 0xffffff,
        world: CANNON.World,
        wheelMaterial: CANNON.Material) {

        this.chassis = new ChassisObject(
            scene,
            new CANNON.Vec3(1, 0.5, 0.5),
            position,
            world,
            new CANNON.Material(),
            300,
            new CANNON.Vec3(0, 0, 0));

        const wheelOptions = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
        };

        this.raycastVehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassis.body,
            //indexRightAxis: 0,
            //indexUpAxis: 1,
            //indexForwardAxis: 2
        });

        wheelOptions.chassisConnectionPointLocal.set(-1, 0, -1);
        this.raycastVehicle.addWheel(wheelOptions);
        
        wheelOptions.chassisConnectionPointLocal.set(-1, 0, 1);
        this.raycastVehicle.addWheel(wheelOptions);
        
        wheelOptions.chassisConnectionPointLocal.set(1, 0, -1);
        this.raycastVehicle.addWheel(wheelOptions);

        wheelOptions.chassisConnectionPointLocal.set(1, 0, 1);        
        this.raycastVehicle.addWheel(wheelOptions);

        this.raycastVehicle.addToWorld(world);

        let i = 0;
        let wheelColor = 0x00ff00;
		this.raycastVehicle.wheelInfos.forEach(wheel => {
            
            if(i > 1)
                wheelColor = 0xff0000;
            
            const temp = new RaycastWheelObject(scene, wheel.radius, wheelColor, world, wheelMaterial);                    
            this.wheels.push(temp);
            i++;
		});
    }

    getPosition() {
        return this.chassis.mesh.position;
    }

    tryAccelerate(): void {
        // rear wheels
        this.raycastVehicle?.applyEngineForce(-this.maxForce, 2);
        this.raycastVehicle?.applyEngineForce(-this.maxForce, 3);

        // front wheels
        this.raycastVehicle?.applyEngineForce(-this.maxForce, 0);
        this.raycastVehicle?.applyEngineForce(-this.maxForce, 1);

    }

    tryStopAccelerate(): void {
        // rear wheels
        this.raycastVehicle?.applyEngineForce(0, 2);
        this.raycastVehicle?.applyEngineForce(0, 3);
        
        // front wheels
        this.raycastVehicle?.applyEngineForce(0, 0);
        this.raycastVehicle?.applyEngineForce(0, 1);
    }

    tryReverse(): void {
        // rear wheels
        this.raycastVehicle?.applyEngineForce(this.maxForce, 2);
        this.raycastVehicle?.applyEngineForce(this.maxForce, 3);

        // front wheels
        this.raycastVehicle?.applyEngineForce(this.maxForce, 0);
        this.raycastVehicle?.applyEngineForce(this.maxForce, 1);
    }

    tryStopReverse(): void {
        // rear wheels
        this.raycastVehicle?.applyEngineForce(0, 2);
        this.raycastVehicle?.applyEngineForce(0, 3);

        // front wheels
        this.raycastVehicle?.applyEngineForce(0, 0);
        this.raycastVehicle?.applyEngineForce(0, 1);
    }

    tryTurnLeft() {
        this.raycastVehicle?.setSteeringValue(this.maxSteerVal, 0);
        this.raycastVehicle?.setSteeringValue(this.maxSteerVal, 1);
    }

    tryStopTurnLeft() {
        this.raycastVehicle?.setSteeringValue(0, 0);
        this.raycastVehicle?.setSteeringValue(0, 1);
    }

    tryTurnRight(): void {
        this.raycastVehicle?.setSteeringValue(-this.maxSteerVal, 0);
        this.raycastVehicle?.setSteeringValue(-this.maxSteerVal, 1);
    }
    tryStopTurnRight(): void {
        this.raycastVehicle?.setSteeringValue(0, 0);
        this.raycastVehicle?.setSteeringValue(0, 1);
    }

    update() {

        //this.raycastVehicle?.updateVehicle(1);
        this.chassis.update();     
        if(this.raycastVehicle != null) {
            for(let i = 0; i < this.raycastVehicle.wheelInfos.length; i++) {
                this.raycastVehicle?.updateWheelTransform(i);

                const transform  = this.raycastVehicle?.wheelInfos[i].worldTransform;

                let wheel = this.wheels[i];
                
                wheel.wheelBody.position.copy(transform.position);
                wheel.wheelBody.quaternion.copy(transform.quaternion);


                wheel.mesh.position.copy(Utility.CannonVec3ToThreeVec3(transform.position));
                wheel.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(transform.quaternion));

                /*
                if(t?.position != null)
                    this.wheels[i].mesh.position.copy(Utility.CannonVec3ToThreeVec3(t?.position));
                if(t?.quaternion != null)
                    this.wheels[i].mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(t?.quaternion));
                */

                //this.wheels[i].update();    
            }
        }

        //this.wheels.forEach(x => x.update());
           
    }
}