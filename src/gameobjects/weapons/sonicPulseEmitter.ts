import * as THREE from 'three'
import { Utility } from '../../utility';

// TODO: implement me
export class SonicPulseEmitter {

    scene: THREE.Scene;
    meshes: THREE.Mesh[] = [];

    private static maxLifeTimeinMs: number = 1000;
    private growthFactor: number = 1.1;

    sonicPulseShaderMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: `
            varying vec3 vPosition;
            void main()
            {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
        fragmentShader: `
            varying vec3 vPosition;
            void main()
            {
                // Map the y position to a 0-1 range for alpha
                float alpha = 0.25 - (vPosition.y / 100.0);
                gl_FragColor = vec4(0.0, 1.0, 1.0, alpha);
            }
            `
    });
    
    constructor(scene: THREE.Scene, position: THREE.Vector3) {

        this.scene = scene;

        this.generateRingWave(0.05, position);
        this.generateRingWave(0.1, position);
        this.generateRingWave(0.2, position);
        this.generateRingWave(0.25, position);
     
        setTimeout(() => {
            this.kill();
        }, SonicPulseEmitter.maxLifeTimeinMs);
    }

    private generateRingWave(radius: number, position: THREE.Vector3): void {
        let mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, 0.5, 32, 1, true),
            this.sonicPulseShaderMaterial
        );       
        mesh.position.copy(position);       
        this.meshes.push(mesh);
        this.scene.add(mesh);
    }

    update() {
        //this.growthFactor * 0.99;
        this.meshes.forEach(mesh => {
            mesh.scale.set(mesh.scale.x * this.growthFactor, 1, mesh.scale.z *  this.growthFactor)
        });
    }

    kill() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            Utility.disposeMesh(mesh);
        });
        
    }
}