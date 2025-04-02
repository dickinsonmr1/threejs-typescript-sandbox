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
import { CpuPlayerPattern } from "./cpuPlayerPatternEnums";
import { VehicleConfig } from "../vehicles/config/vehicleConfig";
import { WeaponCoolDownClock } from "../weapons/weaponCooldownClock";
import { PlayerSoundKeyMap } from "../audio/playerSoundKeyMap";

export enum PlayerState {
    Alive,
    Dead,
    Respawning
}

export enum VehicleType {
    
    Taxi = 0,
    Ambulance = 1,
    
    RaceCar = 2,
    RaceCarRed = 3,

    Killdozer = 4,
    Police = 5,
    TrashTruck = 6,

    Offroader = 7,

    FireTruck = 8,

    PoliceTractor = 9,
    Harvester = 10,
    
    PickupTruck = 11
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
    maxHealth: number;
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

    //private maxBulletCooldownTimeInSeconds: number = 0.15;
    //private maxUpgradedBulletCooldownTimeInSeconds: number = 0.05;
    //private bulletCooldownClock: THREE.Clock = new THREE.Clock(false);

    private bulletCooldownClock: WeaponCoolDownClock = new WeaponCoolDownClock(0.15, 0.05);

    //private maxDeathExplosionTimeInSeconds: number = 0.25;
    //private deathExplosionCooldownClock: THREE.Clock = new THREE.Clock(false);
    private deathExplosionCooldownClock: WeaponCoolDownClock = new WeaponCoolDownClock(0.25, 0.25);

    //private maxRocketCooldownTimeInSeconds: number = 0.5;
    //private rocketCooldownClock: THREE.Clock = new THREE.Clock(false);
    private rocketCooldownClock: WeaponCoolDownClock = new WeaponCoolDownClock(0.5, 0.5);

    //private maxAirstrikeCooldownTimeInSeconds: number = 0.25;
    //private airstrikeCooldownClock: THREE.Clock = new THREE.Clock(false);
    private airstrikeCooldownClock: WeaponCoolDownClock = new WeaponCoolDownClock(0.25, 0.25);

    //private maxSonicePulseCooldownTimeInSeconds: number = 1.00;
    //private sonicPulseCooldownClock: THREE.Clock = new THREE.Clock(false);
    private sonicPulseCooldownClock: WeaponCoolDownClock = new WeaponCoolDownClock(1.00, 1.00);

    public shovelCooldownClock: WeaponCoolDownClock = new WeaponCoolDownClock(8, 1);
    public currentShovelAngle: number = 0;

    flamethrowerBoundingBox: THREE.Mesh;
    boundingMeshMaterial: THREE.MeshBasicMaterial;
    flamethrowerActive: boolean = false;

    shovelBoundingMesh: THREE.Mesh;
    
    private activeAirstrike!: Projectile;

    private selectedWeaponIndex: number = 0;

    private shield!: Shield;

    private deathCount: number = 0;
    public getDeathCount() {
        return this.deathCount;
    }

    private readonly bulletSoundMarker?: THREE.Mesh;    
    private readonly rocketSoundMarker?: THREE.Mesh;   
    
    private readonly deadzoneX: number;

    vehicleType: VehicleType;

    constructor(scene: THREE.Scene,
        public playerIndex: number,
        isDebug: boolean,
        isCpuPlayer: boolean,
        vehicleType: VehicleType, playerColor: THREE.Color,
        crosshairTexture: THREE.Texture, markerTexture: THREE.Texture, particleMaterial: THREE.SpriteMaterial,
        vehicle: IPlayerVehicle,
        maxHealth: number,
        leftHeadlightOffset: THREE.Vector3,
        rightHeadlightOffset: THREE.Vector3,
        leftBrakeLightOffset: THREE.Vector3,
        rightBrakeLightOffset: THREE.Vector3,
        //fireBulletSound: THREE.PositionalAudio,
        //fireRocketSound: THREE.PositionalAudio,
        //explosionSound: THREE.PositionalAudio,
        //deathFireSound: THREE.PositionalAudio,
        public playerSoundKeyMap: PlayerSoundKeyMap,
        deadzoneX: number,
        vehicleConfig: VehicleConfig) {

        this.scene = scene;
        this.isDebug = isDebug;
        this.isCpuPlayer = isCpuPlayer;
        this.vehicleType = vehicleType;

        this.playerId = uuidv4();
        this.healthBar = new HealthBar(scene, maxHealth);
        
        this.maxHealth= maxHealth;
        this.currentHealth = maxHealth;

        this.projectileFactory = new ProjectileFactory(particleMaterial);
        this.headLights = new Headlights(scene, leftHeadlightOffset, rightHeadlightOffset);
        this.brakeLights = new Brakelights(scene, leftBrakeLightOffset, rightBrakeLightOffset);
        if(this.brakeLights != null)
            this.brakeLights.setVisible(false);


        if(vehicleConfig.hasEmergencyLights1 && vehicleConfig.offsetLeft1 && vehicleConfig.offsetRight1) {
            const frontLeftOffset = Utility.ArrayToThreeVector3(vehicleConfig.offsetLeft1);
            const frontRightOffset = Utility.ArrayToThreeVector3(vehicleConfig.offsetRight1);

            this.emergencyLights = new EmergencyLights(scene, frontLeftOffset, frontRightOffset);
            this.emergencyLights.setVisible(true);            
        }

        if(vehicleConfig.hasEmergencyLights2 && vehicleConfig.offsetLeft2 && vehicleConfig.offsetRight2) {
            const rearLeftOffset = Utility.ArrayToThreeVector3(vehicleConfig.offsetLeft2);
            const rearRightOffset = Utility.ArrayToThreeVector3(vehicleConfig.offsetRight2);
            this.emergencyLights2 = new EmergencyLights(scene, rearLeftOffset, rearRightOffset);
            this.emergencyLights2.setVisible(true);    
        }
       
        this.playerName = vehicleType.toString();
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

        this.shield = new Shield(scene, this.getPosition());

        this.setVehicleObject(vehicle);

        //const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const cylinderGeometry = new THREE.CylinderGeometry(0.6, 0.4, 3);
        //const cylinderGeometry = new THREE.BoxGeometry(1, 5, 1)
        this.boundingMeshMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.flamethrowerBoundingBox = new THREE.Mesh(cylinderGeometry, this.boundingMeshMaterial);
        scene.add(this.flamethrowerBoundingBox);

        const BoxGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
        this.shovelBoundingMesh = new THREE.Mesh(BoxGeometry, this.boundingMeshMaterial);
        scene.add(this.shovelBoundingMesh);
       
        //this.bulletSound.position.copy(this.getPosition());
        //this.rocketSound.position.copy(this.getPosition());
        //scene.add(this.bulletSound);
        //scene.add(this.rocketSound);

        let audioManager = gameScene.getAudioManager();
        

        this.vehicleObject.getChassis().mesh.add(audioManager.getPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.bulletSoundKey)!);
        this.vehicleObject.getChassis().mesh.add(audioManager.getPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.rocketSoundKey)!);
        this.vehicleObject.getChassis().mesh.add(audioManager.getPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.explosionSoundKey)!);
        this.vehicleObject.getChassis().mesh.add(audioManager.getPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.flamethrowerSoundKey)!);

        //this.rocketSoundMarker = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }));
        //this.bulletSoundMarker = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }));
        //scene.add(this.rocketSoundMarker);
        //scene.add(this.bulletSoundMarker);

        this.deadzoneX = deadzoneX;
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

    getChassisBodyCenterOfMassVec3(): CANNON.Vec3 {
        let chassisBody = this.vehicleObject.getChassis().body;

        return chassisBody.position.clone().vadd(chassisBody.shapeOffsets[0]);
        //return chassis.body.position.clone().vsub(chassis.centerOfMassAdjust);
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

    setTargetLocation(targetLocation:THREE.Vector3) {
        this.target.setForwardTargetLocation(targetLocation);
    }

    update(cpuPlayerBehaviorOverride?: CpuPlayerPattern): void {
            
        this.fireObjects.forEach(x => {
            x.setEmitPosition(this.vehicleObject.getChassis().getPosition());
        });
        this.fireObjects.forEach(x => x.update());

        if(this.playerState == PlayerState.Dead) {
            
            if(this.deathExplosionCooldownClock.isExpired()) {
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

        if(this.vehicleType == VehicleType.Killdozer) {
            let shovelModel = this.getShovel(this.vehicleObject.getModel());
            if(shovelModel != null) {

            if(this.shovelCooldownClock.isRunningAndNotExpired()) {
                
                const rotationAmplitude = -3 * Math.PI / 4; // -3π/4
                const elapsedTime = this.shovelCooldownClock.getElapsedTime() % 0.5; // Normalize to 0.5-second cycle
                const progress = elapsedTime * 2 * Math.PI; // Convert to full sine wave cycle
            
                // Smooth rotation using sin wave (alternates between 0 and -3π/4)
                let angle = rotationAmplitude * Math.sin(progress);
                shovelModel?.rotation.set(angle, 0, 0);

                this.currentShovelAngle = angle;
                if(elapsedTime < 0.1) {
                    let gameScene = <GameScene>this.scene;
                    gameScene.getAudioManager().playPlayerSpecificSoundIfNotCurrentlyPlaying(this.playerIndex, this.playerSoundKeyMap.shovelSoundKey, false);
                }                    
            }
            else 
                shovelModel?.rotation.set(0,0,0);
        }
        }

        //this.bulletSound.position.copy(this.getPosition());        
        //this.bulletSound.updateMatrixWorld(true);

        //this.rocketSound.position.copy(this.getPosition());
        //this.rocketSound.updateMatrixWorld(true);

        let healthBarOffset = new THREE.Vector3(0, 0, 0.5);
        healthBarOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);
        this.healthBar.update(Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), healthBarOffset));

        if(this.target != null) {
            let targetOffset = new THREE.Vector3(-5, 0, 0);
            targetOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);
            this.target.setForwardTargetLocation(Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), targetOffset));

            
            // TODO: move to projectile        
            let groundTargetOffset = new THREE.Vector3(-10, 0, 0);
            groundTargetOffset.applyQuaternion(this.vehicleObject.getModel().quaternion);

            let groundTargetMeshLocation = Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), groundTargetOffset);
            if(this.isCpuPlayer
                && cpuPlayerBehaviorOverride != null
                && (cpuPlayerBehaviorOverride == CpuPlayerPattern.Follow || cpuPlayerBehaviorOverride == CpuPlayerPattern.FollowAndAttack)) {
                    groundTargetMeshLocation = this.getScene().player1.getPosition();
            }
            let positionOnTerrain = this.getScene().terrainChunk.getWorldPositionOnTerrain(groundTargetMeshLocation.x, groundTargetMeshLocation.z);                
            
            this.target.setGroundTargetMeshPosition(positionOnTerrain);//new THREE.Vector3(worldPosition.x, worldPosition.y + 1, worldPosition.z));        
            this.target.rotateGroundTargetToFaceDown();            
        }
                
        this.playerMarker.setTargetLocation(new THREE.Vector3(this.getPosition().x, this.getPosition().y + 2, this.getPosition().z));

        // flamethrower intersection mesh
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

            //this.flamethrowerActive = false;
        }
        else {
            this.flamethrowerBoundingBox.visible = false;            
        }

        // shovel intersection mesh
        offset = new THREE.Vector3(-1, 0.5, 0);
        offset.applyQuaternion(this.vehicleObject.getModel().quaternion);
        var boundingMeshOffset = Utility.ThreeVector3Add(Utility.CannonVec3ToThreeVec3(this.vehicleObject.getChassis().body.position), offset);
        this.shovelBoundingMesh.position.set(boundingMeshOffset.x, boundingMeshOffset.y, boundingMeshOffset.z);
        this.shovelBoundingMesh.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/2);
        this.shovelBoundingMesh.applyQuaternion(this.vehicleObject.getModel().quaternion);

        if(this.shovelCooldownClock.isRunningAndNotExpired()) {
            if(this.isDebug)
                this.shovelBoundingMesh.visible = true;
        }
        else
            this.shovelBoundingMesh.visible = false
        
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

        this.bulletCooldownClock.stopIfExpired();
        this.rocketCooldownClock.stopIfExpired();
        this.airstrikeCooldownClock.stopIfExpired();
        this.sonicPulseCooldownClock.stopIfExpired();
        this.shovelCooldownClock.stopIfExpired();

        if(this.shield != null)
            this.shield.updatePosition(this.getPosition());

        //this.bulletSoundMarker.position.copy(this.bulletSound.position);
        //this.rocketSoundMarker.position.copy(this.rocketSound.position);
    }

    private getShovel(model: THREE.Group): THREE.Object3D<THREE.Object3DEventMap> | undefined {
        let bodyModel = model.children.find(x => x.name == 'body');
        return bodyModel?.children.find(x => x.name == 'shovel');
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
        if(Math.abs(x) > this.deadzoneX)
            this.vehicleObject.tryTurn(x);
        else
            this.vehicleObject.tryStopTurnLeft();
    }
    
    tryTightTurn(x: number): void {
        if(Math.abs(x) > this.deadzoneX)
            this.vehicleObject.tryTightTurn(x);
        else
            this.vehicleObject.tryStopTurnLeft();
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
        this.vehicleObject.tryStopTurnRight();
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
    
    tryDamage(projectileType: ProjectileType, damageLocation: THREE.Vector3, impactForce?: CANNON.Vec3): void {
        
        if(projectileType == ProjectileType.Bullet)
            this.currentHealth -= 5;
        else if(projectileType == ProjectileType.Rocket) {
            this.currentHealth -= 20;

            if(impactForce != undefined) {
                //this.getChassisBody().applyForce(impactForce, Utility.ThreeVec3ToCannonVec3(damageLocation))
                //this.getChassisBody().applyImpulse(impactForce, Utility.ThreeVec3ToCannonVec3(damageLocation))
                this.getVehicleObject().applyImpulseWhileWheelsAreDisabled(impactForce);                                        
            }
        }

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

            if(randInt(0, 1) == 0)
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

            let gameScene = <GameScene>this.scene;

            let deathFire = new FireObject(
                this.scene,
                scene.explosionTexture,
                new THREE.Color('yellow'),
                new THREE.Color('orange'),
                this.getPosition(),
                3,
                3000,
                gameScene.getAudioManager().getPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.deathFireSoundKey)!
            );
            this.fireObjects.push(deathFire);
            
            let smokeEmitPosition = this.getPosition().add(new THREE.Vector3(0, 0.5, 0));
            let smokeObject = new SmokeObject2(this.scene, scene.explosionTexture, smokeEmitPosition, 1, 3000);

            this.generateRandomExplosion();

            gameScene.getAudioManager().playPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.explosionSoundKey, false);

            //if(this.explosionSound.isPlaying)
                //this.explosionSound.stop();
            //this.explosionSound.play();
            //this.explosionSound.detune = Math.floor(Math.random() * 1600 - 800);

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

            this.healthBar.updateValue(0);

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

        let worldPosition = this.getScene().terrainChunk.getWorldPositionOnTerrain(randX, randZ);

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

        if(!this.rocketCooldownClock.isRunning()) {

            let projectile = this.createProjectile(ProjectileType.Rocket);

            let gameScene = <GameScene>this.scene;
            gameScene.addNewProjectile(projectile);

            this.rocketCooldownClock.start();

            gameScene.getAudioManager().playPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.rocketSoundKey, true);

            //if(this.rocketSound.isPlaying)
                //this.rocketSound.stop();

            //this.rocketSound.play();
            //this.rocketSound.detune = Math.floor(Math.random() * 1600 - 800);
        }       
    }

    tryFireAirStrike(): void {

        if(!this.airstrikeCooldownClock.isRunning()) {

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

        if(this.playerState == PlayerState.Alive) {
            this.flamethrowerEmitter.setPosition(this.getPosition());
            if(!this.isVehicleObjectNull() && !this.isModelNull()) {                
                this.flamethrowerEmitter.setQuaternion(this.getModelQuaternion());
            }
        
            let gameScene = <GameScene>this.scene;
            gameScene.getAudioManager().playPlayerSpecificLoopedSound(this.playerIndex, this.playerSoundKeyMap.flamethrowerSoundKey);

            this.flamethrowerEmitter.emitParticles();
            this.flamethrowerActive = true;
        }
    }

    tryStopFireFlamethrower() {
        this.flamethrowerActive = false;

        let gameScene = <GameScene>this.scene;
        gameScene.getAudioManager().stopSound(this.playerSoundKeyMap.flamethrowerSoundKey, this.playerIndex);
    }

    tryFireBullets(): void {
        //if(this.bulletCooldownTime <= 0) {
        if(!this.bulletCooldownClock.isRunning()) {

            let projectile = this.createProjectile(ProjectileType.Bullet);

            let gameScene = <GameScene>this.scene;
            gameScene.addNewProjectile(projectile);

            //this.bulletCooldownTime = this.maxBulletCooldownTime;
            this.bulletCooldownClock.start();

            //if(this.bulletSound != null) {
                
                // TODO: replace with audio manager call
                /*
                if(this.bulletSound.isPlaying)
                    this.bulletSound.stop();

                this.bulletSound.play();
                this.bulletSound.detune = Math.floor(Math.random() * 1600 - 800);
                */
                //
                let audioManager = gameScene.getAudioManager();
                audioManager.playPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.bulletSoundKey, true);
            //}
        }
    }

    tryFireDumpster(): void {
        let gameScene = <GameScene>this.scene;

        let forwardVector = new THREE.Vector3(-20, 4, 0);
        forwardVector.applyQuaternion(this.getVehicleObject().getModel().quaternion);
        let projectileLaunchVector = forwardVector; 

        gameScene.generateRandomDumpster(this.getPosition(), projectileLaunchVector);
    }

    tryFireSonicPulse(): void {

        if(!this.sonicPulseCooldownClock.isRunning()) {

            let gameScene = <GameScene>this.scene;
            gameScene.getAudioManager().playPlayerSpecificSound(this.playerIndex, this.playerSoundKeyMap.sonicPulseSoundKey, false);
            gameScene.generateSonicPulse(this.getPosition());

            this.sonicPulseCooldownClock.start();
        }
    }

    tryFireShovel(): void {
        if(this.vehicleType != VehicleType.Killdozer)
            return;

        this.shovelCooldownClock.start();
    }

    tryFireSpecialWeapon() {
        switch(this.vehicleType) {
            case VehicleType.Killdozer:
                this.tryFireShovel();
                break;
            case VehicleType.Taxi:
                break;
            case VehicleType.Ambulance:
                break;
            case VehicleType.RaceCar:
                break;
            case VehicleType.RaceCarRed:
                break;
            case VehicleType.Police:
                break;
            case VehicleType.TrashTruck:
                break;
            case VehicleType.Offroader:
                break;
            case VehicleType.FireTruck:
                break;
            case VehicleType.PoliceTractor:
                break;
            case VehicleType.Harvester:
                break;
            case VehicleType.PickupTruck:
                break;
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
        this.selectedWeaponIndex--;
        this.getScene().sceneController.selectPreviousWeaponOnHud();
    }

    trySelectNextWeapon(): void {
        this.selectedWeaponIndex++;
        this.getScene().sceneController.selectNextWeaponOnHud();
    }
    
    tryResetPosition(): void {

        let gameScene = <GameScene>this.scene;

        var position = gameScene.terrainChunk.getWorldPositionOnTerrain(this.getPosition().x, this.getPosition().z);
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