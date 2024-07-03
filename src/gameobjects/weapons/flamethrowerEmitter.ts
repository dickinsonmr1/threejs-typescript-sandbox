import * as THREE from "three";
import { PointLightObject } from "../fx/pointLightObject";
import { Utility } from "../../utility";

export class FlamethrowerEmitter {

    scene: THREE.Scene;
    playerId: string;

    colors = [
        new THREE.Color(0xff0000),
        new THREE.Color(0xffff00),
        new THREE.Color(0x00ff00),
        new THREE.Color(0x0000ff)
      ];

    particleGroup: THREE.Group;
    sprites: THREE.Sprite[] = [];

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
        playerId: string,
        particleTexture: THREE.Texture,
        lightColor: THREE.Color,
        particleColor: THREE.Color,
        position: THREE.Vector3,
        numberParticles: number) {

        this.scene = scene;
        this.playerId = playerId;
                    
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
                depthTest: true,
                depthWrite: true
            });

            let sprite = new THREE.Sprite(particleMaterial);
            sprite.material.blending = THREE.AdditiveBlending;
            
            let forwardVector = new THREE.Vector3(-0.1, 0, 0);
            forwardVector.applyQuaternion(this.particleGroup.quaternion);

            sprite.userData.velocity = forwardVector;//new THREE.Vector3(-0.1, 0, 0);
                
            sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);

            sprite.material.color = new THREE.Color('yellow');//  this.particleColor.lerp(new THREE.Color('red'), 0.05);

            sprite.material.opacity = Math.random() * 0.2 + 0.8;

            let size = Math.random() * 0.1 + 0.5;
            sprite.scale.set(size, size, size);

            sprite.position.set(this.particleGroup.position.x, this.particleGroup.position.y, this.particleGroup.position.z);
            //sprite.quaternion.copy(this.particleGroup.quaternion);
                
            sprite.position.x += Math.random() * 0.1 - 0.05;
            sprite.position.y += Math.random() * 0.1 - 0.05;
            sprite.position.z += Math.random() * 0.1 - 0.05;
            sprite.rotation.setFromVector3(new THREE.Vector3(
                Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI));

            this.sprites.push(sprite);

            // adding the sprite directly to the scene because each particle is independent of a parent group
            this.scene.add(sprite);
            //this.particleGroup.add(sprite);
        }

    }

    getPosition(): THREE.Vector3 {
        return this.particleGroup.position;
    }

    setPosition(position: THREE.Vector3): void {
        this.particleGroup.position.set(position.x, position.y, position.z);
    }

    setQuaternion(quaternion: THREE.Quaternion): void {

        //let forwardVector = new THREE.Vector3(-2, 0, 0);
        //forwardVector.applyQuaternion(quaternion);

        this.particleGroup.quaternion.copy(quaternion);
    }

    emitParticles(): void {
        this.addParticles();
    }

    update() {        
        //this.particleGroup.children.forEach((child) => {
        this.sprites.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            item.material.opacity -= 0.03;
            item.scale.x *= 1.05;
            item.scale.y *= 1.05;
            item.scale.z *= 1.05;
            
            const color1 = item.material.color;
            item.material.color.copy(color1);            
            item.material.color.lerp(new THREE.Color('red'), 0.1);

            if(item.material.opacity <= 0) {
                this.scene.remove(item);

                Utility.disposeSprite(item);
                //item.material.dispose();
                //item.geometry.dispose();                
            }

            //const alpha1 = item.material.opacity;
            //item.material.opacitycopy(alpha1);
            //item.material.opacity.lerp(0, 0.03);
            //THREE.linear

            //item.material.color = item.material.color.lerpColors(new THREE.Color('yellow'), new THREE.Color('red'), 0.1);
        });

        //this.particleGroup.children = this.particleGroup.children
        this.sprites = this.sprites
            .filter((child) => {
                let item = <THREE.Sprite>child;
                return item.material.opacity > 0.0;
            });       
                    
        //if(this.pointLightObject && this.pointLightObject.pointLight)
            //this.pointLightObject.pointLight.intensity *= 0.95;

        this.particleColor.copy(this.particleColor).lerp(new THREE.Color('red'), 0.1);
        //if(this.particleGroup.children.length === 0) {
        if(this.sprites.length === 0) {
            this.isActive = false;

            //this.pointLightObject?.remove();
        } 
        else {
            //this.pointLightObject?.update();
        }
    }
    // https://jsfiddle.net/rnuL051z/

    stop() {
        // todo: implement
    }
}