// todo: version of FireGpuParticleEmitter that creates a new instance of THREE.Points every time particles need to be emitted
import * as THREE from 'three'
import { ParticleEmitter } from '../particleEmitter';


export class GpuFireParticleInstance {
    
    isEmitting: boolean = true;
    isDead: boolean = false;

    constructor(public particles: THREE.Points, particleLifeTimeInMs: number) {

        setTimeout(() => {
            this.isEmitting = false;
            this.isDead = true;
        }, particleLifeTimeInMs);     

    }
}


export class FireGpuParticleEmitter2 extends ParticleEmitter {
    
    // not used in this class
    particleGroup!: THREE.Group<THREE.Object3DEventMap>;    

    isEmitting: boolean = true;
    isDead!: boolean;
    scene: THREE.Scene;

    frameCount: number = 0;

    particlesPerInstance: number;

    /**
     *
     */

    private smokeParticleSystems: GpuFireParticleInstance[] = [];
    private fireParticleSystems: GpuFireParticleInstance[] = [];

    private fireParticleMaterial!: THREE.ShaderMaterial;
    private smokeParticleMaterial!: THREE.ShaderMaterial;

    private emitPosition: THREE.Vector3 = new THREE.Vector3(0,0,0);

    constructor(scene: THREE.Scene, maxSimulationLifeTimeInMs: number, particlesPerInstance: number, position: THREE.Vector3) {

        super();

        this.scene = scene;
        this.particlesPerInstance = particlesPerInstance;

        this.emitPosition = new THREE.Vector3(0,0,0);

        //this.emitParticles(particlesPerInstance, position);

        setTimeout(() => {

            this.isEmitting = false;
            setTimeout(() => {
                this.kill();
            }, 500);     

        }, maxSimulationLifeTimeInMs);     
    }  
    
    private emitParticles(particlesPerInstance: number, position: THREE.Vector3): void {
        
        let fireParticles = new GpuFireParticleInstance(this.createFireParticles(1, particlesPerInstance, position), 500);
        let smokeParticles = new GpuFireParticleInstance(this.createSmokeParticles(0.75, particlesPerInstance, position), 1000);//new THREE.Vector3(0, 3, 0));

        this.scene.add(fireParticles.particles);
        this.scene.add(smokeParticles.particles);

        this.fireParticleSystems.push(fireParticles);
        this.smokeParticleSystems.push(smokeParticles);
    }

    private createFireParticles(fireSize: number, particlesPerInstance: number, position: THREE.Vector3): THREE.Points {
        // Create particle attributes
        const particleCount = particlesPerInstance;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);

        const origin = new THREE.Vector3().addVectors(position, new THREE.Vector3(0, -0.5, 0));

        const particleLifetimeMax = 1.0; // max lifetime in seconds

        for (let i = 0; i < particleCount; i++) {

            const angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
            const r = Math.sqrt(Math.random()) * fireSize; // Random radius with sqrt for uniform distribution
            const randOffsetX = Math.cos(angle) * r;
            const randOffsetZ = Math.sin(angle) * r;

            positions.set([origin.x + randOffsetX, origin.y, origin.z + randOffsetZ], i * 3);
            velocities.set([
                (Math.random() * 0.2) - 0.1,
                Math.random() * 5.0,
                (Math.random() * 0.2) - 0.1,
            ], i * 3);
            lifetimes[i] = Math.random() * particleLifetimeMax;
        }

        // Buffer geometry
        const geometry = new THREE.BufferGeometry();

        // set attribute variables in vertex shader
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));

        // Shader material
        this.fireParticleMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                
                // global input to both vertex and fragment shaders (same value across all vertices/fragemnts in single draw call)
                uniform float u_time;
                uniform vec3 u_origin;
                uniform vec3 u_emitPosition;

                // input to vertex shader
                attribute vec3 offset;
                attribute vec3 velocity;
                attribute float lifetime;

                // passed to fragment shader
                varying float v_opacity;
                varying vec3 v_color;

                void main() {            
                    float age = mod(u_time, lifetime);
                    float lifeProgress = age / lifetime;

                    // Reset particle position if lifetime is reached
                    vec3 pos = position + velocity * age;

                    // Color transition from yellow to red
                    v_color = mix(vec3(1.0, 0.9, 0.0), vec3(1.0, 0.0, 0.0), lifeProgress);
                    
                    // Opacity fades out as it reaches the lifetime
                    v_opacity = 1.0 - lifeProgress;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 1.25 * (300.0 / -mvPosition.z) * (1.0 - lifeProgress);
                    // scale with perspective, shrink with time                                    

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                }
            `,
            fragmentShader: `
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

                    // Render particle with fading opacity
                    gl_FragColor = vec4(v_color, v_opacity);
                }
 
            `,
            uniforms: {
                u_time: { value: 0.0 },
                u_origin: { value: origin },
                u_emitPosition: { value: this.emitPosition}
            },
            transparent: true,
            depthWrite: false,
        });
      
        // Create the particle system
        const particleSystem = new THREE.Points(geometry, this.fireParticleMaterial);
      
        return particleSystem;
    }

    private createSmokeParticles(smokeSize: number, particlesPerInstance: number, position: THREE.Vector3): THREE.Points {
        // Create particle attributes
        const particleCount = particlesPerInstance;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);

        const origin = new THREE.Vector3().addVectors(position, new THREE.Vector3(0,0,0))

        const particleLifetimeMax = 2.0; // max lifetime in seconds

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
            const r = Math.sqrt(Math.random()) * smokeSize; // Random radius with sqrt for uniform distribution
            const randOffsetX = Math.cos(angle) * r;
            const randOffsetZ = Math.sin(angle) * r;

            positions.set([
                origin.x + randOffsetX,
                origin.y + 1,
                origin.z + randOffsetZ
            ], i * 3);
            velocities.set([
                (Math.random() * 1) - 0.5,
                Math.random() * 2,
                (Math.random() * 1) - 0.5,
            ], i * 3);
            lifetimes[i] = Math.random() * particleLifetimeMax;
        }

        // Buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));

        // Shader material
        this.smokeParticleMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float u_time;
                uniform vec3 u_origin;
                uniform vec3 u_emitPosition;

                attribute vec3 velocity;
                attribute float lifetime;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float age = mod(u_time, lifetime);
                    float lifeProgress = age / lifetime;

                    // Reset particle position if lifetime is reached
                    vec3 pos = position + velocity * age;

                    // Color transition
                    v_color = mix(vec3(0.0, 0.0, 0.0), vec3(0.5, 0.5, 0.5), lifeProgress);                    
                    
                    if(lifeProgress < 0.5)
                        v_opacity = 0.25;
                    else if(lifeProgress >= 0.5)
                        v_opacity = 0.25 * (1.0 - lifeProgress);                

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (50.0 / -mvPosition.z) * lifeProgress * 25.0;
                    // scale with perspective, grow with time                                    
                }
            `,
            fragmentShader: `
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

                    // Render particle with fading opacity
                    gl_FragColor = vec4(v_color, v_opacity);
                }
 
            `,
            uniforms: {
                u_time: { value: 0.0 },
                u_origin: { value: origin },
                u_emitPosition: { value: this.emitPosition}
            },
            transparent: true,
            depthWrite: false,
        });
      
        // Create the particle system
        const particleSystem = new THREE.Points(geometry, this.smokeParticleMaterial);
      
        return particleSystem;
    }

    public update(clock: THREE.Clock): void {
        
        if(this.isDead) {
            this.kill();
            return;
        }

        //if(!this.isEmitting) {
            //setTimeout(() => {
                //this.isDead = true
            //}, 1000);        
        //}

        this.frameCount++;        
        if (this.frameCount % 2 === 0 && this.isEmitting)
            this.emitParticles(this.particlesPerInstance, this.emitPosition);

        this.fireParticleSystems.forEach(particleSystem => {

            if(particleSystem.isDead) {
                this.disposePoints(particleSystem.particles, this.scene);
            }
            else {
                let material = particleSystem.particles.material as THREE.ShaderMaterial;
                material.uniforms['u_time'].value = clock.getElapsedTime();
                material.uniforms['u_emitPosition'].value = this.emitPosition; // todo: make this work            
            }
        });

        this.smokeParticleSystems.forEach(particleSystem => {

            if(particleSystem.isDead) {
                this.disposePoints(particleSystem.particles, this.scene);
            }
            else {
                let material = particleSystem.particles.material as THREE.ShaderMaterial;
                material.uniforms['u_time'].value = clock.getElapsedTime();
                material.uniforms['u_emitPosition'].value = this.emitPosition; // todo: make this work        
            }
        });

        this.fireParticleSystems = this.fireParticleSystems.filter(x => !x.isDead);
        this.smokeParticleSystems = this.smokeParticleSystems.filter(x => !x.isDead);
    }

    getPosition(): THREE.Vector3 {
        throw new Error('Method not implemented.');
    }
    setPosition(position: THREE.Vector3): void {

        this.fireParticleSystems.forEach(particleSystem => {
            particleSystem.particles.position.copy(position);
        });
        this.smokeParticleSystems.forEach(particleSystem => {
            particleSystem.particles.position.copy(position);
        });
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

        let count = 0;

        this.fireParticleSystems.forEach( x=> count += x.particles.geometry.getAttribute('position').count);
        this.smokeParticleSystems.forEach( x=> count += x.particles.geometry.getAttribute('position').count);

        return count;
    }

    kill(): void {
        
        this.isDead = true;

        this.fireParticleSystems.forEach(x => {
            this.disposePoints(x.particles, this.scene);            
        });
        this.fireParticleSystems.length = 0;

        this.smokeParticleSystems.forEach(x => {
            this.disposePoints(x.particles, this.scene);
        });
        this.smokeParticleSystems.length = 0;
    }

    private disposePoints(points: THREE.Points, scene: THREE.Scene) {
        // Remove from scene (if added)
        scene.remove(points);

        // Dispose geometry
        if (points.geometry) {
            points.geometry.dispose();
        }

        // Dispose material(s)
        if (Array.isArray(points.material)) {
            points.material.forEach((mat) => mat.dispose());
        } else {
            points.material.dispose();
        }
    }
}