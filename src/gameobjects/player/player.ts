// import { v4 as uuidv4 } from 'uuid';
import { ProjectileType } from "../weapons/projectileType";
import HealthBar from "../healthBar";
import { Utility } from "../../utility";
import Headlights from "../vehicles/headLights";
import * as THREE from "three";
import { v4 as uuidv4 } from 'uuid';
import { FireObject } from "../fx/fireObject";
import GameScene from "../../scenes/gameScene";
import ProjectileFactory from "../weapons/projectileFactory";
import { Projectile, ProjectileLaunchLocation } from "../weapons/projectile";
import { IPlayerVehicle } from "../vehicles/IPlayerVehicle";
import { ParticleEmitterType, ParticleTrailObject } from "../fx/particleTrailObject";
import * as CANNON from 'cannon-es';
import { Target } from "../target";
import { PlayerMarker } from "./playerMarker";
import { FlamethrowerEmitter } from "../weapons/flamethrowerEmitter";
import { Shield } from "../vehicles/shield";
import { ParticleEmitter } from "../fx/particleEmitter";
import { SmokeObject2 } from "../fx/smokeObject2";
import Brakelights from "../vehicles/brakeLights";
import { randFloatSpread, randInt } from "three/src/math/MathUtils.js";
import EmergencyLights from "../vehicles/emergencyLights";

export enum PlayerState {
    Alive,
    Dead,
    Respawning
}

export enum VehicleType {
    
    //TrashMan,
    Sedan,
    Taxi,
    Ambulance,
    
    RaceCar,
    RaceCarRed,

    Killdozer,
    Police,
    TrashTruck,

    Offroader,

    FireTruck,

    PoliceTractor,
    Harvester,
    
    PickupTruck
    //Hearse,
    //MonsterTruck    
}

export enum PlayerTeam {
    Red,
    Blue,
    Green,
    Yellow
}

// TODO: convert to abstract class and add 1 child class per vehicle type
export class Player {

    scene: THREE.Scene;
    isDebug: boolean;
    public playerName: string;

    public isCpuPlayer: boolean;
    public playerId: string;
    maxHealth: number = 100;
    currentHealth: number;

    static RespawnTimeinMs: number = 3000;

    playerState: PlayerState = PlayerState.Alive;

    healthBar: HealthBar;
    headLights!: Headlights;
    brakeLights!: Brakelights;
    emergencyLights!: EmergencyLights;
    emergencyLights2!: EmergencyLights;

    private vehicleObject!: IPlayerVehicle;    
    turboParticleEmitter: ParticleTrailObject;

    flamethrowerEmitter: FlamethrowerEmitter;

    fireObjects: ParticleEmitter[] = [];

    playerColor: THREE.Color;
    target!: Target;
    playerMarker!: PlayerMarker;

    private fireLeft: boolean = false;
    private projectileFactory: ProjectileFactory;// = new ProjectileFactory();

    private maxBulletCooldownTimeInSeconds: number = 0.20;
    private bulletCooldownClock: THREE.Clock = new THREE.Clock(false);

    private maxDeathExplosionTimeInSeconds: number = 0.25;
    private deathExplosionCooldownClock: THREE.Clock = new THREE.Clock(false);

    private maxRocketCooldownTimeInSeconds: number = 0.5;
    private rocketCooldownClock: THREE.Clock = new THREE.Clock(false);

    private maxAirstrikeCooldownTimeInSeconds: number = 0.25;
    private airstrikeCooldownClock: THREE.Clock = new THREE.Clock(false);

    flamethrowerBoundingBox: THREE.Mesh;
    flamethrowerBoundingBoxMaterial: THREE.MeshBasicMaterial;
    flamethrowerActive: boolean = false;
    
    private activeAirstrike!: Projectile;

    private shield!: Shield;

    private deathCount: number = 0;
    public getDeathCount() {
        return this.deathCount;
    }

    constructor(scene: THREE.Scene,
        isDebug: boolean,
        isCpuPlayer: boolean,
        playerName: string, playerColor: THREE.Color,
        crosshairTexture: THREE.Texture, markerTexture: THREE.Texture, particleMaterial: THREE.SpriteMaterial,
        vehicle: IPlayerVehicle,
        maxHealth: number,
        leftHeadlightOffset: THREE.Vector3,
        rightHeadlightOffset: THREE.Vector3,
        leftBrakeLightOffset: THREE.Vector3,
        rightBrakeLightOffset: THREE.Vector3) {

        this.scene = scene;
        this.isDebug = isDebug;
        this.isCpuPlayer = isCpuPlayer;

        this.playerId = uuidv4();
        this.healthBar = new HealthBar(scene, maxHealth);

        this.currentHealth = maxHealth;

        this.projectileFactory = new ProjectileFactory(particleMaterial);
        this.headLights = new Headlights(scene, leftHeadlightOffset, rightHeadlightOffset);
        this.brakeLights = new Brakelights(scene, leftBrakeLightOffset, rightBrakeLightOffset);
        if(this.brakeLights != null)
            this.brakeLights.setVisible(false);


         // ambulance
         if(playerName == "2") {

            let offsetLeft = new THREE.Vector3(-0.55, 0.75, 0.25);
            let offsetRight = new THREE.Vector3(-0.55, 0.75, -0.25);
            this.emergencyLights = new EmergencyLights(scene, offsetLeft, offsetRight);
            this.emergencyLights.setVisible(true);

            offsetLeft = new THREE.Vector3(1.1, 0.85, 0.25);
            offsetRight = new THREE.Vector3(1.1, 0.85, -0.25);
            this.emergencyLights2 = new EmergencyLights(scene, offsetLeft, offsetRight);
            this.emergencyLights2.setVisible(true);
        }

        // police car
        if(playerName == "6") {

            let offsetLeft = new THREE.Vector3(0, 0.55, 0.2);
            let offsetRight = new THREE.Vector3(0, 0.55, -0.2);
            this.emergencyLights = new EmergencyLights(scene, offsetLeft, offsetRight);
            this.emergencyLights.setVisible(true);
        }

         // fire truck
         if(playerName == "9") {

            let offsetLeft = new THREE.Vector3(-1.1, 1.20, 0.4);
            let offsetRight = new THREE.Vector3(-1.1, 1.20, -0.4);
            this.emergencyLights = new EmergencyLights(scene, offsetLeft, offsetRight);
            this.emergencyLights.setVisible(true);

            offsetLeft = new THREE.Vector3(1.5, 1.20, 0.4);
            offsetRight = new THREE.Vector3(1.5, 1.20, -0.4);
            this.emergencyLights2 = new EmergencyLights(scene, offsetLeft, offsetRight);
            this.emergencyLights2.setVisible(true);
        }


        // police tractor
        if(playerName == "10") {

            let offsetLeft = new THREE.Vector3(0.45, 1.25, 0.25);
            let offsetRight = new THREE.Vector3(0.45, 1.25, -0.25);
            this.emergencyLights = new EmergencyLights(scene, offsetLeft, offsetRight);
            this.emergencyLights.setVisible(true);
        }

        this.playerName = playerName;      
        let gameScene = <GameScene>scene;

        let material = new THREE.SpriteMaterial({
            map: gameScene.explosionTexture,
            depthTest: true
        });
        
        this.turboParticleEmitter = new ParticleTrailObject(
            scene,
            ParticleEmitterType.GlowingParticles,
            new THREE.Color('white'),
            new THREE.Color('yellow'),
            new THREE.Color('orange'),
            new THREE.Color('red'),
            1,
            0.02,
            material);

        this.turboParticleEmitter.pause();
        gameScene.addToParticleEmitters(this.turboParticleEmitter);

        this.flamethrowerEmitter = new FlamethrowerEmitter(gameScene,
            this.playerId,
            gameScene.explosionTexture,
            new THREE.Color('yellow'),
            new THREE.Color('orange'),
            new THREE.Vector3(0, 1, 0),
            5
        );
        gameScene.addToFlamethrowerEmitters(this.flamethrowerEmitter);

        this.playerColor = playerColor;
        this.target = new Target(scene, crosshairTexture, playerColor, new THREE.Vector3(0,0,0), 0.075, true);
        this.playerMarker = new PlayerMarker(scene, markerTexture, playerColor, new THREE.Vector3(0,0,0), 0.05, false);

        //this.shield = new Shield(scene, this.getPosition());

        this.setVehicleObject(vehicle);

        //const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const cylinderGeometry = new THREE.CylinderGeometry(0.6, 0.4, 3);
        //const cylinderGeometry = new THREE.BoxGeometry(1, 5, 1)
        this.flamethrowerBoundingBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.flamethrowerBoundingBox = new THREE.Mesh(cylinderGeometry, this.flamethrowerBoundingBoxMaterial);
        scene.add(this.flamethrowerBoundingBox);
    }

    private getScene(): GameScene {
        return <GameScene>this.scene;
    }

    getPosition(): THREE.Vector3{
        if(!this.vehicleObject?.getChassis().body) return new THREE.Vector3(0,10,0);

        return Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position);
    }

    isVehicleObjectNull(): boolean {
        return !this.vehicleObject;
    }

    getChassisBody(): CANNON.Body {
        return this.vehicleObject.getChassis().body;
    }

    isModelNull(): boolean {
        return !this.vehicleObject.getModel();
    }

    getModelQuaternion(): THREE.Quaternion {
        return this.vehicleObject.getModel().quaternion;
    }

    getModelPosition(): THREE.Vector3 {
        return this.vehicleObject.getModel().position;
    }

    update(): void {
            
        this.fireObjects.forEach(x => {
            x.setEmitPosition(this.vehicleObject.getChassis().getPosition());
        });
        this.fireObjects.forEach(x => x.update());

        if(this.playerState == PlayerState.Dead) {
            
            if(this.deathExplosionCooldownClock.getElapsedTime() > this.maxDeathExplosionTimeInSeconds) {
                this.deathExplosionCooldownClock.stop();

                this.generateRandomExplosion();
                this.deathExplosionCooldownClock.start();
            }        

            this.vehicleObject.update();            

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

        if(!this.vehicleObject?.getChassis()?.body?.position) return;

        this.vehicleObject.update();

        let healthBarOffset = new THREE.Vector3(0, 0, 0.5);
        healthBarOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);
        this.healthBar.update(Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), healthBarOffset));

        if(this.target != null) {
            let targetOffset = new THREE.Vector3(-5, 0, 0);
            targetOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);
            this.target.setTargetLocation(Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), targetOffset));

            // TODO: move to projectile        
            let groundTargetOffset = new THREE.Vector3(-10, 0, 0);
            groundTargetOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);
            let groundTargetMeshLocation = Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), groundTargetOffset);
            let positionOnTerrain = this.getScene().getWorldPositionOnTerrain(groundTargetMeshLocation.x, groundTargetMeshLocation.z);
            this.target.setTargetMeshPosition(positionOnTerrain);//new THREE.Vector3(worldPosition.x, worldPosition.y + 1, worldPosition.z));        
            this.target.rotateTargetToFaceDown();
        }
        
        this.playerMarker.setTargetLocation(new THREE.Vector3(this.getPosition().x, this.getPosition().y + 2, this.getPosition().z));

        let offset = new THREE.Vector3(-2, 0, 0);
        offset.applyQuaternion(this.vehicleObject.getModel().quaternion);
        var flamethrowerBoundingCylinderOffset = Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), offset);
        this.flamethrowerBoundingBox.position.set(flamethrowerBoundingCylinderOffset.x, flamethrowerBoundingCylinderOffset.y, flamethrowerBoundingCylinderOffset.z);
        this.flamethrowerBoundingBox.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/2);
        this.flamethrowerBoundingBox.applyQuaternion(this.vehicleObject.getModel().quaternion);

        if(this.flamethrowerActive) {
            if(this.isDebug) { 
                this.flamethrowerBoundingBox.visible = true;
            }

            this.flamethrowerActive = false;
        }
        else {
            this.flamethrowerBoundingBox.visible = false;
        }
        
        if(this.headLights != null)
            this.headLights.update(
                Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position),
                Utility.CannonQuaternionToThreeQuaternion(this.vehicleObject.getChassis().body.quaternion)            
            );
        
        if(this.brakeLights != null)
            this.brakeLights.update(
                Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position),
                Utility.CannonQuaternionToThreeQuaternion(this.vehicleObject.getChassis().body.quaternion)            
            );              

        if(this.emergencyLights != null)
            this.emergencyLights.update(
                Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position),
                Utility.CannonQuaternionToThreeQuaternion(this.vehicleObject.getChassis().body.quaternion)            
            );            
            
        if(this.emergencyLights2 != null)
            this.emergencyLights2.update(
                Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position),
                Utility.CannonQuaternionToThreeQuaternion(this.vehicleObject.getChassis().body.quaternion)            
            );    
        
        /*
        switch(launchLocation) {
            case ProjectileLaunchLocation.Left:                
                sideVector = new THREE.Vector3(-10, 0, sideOffset);
                break;
            case ProjectileLaunchLocation.Center:
                sideVector = new THREE.Vector3(0, 0, 0);
                break;                
            case ProjectileLaunchLocation.Right:
                sideVector = new THREE.Vector3(0, 0, -sideOffset);
                break;
        }
        */
        let turboOffset = new THREE.Vector3(1, 0, 0);
        turboOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);
        let turboEmitPosition = Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), turboOffset);

        this.turboParticleEmitter.setEmitPosition(turboEmitPosition);

        this.fireObjects.forEach(x => x.setEmitPosition(this.getPosition()));


        if(this.bulletCooldownClock.getElapsedTime() > this.maxBulletCooldownTimeInSeconds) {
            this.bulletCooldownClock.stop();
        }        

        if(this.rocketCooldownClock.getElapsedTime() > this.maxRocketCooldownTimeInSeconds) {
            this.rocketCooldownClock.stop();
        }

        if(this.airstrikeCooldownClock.getElapsedTime() > this.maxAirstrikeCooldownTimeInSeconds) {
            this.airstrikeCooldownClock.stop();
        }
        
        //if(this.bulletCooldownTime > 0) this.bulletCooldownTime--;

        if(this.shield != null)
            this.shield.updatePosition(this.getPosition());
    }

    public createProjectile(projectileType: ProjectileType): Projectile {
                
        let scene = <GameScene>this.scene;

        let launchLocation = ProjectileLaunchLocation.Center;        

        let forwardVector = new THREE.Vector3(-2, 0, 0);
        forwardVector.applyQuaternion(this.vehicleObject.getModel().quaternion);
        let projectileLaunchVector = forwardVector; 

        let sideOffset = 0;
        switch(projectileType) {
            case ProjectileType.Bullet:
                sideOffset = 2;
                this.fireLeft = !this.fireLeft;
                launchLocation = this.fireLeft ? ProjectileLaunchLocation.Left : ProjectileLaunchLocation.Right;
                break;
            case ProjectileType.Rocket:
                sideOffset = 5;
                launchLocation = ProjectileLaunchLocation.Center;
                break;
        }        

        let sideVector = new THREE.Vector3();
        switch(launchLocation) {
            case ProjectileLaunchLocation.Left:                
                sideVector = new THREE.Vector3(0, 0, sideOffset);
                break;
            case ProjectileLaunchLocation.Center:
                sideVector = new THREE.Vector3(0, 0, 0);
                break;                
            case ProjectileLaunchLocation.Right:
                sideVector = new THREE.Vector3(0, 0, -sideOffset);
                break;
        }
        sideVector.applyQuaternion(this.vehicleObject.getModel().quaternion);

        //axis-aligned bounding box
        const aabb = new THREE.Box3().setFromObject(this.vehicleObject.getChassis().mesh);
        const size = aabb.getSize(new THREE.Vector3());

        const vec = new THREE.Vector3();
        this.vehicleObject.getModel().getWorldPosition(vec);

        // offset to front of gun
        var tempPosition = vec.add(
                sideVector.clone().multiplyScalar(-size.z * 0.12)
        );

        if(projectileType == ProjectileType.Airstrike) {
            vec.y += 20;
        }

        // offset to side of car
        // +x is in left of car, -x is to right of car
        // +z is in front of car, -z is to rear of car
        //var tempPosition = vec.add(
            //this.directionVector.clone().multiplyScalar(-size.z * 5)
        //);
        //tempPosition.add(this.directionVector.clone().multiplyScalar(size.z * 1.5));

        var projectile = this.projectileFactory.generateProjectile(
            this.scene, this.isDebug,
            this.playerId,
            projectileType,            
            tempPosition,           // launchPosition relative to chassis
            projectileLaunchVector,  
            this.vehicleObject.getModel().quaternion,          
            scene.getWorld());              

        if(projectileType == ProjectileType.Airstrike)
            this.activeAirstrike = projectile;

        return projectile;
    }

    private setVehicleObject(vehicle: IPlayerVehicle) {
        this.vehicleObject = vehicle;
    }

    getVehicleObject(): IPlayerVehicle {
        return this.vehicleObject;
    }


    tryAccelerateWithKeyboard(): void {
        this.vehicleObject.tryAccelerate();
        this.brakeLights.setVisible(false);
    }
    
    tryAccelerateWithJoystick(joystickY: number): void {
        this.vehicleObject.tryAccelerateWithJoystick(joystickY);
        this.brakeLights.setVisible(false);
    }

    tryStopAccelerateWithKeyboard(): void {
        this.vehicleObject.tryStopAccelerate();
    }
    
    tryReverseWithKeyboard(): void {
        this.vehicleObject.tryReverse();
        this.brakeLights.setVisible(true);
    }
        
    tryReverseWithJoystick(joystickY: number): void {
        this.vehicleObject.tryReverseWithJoystick(joystickY);
        this.brakeLights.setVisible(true);
    }

    tryStopReverseWithKeyboard(): void {
        this.vehicleObject.tryStopReverse();
        this.brakeLights.setVisible(false);
    }

    tryTurn(x: number): void {
        this.vehicleObject.tryTurn(x);
    }
    
    tryTightTurn(x: number): void {
        this.vehicleObject.tryTightTurn(x);
    }
    
    tryTurnLeftWithKeyboard(): void {
        this.vehicleObject.tryTurnLeft();
    }

    tryStopTurnLeftWithKeyboard(): void {
        this.vehicleObject.tryStopTurnLeft(); // same as right
    }

    tryTurnRightWithKeyboard(): void {
        this.vehicleObject.tryTurnRight();
    }

    tryStopTurnRightWithKeyboard(): void {
    }

    tryJump(): void {
        this.vehicleObject.tryJump();
    }

    tryTurbo(): void {        
        this.vehicleObject.tryTurbo();
        this.turboParticleEmitter.resume();
    }

    tryStopTurbo(): void {
        this.turboParticleEmitter.pause();
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

    tryDamageWithFlamethrower(): void {
        
        this.currentHealth -= 0.5;

        this.healthBar.updateValue(this.currentHealth);

        if(this.currentHealth <= 0)
            this.tryKill();
    }

    tryDamageWithAirstrike(): void {
        
        this.currentHealth -= 2;

        this.healthBar.updateValue(this.currentHealth);

        if(this.currentHealth <= 0)
            this.tryKill();
    }
    
    tryKill() {

        if(this.playerState == PlayerState.Alive) {

            if(randInt(0, 2) == 0)
                this.tryJump();

            this.playerState = PlayerState.Dead;
            this.deathCount++;
        
            var scene = this.getScene();
            
            if(this.headLights != null)
                this.headLights.group.visible = false;

            if(this.brakeLights != null)
                this.brakeLights.group.visible = false;

            if(this.shield != null)
                this.shield.setVisible(false);

            if(this.emergencyLights != null)
                this.emergencyLights.setVisible(false);

            if(this.emergencyLights2 != null)
                this.emergencyLights2.setVisible(false);

            this.vehicleObject.tryStopAccelerate();
            this.vehicleObject.tryStopReverse();

            //this.vehicleObject.getModel().visible = false;
            this.vehicleObject.getModel().traverse((child: THREE.Object3D) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const material = mesh.material as THREE.MeshStandardMaterial;
                    // Set the material color for the mesh
                    material.color.set(0x000000); // Example: Set color to green
                }
            });            

            this.vehicleObject.getWheelModels().forEach(x => x.visible = false);      
        
            this.vehicleObject.setAcceptInput(false);      
            this.turboParticleEmitter.pause();

            if(!scene.explosionTexture) return;

            let deathFire = new FireObject(
                this.scene,
                scene.explosionTexture,
                new THREE.Color('yellow'),
                new THREE.Color('orange'),
                this.getPosition(),
                3,
                3000
            );
            this.fireObjects.push(deathFire);
            
            let smokeEmitPosition = this.getPosition().add(new THREE.Vector3(0, 0.5, 0));
            let smokeObject = new SmokeObject2(this.scene, scene.explosionTexture, smokeEmitPosition, 1, 3000);

            this.generateRandomExplosion();

            let wheels = this.vehicleObject.getWheelModels();
            scene.generateRandomDebrisWheel(wheels[0].position.add(new THREE.Vector3(0, 0.5, 0)), wheels[0].quaternion);
            scene.generateRandomDebrisWheel(wheels[1].position.add(new THREE.Vector3(0, 0.5, 0)), wheels[1].quaternion);
            scene.generateRandomDebrisWheel(wheels[2].position.add(new THREE.Vector3(0, 0.5, 0)), wheels[2].quaternion);
            scene.generateRandomDebrisWheel(wheels[3].position.add(new THREE.Vector3(0, 0.5, 0)), wheels[3].quaternion);
            
            this.deathExplosionCooldownClock.start();
            /*
            let smokeObject = new ParticleTrailPointsShaderObject(
                scene,
                ParticleEmitterType.SmokeEmit,
                //particleTexture,
                new THREE.Color('grey'),
                new THREE.Color(0x663399),
                new THREE.Color(0x663399),
                new THREE.Color(0x4d0099),
                1, // number of particle
                0.01, // TODO: max particle velocity
                100, // initial particle size
                0.01, // max position jitter
                3000
            );
            smokeObject.setEmitPosition(this.getPosition());
            */

            this.fireObjects.push(smokeObject);            

            this.fireObjects.forEach(x => x.setEmitPosition(this.getPosition()));

            setTimeout(() => {
                this.playerState = PlayerState.Respawning
            }, Player.RespawnTimeinMs);
        }
    }

    tryRespawn() {
        this.refillHealth();        

        
        this.playerState = PlayerState.Alive;        
        this.tryStopTurbo();

        var mapDimensions = this.getScene().getMapDimensions();
        
        let randX = THREE.MathUtils.randFloat(-mapDimensions.x / 2, mapDimensions.x / 2);        
        let randZ = THREE.MathUtils.randFloat(-mapDimensions.z / 2, mapDimensions.z / 2);

        let worldPosition = this.getScene().getWorldPositionOnTerrain(randX, randZ);

        this.vehicleObject.setAcceptInput(true);
        this.vehicleObject.respawnPosition(worldPosition.x, worldPosition.y + 2, worldPosition.z);

        this.vehicleObject.getModel().traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const material = mesh.material as THREE.MeshStandardMaterial;
                material.color.set(0xffffff);
            }
        });        
        this.vehicleObject.getModel().visible = true;
        this.vehicleObject.getWheelModels().forEach(x => x.visible = true);            

        if(this.headLights != null)
            this.headLights.group.visible = true;

        if(this.emergencyLights != null)
            this.emergencyLights.setVisible(true);

        if(this.emergencyLights2 != null)
            this.emergencyLights2.setVisible(true);
        //this.turboParticleEmitter.isEmitting = true;
    }

    tryFirePrimaryWeapon(): void {
        
    }

    tryFireSecondaryWeapon(): void {

    }

    tryFireRocket(): void {

        if(!this.rocketCooldownClock.running) {

            let projectile = this.createProjectile(ProjectileType.Rocket);

            let gameScene = <GameScene>this.scene;
            gameScene.addNewProjectile(projectile);

            this.rocketCooldownClock.start();
        }       
    }

    tryFireAirStrike(): void {

        if(!this.airstrikeCooldownClock.running) {

            if(this.activeAirstrike == null || this.activeAirstrike.isDetonated) {
                let projectile = this.createProjectile(ProjectileType.Airstrike);

                let gameScene = <GameScene>this.scene;
                gameScene.addNewProjectile(projectile);

                this.airstrikeCooldownClock.start();
            }
            else {
                this.activeAirstrike.detonate();
                this.airstrikeCooldownClock.start();
            }
        }       
    }

    tryFireFlamethrower(): void {        
        this.flamethrowerEmitter.setPosition(this.getPosition());
        if(!this.isVehicleObjectNull() && !this.isModelNull()) {                
            this.flamethrowerEmitter.setQuaternion(this.getModelQuaternion());
        }
    
        this.flamethrowerEmitter.emitParticles();
        this.flamethrowerActive = true;
    }

    tryFireBullets(): void {
        //if(this.bulletCooldownTime <= 0) {
        if(!this.bulletCooldownClock.running) {

            let projectile = this.createProjectile(ProjectileType.Bullet);

            let gameScene = <GameScene>this.scene;
            gameScene.addNewProjectile(projectile);

            //this.bulletCooldownTime = this.maxBulletCooldownTime;
            this.bulletCooldownClock.start();
        }
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

        if(this.playerId == this.getScene().player1.playerId)
            this.getScene().sceneController.updateHealthOnHud(this.currentHealth);
    }

    refillShield(): void {

    }

    trySelectPreviousWeapon(): void {

    }

    trySelectNextWeapon(): void {

    }
    
    tryResetPosition(): void {

        let gameScene = <GameScene>this.scene;

        var position = gameScene.getWorldPositionOnTerrain(this.getPosition().x, this.getPosition().z);
        position.y += 2;

        this.vehicleObject.resetPosition(position);
    }

    getTotalParticleCount(): number {
        let particleCount = 0;
        this.fireObjects.forEach(x => particleCount += x.getParticleCount());
        
        return particleCount;
    }

    private generateRandomExplosion(): void {
        let scene = this.getScene();                
        scene.generateRandomExplosion(ProjectileType.Rocket,
            this.getPosition().add(new THREE.Vector3(randFloatSpread(3), randFloatSpread(2), randFloatSpread(3))),
            new THREE.Color('white'),
            new THREE.Color('white'),
            new THREE.Color('yellow'),
            new THREE.Color('orange'),
            new THREE.Color('red')
        );
    }
}