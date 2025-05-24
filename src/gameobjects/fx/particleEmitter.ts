import * as THREE from "three";

export abstract class ParticleEmitter {
    
    abstract isEmitting: boolean;
    abstract isDead: boolean;
    abstract particleGroup: THREE.Group;

    abstract getPosition(): THREE.Vector3;
    
    // used if you want all particles to move with object, or object is stationary
    abstract setPosition(position: THREE.Vector3): void;
    
    abstract setQuaternion(quaternion: THREE.Quaternion): void;
    abstract update(clock?: THREE.Clock): void;
    abstract kill(): void;
    abstract pause(): void;
    abstract resume(): void;
    abstract stop(): void;

    // used if you particles to be emitted from a specific position (aka object is moving)
    abstract setEmitPosition(position: THREE.Vector3): void;
    abstract getParticleCount(): number;
}