import * as THREE from "three";
import { PointLightObject } from "../fx/pointLightObject";
import { SphereObject } from "../shapes/sphereObject";
import { ParticleTrailObject, ParticleEmitterType } from "../fx/particleTrailObject";
import { ProjectileType } from "./projectileType";
import { v4 as uuidv4 } from 'uuid';
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
import GameScene from "../../scenes/gameScene";

export enum ProjectileLaunchLocation {
    Left,
    Center,
    Right
}

export class Projectile extends SphereObject {

    public playerId: string;
    public projectileType: ProjectileType;
    private lightColor: THREE.Color;

    private particleColor1: THREE.Color;
    private particleColor2: THREE.Color;
    private particleColor3: THREE.Color;
    private particleColor4: THREE.Color;

    scene: THREE.Scene;

    pointLightObject!: PointLightObject;
    particleEmitterObject!: ParticleTrailObject;
    particleEmitterSmokeObject!: ParticleTrailObject;
    
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
        
        particleColor1: THREE.Color,
        particleColor2: THREE.Color,
        particleColor3: THREE.Color,
        particleColor4: THREE.Color,

        meshMaterial?: THREE.Material,
        particleTexture?: THREE.Texture,
        world?: CANNON.World) {
        
        super(scene, radius, position, particleColor1.getHex(), meshMaterial, world);

        this.scene = scene;
        
        this.playerId = playerId;
        this.projectileType = projectileType;

        this.lightColor = lightColor;
        this.particleColor1 = particleColor1;
        this.particleColor2 = particleColor2;
        this.particleColor3 = particleColor3;
        this.particleColor4 = particleColor4;
        
        this.group.position.set(position.x, position.y, position.z);

        if(this.projectileType == ProjectileType.Rocket) {

            /*
            this.pointLightObject = new PointLightObject(
                scene,
                lightColor,//new THREE.Color('white'),
                0.2, 2, 0.96, 
                new THREE.Vector3()// this.group.position
            );
            */

            if(particleTexture != null) {
                this.particleEmitterObject = new ParticleTrailObject(
                    scene,
                    ParticleEmitterType.GlowingParticles,
                    particleTexture,
                    particleColor1,//new THREE.Color('grey'),
                    particleColor2, //new THREE.Color(0x663399),
                    particleColor3, //new THREE.Color(0x663399),
                    particleColor4, //new THREE.Color(0x4d0099),
                    1,
                    0.0025
                )
                this.particleEmitterSmokeObject = new ParticleTrailObject(
                    scene,
                    ParticleEmitterType.SmokeTrail,
                    particleTexture,
                    new THREE.Color('black'),
                    new THREE.Color('black'),
                    new THREE.Color('gray'),
                    new THREE.Color('gray'),
                    1,
                    0.0025
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

    getParticleColor1(): THREE.Color {
        return this.particleColor1;
    }
    getParticleColor2(): THREE.Color {
        return this.particleColor2;
    }
    getParticleColor3(): THREE.Color {
        return this.particleColor3;
    }
    getParticleColor4(): THREE.Color {
        return this.particleColor4;
    }

    get shouldRemove() {
		return this.isDead;
	}

	setVelocity(x: number, y: number, z: number) {
		this.velocity.set(x, y, z);
	}

	kill(): void {

        super.kill();
        this.isDead = true;

        if(this.particleEmitterObject != null) {
            this.particleEmitterObject.stop();
            this.particleEmitterSmokeObject.stop();
        }
        if(this.pointLightObject != null) {
            this.pointLightObject.kill();
        
        }

        this.scene.remove(this.mesh);
        this.scene.remove(this.group);        
	}

    update() {

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
		this.group.position.z += this.velocity.z;
        this.group.position.y += this.velocity.y;             

        // TODO: homing rockets that avoid hitting the ground   
        //let scene = <GameScene>this.scene;
        //let worldPosition = scene.getWorldPositionOnTerrain(this.group.position.x, this.group.position.z );        
        //this.group.position.y = worldPosition.y + 1;

        this.body?.position.set(this.group.position.x, this.group.position.y, this.group.position.z);
        this.body?.updateAABB();

        this.pointLightObject?.setPosition(this.group.position);

        if(this.particleEmitterObject != null) {     
            this.particleEmitterObject.setEmitPosition(this.getPosition());   
        }
        if(this.particleEmitterSmokeObject != null) {     
            this.particleEmitterSmokeObject.setEmitPosition(this.getPosition());   
        }
    }
}