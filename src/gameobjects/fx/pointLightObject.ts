import * as THREE from "three";

export class PointLightObject {

    pointLight?: THREE.PointLight;
    pointLightHelper?: THREE.PointLightHelper;

    constructor(scene: THREE.Scene,
        color: THREE.Color,
        intensity: number,
        distance: number,
        decay: number,
        position: THREE.Vector3) {

        this.pointLight = new THREE.PointLight(color, intensity, distance, decay);
        this.pointLight.position.set(position.x, position.y, position.z);
        
        this.pointLight.castShadow = false;

        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight)
        this.pointLight.add(this.pointLightHelper);
        
        scene.add(this.pointLight);
    }

    getPosition() {
        return this.pointLight?.position;
    }

    // only use if pointLight is not already attached to another object
    setPosition(position: THREE.Vector3) {
        this.pointLight?.position.set(position.x, position.y, position.z);
        //this.pointLightHelper?.position.set(position.x, position.y, position.z);
    }

    update() {
        this.pointLightHelper?.update();
    }

    remove() {

        if(this.pointLight != null) {
            this.pointLight.visible = false;
            this.pointLight.remove();
        }

        if(this.pointLightHelper != null) {
            this.pointLightHelper.visible = false;
            this.pointLightHelper.remove(); 
        }
    }
}