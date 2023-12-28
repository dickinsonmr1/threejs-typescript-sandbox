import * as THREE from "three";
import { Utility } from "../utility";
import { PointLightObject } from "./pointLightObject";
import { SphereObject } from "./sphereObject";
import * as CANNON from 'cannon-es'
export class Projectile extends SphereObject {

    pointLightObject?: PointLightObject;
	private readonly velocity = new THREE.Vector3();    
	private isDead = false;

    private expiryTimer: THREE.Clock;

    constructor(scene: THREE.Scene,
        radius: number,
        position: THREE.Vector3,
        launchVector: THREE.Vector3,
        projectileSpeed: number,
        color: number = 0xffffff,
        meshMaterial?: THREE.Material) {
        
        super(scene, radius, position, color, meshMaterial);
        
        this.pointLightObject = new PointLightObject(scene, new THREE.Color('white'), 0.9, 1, 0.1, 
        new THREE.Vector3(0, 0, 0));

        if(this.pointLightObject.pointLight != null) 
            scene.add(this.pointLightObject.pointLight);

        if(this.pointLightObject.pointLightHelper != null) 
            scene.add(this.pointLightObject.pointLightHelper);

        setTimeout(() => {
            this.isDead = true
        }, 1000);

        this.setVelocity(
            launchVector.x * projectileSpeed,
            launchVector.y * projectileSpeed,
            launchVector.z * projectileSpeed
        );

        this.expiryTimer = new THREE.Clock(true);
        this.expiryTimer.start();
    }

    getPhysicsMaterial(): CANNON.Material {
        
        if(this.physicsMaterial != null)
            return this.physicsMaterial;
        else
            throw new Error("No physics material set!")
    }

    getPosition() {
        return this.mesh?.position;
    }

    get shouldRemove()
	{
		return this.isDead;
	}

	setVelocity(x: number, y: number, z: number)
	{
		this.velocity.set(x, y, z);
        //this.body?.velocity.set(x, y, z);
	}

	kill() {
        this.isDead = true;
		this.pointLightObject?.remove();
	}

    update() {

        //this.body?.applyForce(new CANNON.Vec3(0, 9.81, 0)) // opposite of gravity 
        super.update();

        if(this.expiryTimer.getElapsedTime() > 1) {
            this.kill();
            return;
        }

        this.mesh.position.x += this.velocity.x;
		this.mesh.position.y += this.velocity.y;
		this.mesh.position.z += this.velocity.z;

        if(this.mesh?.position != null)
            this.pointLightObject?.setPosition(this.mesh.position);
    }
}