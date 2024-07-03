import * as THREE from "three";
import { PointLightObject } from "./pointLightObject";
import { ParticleEmitter } from "./particleEmitter";
import { Utility } from "../../utility";

export class FireObject extends ParticleEmitter {
        
    pause(): void {
        throw new Error("Method not implemented.");
    }
    resume(): void {
        throw new Error("Method not implemented.");
    }
    setEmitPosition(position: THREE.Vector3): void {
        throw new Error("Method not implemented.");
    }

    scene: THREE.Scene;
    particleGroup: THREE.Group;
    particleTexture: THREE.Texture;
    lightColor: THREE.Color;
    particleColor: THREE.Color;
    position: THREE.Vector3;

    numberParticles: number;

    velocity: number;
    isActive: boolean;

    pointLightObject?: PointLightObject;

    isEmitting: boolean = true;
    isDead: boolean = false;

    // tutorial from here: https://www.youtube.com/watch?v=DtRFv9_XfnE

    constructor(scene: THREE.Scene,
        particleTexture: THREE.Texture,
        lightColor: THREE.Color,
        particleColor: THREE.Color,
        position: THREE.Vector3,
        numberParticles: number) {
                    
        super();
        
        this.scene = scene;
        this.particleGroup = new THREE.Group();
        this.particleTexture = particleTexture;
        this.lightColor = lightColor;
        this.particleColor = particleColor;
        this.position = position;
        this.numberParticles = numberParticles;
        this.velocity = 0.05;

        this.isActive = true;

        this.numberParticles = numberParticles;
        this.particleColor = particleColor;

        this.addParticles();

        this.particleGroup.position.set(position.x, position.y, position.z);

        //this.pointLightObject = new PointLightObject(scene,
            //lightColor, 0.1, 2, 0.5, position);
        /*
        this.particleGroup.position.set(
            Math.random() * 20 - 10,
            Math.random() * 5 + 3,
            Math.random() * 10 - 5);
        */
       //if(this.pointLightObject.pointLight)
            //this.particleGroup.add(this.pointLightObject.pointLight)

        scene.add(this.particleGroup);     
        
        setTimeout(() => {
            this.isEmitting = false
        }, 3000);        
    }


    private addParticles(): void {
        for(let i = 0; i < this.numberParticles; i++) {
            let particleMaterial = new THREE.SpriteMaterial({
                map: this.particleTexture,
                depthTest: true
            });

            let sprite = new THREE.Sprite(particleMaterial);
            sprite.material.blending = THREE.AdditiveBlending;
            
            sprite.userData.velocity = new THREE.Vector3(
                0, //Math.random() * 0.2 - 0.1, //this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2,
                0, //Math.random() * 0.2 - 0.1, //this.velocity - this.velocity / 2
            );
            sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);

            sprite.material.color =  new THREE.Color('white'); //this.particleColor;

            sprite.material.opacity = Math.random() * 0.2 + 0.8;

            let size = Math.random() * 0.1 + 0.5;
            sprite.scale.set(size, size, size);
            sprite.position.x += Math.random() * 0.5 - 0.25;
            sprite.position.z += Math.random() * 0.5 - 0.25;
            sprite.rotation.setFromVector3(new THREE.Vector3(
                Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI,));

            this.particleGroup.add(sprite);
        }

    }

    getPosition(): THREE.Vector3 {
        return this.particleGroup.position;
    }

    setPosition(position: THREE.Vector3): void {
        this.particleGroup.position.set(position.x, position.y, position.z);
    }

    setQuaternion(quaternion: THREE.Quaternion): void {
        
    }

    kill() {
        this.scene.remove(this.particleGroup);
    }

    update(): void {

        if(this.isDead) {
            this.kill();
            return;
        }

        if(!this.isEmitting) {
            setTimeout(() => {
                this.isDead = true
            }, 1000);        
        }

        if(this.isEmitting) {
            this.addParticles();
        }
        
        this.particleGroup.children.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            item.material.opacity -= 0.03;
            item.scale.x *= 0.95;
            item.scale.y *= 0.95;
            item.scale.z *= 0.95;

            const color1 = item.material.color;
            item.material.color.copy(color1);      
            
            //THREE.MathUtils.lerp
            if(item.material.opacity < 0.98 && item.material.opacity >= 0.80)      
                item.material.color.lerp(new THREE.Color('yellow'), 0.5);
            else if(item.material.opacity < 0.80 && item.material.opacity >= 0.50)      
                item.material.color.lerp(new THREE.Color('orange'), 0.5);
            else if(item.material.opacity < 0.50)
                item.material.color.lerp(new THREE.Color('red'), 0.5);

            if(item.material.opacity <= 0) {
                this.scene.remove(item);

                Utility.disposeSprite(item);
                //item.material.dispose();
                //item.geometry.dispose();                
            }
            //todo: investigate: THREE.MathUtils.lerp
        });

        this.particleGroup.children = this.particleGroup.children
            .filter((child) => {
                let item = <THREE.Sprite>child;
                return item.material.opacity > 0.0;
            });       
                    
        //if(this.pointLightObject && this.pointLightObject.pointLight)
            //this.pointLightObject.pointLight.intensity *= 0.95;

        if(this.particleGroup.children.length === 0) {
            this.isActive = false;
            //this.pointLightObject?.remove();
        } 
        else {
            //this.pointLightObject?.update();
        }
    }

    stop() {
        // todo: implement
    }

    getParticleCount(): number {
        return this.particleGroup.children.length;
    }
}