import * as THREE from "three";
import { ParticleEmitter } from "./particleEmitter";
import { ParticleEmitterType } from "./particleTrailObject";
import { Material } from "cannon-es";
import GameScene from "../../scenes/gameScene";
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

    position!: THREE.Vector3;
    emitPosition!: THREE.Vector3;

    numberParticles: number;
    velocity: number;

    isDead: boolean = false;
    isEmitting: boolean = true;

    //particleMaterial: THREE.SpriteMaterial;

    //private particles: THREE.Points[] = [];
    private particles: { mesh: THREE.Points, birthTime: number }[] = [];
    private particleSystem: THREE.Group;
    particleMaterial: THREE.Material;

    private maxPositionJitter: number;
    private maxLifeTime: number = 2000;

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

        /*
        this.particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: size,   
            map: new THREE.TextureLoader().load( 'assets/particle-16x16.png'),
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        */

        let gameScene = <GameScene>scene;
        const loader = new THREE.TextureLoader();
        //var particleTexture1 = loader.load('assets/particle-16x16.png');

        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                texture: { value: gameScene.explosionTexture },
                //tDiffuse: { value: particleTexture1 } // https://stackoverflow.com/questions/40715234/three-js-wrong-texture-on-shadermaterial
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true
        });
        // todo: max particle count

        this.scene = scene;
        this.type = type;
        this.particleGroup = new THREE.Group();
        //this.particleTexture = particleTexture;
        this.startColor = startColor;
        this.lerpColor1 = lerpColor1;
        this.lerpColor2 = lerpColor2;
        this.lerpColor3 = lerpColor3;

        this.numberParticles = numberParticles;
        this.velocity = velocity;

        this.isEmitting = true;        

        this.particleGroup.position.set(0,0,0);//position.x, position.y, position.z);
        this.emitPosition = this.particleGroup.position;

        this.maxPositionJitter = maxPositionJitter;
       
        this.particleSystem = new THREE.Group();
        scene.add(this.particleSystem);
    }

    addParticle(position: THREE.Vector3): void {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(3); // Single particle
    
        vertices[0] = position.x + (Math.random() - this.maxPositionJitter/2) * this.maxPositionJitter;
        vertices[1] = position.y + (Math.random() - this.maxPositionJitter/2) * this.maxPositionJitter;
        vertices[2] = position.z + (Math.random() - this.maxPositionJitter/2) * this.maxPositionJitter;
    
        const sizes = new Float32Array([20]);
        const alphas = new Float32Array([1.0]);
    
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
        const particle = new THREE.Points(geometry, this.particleMaterial);
        const birthTime = Date.now();
    
        this.particleSystem.add(particle);
        this.particles.push({ mesh: particle, birthTime });
    }

    updateParticles(): void {
        const now = Date.now();
        for (let i = this.particles.length - 1; i >= 0; i--) {
            
            const { mesh, birthTime } = this.particles[i];
            const elapsedTime = now - birthTime;
            if (elapsedTime > this.maxLifeTime) {
                this.particleSystem.remove(mesh);
                this.particles.splice(i, 1);
                continue;
            }
                        
            // Calculate size reduction over time
            const lifeFraction = elapsedTime / this.maxLifeTime;

            const alpha = (mesh.geometry.attributes.alpha.array as Float32Array);
            alpha[0] =  1.0 - lifeFraction;
            mesh.geometry.attributes.alpha.needsUpdate = true;

            /*
            let material = (mesh.material as THREE.PointsMaterial);

            //material.size = initialSize * (1 - lifeFraction);           
            material.opacity -= 0.012;

            if(material.opacity < 0.98 && material.opacity >= 0.80)      
                material.color.lerp(this.lerpColor1, 0.5);
            else if(material.opacity < 0.80 && material.opacity >= 0.50)      
                material.color.lerp(this.lerpColor2, 0.5);
            else if(material.opacity < 0.50)
                material.color.lerp(this.lerpColor3, 0.5);            
            */
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
        /*
        let newEmitColor = this.startColor.clone();// new THREE.Color('white');

        
        for(let i = 0; i < this.numberParticles; i++) {            

            let sprite = new THREE.Sprite(this.particleMaterial);
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
        */
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

        /*
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
        */
    }

    kill(): void {
        this.isDead = true;

        this.particleSystem.children = this.particleSystem.children
            .filter((child) => {
                let item = <THREE.Points>child;
                //item.remove();
                this.particleSystem.remove(item);
            });   

        this.scene.remove(this.particleGroup);
    }
   
    vertexShader(){
        return `
            attribute float size;
            attribute float alpha;
            varying float vAlpha;

            void main()
            {
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (3.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `
    }

    fragmentShader() {
        return `
            uniform sampler2D particleTexture5;
            varying float vAlpha;

            void main()
            {
                vec4 texColor = texture2D(particleTexture5, gl_PointCoord);
                gl_FragColor = vec4(texColor.rgb, texColor.a * vAlpha);
            }
            `
    }
}