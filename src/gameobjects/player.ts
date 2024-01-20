// import { v4 as uuidv4 } from 'uuid';
import { ProjectileType } from "./weapons/projectileType";
import HealthBar from "./healthBar";
import { RigidVehicleObject } from "./vehicles/rigidVehicle/rigidVehicleObject";
import { Utility } from "../utility";
import Headlights from "./fx/headLights";
import * as THREE from "three";
import { v4 as uuidv4 } from 'uuid';

export class Player {
    // TODO: implement
    /**
     *
     */

    //public playerId: uuidv4;
    public playerName: string;
    public playerId: string;
    maxHealth: number = 100;

    healthBar: HealthBar;
    headLights: Headlights;
    
    rigidVehicleObject?: RigidVehicleObject;

    constructor(scene: THREE.Scene,
        playerName: string) {

        this.playerId = uuidv4();
        this.healthBar = new HealthBar(scene, this.maxHealth);

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
        this.healthBar.updateValue(this.maxHealth);
    }

    refillShield(): void {

    }

    trySelectPreviousWeapon(): void {

    }

    trySelectNextWeapon(): void {

    }
}