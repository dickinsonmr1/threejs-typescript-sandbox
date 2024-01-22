import * as THREE from "three";
import { PointLightObject } from "./pointLightObject";

export class FireObject {

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
        numberParticles: number) {
                    
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

            sprite.material.color = this.particleColor;

            sprite.material.opacity = Math.random() * 0.2 + 0.8;

            let size = Math.random() * 0.1 + 0.5;
            sprite.scale.set(size, size, size);
            sprite.position.x += Math.random() * 0.2 - 0.2;
            sprite.position.z += Math.random() * 0.2 - 0.2;

            this.particleGroup.add(sprite);
        }

    }

    getPosition() {
        return null;
    }

    setPosition(position: THREE.Vector3) {
        this.particleGroup.position.set(position.x, position.y, position.z);
    }

    update() {
        this.addParticles();

        this.particleGroup.children.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            item.material.opacity -= 0.03;
            item.scale.x *= 0.95;
            item.scale.y *= 0.95;
            item.scale.z *= 0.95;
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
}