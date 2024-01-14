import * as THREE from "three";
import { PointLightObject } from "./pointLightObject";

export class ExplosionObject {

    particleGroup: THREE.Group;
    particleTexture: THREE.Texture;
    lightColor: THREE.Color;
    particleColor: THREE.Color;
    position: THREE.Vector3;
    numberParticles: number;
    velocity: number;
    isActive: boolean;

    pointLightObject?: PointLightObject;

    // tutorial from here: https://www.youtube.com/watch?v=DtRFv9_XfnE

    constructor(scene: THREE.Scene,
        particleTexture: THREE.Texture,
        lightColor: THREE.Color,
        particleColor: THREE.Color,
        position: THREE.Vector3,
        numberParticles: number,
        velocity: number) {
                    
        this.particleGroup = new THREE.Group();
        this.particleTexture = particleTexture;
        this.lightColor = lightColor;
        this.particleColor = particleColor;
        this.position = position;
        this.numberParticles = numberParticles;
        this.velocity = velocity;

        this.isActive = true;

        for(let i = 0; i < numberParticles; i++) {
            let particleMaterial = new THREE.SpriteMaterial({
                map: this.particleTexture,
                depthTest: true
            });

            let sprite = new THREE.Sprite(particleMaterial);
            sprite.material.blending = THREE.AdditiveBlending;
            
            sprite.userData.velocity = new THREE.Vector3(
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2
            );
            sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);

            sprite.material.color = particleColor;

            sprite.material.opacity = Math.random() * 0.2 + 0.8;

            let size = Math.random() * 0.1 + 0.1;
            sprite.scale.set(size, size, size);

            this.particleGroup.add(sprite);
        }

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
    }

    getPosition() {
        return null;
    }

    setPosition(position: THREE.Vector3) {
        this.particleGroup.position.set(position.x, position.y, position.z);
    }

    update() {
        this.particleGroup.children.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            item.material.opacity -= 0.02
        });

        this.particleGroup.children = this.particleGroup.children
            .filter((child) => {
                let item = <THREE.Sprite>child;
                return item.material.opacity > 0.0;
            });       
                    
        if(this.pointLightObject && this.pointLightObject.pointLight)
            this.pointLightObject.pointLight.intensity *= 0.95;

        if(this.particleGroup.children.length === 0) {
            this.isActive = false;
            this.pointLightObject?.remove();
        } 
        else {
            this.pointLightObject?.update();
        }

    }
}