import * as THREE from "three";
import { PointLightObject } from "../fx/pointLightObject";
import { SphereObject } from "../shapes/sphereObject";
import { ParticleEmitterObject, ParticleEmitterType } from "../fx/particleEmitterObject";
import { ProjectileType } from "./projectileType";
import { v4 as uuidv4 } from 'uuid';

export enum ProjectileLaunchLocation {
    Left,
    Center,
    Right
}

export class Projectile extends SphereObject {

    public playerId: string;
    public projectileType: ProjectileType;
    private lightColor: THREE.Color;
    private particleColor: THREE.Color;

    scene: THREE.Scene;

    pointLightObject!: PointLightObject;
    particleEmitterObject!: ParticleEmitterObject;
    
	private readonly velocity = new THREE.Vector3();    
	private isDead = false;

    private maxLifespanInSeconds: number = 3;

    //private expiryTimer: THREE.Clock;

    constructor(scene: THREE.Scene,
        playerId: string,
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

        this.scene = scene;
        
        this.playerId = playerId;
        this.projectileType = projectileType;

        this.lightColor = lightColor;
        this.particleColor = particleColor;
        
        //scene.add(this.group);
        this.group.position.set(position.x, position.y, position.z);

        if(this.projectileType == ProjectileType.Rocket) {

            
            this.pointLightObject = new PointLightObject(
                scene,
                lightColor,//new THREE.Color('white'),
                0.2, 2, 0.96, 
                new THREE.Vector3()// this.group.position
            );

            //if(this.pointLightObject.pointLight != null) 
            //this.group.add(this.pointLightObject.group);

            //if(this.pointLightObject.pointLightHelper != null) 
                //this.group.add(this.pointLightObject.pointLightHelper);

            //this.group.position.set(position.x, position.y, position.z);

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
        
        setTimeout(() => {
            this.isDead = true
        }, 3000);
        

        this.setVelocity(
            launchVector.x * projectileSpeed,
            launchVector.y * projectileSpeed,
            launchVector.z * projectileSpeed
        );

        //this.expiryTimer = new THREE.Clock(true);
        //this.expiryTimer.start();
    }

    getLightColor(): THREE.Color {
        return this.lightColor;
    }

    getParticleColor(): THREE.Color {
        return this.particleColor;
    }

    get shouldRemove() {
		return this.isDead;
	}

	setVelocity(x: number, y: number, z: number) {
		this.velocity.set(x, y, z);
        //this.body?.velocity.set(x, y, z);
	}

	kill() {

        super.kill();
        this.isDead = true;

        if(this.particleEmitterObject != null) {
            this.particleEmitterObject.kill();
        }
        if(this.pointLightObject != null) {
            this.pointLightObject.kill();
        
        }

        this.scene.remove(this.mesh);
        this.scene.remove(this.group);        
        //this.group.children.forEach(x => this.group.remove(x));
        //this.group.removeFromParent();
	}

    update() {

        //this.body?.applyForce(new CANNON.Vec3(0, 9.81, 0)) // opposite of gravity 
        super.update();

        if(this.isDead) {
            this.kill();
            return;
        }

        
        //if(this.expiryTimer.getElapsedTime() > this.maxLifespanInSeconds) {
            //this.kill();
            //return;
        //}        

        this.group.position.x += this.velocity.x;
		this.group.position.y += this.velocity.y;
		this.group.position.z += this.velocity.z;

        this.pointLightObject?.setPosition(this.group.position);

        if(this.particleEmitterObject != null) {            
            this.particleEmitterObject.update(this.getPosition());
        }
    }
}