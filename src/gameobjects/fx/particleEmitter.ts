import * as THREE from "three";

export abstract class ParticleEmitter {
    
    abstract isEmitting: boolean;
    abstract isDead: boolean;
    abstract particleGroup: THREE.Group;

    abstract getPosition(): THREE.Vector3;
    abstract setPosition(position: THREE.Vector3): void;
    abstract setQuaternion(quaternion: THREE.Quaternion): void;
    abstract update(): void;
    abstract kill(): void;
    abstract pause(): void;
    abstract resume(): void;
    abstract stop(): void;
    abstract setEmitPosition(position: THREE.Vector3): void;
    abstract getParticleCount(): number;
}