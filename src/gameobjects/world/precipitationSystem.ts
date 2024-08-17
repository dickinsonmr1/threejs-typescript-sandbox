import * as THREE from 'three';

export class PrecipitationSystem {

    private static rainCount: number = 20000;
    rainGeometry: THREE.BufferGeometry;
    private static maxY: number = 50;

    constructor(scene: THREE.Scene, textureName: string) {

        // Create an empty geometry
        this.rainGeometry = new THREE.BufferGeometry();

        // Define the number of raindrops

        // Create an array to hold the positions of the raindrops
        const positions = new Float32Array(PrecipitationSystem.rainCount * 3);

        for (let i = 0; i < PrecipitationSystem.rainCount; i++) {
            positions[i * 3] = Math.random() * 200 - 100; // x position
            positions[i * 3 + 1] = Math.random() * PrecipitationSystem.maxY; // y position
            positions[i * 3 + 2] = Math.random() * 200 - 100; // z position
        }

        // Set the positions as the attribute of the geometry
        this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;

        sprite.wrapS = THREE.ClampToEdgeWrapping;
        sprite.wrapT = THREE.ClampToEdgeWrapping;
        sprite.repeat.set(1, 1); // Ensure texture isn't repeated

        const rainMaterial = new THREE.PointsMaterial({
            //color: 0xaaaaaa,  // Gray color for raindrops
            //size: 0.3,        // Size of each raindrop
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            map: sprite,
            depthWrite: false,
            sizeAttenuation: true
        });

        const rain = new THREE.Points(this.rainGeometry, rainMaterial);
        scene.add(rain);
    }

    animateRain(): void {
        const positions = this.rainGeometry.attributes.position.array as Float32Array;
    
        for (let i = 0; i < PrecipitationSystem.rainCount; i++) {
            positions[i * 3 + 1] -= 0.5; // Move raindrop down
    
            // Reset position if it falls below a certain point
            if (positions[i * 3 + 1] < -0) {
                positions[i * 3 + 1] = PrecipitationSystem.maxY;
            }
        }
    
        // Need to update the geometry attribute
        this.rainGeometry.attributes.position.needsUpdate = true;
    }
}