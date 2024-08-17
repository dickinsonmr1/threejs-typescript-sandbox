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
        isDebug: boolean,
        playerId: string,
        type: ProjectileType,
        launchPosition: THREE.Vector3,
        launchVector: THREE.Vector3,
        quaternion: THREE.Quaternion,
        world?: CANNON.World) : Projectile
    {


        let randRocketType = THREE.MathUtils.randInt(0, 2);

        let startColor;
        let particleColor1; //= new THREE.Color(0x663399);
        let particleColor2; //= new THREE.Color(0x663399);
        let particleColor3; //= new THREE.Color(0x663399);
        let particleColor4; //= new THREE.Color(0x4d0099);

        switch(randRocketType) {
            case 0:
                startColor = new THREE.Color('white');
                particleColor1 = new THREE.Color('white');
                particleColor2 = new THREE.Color('mediumpurple');
                particleColor3 = new THREE.Color('mediumpurple');
                particleColor4 = new THREE.Color('pink');
                break;
            case 1:
            default:
                startColor = new THREE.Color('white');    
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
                return new Projectile(scene, isDebug,
                    playerId,
                    ProjectileType.Bullet,
                    0.05,                   // radius
                    launchPosition,           // launchPosition relative to chassis
                    launchVector,
                    quaternion,
                    1.25,
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
                return new Projectile(scene, isDebug,
                    playerId,
                    ProjectileType.Rocket,
                    0.07,                   // radius
                    launchPosition,           // launchPosition relative to chassis
                    launchVector,
                    quaternion,
                    0.9,
                    startColor,
                    particleColor1,
                    particleColor2,
                    particleColor3,
                    particleColor4,
                    new THREE.MeshPhongMaterial( { color: 0xff0000, depthWrite: true }),
                    this.particleMaterial,
                    world);          
                break;
            case ProjectileType.Airstrike:            
                return new Projectile(scene, isDebug,
                    playerId,
                    ProjectileType.Airstrike,
                    0.05,                   // radius
                    launchPosition,           // launchPosition relative to chassis
                    launchVector,
                    quaternion,
                    0.4,
                    startColor,
                    particleColor1,
                    particleColor2,
                    particleColor3,
                    particleColor4,
                    new THREE.MeshBasicMaterial( { color: 0xffffff, depthWrite: true }),
                    this.particleMaterial,
                    world);      
                break;
        }
    }
}