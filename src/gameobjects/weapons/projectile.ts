import * as THREE from "three";
import { PointLightObject } from "../fx/pointLightObject";
import { SphereObject } from "../shapes/sphereObject";
import {  ParticleEmitterType } from "../fx/particleTrailObject";
import { ProjectileType } from "./projectileType";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
import { ParticleEmitter } from "../fx/particleEmitter";
import { ParticleTrailPointsShaderObject } from "../fx/particleTrailPointsShaderObject";
import { Target } from "../target";
import GameScene from "../../scenes/gameScene";

export enum ProjectileLaunchLocation {
    Left,
    Center,
    Right
}

export class Projectile extends SphereObject {

    public playerId: string;
    public isDebug: boolean;
    public projectileType: ProjectileType;
    private lightColor: THREE.Color;

    private particleColor1: THREE.Color;
    private particleColor2: THREE.Color;
    private particleColor3: THREE.Color;
    private particleColor4: THREE.Color;

    scene: THREE.Scene;

    pointLightObject!: PointLightObject;
    particleEmitterObject!: ParticleEmitter;
    particleEmitterSmokeObject!: ParticleEmitter;

    airstrikeTarget!: Target;
    detonationBoundingMesh!: THREE.Mesh;
    detonationDamageRadius: number = 3;

    bulletMesh!: THREE.Mesh;

    
	private readonly velocity = new THREE.Vector3();  
    public getVelocity(): THREE.Vector3 {
        return this.velocity;
    }  

	private isDead: boolean = false;

    isDetonated: boolean = false;

    private maxLifespanInSeconds: number = 3;

    //private expiryTimer: THREE.Clock;
    private maxDetonationLifetimeInSeconds: number = 0.75;
    private maxDetonationCooldownTimeInSeconds: number = 0.05;    
    private detonationClock: THREE.Clock  = new THREE.Clock(false);
    private detonationLifetimeClock: THREE.Clock  = new THREE.Clock(false);

    constructor(scene: THREE.Scene,
        isDebug: boolean,
        playerId: string,
        projectileType: ProjectileType,
        radius: number,
        position: THREE.Vector3,
        launchVector: THREE.Vector3,
        quaternion: THREE.Quaternion,
        projectileSpeed: number,
        lightColor: THREE.Color,
        
        particleColor1: THREE.Color,
        particleColor2: THREE.Color,
        particleColor3: THREE.Color,
        particleColor4: THREE.Color,

        meshMaterial?: THREE.Material,
        //particleTexture?: THREE.Texture,
        particleMaterial?: THREE.SpriteMaterial,
        world?: CANNON.World) {
        
        super(scene, radius, position, particleColor1.getHex(), meshMaterial, world);

        this.scene = scene;
        this.isDebug = isDebug;
        
        this.playerId = playerId;
        this.projectileType = projectileType;

        this.lightColor = lightColor;
        this.particleColor1 = particleColor1;
        this.particleColor2 = particleColor2;
        this.particleColor3 = particleColor3;
        this.particleColor4 = particleColor4;

        this.group.position.set(position.x, position.y, position.z);

        let gameScene = <GameScene>scene;

        if(this.projectileType == ProjectileType.Bullet) {
                        
            //const geometry = new THREE.BoxGeometry( 2.5, 0.075, 0.050 ); 
            const geometry = new THREE.CylinderGeometry( 0.025, 0.040, 2 ); 
            //const material = new THREE.MeshBasicMaterial( {color: 0xffffff} ); 
            
            const meshMaterial = new THREE.ShaderMaterial({
                vertexShader: this.vertexShader(),
                fragmentShader: this.fragmentShader(),
                //transparent: true, // Enable transparency,
                //blending: THREE.AdditiveBlending,
                //side: THREE.DoubleSide,
                //uniforms: {
                    //time: { value: 0.0 }
                //}
            });
            
            this.bulletMesh = new THREE.Mesh( geometry, meshMaterial ); 
            this.bulletMesh.quaternion.copy(quaternion);            
            this.bulletMesh.rotateZ(3 * Math.PI / 2);

            this.group.add(this.bulletMesh);            
        }
        if(this.projectileType == ProjectileType.Airstrike) {
            this.airstrikeTarget = new Target(scene, gameScene.crosshairTexture, new THREE.Color('white'), this.group.position, 1, true);
        }
        if(this.projectileType == ProjectileType.Rocket) {

            /*
            this.pointLightObject = new PointLightObject(
                scene,
                lightColor,//new THREE.Color('white'),
                0.2, 2, 0.96, 
                new THREE.Vector3()// this.group.position
            );
            */

            if(particleMaterial != null) {
                /*
                this.particleEmitterObject = new ParticleTrailObject(
                    scene,
                    ParticleEmitterType.GlowingParticles,
                    //particleTexture,
                    particleColor1,//new THREE.Color('grey'),
                    particleColor2, //new THREE.Color(0x663399),
                    particleColor3, //new THREE.Color(0x663399),
                    particleColor4, //new THREE.Color(0x4d0099),
                    1,
                    0.0025,
                    particleMaterial
                );
                this.particleEmitterSmokeObject = new ParticleTrailObject(
                    scene,
                    ParticleEmitterType.SmokeTrail,
                    //particleTexture,
                    new THREE.Color('black'),
                    new THREE.Color('black'),
                    new THREE.Color('gray'),
                    new THREE.Color('gray'),
                    1,
                    0.0025,
                    particleMaterial
                );
                */
                this.particleEmitterObject = new ParticleTrailPointsShaderObject(
                    scene,
                    ParticleEmitterType.GlowingParticles,
                    //particleTexture,
                    particleColor1,//new THREE.Color('grey'),
                    particleColor2, //new THREE.Color(0x663399),
                    particleColor3, //new THREE.Color(0x663399),
                    particleColor4, //new THREE.Color(0x4d0099),
                    1, // number of particle
                    0.01, // TODO: max particle velocity
                    20, // initial particle size
                    0.01, // max position jitter
                    3000
                );
                /*
                this.particleEmitterObject = new ParticleTrailPointsObject(
                    scene,
                    ParticleEmitterType.GlowingParticles,
                    //particleTexture,
                    particleColor1,//new THREE.Color('grey'),
                    particleColor2, //new THREE.Color(0x663399),
                    particleColor3, //new THREE.Color(0x663399),
                    particleColor4, //new THREE.Color(0x4d0099),
                    1, // number particle
                    0.7, // velocity
                    0.1, // size
                    0.25 // max position jitter
                );
                */
                /*
                this.particleEmitterSmokeObject = new ParticleTrailPointsObject(
                    scene,
                    ParticleEmitterType.SmokeTrail,
                    //particleTexture,
                    new THREE.Color('black'),
                    new THREE.Color('black'),
                    new THREE.Color('gray'),
                    new THREE.Color('gray'),
                    1,
                    0.5
                );
                */
               /*
                this.particleEmitterSmokeObject = new ParticleTrailPointsShaderObject(
                    scene,
                    ParticleEmitterType.SmokeTrail,
                    //particleTexture,
                    new THREE.Color('gray'),
                    new THREE.Color('gray'),
                    new THREE.Color('gray'),
                    new THREE.Color('gray'),
                    1, // number of particles
                    0.5, // TODO: particle velocity
                    0.3, // initial particle size
                    0.1 // max position jitter
                );
                */
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

    detonate() {
        if(this.projectileType == ProjectileType.Airstrike && !this.detonationClock.running) {

            let gameScene = <GameScene>this.scene;

            gameScene.generateRandomExplosion(this.projectileType,
                this.airstrikeTarget.groundTargetMesh.position,
                new THREE.Color('white'),
                new THREE.Color('white'),
                new THREE.Color('yellow'),
                new THREE.Color('orange'),
                new THREE.Color('red')
            );

            var geometry = new THREE.SphereGeometry(this.detonationDamageRadius);
            var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
            this.detonationBoundingMesh = new THREE.Mesh(geometry, material);

            this.detonationBoundingMesh.position.set(
                this.airstrikeTarget.groundTargetMesh.position.x,
                this.airstrikeTarget.groundTargetMesh.position.y,
                this.airstrikeTarget.groundTargetMesh.position.z);

            if(!this.isDebug)
                this.detonationBoundingMesh.visible = false;

            this.scene.add(this.detonationBoundingMesh);
                
            //gameScene.generateSmoke(this.airstrikeTarget.groundTargetMesh.position);

            this.isDetonated = true;

            this.detonationClock.start();
            this.detonationLifetimeClock.start();
        }
    }

	kill(): void {

        super.kill();
        this.isDead = true;

        if(this.particleEmitterObject != null) {
            this.particleEmitterObject.stop();
            
        }
        if(this.particleEmitterSmokeObject != null) {
            this.particleEmitterSmokeObject.stop();
        }
        if(this.pointLightObject != null) {
            this.pointLightObject.kill();
        
        }

        this.scene.remove(this.mesh);
        Utility.disposeMesh(this.mesh);

        if(this.bulletMesh != null) {
            this.scene.remove(this.bulletMesh);
            Utility.disposeMesh(this.bulletMesh);
        }

        if(this.airstrikeTarget != null) {
            this.scene.remove(this.airstrikeTarget.groundTargetMesh);
            Utility.disposeMesh(this.airstrikeTarget.groundTargetMesh);            
        }

        if(this.detonationBoundingMesh != null) {
            this.scene.remove(this.detonationBoundingMesh);
            Utility.disposeMesh(this.detonationBoundingMesh);            
        }

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
        //let worldPosition = scene.getWorldPositionOnTerrainAndWater(this.group.position.x, this.group.position.z );        
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

        if(this.projectileType == ProjectileType.Airstrike) {
            if(this.airstrikeTarget != null) {
                let gameScene = <GameScene>this.scene;
                let groundTargetMeshLocation = this.getPosition();
                
                let positionOnTerrainAndWater = gameScene.getWorldPositionOnTerrainAndWater(groundTargetMeshLocation.x, groundTargetMeshLocation.z);

                this.airstrikeTarget.setGroundTargetMeshPosition(positionOnTerrainAndWater);//new THREE.Vector3(worldPosition.x, worldPosition.y + 1, worldPosition.z));        
                this.airstrikeTarget.rotateGroundTargetToFaceDown();

                if(this.detonationBoundingMesh != null)
                    this.detonationBoundingMesh.position.set(
                        this.airstrikeTarget.groundTargetMesh.position.x,
                        this.airstrikeTarget.groundTargetMesh.position.y,
                        this.airstrikeTarget.groundTargetMesh.position.z
                    );
            }
            
            if(this.detonationLifetimeClock.running
                //&& this.detonationClock.running
                && this.detonationLifetimeClock.getElapsedTime() >= this.maxDetonationLifetimeInSeconds) {

                this.detonationLifetimeClock.stop();
                this.detonationClock.stop();
                this.kill();
            }
            

            if(this.detonationClock.running && this.detonationClock.getElapsedTime() >= this.maxDetonationCooldownTimeInSeconds) {
                let gameScene = <GameScene>this.scene;

                // todo: account for scenario where crosshair is on top of water but explosions should happen on terrain underwater
                gameScene.generateRandomExplosion(this.projectileType,
                    this.airstrikeTarget.groundTargetMesh.position,
                    new THREE.Color('white'),
                    new THREE.Color('white'),
                    new THREE.Color('yellow'),
                    new THREE.Color('orange'),
                    new THREE.Color('red')
                );

                //gameScene.generateSmoke(this.airstrikeTarget.groundTargetMesh.position);

                this.detonationClock.start();
                //this.detonationClock.start();
            }      
        }
    }

     // Vertex shader
     vertexShader() {    
        return `
            varying vec3 vPosition;
            void main()
            {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `
    }


    // Fragment shader
    fragmentShader() {
        return `
            varying vec3 vPosition;
    
            void main() {
                float normalizedY = (vPosition.y + 0.5) / 1.0;  // Normalize x-coordinate, assuming the box width is 1.0

                vec3 color;
                
                if (normalizedY < 0.2) {
                    color = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 1.0, 0.0), normalizedY / 0.2);
                } else {
                    color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (normalizedY - 0.8) / 0.8);
                }

                gl_FragColor = vec4(color, 1.0);
    }
            `
    }
}