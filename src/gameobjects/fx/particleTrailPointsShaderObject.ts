import * as THREE from "three";
import { ParticleEmitter } from "./particleEmitter";
import { ParticleEmitterType } from "./particleTrailObject";
import { Material } from "cannon-es";
import GameScene from "../../scenes/gameScene";
import { vec2 } from "three/examples/jsm/nodes/Nodes.js";
import { Utility } from "../../utility";
/*
TODO: fix me
*/

export class ParticleTrailPointsShaderObject extends ParticleEmitter {

    scene: THREE.Scene;
    type: ParticleEmitterType;
    particleGroup: THREE.Group;

    startColor: THREE.Color;
    lerpColor1: THREE.Color;
    lerpColor2: THREE.Color;
    lerpColor3: THREE.Color;
    initialSize: number;

    position!: THREE.Vector3;
    emitPosition!: THREE.Vector3;

    numberParticles: number;
    velocity: number;

    isDead: boolean = false;
    isEmitting: boolean = true;

    //particleMaterial: THREE.SpriteMaterial;

    //private particles: THREE.Points[] = [];
    private particles: { mesh: THREE.Points, birthTime: number }[] = [];
    particleMaterial: THREE.Material;

    private maxPositionJitter: number;
    private maxLifeTime: number = 500;

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
        size: number,
        maxPositionJitter: number
        ) {
                  
        super();

        let gameScene = <GameScene>scene;

        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: gameScene.explosionTexture },
                //tDiffuse: { value: particleTexture1 } // https://stackoverflow.com/questions/40715234/three-js-wrong-texture-on-shadermaterial
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true,
            
        });
        if(type == ParticleEmitterType.GlowingParticles)
            this.particleMaterial.blending = THREE.AdditiveBlending;
        else
            this.particleMaterial.blending = THREE.NormalBlending;

        // todo: max particle count

        this.scene = scene;
        this.type = type;
        this.particleGroup = new THREE.Group();
        this.startColor = startColor;
        this.lerpColor1 = lerpColor1;
        this.lerpColor2 = lerpColor2;
        this.lerpColor3 = lerpColor3;

        this.numberParticles = numberParticles;
        this.velocity = velocity;
        this.initialSize = size;

        this.isEmitting = true;        

        this.particleGroup.position.set(0,0,0);//position.x, position.y, position.z);
        this.emitPosition = this.particleGroup.position;

        this.maxPositionJitter = maxPositionJitter;
       
        scene.add(this.particleGroup);
    }

    addParticle(position: THREE.Vector3): void {
        const geometry = new THREE.BufferGeometry();

        const vertices = new Float32Array(3); // Single particle   
        vertices[0] = position.x;// + (Math.random() - this.maxPositionJitter/2) * this.maxPositionJitter;
        vertices[1] = position.y;// + (Math.random() - this.maxPositionJitter/2) * this.maxPositionJitter;
        vertices[2] = position.z;// + (Math.random() - this.maxPositionJitter/2) * this.maxPositionJitter;


        var randVelocity = new THREE.Vector3(
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2,
                        Math.random() * this.velocity - this.velocity / 2
                    ).multiplyScalar(Math.random() * Math.random() * 3 + 1);

        const velocity = new Float32Array(3);
        velocity[0] = randVelocity.x;
        velocity[1] = randVelocity.y;
        velocity[2] = randVelocity.z;
    
        const sizes = new Float32Array([1]);        
        sizes[0] = this.initialSize;
        const sizeMultiplier = new Float32Array([1]);

        switch(this.type) {
            case ParticleEmitterType.SmokeTrail:
            case ParticleEmitterType.SmokeEmit:
                //item.material.opacity -= 0.008;
                //item.scale.x *= 1.02; item.scale.y *= 1.02; item.scale.z *= 1.02;        
                sizeMultiplier[0] = 5;
                break;
            default:
                //item.material.opacity -= 0.01;
                //item.scale.x *= 0.98; item.scale.y *= 0.98; item.scale.z *= 0.98;        
                sizeMultiplier[0] = 0.9;
                break;
        }       


        const alphas = new Float32Array([0.9]);

        const startColor = new Float32Array(3); // Single particle
        const lerpColor1 = new Float32Array(3); // Single particle
        const lerpColor2 = new Float32Array(3); // Single particle
        const lerpColor3 = new Float32Array(3); // Single particle
    
        startColor[0] = this.startColor.r;
        startColor[1] = this.startColor.g;
        startColor[2] = this.startColor.b;

        lerpColor1[0] = this.lerpColor1.r;
        lerpColor1[1] = this.lerpColor1.g;
        lerpColor1[2] = this.lerpColor1.b;
        
        lerpColor2[0] = this.lerpColor2.r;
        lerpColor2[1] = this.lerpColor2.g;
        lerpColor2[2] = this.lerpColor2.b;

        lerpColor3[0] = this.lerpColor3.r;
        lerpColor3[1] = this.lerpColor3.g;
        lerpColor3[2] = this.lerpColor3.b;
        
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocity, 3));
        geometry.setAttribute('initialSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('sizeMultiplier', new THREE.BufferAttribute(sizeMultiplier, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        geometry.setAttribute('startColor', new THREE.BufferAttribute(startColor, 3));
        geometry.setAttribute('lerpColor1', new THREE.BufferAttribute(lerpColor1, 3));
        geometry.setAttribute('lerpColor2', new THREE.BufferAttribute(lerpColor2, 3));
        geometry.setAttribute('lerpColor3', new THREE.BufferAttribute(lerpColor3, 3));

        const particle = new THREE.Points(geometry, this.particleMaterial);
        const birthTime = Date.now();
    
        this.particleGroup.add(particle);
        this.particles.push({ mesh: particle, birthTime });
    }

    updateParticles(): void {
        const now = Date.now();
        for (let i = this.particles.length - 1; i >= 0; i--) {
            
            const { mesh, birthTime } = this.particles[i];
            const elapsedTime = now - birthTime;
            if (elapsedTime > this.maxLifeTime) {
                this.particleGroup.remove(mesh);
                this.particles.splice(i, 1);
                continue;
            }
                        
            // Calculate size reduction over time
            const lifeFraction = elapsedTime / this.maxLifeTime;

            const alpha = (mesh.geometry.attributes.alpha.array as Float32Array);
            alpha[0] = 1.0 - lifeFraction;
            mesh.geometry.attributes.alpha.needsUpdate = true;    
            
            const position = (mesh.geometry.attributes.position.array as Float32Array);
            const velocity = (mesh.geometry.attributes.velocity.array as Float32Array);
            position[0] = position[0] + velocity[0];
            position[1] = position[1] + velocity[1];
            position[2] = position[2] + velocity[2];
            mesh.geometry.attributes.position.needsUpdate = true;    
        }
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
        throw new Error("Method not implemented.");
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
            this.addParticle(this.emitPosition);
            //this.emitParticles(this.emitPosition);
        }

        this.updateParticles();       
    }

    kill(): void {
        this.isDead = true;

        this.particleGroup.children = this.particleGroup.children
            .filter((child) => {
                let item = <THREE.Points>child;
                //item.remove();
                this.particleGroup.remove(item);

                Utility.disposePoints(item);
            });   

        this.scene.remove(this.particleGroup);
    }

    getParticleCount(): number {
        
        let particleCount = 0;
        let points = this.particleGroup.children.filter(x => x.type == "Points");

        points.forEach(x => {
            let item = <THREE.Points>x;

            if(item.geometry != null) 
                particleCount += item.geometry.attributes.position.count;
        });

        return particleCount;
    } 
   
    vertexShader(){
        return `
            attribute float initialSize;
            attribute float sizeMultiplier;
            attribute float alpha;
            attribute vec3 startColor;
            attribute vec3 lerpColor1;
            attribute vec3 lerpColor2;
            attribute vec3 lerpColor3;
            attribute vec3 velocity;
            
            varying float vAlpha;
            varying vec3 vStartColor;
            varying vec3 vLerpColor1;
            varying vec3 vLerpColor2;
            varying vec3 vLerpColor3;

            void main()
            {
                vAlpha = alpha;
                vStartColor = startColor;
                vLerpColor1 = lerpColor1;
                vLerpColor2 = lerpColor2;
                vLerpColor3 = lerpColor3;

                vec4 mvPosition = modelViewMatrix * vec4(position + velocity, 1.0);
                //gl_PointSize = size * (10.0 / -mvPosition.z) * sizeMultiplier;
                if(sizeMultiplier < 1.0) {
                    gl_PointSize = initialSize * sizeMultiplier * vAlpha;    
                }
                else {
                    gl_PointSize = initialSize * sizeMultiplier * (1.0 - vAlpha);
                }                
                gl_Position = projectionMatrix * mvPosition;
            }
        `
    }

    fragmentShader() {
        return `
            uniform sampler2D uTexture;
            
            varying float vAlpha;
            //varying float vSize;
            varying vec3 vStartColor;
            varying vec3 vLerpColor1;
            varying vec3 vLerpColor2;
            varying vec3 vLerpColor3;
            
            void main()
            {
                float t = 1.0 - vAlpha;

                vec3 color;
                if (t < 0.33) {
                    //color = mix(vec3(1.0), vec3(1.0, 1.0, 0.0), t / 0.33); // White to Yellow
                    color = mix(vStartColor, vLerpColor1, t / 0.33); // White to Yellow
                } else if (t < 0.66) {
                    //color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.65, 0.0), (t - 0.33) / 0.33); // Yellow to Orange
                    color = mix(vLerpColor1, vLerpColor2, (t - 0.33) / 0.33); // Yellow to Orange
                } else {
                    //color = mix(vec3(1.0, 0.65, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.66) / 0.34); // Orange to Red
                    color = mix(vLerpColor2, vLerpColor3, (t - 0.66) / 0.34); // Orange to Red
                }
                
                vec4 texColor = texture2D(uTexture, gl_PointCoord);
                gl_FragColor = vec4(color * texColor.rgb, texColor.a * vAlpha);
            }
            `
    }
}