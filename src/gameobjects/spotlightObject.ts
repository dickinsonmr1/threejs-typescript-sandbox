import * as THREE from "three";

export class SpotlightObject {

    spotlight?: THREE.SpotLight;
    spotlightHelper?: THREE.SpotLightHelper;

    constructor(scene: THREE.Scene,
        color: THREE.Color,
        intensity: number,
        distance: number,
        angle: number,
        penumbra: number,
        decay: number,
        position: THREE.Vector3,
        target?: THREE.Object3D) {

        this.spotlight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        this.spotlight.position.set(position.x, position.y, position.z);
        
        if(target != null)
            this.spotlight.target = target;

        this.spotlight.castShadow = true;

        this.spotlight.shadow.camera.near = 0.5;
        this.spotlight.shadow.camera.far = 20;
        this.spotlight.shadow.camera.fov = 0;

        // spotlight.shadow.bias = -0.0001
        this.spotlight.shadow.mapSize.width = 128;
        this.spotlight.shadow.mapSize.height = 128;
        this.spotlightHelper = new THREE.SpotLightHelper(this.spotlight)
        this.spotlight.add(this.spotlightHelper);
        
        scene.add(this.spotlight);
    }

    getPosition() {
        return this.spotlight?.position;
    }

    setPosition(position: THREE.Vector3) {
        this.spotlight?.position.set(position.x, position.y, position.z);
    }

    update() {
        this.spotlightHelper?.update();
    }
}