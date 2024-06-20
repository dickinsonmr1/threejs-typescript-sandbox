import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Projectile } from "./projectile";
import { ProjectileType } from "./projectileType";
 import { v4 as uuidv4 } from 'uuid';

export default class ProjectileFactory {
    particleMaterial: THREE.SpriteMaterial;
    constructor(particleMaterial: THREE.SpriteMaterial) {

        this.particleMaterial = particleMaterial;
    }

    generateProjectile(scene: THREE.Scene,
        playerId: string,
        type: ProjectileType,
        launchPosition: THREE.Vector3,
        launchVector: THREE.Vector3,
        world?: CANNON.World) : Projectile
    {


        let randRocketType = THREE.MathUtils.randInt(0, 1);

        let particleColor1; //= new THREE.Color(0x663399);
        let particleColor2; //= new THREE.Color(0x663399);
        let particleColor3; //= new THREE.Color(0x663399);
        let particleColor4; //= new THREE.Color(0x4d0099);

        switch(randRocketType) {
            case 0:
                particleColor1 = new THREE.Color(0xffffff);
                particleColor2 = new THREE.Color(0x663399);
                particleColor3 = new THREE.Color(0x663399);
                particleColor4 = new THREE.Color(0x4d0099);
                break;
            case 1:
            default:
                particleColor1 = new THREE.Color('white');    
                particleColor2 = new THREE.Color('yellow');
                particleColor3 = new THREE.Color('orange');
                particleColor4 = new THREE.Color('red');
                break;
        }
    
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
                    new THREE.Color('white'),
                    new THREE.Color('white'),
                    new THREE.Color('white'),
                    new THREE.MeshBasicMaterial( { color: 0xffffff, depthWrite: true }),
                    this.particleMaterial,
                    world);      
        
                break;
            case ProjectileType.Rocket:            
                return new Projectile(scene,
                    playerId,
                    ProjectileType.Rocket,
                    0.07,                   // radius
                    launchPosition,           // launchPosition relative to chassis
                    launchVector,
                    0.4,
                    new THREE.Color('white'),
                    particleColor1,
                    particleColor2,
                    particleColor3,
                    particleColor4,
                    new THREE.MeshPhongMaterial( { color: 0xff0000, depthWrite: true }),
                    this.particleMaterial,
                    world);          
                break;
        }
    }
}