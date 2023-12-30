import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";
import { CubeObject } from "./cubeObject";
import { CylinderObject } from "./cylinderObject";
import { WheelObject } from "./wheelObject";

export class RaycastVehicleObject {
    
    wheels: WheelObject[] = [];
    vehicleFrame: CubeObject;

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
        //meshMaterial?: THREE.Material,
        world: CANNON.World,
        physicsMaterial: CANNON.Material,
        wheelMaterial: CANNON.Material) {

        const meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: false
        });

        // three.js frame and wheels
        //this.vehicleFrame = new CubeObject(scene, 0.5, 1, 0.5, position, color,
        // meshMaterial, world, physicsMaterial);
       
            
        //for(let i = 0; i < 4; i++) {
            //const wheel = new CylinderObject(scene, 0.5, 0.25, position, color, meshMaterial, world, physicsMaterial);
            //this.wheels.push(wheel);
        //}   
        
        // cannon-es chassis and wheels
        this.vehicleFrame = new CubeObject(scene, 2, 0.5, 1, new THREE.Vector3(0, 4, -5), color, meshMaterial, world, physicsMaterial, 150);        
        //this.vehicleFrame.body?.mass = 150;

        //const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        //const chassisBody = new CANNON.Body({ mass: 150 });
        //chassisBody.addShape(chassisShape);
        //chassisBody.position.set(0, 4, 0);
        // this.help.addVisual(chassisBody, 'car');

        const options = {
			radius: 0.5,
			directionLocal: new CANNON.Vec3(0, -1, 0),
			suspensionStiffness: 30,
			suspensionRestLength: 0.3,
			frictionSlip: 5,
			dampingRelaxation: 2.3,
			dampingCompression: 4.4,
			maxSuspensionForce: 100000,
			rollInfluence:  0.01,
			axleLocal: new CANNON.Vec3(-1, 0, 0),
			chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
			maxSuspensionTravel: 0.3,
			customSlidingRotationalSpeed: -30,
			useCustomSlidingRotationalSpeed: true
        };

        this.raycastVehicle = new CANNON.RaycastVehicle({
            chassisBody: this.vehicleFrame.body,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indexForwardAxis: 2
        });

        options.chassisConnectionPointLocal.set(1, 0, -1);
        this.raycastVehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, 0, -1);
        this.raycastVehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(1, 0, 1);
        this.raycastVehicle.addWheel(options);
        
        options.chassisConnectionPointLocal.set(-1, 0, 1);
        this.raycastVehicle.addWheel(options);

        this.raycastVehicle.addToWorld(world);

		//var wheelBodies: CANNON.Body[] = [];    

		this.raycastVehicle.wheelInfos.forEach(wheel => {
            
			//const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
            const temp = new WheelObject(scene, wheel.radius, world, wheelMaterial);
            
            /*
            const q = new CANNON.Quaternion();
			//q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
            q.setFromEuler(-Math.PI / 2, 0, 0);
            temp.body?.addShape()

            //temp.body?.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
            //temp.body?.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            if(temp.body != null) {
                temp.body.type = CANNON.Body.KINEMATIC;
                temp.body.collisionFilterGroup = 0;
                temp.body.quaternion = q;
            }

            //world.add
            //temp.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(), -Math.PI / 2);
            //temp.mesh?.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

			//const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });            
			//const q = new CANNON.Quaternion();
			//q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
            */

            this.wheels.push(temp);

			//wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
			//wheelBodies.push(wheelBody);
			//game.helper.addVisual(wheelBody, 'wheel');
		});
    }

    getPosition() {
        return this.vehicleFrame?.mesh.position;
    }

    update() {

        //this.raycastVehicle?.updateVehicle(1);
        if(this.raycastVehicle != null) {
            for(let i = 0; i < this.raycastVehicle.wheelInfos.length; i++) {
                this.raycastVehicle?.updateWheelTransform(i);

                const transform  = this.raycastVehicle?.wheelInfos[i].worldTransform;

                let wheel = this.wheels[i];
                
                wheel.wheelBody.position.copy(transform.position);
                wheel.wheelBody.quaternion.copy(transform.quaternion);

                /*
                if(t?.position != null)
                    this.wheels[i].mesh.position.copy(Utility.CannonVec3ToThreeVec3(t?.position));
                if(t?.quaternion != null)
                    this.wheels[i].mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(t?.quaternion));
                */

                this.wheels[i].update();    
            }
        }

        //this.wheels.forEach(x => x.update());
        this.vehicleFrame.update();
        
    }
}