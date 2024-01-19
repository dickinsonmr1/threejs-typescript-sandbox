import { Projectile } from "./weapons/projectile";
import { v4 as uuidv4 } from 'uuid';
import { ProjectileType } from "./weapons/projectileType";
import HealthBar from "./healthBar";

export class Player {
    // TODO: implement
    /**
     *
     */

    //public playerId: uuidv4;
    public playerName: string;

    healthBar: HealthBar;

    constructor(scene: THREE.Scene,
        playerName: string) {

        this.healthBar = new HealthBar(scene, 100);
        //super();

        //this.playerId = uuidv4();
        this.playerName = playerName;        
    }


    /*
    createProjectile(): Projectile {
        return;
    }
    */

    update(): void {

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
        this.healthBar.update()
    }

    refillShield(): void {

    }

    trySelectPreviousWeapon(): void {

    }

    trySelectNextWeapon(): void {

    }
}