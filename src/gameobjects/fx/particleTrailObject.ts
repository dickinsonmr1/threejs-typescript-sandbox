import * as THREE from "three";
import { ParticleEmitter } from "./particleEmitter";

export enum ParticleEmitterType {    
    SmokeTrail,
    SmokeEmit,
    GlowingParticles
}

export class ParticleTrailObject extends ParticleEmitter { 
    scene: THREE.Scene;
    type: ParticleEmitterType;
    particleGroup: THREE.Group;
    particleTexture: THREE.Texture;
    color: THREE.Color;
    position!: THREE.Vector3;
    emitPosition!: THREE.Vector3;

    numberParticles: number;
    maxParticles: number;
    velocity: number;

    isDead: boolean = false;
    isEmitting: boolean = true;

    // tutorial from here: https://www.youtube.com/watch?v=DtRFv9_XfnE

    constructor(scene: THREE.Scene,
        type: ParticleEmitterType,
        particleTexture: THREE.Texture,
        color: THREE.Color,
        position: THREE.Vector3,
        numberParticles: number,
        maxParticles: number,
        velocity: number) {
                  
        super();

        this.scene = scene;
        this.type = type;
        this.particleGroup = new THREE.Group();
        this.particleTexture = particleTexture;
        this.color = color;
        //this.position = position;
        this.numberParticles = numberParticles;
        this.maxParticles = maxParticles;
        this.velocity = velocity;

        this.isEmitting = true;
       
        this.particleGroup.position.set(0,0,0);//position.x, position.y, position.z);

        /*
        this.particleGroup.position.set(
            Math.random() * 20 - 10,
            Math.random() * 5 + 3,
            Math.random() * 10 - 5);
        */

        this.scene.add(this.particleGroup);
    }

    getPosition(): THREE.Vector3 {
        return this.particleGroup.position;
    }

    getColor(): THREE.Color {
        return this.color;
    }

    setEmitPosition(position: THREE.Vector3): void {
        this.emitPosition = position;
    }

    setPosition(position: THREE.Vector3): void {
        throw new Error("Method not implemented.");
    }
    setQuaternion(quaternion: THREE.Quaternion): void {
        throw new Error("Method not implemented.");
    }

    private emitParticles(emitPosition: THREE.Vector3, color: THREE.Color) {
        for(let i = 0; i < this.numberParticles; i++) {
            let particleMaterial = new THREE.SpriteMaterial({
                map: this.particleTexture,
                depthTest: true
            });

            let sprite = new THREE.Sprite(particleMaterial);

            switch(this.type) {
                case ParticleEmitterType.SmokeTrail:
                case ParticleEmitterType.SmokeEmit:
                    sprite.material.blending = THREE.NormalBlending;
                    break;
                default:
                    sprite.material.blending = THREE.AdditiveBlending;
                    break;
            }            
            
            sprite.userData.velocity = new THREE.Vector3(
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2
            );
            sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);

            sprite.material.color = color;

            sprite.material.opacity = Math.random() * 0.2 + 0.6;

            let size = 0.1;//Math.random() * 0.1 + 0.1;
            sprite.scale.set(size, size, size);

            sprite.position.set(emitPosition.x, emitPosition.y, emitPosition.z);

            this.particleGroup.add(sprite);
        }
    }

    stop(): void {
        this.isEmitting = false;

        setTimeout(() => {
            this.isDead = true;
        }, 1000);
    }

    update() {

        if(this.isDead) {
            this.kill();
            return;
        }

        if(this.isEmitting) {
            this.emitParticles(this.emitPosition, this.color);
        }

        this.particleGroup.children.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            item.material.opacity -= 0.03;
            
            let scaleFactor = 0.015;
            let scale = new THREE.Vector3(item.scale.x + scaleFactor, item.scale.y + scaleFactor, item.scale.z + scaleFactor);
            item.scale.set(scale.x, scale.y, scale.z);
        });

        this.particleGroup.children = this.particleGroup.children
            .filter((child) => {
                let item = <THREE.Sprite>child;
                return item.material.opacity > 0.0;
            });       

        //if(this.particleGroup.children.length === 0) {
            //this.isActive = false;
        //} 
    }

    kill(): void {
        this.isDead = true;

        this.particleGroup.children = this.particleGroup.children
        .filter((child) => {
            let item = <THREE.Sprite>child;
            //item.remove();
            this.particleGroup.remove(item);
        });   

        this.scene.remove(this.particleGroup);
    }
}