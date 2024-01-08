import * as THREE from 'three'
import { Projectile } from "./projectile";
import { ProjectileType } from "./projectileType";

export default class ProjectileFactory {
    constructor() {

    }

    generateProjectile(scene: THREE.Scene,
        type: ProjectileType,
        launchPosition: THREE.Vector3,
        launchVector: THREE.Vector3,
        explosionTexture?: THREE.Texture) : Projectile
    {

        let r = THREE.MathUtils.randInt(0, 255);
        let g = THREE.MathUtils.randInt(0, 255);
        let b = THREE.MathUtils.randInt(0, 255);

        let color = new THREE.Color(r, g, b);

        let projectileSpeed = 0.3;
        
        switch(type) {
            case ProjectileType.Bullet:
            case ProjectileType.Rocket:
            
            return new Projectile(scene,
                0.05,                   // radius
                launchPosition,           // launchPosition relative to chassis
                launchVector,
                projectileSpeed,
                color,
                color,
                new THREE.MeshPhongMaterial( { color: 0xff0000, depthWrite: true }),
                explosionTexture);      
    
            break;
        }
    }
}