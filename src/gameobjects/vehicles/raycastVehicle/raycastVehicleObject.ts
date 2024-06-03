import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../../utility";
import { RaycastWheelObject } from "./raycastWheelObject";
import { ChassisObject } from "../chassisObject";
import { IPlayerVehicle } from "../IPlayerVehicle";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Utils } from "utils/Utils";

export class RaycastVehicleObject implements IPlayerVehicle {
    
    wheels: RaycastWheelObject[] = [];
    chassis: ChassisObject;

    private raycastVehicle?: CANNON.RaycastVehicle;

    // TODO: use these
    private model!: THREE.Group;
    modelOffset?: THREE.Vector3;
    
    private readonly maxSteerVal: number = 0.7;
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
        //color: number = 0xffffff,
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

        const wheelOptions = {
            radius: wheelRadius,
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

        const axisWidth = chassisDimensions.z * 2.5; //0.75;
        const down = new CANNON.Vec3(0, -1, 0);
        
        const chassisLength = chassisDimensions.x;

        // front right
        wheelOptions.chassisConnectionPointLocal.set(-chassisLength, 0, -axisWidth / 2);
        this.raycastVehicle.addWheel(wheelOptions);
        
        // front left
        wheelOptions.chassisConnectionPointLocal.set(-chassisLength, 0, axisWidth / 2);
        this.raycastVehicle.addWheel(wheelOptions);
        
        // rear right
        wheelOptions.chassisConnectionPointLocal.set(chassisLength, 0, -axisWidth / 2);
        this.raycastVehicle.addWheel(wheelOptions);

        // rear left
        wheelOptions.chassisConnectionPointLocal.set(chassisLength, 0, axisWidth / 2);        
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

        if(modelData != null) {
            this.model = modelData.scene;//.children[0];
            this.modelOffset = modelOffset;

            this.model.position.set(position.x + modelOffset.x, position.y + modelOffset.y, position.z + modelOffset.z);
            this.model.scale.set(modelScale.x, modelScale.y, modelScale.z);         
            this.model.rotateY(Math.PI / 2);
        }
    }
    tryJump(): void {        
        this.raycastVehicle?.chassisBody.applyImpulse(new CANNON.Vec3(0, 4000, 0));
    }
    
    tryTurbo(): void {

        let forwardVector = new THREE.Vector3(-100, 0, 0);
        forwardVector.applyQuaternion(this.getModel().quaternion);

        let vec3 = Utility.ThreeVec3ToCannonVec3(forwardVector);

        this.raycastVehicle?.chassisBody.applyImpulse(vec3);
    }

    resetPosition(): void {
        if(!this.raycastVehicle) return;

        this.raycastVehicle.chassisBody.position.y = 10;
        this.raycastVehicle.chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
        this.raycastVehicle.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
        this.raycastVehicle.chassisBody.velocity.set(0, 0, 0);
    }

    getChassis(): ChassisObject {
        return this.chassis;
    }

    getModel(): THREE.Group<THREE.Object3DEventMap> {
        return this.model
    }
    
    getCannonVehicleChassisBody(): CANNON.Body | undefined {
        return this.raycastVehicle?.chassisBody;
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

    tryTurn(gamepadStickX: number): void {
        // front wheels
        this.raycastVehicle?.setSteeringValue(this.maxSteerVal * gamepadStickX, 0);
        this.raycastVehicle?.setSteeringValue(this.maxSteerVal * gamepadStickX, 1);

        // rear wheels
        //this.raycastVehicle?.setSteeringValue(-this.maxSteerVal * gamepadStickX, 2);
        //this.raycastVehicle?.setSteeringValue(-this.maxSteerVal * gamepadStickX, 3);
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
        //this.wheels.forEach(x => x.update());

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

        //this.wheels.forEach(x => x.update());
           
    }
}