import * as THREE from "three";

export class RainShaderParticleEmitter {
    /**
     *
     */

    uniforms = {
        time: { value: 0.0 }
    };

    private particleSystem: THREE.Points;

    constructor(scene: THREE.Scene) {
        
        const particleCount = 10000;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = Math.random() * 100;   // x
            positions[i * 3 + 1] = Math.random() * 100; // y
            positions[i * 3 + 2] = Math.random() * 100; // z
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: false
        });

        this.particleSystem = new THREE.Points(particleGeometry, shaderMaterial);
        scene.add(this.particleSystem);
    }

    update() {
        this.uniforms.time.value += 0.05;
        for (let i = this.particleSystem.children.length - 1; i >= 0; i--) {
            //this.particleSystem.children[i].
        }    
    }

    vertexShader() {
        return `
            uniform float time;
            attribute vec3 position;
            varying vec3 vColor;

            void main() {
                vec3 pos = position;
                pos.y -= mod(time + position.y, 10.0);
                vColor = vec3(0.1, 0.2, 1.0); // Blue color for raindrops
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 5.0;
            }
        `
    }

    fragmentShader() {
        return `
            varying vec3 vColor;

            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }
        `
    }
}