import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";
import { BoxObject } from "./boxObject";
import { CylinderObject } from "./cylinderObject";
import { WheelObject } from "./wheelObject";
import { ChassisObject } from "./chassisObject";

export class RaycastVehicleObject {
    
    wheels: WheelObject[] = [];
    chassis: ChassisObject;

    raycastVehicle?: CANNON.RaycastVehicle;

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

        this.chassis = new ChassisObject(scene, position, world, new CANNON.Material(), 150);

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

		this.raycastVehicle.wheelInfos.forEach(wheel => {
            const temp = new WheelObject(scene, wheel.radius, world, wheelMaterial);                    
            this.wheels.push(temp);
		});
    }

    getPosition() {
        return this.chassis.mesh.position;
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