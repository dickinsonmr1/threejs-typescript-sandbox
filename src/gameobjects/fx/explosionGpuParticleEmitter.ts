import * as THREE from 'three'
import { ParticleEmitter } from './particleEmitter';

export class ExplosionGpuParticleEmitter extends ParticleEmitter {
    
    isEmitting: boolean = true;
    isDead!: boolean;
    particleGroup!: THREE.Group<THREE.Object3DEventMap>;
    scene: THREE.Scene;

    /**
     *
     */

    private fireParticles: THREE.Points;
    private fireParticleMaterial!: THREE.ShaderMaterial;

    private emitPosition: THREE.Vector3 = new THREE.Vector3(0,0,0);

    constructor(scene: THREE.Scene, clock: THREE.Clock, particleCount: number, maxVelocity: number, maxEmitterLifeTimeInMs: number, position: THREE.Vector3) {

        super();

        this.scene = scene;

        this.emitPosition = new THREE.Vector3(0,0,0);

        this.fireParticles = this.createFireParticles(particleCount, maxVelocity, position, clock);
        scene.add(this.fireParticles);

        setTimeout(() => {
            this.isEmitting = false
        }, maxEmitterLifeTimeInMs);     
    }    

    private createFireParticles(particleCount: number, maxVelocity: number, position: THREE.Vector3, clock: THREE.Clock): THREE.Points {
        // Create particle attributes
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);
        const spawnTimes = new Float32Array(particleCount);

        const origin = new THREE.Vector3().addVectors(position, new THREE.Vector3(0, -0.5, 0));

        const particleLifetimeMax = 1.0; // max lifetime in seconds

        for (let i = 0; i < particleCount; i++) {

            //const angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
            //const r = Math.sqrt(Math.random()) * fireSize; // Random radius with sqrt for uniform distribution
            //const randOffsetX = Math.cos(angle) * r;
            //const randOffsetZ = Math.sin(angle) * r;

            positions.set([origin.x + (Math.random() * 1 - 0.5),
                origin.y + (Math.random() * 1 - 0.5),
                origin.z + (Math.random() * 1 - 0.5)
            ], i * 3);

            const dir = new THREE.Vector3(
                (Math.random() * 1 - 0.5),
                (Math.random() * 1),
                (Math.random() * 1 - 0.5)
            ).normalize().multiplyScalar(Math.random() * maxVelocity);
            
            velocities.set([dir.x, dir.y, dir.z], i * 3);
            lifetimes[i] = particleLifetimeMax - (Math.random() * 0.5);
            spawnTimes[i] = clock.getElapsedTime();
        }

        // Buffer geometry
        const geometry = new THREE.BufferGeometry();

        // set attribute variables in vertex shader
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));
        geometry.setAttribute('spawnTime', new THREE.Float32BufferAttribute(spawnTimes, 1));

        // Shader material
        this.fireParticleMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                
                // global input to both vertex and fragment shaders (same value across all vertices/fragments in single draw call)
                uniform float u_time;
                uniform vec3 u_origin;
                uniform vec3 u_emitPosition;

                // input to vertex shader
                attribute vec3 offset;
                attribute vec3 velocity;
                attribute float lifetime;
                attribute float spawnTime;

                // passed to fragment shader
                varying float vLifetime;

                void main() {            
                    float age = u_time - spawnTime;
                    float lifeProgress = clamp(age / lifetime, 0.0, 1.0);

                    vLifetime = lifeProgress;

                    vec3 gravity = vec3(0.0, -1.0, 0.0);
                      // Position update with gravity
                    vec3 displaced = position 
                        + velocity * age 
                        + 0.5 * gravity * (age * age);

                    //float velocityDecayFactor = 5.0; //pow(1.0 - vLifetime, 2.0);

                    vec3 pos = displaced; //position + velocity * age * velocityDecayFactor;
                                  
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    // scale with perspective, shrink with time                                    
                    gl_PointSize = 1.0 * (300.0 / -mvPosition.z) * (1.0 - lifeProgress);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                precision mediump float;
                varying float vLifetime;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

                    float t = vLifetime;
                    vec3 color;

                    float cutOff1 = 0.25;
                    float cutOff2 = 0.40;

                    if (t < cutOff1) {
                        float localT = t / cutOff1;
                        color = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 1.0, 0.0), localT); // White → Yellow
                    } else if (t < cutOff2) {
                        float localT = (t - cutOff1) / (0.85 - cutOff1);
                        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), localT); // Yellow → Orange
                    } else {
                        float localT = (t - cutOff2) / (1.0 -cutOff2);
                        color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), localT); // Orange → Red
                    }
                    float opacity = 0.8 - (t / 2.0);

                    // Render particle with fading opacity
                    gl_FragColor = vec4(color, opacity);
                }
 
            `,
            uniforms: {
                u_time: { value: 0.0 },
                u_origin: { value: origin },
                u_emitPosition: { value: this.emitPosition}
            },
            transparent: true,
            depthWrite: true,
            blending: THREE.AdditiveBlending
        });
      
        // Create the particle system
        const particleSystem = new THREE.Points(geometry, this.fireParticleMaterial);
      
        return particleSystem;
    }

    public update(clock: THREE.Clock): void {
        
        if(this.isDead) {
            this.kill();
            return;
        }

        if(!this.isEmitting) {
            setTimeout(() => {
                this.isDead = true
            }, 1000);        
        }

        let fireMaterial = this.fireParticles.material as THREE.ShaderMaterial;
        fireMaterial.uniforms['u_time'].value = clock.getElapsedTime();
        fireMaterial.uniforms['u_emitPosition'].value = this.emitPosition; // todo: make this work
    }

    getPosition(): THREE.Vector3 {
        throw new Error('Method not implemented.');
    }
    setPosition(position: THREE.Vector3): void {
        this.fireParticles.position.copy(position);
    }
    setQuaternion(quaternion: THREE.Quaternion): void {
        throw new Error('Method not implemented.');
    }

    pause(): void {
        throw new Error('Method not implemented.');
    }
    resume(): void {
        throw new Error('Method not implemented.');
    }
    stop(): void {
        throw new Error('Method not implemented.');
    }
    setEmitPosition(position: THREE.Vector3): void {
        
        //this.fireParticles.position.copy(position);
        //this.smokeParticles.position.copy(position);
        this.emitPosition = position;
    }
    getParticleCount(): number {

        return this.fireParticles.geometry.getAttribute('position').count;
    }

    kill(): void {
        this.disposePoints(this.fireParticles, this.scene);
    }

    private disposePoints(points: THREE.Points, scene: THREE.Scene) {
        // Remove from scene (if added)
        scene.remove(points);

        // Dispose geometry
        points.geometry.dispose();

        // Dispose material(s)
        if (Array.isArray(points.material)) {
            points.material.forEach((mat) => mat.dispose());
        } else {
            points.material.dispose();
        }
    }
}