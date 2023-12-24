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
        
        this.pointLight.castShadow = true;

        this.pointLight.shadow.camera.near = 0.5;
        this.pointLight.shadow.camera.far = 20;
        this.pointLight.shadow.camera.fov = 0;

        // spotlight.shadow.bias = -0.0001
        this.pointLight.shadow.mapSize.width = 128;
        this.pointLight.shadow.mapSize.height = 128;
        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight)
        this.pointLight.add(this.pointLightHelper);
        
        scene.add(this.pointLight);
    }

    getPosition() {
        return this.pointLight?.position;
    }

    setPosition(position: THREE.Vector3) {
        this.pointLight?.position.set(position.x, position.y, position.z);
    }

    update() {
        this.pointLightHelper?.update();
    }
}