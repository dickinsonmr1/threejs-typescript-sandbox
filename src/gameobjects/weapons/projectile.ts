import * as THREE from "three";
import { PointLightObject } from "../fx/pointLightObject";
import { SphereObject } from "../shapes/sphereObject";
import * as CANNON from 'cannon-es'
import { ParticleEmitterObject, ParticleEmitterType } from "../fx/particleEmitterObject";
import { ProjectileType } from "./projectileType";

export enum ProjectileLaunchLocation {
    Left,
    Center,
    Right
}

export class Projectile extends SphereObject {

    private projectileType: ProjectileType;
    private lightColor: THREE.Color;
    private particleColor: THREE.Color;

    pointLightObject?: PointLightObject;
    particleEmitterObject?: ParticleEmitterObject;
	private readonly velocity = new THREE.Vector3();    
	private isDead = false;

    private maxLifespanInSeconds: number = 3;

    private expiryTimer: THREE.Clock;

    constructor(scene: THREE.Scene,
        projectileType: ProjectileType,
        radius: number,
        position: THREE.Vector3,
        launchVector: THREE.Vector3,
        projectileSpeed: number,
        lightColor: THREE.Color,
        particleColor: THREE.Color,
        meshMaterial?: THREE.Material,
        particleTexture?: THREE.Texture) {
        
        super(scene, radius, position, particleColor.getHex(), meshMaterial);
        
        this.projectileType = projectileType;

        this.lightColor = lightColor;
        this.particleColor = particleColor;
        
        if(this.projectileType == ProjectileType.Rocket) {

            this.pointLightObject = new PointLightObject(
                scene,
                lightColor,//new THREE.Color('white'),
                0.2, 2, 0.96, 
                new THREE.Vector3(0, 0, 0)
            );

            if(this.pointLightObject.pointLight != null) 
                scene.add(this.pointLightObject.pointLight);

            if(this.pointLightObject.pointLightHelper != null) 
                scene.add(this.pointLightObject.pointLightHelper);

            if(particleTexture != null) {
                this.particleEmitterObject = new ParticleEmitterObject(
                    scene,
                    ParticleEmitterType.GlowingParticles,
                    particleTexture,
                    particleColor,//new THREE.Color('grey'),
                    position,
                    1,
                    20,
                    0
                )
            };
        }

      
      

        /*
        setTimeout(() => {
            this.isDead = true
        }, 1000);
        */

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
    
    getLightColor(): THREE.Color {
        return this.lightColor;
    }

    getParticleColor(): THREE.Color {
        return this.particleColor;
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
        if(this.particleEmitterObject != null) {
            this.particleEmitterObject.kill();
        }
        if(this.particleEmitterObject != null) {
            this.particleEmitterObject.kill();
        }
	}

    update() {

        //this.body?.applyForce(new CANNON.Vec3(0, 9.81, 0)) // opposite of gravity 
        super.update();

        if(this.expiryTimer.getElapsedTime() > this.maxLifespanInSeconds) {
            this.kill();
            return;
        }

        this.mesh.position.x += this.velocity.x;
		this.mesh.position.y += this.velocity.y;
		this.mesh.position.z += this.velocity.z;

        if(this.mesh?.position != null)
            this.pointLightObject?.setPosition(this.mesh.position);

        if(this.particleEmitterObject != null) {            
            this.particleEmitterObject.update(this.getPosition());
        }
    }
}