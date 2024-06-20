import * as THREE from "three";
import { ParticleEmitter } from "./particleEmitter";
import { ParticleEmitterType } from "./particleTrailObject";
/*
TODO: rewrite using BufferGeometry and PointsMaterial
*/

export class ParticleTrailPointsObject extends ParticleEmitter { 
    scene: THREE.Scene;
    type: ParticleEmitterType;
    particleGroup: THREE.Group;

    particles: THREE.BufferGeometry;
    particleSystem!: THREE.Points;

    startColor: THREE.Color;
    lerpColor1: THREE.Color;
    lerpColor2: THREE.Color;
    lerpColor3: THREE.Color;

    position!: THREE.Vector3;
    emitPosition!: THREE.Vector3;

    numberParticles: number;
    velocity: number;

    isDead: boolean = false;
    isEmitting: boolean = true;

    particleMaterial: THREE.SpriteMaterial;

    // tutorial from here: https://www.youtube.com/watch?v=DtRFv9_XfnE

    constructor(scene: THREE.Scene,
        type: ParticleEmitterType,
        //particleTexture: THREE.Texture,
        startColor: THREE.Color,
        lerpColor1: THREE.Color,
        lerpColor2: THREE.Color,
        lerpColor3: THREE.Color,
        numberParticles: number,
        velocity: number,
        particleMaterial: THREE.SpriteMaterial,
        maxParticleCount: number) {
                  
        super();

        this.scene = scene;
        this.type = type;
        this.particleGroup = new THREE.Group();
        //this.particleTexture = particleTexture;
        this.startColor = startColor;
        this.lerpColor1 = lerpColor1;
        this.lerpColor2 = lerpColor2;
        this.lerpColor3 = lerpColor3;
        //this.position = position;
        this.numberParticles = numberParticles;
        this.velocity = velocity;
        this.particleMaterial = particleMaterial;

        this.isEmitting = true;
       
        this.particleGroup.position.set(0,0,0);//position.x, position.y, position.z);
        this.emitPosition = this.particleGroup.position;

        /*
        this.particleGroup.position.set(
            Math.random() * 20 - 10,
            Math.random() * 5 + 3,
            Math.random() * 10 - 5);
        */

        this.particles = new THREE.BufferGeometry();
        const positions = new Float32Array(maxParticleCount * 3);
        const velocities = new Float32Array(maxParticleCount * 3);

        this.scene.add(this.particleGroup);
    }

    getPosition(): THREE.Vector3 {
        return this.particleGroup.position;
    }

    getColor(): THREE.Color {
        return this.startColor;
    }

    setEmitPosition(position: THREE.Vector3): void {
        this.emitPosition = position;
    }
    setEmitQuaternion(quaternion: THREE.Quaternion): void {
        // TODO: always aim particles directly behind vehicle
    }

    setPosition(position: THREE.Vector3): void {
        throw new Error("Method not implemented.");
    }
    setQuaternion(quaternion: THREE.Quaternion): void {
        throw new Error("Method not implemented.");
    }

    private emitParticles(emitPosition: THREE.Vector3) {

        let newEmitColor = this.startColor.clone();// new THREE.Color('white');
        
        for(let i = 0; i < this.numberParticles; i++) {            

            let sprite = new THREE.Sprite(this.particleMaterial.clone());
            let spriteScale = 1;
            switch(this.type) {
                case ParticleEmitterType.SmokeTrail:
                case ParticleEmitterType.SmokeEmit:
                    sprite.material.blending = THREE.NormalBlending;
                    spriteScale = Math.random() * 0.1 + 0.1;

                    sprite.userData.velocity = new THREE.Vector3(
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2
                    );
                    sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 1);
                    break;
                case ParticleEmitterType.GlowingParticles:
                default:
                    sprite.material.blending = THREE.AdditiveBlending;
                    spriteScale = 0.33;

                    sprite.userData.velocity = new THREE.Vector3(
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2
                    );
                    sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);
                    break;
            }            
            
            sprite.userData.velocity = new THREE.Vector3(
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2,
                Math.random() * this.velocity - this.velocity / 2
            );
            sprite.userData.velocity.multiplyScalar(Math.random() * Math.random() * 3 + 2);

            sprite.material.color = newEmitColor;

            sprite.material.opacity = Math.random() * 0.2 + 0.6;

            
            sprite.scale.set(spriteScale, spriteScale, spriteScale);

            sprite.position.set(emitPosition.x, emitPosition.y, emitPosition.z);

            this.particleGroup.add(sprite);
        }
    }

    stop(): void {
        this.isEmitting = false;

        setTimeout(() => {
            this.isDead = true;
        }, this.type == ParticleEmitterType.GlowingParticles ? 3000 : 3000);
    }

    pause(): void {
        this.isEmitting = false;        
    }

    resume(): void {
        this.isEmitting = true;        
    }

    update() {

        if(this.isDead) {
            this.kill();
            return;
        }

        if(this.isEmitting) {
            this.emitParticles(this.emitPosition);
        }

        this.particleGroup.children.forEach((child) => {
            let item = <THREE.Sprite>child;

            item.position.add(child.userData.velocity);
            
            
            switch(this.type) {
                case ParticleEmitterType.SmokeTrail:
                case ParticleEmitterType.SmokeEmit:
                    item.material.opacity -= 0.008;
                    item.scale.x *= 1.02;
                    item.scale.y *= 1.02;
                    item.scale.z *= 1.02;        
                    break;
                default:
                    item.material.opacity -= 0.01;
                    item.scale.x *= 0.98;
                    item.scale.y *= 0.98;
                    item.scale.z *= 0.98;        
                    break;
            }       

            const color1 = item.material.color;
            item.material.color.copy(color1);      
            
            //THREE.MathUtils.lerp
            if(item.material.opacity < 0.98 && item.material.opacity >= 0.80)      
                item.material.color.lerp(this.lerpColor1, 0.5);
            else if(item.material.opacity < 0.80 && item.material.opacity >= 0.50)      
                item.material.color.lerp(this.lerpColor2, 0.5);
            else if(item.material.opacity < 0.50)
                item.material.color.lerp(this.lerpColor3, 0.5);
        });

        this.particleGroup.children = this.particleGroup.children
            .filter((child) => {
                let item = <THREE.Sprite>child;
                return item.material.opacity > 0.0;// && item.scale.x > 0;
            });       

        //if(this.particleGroup.children.length === 0) {
            //this.isActive = false;
        //} 
    }

    kill(): void {
        this.isDead = true;

        this.particleGroup.children = this.particleGroup.children
        .filter((child) => {
            let item = <THREE.Sprite>child;
            //item.remove();
            this.particleGroup.remove(item);
        });   

        this.scene.remove(this.particleGroup);
    }
}

/*
// example from ChatGPT:
// question: using three.js, create a particle emitter using PointsMaterial
that adds one particle at a time and removes particle after 5 seconds

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Three.js Particle Emitter</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Basic Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Particle setup
        let particleCount = 0;
        const positions = [];
        const velocities = [];
        const lifetimes = [];
        const maxLifetime = 5 * 1000; // 5 seconds in milliseconds

        // Geometry and Material
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        camera.position.z = 5;

        // Function to add a new particle
        function addParticle() {
            const x = (Math.random() - 0.5) * 2;
            const y = (Math.random() - 0.5) * 2;
            const z = (Math.random() - 0.5) * 2;

            positions.push(x, y, z);
            velocities.push((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);
            lifetimes.push(Date.now());

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        }

        // Add particles at regular intervals
        setInterval(addParticle, 100); // Add a particle every 100ms

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            const currentTime = Date.now();
            const positionsArray = geometry.attributes.position.array;
            const velocitiesArray = geometry.attributes.velocity.array;

            for (let i = particleCount - 1; i >= 0; i--) {
                const lifetime = currentTime - lifetimes[i];
                if (lifetime > maxLifetime) {
                    // Remove particle by swapping it with the last one
                    positionsArray[i * 3] = positionsArray[(particleCount - 1) * 3];
                    positionsArray[i * 3 + 1] = positionsArray[(particleCount - 1) * 3 + 1];
                    positionsArray[i * 3 + 2] = positionsArray[(particleCount - 1) * 3 + 2];

                    velocitiesArray[i * 3] = velocitiesArray[(particleCount - 1) * 3];
                    velocitiesArray[i * 3 + 1] = velocitiesArray[(particleCount - 1) * 3 + 1];
                    velocitiesArray[i * 3 + 2] = velocitiesArray[(particleCount - 1) * 3 + 2];

                    lifetimes[i] = lifetimes[particleCount - 1];

                    particleCount--;
                    positions.length = particleCount * 3;
                    velocities.length = particleCount * 3;
                    lifetimes.length = particleCount;

                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
                } else {
                    positionsArray[i * 3] += velocitiesArray[i * 3];
                    positionsArray[i * 3 + 1] += velocitiesArray[i * 3 + 1];
                    positionsArray[i * 3 + 2] += velocitiesArray[i * 3 + 2];
                }
            }

            geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        animate();
    </script>
</body>
</html>

*/