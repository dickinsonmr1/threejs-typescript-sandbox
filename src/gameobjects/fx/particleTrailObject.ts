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

    startColor: THREE.Color;
    lerpColor1: THREE.Color;
    lerpColor2: THREE.Color;
    lerpColor3: THREE.Color;

    position!: THREE.Vector3;
    emitPosition!: THREE.Vector3;

    numberParticles: number;
    velocity: number;

    isDead: boolean = false;
    isEmitting: boolean = true;

    // tutorial from here: https://www.youtube.com/watch?v=DtRFv9_XfnE

    constructor(scene: THREE.Scene,
        type: ParticleEmitterType,
        particleTexture: THREE.Texture,
        startColor: THREE.Color,
        lerpColor1: THREE.Color,
        lerpColor2: THREE.Color,
        lerpColor3: THREE.Color,
        numberParticles: number,
        velocity: number) {
                  
        super();

        this.scene = scene;
        this.type = type;
        this.particleGroup = new THREE.Group();
        this.particleTexture = particleTexture;
        this.startColor = startColor;
        this.lerpColor1 = lerpColor1;
        this.lerpColor2 = lerpColor2;
        this.lerpColor3 = lerpColor3;
        //this.position = position;
        this.numberParticles = numberParticles;
        this.velocity = velocity;

        this.isEmitting = true;
       
        this.particleGroup.position.set(0,0,0);//position.x, position.y, position.z);
        this.emitPosition = this.particleGroup.position;

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
        return this.startColor;
    }

    setEmitPosition(position: THREE.Vector3): void {
        this.emitPosition = position;
    }
    setEmitQuaternion(quaternion: THREE.Quaternion): void {
        // TODO: always aim particles directly behind vehicle
    }

    setPosition(position: THREE.Vector3): void {
        throw new Error("Method not implemented.");
    }
    setQuaternion(quaternion: THREE.Quaternion): void {
        throw new Error("Method not implemented.");
    }

    private emitParticles(emitPosition: THREE.Vector3) {

        let newEmitColor = this.startColor.clone();// new THREE.Color('white');
        
        for(let i = 0; i < this.numberParticles; i++) {
            let particleMaterial = new THREE.SpriteMaterial({
                map: this.particleTexture,
                depthTest: true
            });

            let sprite = new THREE.Sprite(particleMaterial);
            let spriteScale = 1;
            switch(this.type) {
                case ParticleEmitterType.SmokeTrail:
                case ParticleEmitterType.SmokeEmit:
                    sprite.material.blending = THREE.NormalBlending;
                    spriteScale = Math.random() * 0.1 + 0.1;

                    sprite.userData.velocity = new THREE.Vector3(
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2
                    );
                    sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 1);
                    break;
                case ParticleEmitterType.GlowingParticles:
                default:
                    sprite.material.blending = THREE.AdditiveBlending;
                    spriteScale = 0.33;

                    sprite.userData.velocity = new THREE.Vector3(
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2
                    );
                    sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);
                    break;
            }            
            
            sprite.userData.velocity = new THREE.Vector3(
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2
            );
            sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);

            sprite.material.color = newEmitColor;

            sprite.material.opacity = Math.random() * 0.2 + 0.6;

            
            sprite.scale.set(spriteScale, spriteScale, spriteScale);

            sprite.position.set(emitPosition.x, emitPosition.y, emitPosition.z);

            this.particleGroup.add(sprite);
        }
    }

    stop(): void {
        this.isEmitting = false;

        setTimeout(() => {
            this.isDead = true;
        }, this.type == ParticleEmitterType.GlowingParticles ? 3000 : 3000);
    }

    pause(): void {
        this.isEmitting = false;        
    }

    resume(): void {
        this.isEmitting = true;        
    }

    update() {

        if(this.isDead) {
            this.kill();
            return;
        }

        if(this.isEmitting) {
            this.emitParticles(this.emitPosition);
        }

        this.particleGroup.children.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            
            
            switch(this.type) {
                case ParticleEmitterType.SmokeTrail:
                case ParticleEmitterType.SmokeEmit:
                    item.material.opacity -= 0.008;
                    item.scale.x *= 1.02;
                    item.scale.y *= 1.02;
                    item.scale.z *= 1.02;        
                    break;
                default:
                    item.material.opacity -= 0.01;
                    item.scale.x *= 0.98;
                    item.scale.y *= 0.98;
                    item.scale.z *= 0.98;        
                    break;
            }       

            const color1 = item.material.color;
            item.material.color.copy(color1);      
            
            //THREE.MathUtils.lerp
            if(item.material.opacity < 0.98 && item.material.opacity >= 0.80)      
                item.material.color.lerp(this.lerpColor1, 0.5);
            else if(item.material.opacity < 0.80 && item.material.opacity >= 0.50)      
                item.material.color.lerp(this.lerpColor2, 0.5);
            else if(item.material.opacity < 0.50)
                item.material.color.lerp(this.lerpColor3, 0.5);
        });

        this.particleGroup.children = this.particleGroup.children
            .filter((child) => {
                let item = <THREE.Sprite>child;
                return item.material.opacity > 0.0;// && item.scale.x > 0;
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