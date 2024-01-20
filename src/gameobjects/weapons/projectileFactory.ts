import * as THREE from 'three'
import { Projectile } from "./projectile";
import { ProjectileType } from "./projectileType";
 import { v4 as uuidv4 } from 'uuid';

export default class ProjectileFactory {
    constructor() {

    }

    generateProjectile(scene: THREE.Scene,
        playerId: string,
        type: ProjectileType,
        launchPosition: THREE.Vector3,
        launchVector: THREE.Vector3,
        explosionTexture?: THREE.Texture) : Projectile
    {

        let r = THREE.MathUtils.randInt(0, 255);
        let g = THREE.MathUtils.randInt(0, 255);
        let b = THREE.MathUtils.randInt(0, 255);

        let color = new THREE.Color(r, g, b);

        switch(type) {
            case ProjectileType.Bullet:
                return new Projectile(scene,
                    playerId,
                    ProjectileType.Bullet,
                    0.05,                   // radius
                    launchPosition,           // launchPosition relative to chassis
                    launchVector,
                    0.5,
                    new THREE.Color('white'),
                    new THREE.Color('white'),
                    new THREE.MeshBasicMaterial( { color: 0xffffff, depthWrite: true }),
                    explosionTexture);      
        
                break;
            case ProjectileType.Rocket:            
                return new Projectile(scene,
                    playerId,
                    ProjectileType.Rocket,
                    0.07,                   // radius
                    launchPosition,           // launchPosition relative to chassis
                    launchVector,
                    0.3,
                    color,
                    color,
                    new THREE.MeshPhongMaterial( { color: 0xff0000, depthWrite: true }),
                    explosionTexture);          
                break;
        }
    }
}