// import { v4 as uuidv4 } from 'uuid';
import { ProjectileType } from "./weapons/projectileType";
import HealthBar from "./healthBar";
import { RigidVehicleObject } from "./vehicles/rigidVehicle/rigidVehicleObject";
import { Utility } from "../utility";
import Headlights from "./fx/headLights";
import * as THREE from "three";
import { v4 as uuidv4 } from 'uuid';
import { FireObject } from "./fx/fireObject";
import GameScene from "../scenes/gameScene";


export enum PlayerState {
    Alive,
    Dead,
    Respawning
}

export class Player {
    // TODO: implement
    /**
     *
     */

    scene: THREE.Scene;
    //public playerId: uuidv4;
    public playerName: string;
    public playerId: string;
    maxHealth: number = 100;
    currentHealth: number;

    static RespawnTimeinMs: number = 3000;

    playerState: PlayerState = PlayerState.Alive;

    healthBar: HealthBar;
    headLights: Headlights;
    
    rigidVehicleObject?: RigidVehicleObject;

    fireObjects: FireObject[] = [];

    constructor(scene: THREE.Scene,
        playerName: string) {

        this.scene = scene;

        this.playerId = uuidv4();
        this.healthBar = new HealthBar(scene, this.maxHealth);

        this.currentHealth = this.maxHealth;

        this.headLights = new Headlights(scene);
        //super();

        //this.playerId = uuidv4();
        this.playerName = playerName;        
    }


    /*
    createProjectile(): Projectile {
        return;
    }
    */

    getPosition(): THREE.Vector3{
        if(!this.rigidVehicleObject?.chassis.body) return new THREE.Vector3(0,0,0);

        return Utility.CannonVec3ToThreeVec3(this.rigidVehicleObject.chassis.body.position);
    }

    update(): void {

        this.fireObjects.forEach(x => x.update());

        if(this.playerState == PlayerState.Dead) {
            return; 
        }
            
        if(this.playerState == PlayerState.Respawning)
            this.tryRespawn();
        
            /*
            if(this.deadUntilRespawnTimer.running) {

            if(this.deadUntilRespawnTimer.elapsedTime >= 3)
                this.tryRespawn();
            else
                return;
        }     
        */   

        if(!this.rigidVehicleObject?.chassis?.body?.position) return;

        this.rigidVehicleObject.update();

        this.healthBar.update(Utility.CannonVec3ToThreeVec3(this.rigidVehicleObject.chassis.body.position));

        this.headLights.update(
            Utility.CannonVec3ToThreeVec3(this.rigidVehicleObject.chassis.body.position),
            Utility.CannonQuaternionToThreeQuaternion(this.rigidVehicleObject.chassis.body.quaternion)
        );
    }

    tryAccelerateWithKeyboard(): void {

    }

    tryStopAccelerateWithKeyboard(): void {
        
    }
    
    tryReverseWithKeyboard(): void {
        
    }

    tryStopReverseWithKeyboard(): void {
        
    }

    tryTurnLeftWithKeyboard(): void {
        
    }

    tryStopTurnLeftWithKeyboard(): void {
        
    }

    tryTurnRightWithKeyboard(): void {
        
    }

    tryStopTurnRightWithKeyboard(): void {
        
    }

    tryDamage(projectileType: ProjectileType, damageLocation: THREE.Vector3): void {
        
        if(projectileType == ProjectileType.Bullet)
            this.currentHealth -= 5;
        else if(projectileType == ProjectileType.Rocket)
            this.currentHealth -= 20;

        this.healthBar.updateValue(this.currentHealth);

        if(this.currentHealth <= 0)
            this.tryKill();
    }
    
    tryKill() {

        if(this.playerState == PlayerState.Alive) {
            this.playerState = PlayerState.Dead;


            let scene = <GameScene>this.scene;
            
            this.headLights.group.visible = false;

            if(!scene.explosionTexture) return;

            let deathFire = new FireObject(
                this.scene,
                scene.explosionTexture,
                new THREE.Color('yellow'),
                new THREE.Color('orange'),
                this.getPosition(),
                10
            );

            this.fireObjects.push(deathFire);

            setTimeout(() => {
                this.playerState = PlayerState.Respawning
            }, Player.RespawnTimeinMs);
        }
    }

    tryRespawn() {
        this.refillHealth();
        this.playerState = PlayerState.Alive;


        this.headLights.group.visible = true;
    }

    tryFirePrimaryWeapon(): void {

    }

    tryFireSecondaryWeapon(): void {

    }

    tryFireRocket(): void {

    }

    tryFireBullets(): void {

    }
    
    // TODO: try fire additional weapons

    tryTurboBoostOn(): void {

    }
    
    tryTurboBoostOff(): void {

    }

    refillTurbo(): void {

    }

    refillHealth(): void {
        this.currentHealth = this.maxHealth;
        this.healthBar.updateValue(this.currentHealth);
    }

    refillShield(): void {

    }

    trySelectPreviousWeapon(): void {

    }

    trySelectNextWeapon(): void {

    }
}