import * as THREE from "three";
import { RaycastVehicleObject } from "../vehicles/raycastVehicle/raycastVehicleObject";
import { Player, PlayerTeam, VehicleType } from "./player";
import * as CANNON from 'cannon-es'
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import GameScene from "../../scenes/gameScene";

export class VehicleFactory {
    crosshairTexture: THREE.Texture;
    markerTexture: THREE.Texture;
    particleMaterial: THREE.SpriteMaterial;
    constructor(crosshairTexture: THREE.Texture, markerTexture: THREE.Texture, particleMaterial: THREE.SpriteMaterial) {
        
        this.crosshairTexture = crosshairTexture;
        this.markerTexture = markerTexture;
        this.particleMaterial = particleMaterial;
        
    }

    generatePlayer(scene: THREE.Scene,
        isDebug: boolean,
        world: CANNON.World, isCpuPlayer: boolean,
        vehicleType: VehicleType, playerColor: THREE.Color,        
        wheelMaterial: CANNON.Material,
        fireBulletSound: THREE.PositionalAudio,
        fireRocketSound: THREE.PositionalAudio,
        explosionSound: THREE.PositionalAudio,
        deathFireSound: THREE.PositionalAudio) : Player {
        //isCpuPlayer: boolean, playerTeam: PlayerTeam, scene: THREE.Scene) : Player {        
        
        let gameScene = <GameScene>scene;

        let vehicle = null;
        let maxHealth = 100;

        let leftHeadlightOffset = new THREE.Vector3(-2, 0, -0.3);
        let rightHeadlightOffset = new THREE.Vector3(-2, 0, 0.3);

        let leftBrakeLightOffset = new THREE.Vector3(1.15, 0.15, -0.3);
        let rightBrakeLightOffset = new THREE.Vector3(1.15, 0.15, 0.3);

        switch(vehicleType) {
            case VehicleType.Taxi:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(5, 4, 5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.4), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.5, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.25,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.taxiModel,             // model                            
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // wheel offset  new THREE.Vector3(0, -0.35, 0)

                    new THREE.Vector3(0.5, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.5, 0.75, 0.75) // rear wheel model scale

                );
                maxHealth = 100;
                break;
            case VehicleType.Ambulance:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(5, 4, 5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    750,                            // chassis mass
                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.25, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.25, 0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.25,    // rearvwheel height

                    20,                              // wheel mass

                    gameScene.ambulanceModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset  new THREE.Vector3(0, -0.35, 0)
                    
                    new THREE.Vector3(0.5, 1, 1), // front wheel model scale,
                    new THREE.Vector3(0.5, 1, 1) // rear wheel model scale
                );
                maxHealth = 150;
                break;
            case VehicleType.RaceCar:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-10, 5, -10),   // position
                    world,            
                    new CANNON.Vec3(0.8, 0.25, 0.4), // chassis dimensions
                    new CANNON.Vec3(0.2, 0.1, 0),    // center of mass adjust
                    250,                            // chassis mass
                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.20,                       //rear wheel radius
                    new CANNON.Vec3(0.3, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.1, 0, 0),   // rear wheel offset

                    0.5,    // front wheel height
                    0.5,    // c wheel height

                    20,                              // wheel mass

                    gameScene.raceCarBlueModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.8, 0.8, 0.8), // front wheel model scale,
                    new THREE.Vector3(0.8, 0.8, 0.8) // rear wheel model scale
                );
                maxHealth = 50;
                leftHeadlightOffset = new THREE.Vector3(-2, -0.1, -0.3);
                rightHeadlightOffset = new THREE.Vector3(-2, -0.1, 0.3);
                leftBrakeLightOffset = new THREE.Vector3(1.15, 0.0, -0.2);
                rightBrakeLightOffset = new THREE.Vector3(1.15, 0.0, 0.2);
                break;
            case VehicleType.RaceCarRed:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-10, 5, -10),   // position
                    world,            
                    new CANNON.Vec3(0.8, 0.25, 0.4), // chassis dimensions
                    new CANNON.Vec3(0.2, 0.1, 0),    // center of mass adjust
                    300,                            // chassis mass
                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.20,                       //rear wheel radius
                    new CANNON.Vec3(0.3, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.1, 0, 0),   // rear wheel offset

                    0.5,    // front wheel height
                    0.5,    // rear wheel height

                
                    20,                              // wheel mass

                    gameScene.raceCarRedModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.8, 0.8, 0.8), // front wheel model scale,
                    new THREE.Vector3(0.8, 0.8, 0.8) // rear wheel model scale
                );
                maxHealth = 50;
                leftHeadlightOffset = new THREE.Vector3(-2, -0.1, -0.3);
                rightHeadlightOffset = new THREE.Vector3(-2, -0.1, 0.3);
                leftBrakeLightOffset = new THREE.Vector3(1.15, 0.0, -0.2);
                rightBrakeLightOffset = new THREE.Vector3(1.15, 0.0, 0.2);
                break;
            case VehicleType.Sedan:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-10, 5, -10),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.5, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.20,                       //rear wheel radius
                    new CANNON.Vec3(0.5, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.25,    // rear wheel height
                    
                    20,                              // wheel mass

                    gameScene.sedanSportsModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.5, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.5, 0.75, 0.75) // rear wheel model scale
                );
                maxHealth = 75;
                break;
            case VehicleType.Police:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.35, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.25, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    
                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.4, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.4, 0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.25,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.policeModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.5, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.5, 0.75, 0.75) // rear wheel model scale
                );
                maxHealth = 125;
                break; 
            case VehicleType.Harvester:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.6), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    1000,                            // chassis mass

                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.3,                            //rear wheel radius

                    new CANNON.Vec3(0.125, 0, 0),    // front wheel offset
                    new CANNON.Vec3(0.125, 0.0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.375,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.tractorModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(1, 1, 1), // model scale,
                    new THREE.Vector3(0, 0, -0.1), // model offset

                    new THREE.Vector3(1, 1, 1), // front wheel model scale,
                    new THREE.Vector3(1.5, 2, 2) // rear wheel model scale
                );
                maxHealth = 150;
                break;         
            case VehicleType.PoliceTractor:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.6), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    1000,                            // chassis mass

                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.5,                       //rear wheel radius

                    new CANNON.Vec3(0.25, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.25, 0.1, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.5,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.policeTractorModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(1, 1, 1), // model scale,
                    new THREE.Vector3(0, 0, -0.175), // model offset

                    new THREE.Vector3(1, 1, 1), // front wheel model scale,
                    new THREE.Vector3(1, 2, 2) // rear wheel model scale
                );
                maxHealth = 150;
                leftHeadlightOffset = new THREE.Vector3(-2.25, 0.25, -0.2);
                rightHeadlightOffset = new THREE.Vector3(-2.25, 0.25, 0.2);
                leftBrakeLightOffset = new THREE.Vector3(1.5, 0.15, -0.3);
                rightBrakeLightOffset = new THREE.Vector3(1.5, 0.15, 0.3);
                break;               
            case VehicleType.Killdozer:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(0.75, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0.5, 0.4, 0),    // center of mass adjust
                    1000,                            // chassis mass

                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.3,                       //rear wheel radius

                    new CANNON.Vec3(0.4, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0, 0.1, 0),   // rear wheel offset
                    
                    0.5,    // front wheel height
                    0.5,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.killdozerModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(1, 1, 1), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(1, 1, 1), // front wheel model scale,
                    new THREE.Vector3(1.5, 1.5, 1.5) // rear wheel model scale
                );
                maxHealth = 150;
                        
                leftHeadlightOffset = new THREE.Vector3(-2.25, 0.25, -0.2);
                rightHeadlightOffset = new THREE.Vector3(-2.25, 0.25, 0.2);
                leftBrakeLightOffset = new THREE.Vector3(1.5, 0.15, -0.3);
                rightBrakeLightOffset = new THREE.Vector3(1.5, 0.15, 0.3);
                break;
            case VehicleType.TrashTruck:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1.5, 0.75, 0.6), // chassis dimensions
                    new CANNON.Vec3(0, 1, 0),    // center of mass adjust
                    1000,                            // chassis mass
                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    
                    new CANNON.Vec3(0.45, 0.5, 0),   // front wheel offset
                    new CANNON.Vec3(0.95, 0.5, 0),   // rear wheel offset

                    0.3,    // front wheel height
                    0.3,    // rear wheel height


                    20,                              // wheel mass
                    gameScene.trashTruckModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(1, 1, 1), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.5, 1, 1), // front wheel model scale,
                    new THREE.Vector3(0.5, 1, 1) // rear wheel model scale
                );
                maxHealth = 150;           
                leftHeadlightOffset = new THREE.Vector3(-3, 0.55, -0.45);
                rightHeadlightOffset = new THREE.Vector3(-3, 0.55, 0.45);
                leftBrakeLightOffset = new THREE.Vector3(1.8, 0.5, -0.35);
                rightBrakeLightOffset = new THREE.Vector3(1.8, 0.5, 0.35);
                break;
            case VehicleType.Offroader:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(0.9, 0.35, 0.45), // chassis dimensions
                    new CANNON.Vec3(0, 0.35, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    
                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius

                    new CANNON.Vec3(0.35, 0, 0),   // front wheel offset - ignores z for now
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset - ignores z for now
                    
                    0.25,    // front wheel height
                    0.25,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.suvModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.5, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.5, 0.75, 0.75) // rear wheel model scale
                );
                maxHealth = 100;
                leftHeadlightOffset = new THREE.Vector3(-2.25, 0.1, -0.3);
                rightHeadlightOffset = new THREE.Vector3(-2.25, 0.1, 0.3);
                break;
            case VehicleType.PickupTruck:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    
                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.25, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.25,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.pickupTruckModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.5, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.5, 0.75, 0.75) // rear wheel model scale
                );
                maxHealth = 100;
                break;
            case VehicleType.FireTruck:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1.5, 0.70, 0.70), // chassis dimensions
                    new CANNON.Vec3(0, 0.6, 0),    // center of mass adjust
                    1250,                            // chassis mass
                    wheelMaterial,
                    
                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.5, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.75, 0, 0),   // rear wheel offset

                    0.25,    // front wheel height
                    0.25,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.fireTruckModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(1, 1, 1), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.5, 1, 1), // front wheel model scale,
                    new THREE.Vector3(0.5, 1, 1) // rear wheel model scale
                );
                maxHealth = 150;
                leftHeadlightOffset = new THREE.Vector3(-3.0, 0.4, -0.45);
                rightHeadlightOffset = new THREE.Vector3(-3.0, 0.4, 0.45);
                leftBrakeLightOffset = new THREE.Vector3(2.0, 0.15, -0.6);
                rightBrakeLightOffset = new THREE.Vector3(2.0, 0.15, 0.6);
                break;
            default:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    new THREE.Vector3(-10, 5, -10),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.5, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.20,                       //rear wheel radius
                    new CANNON.Vec3(0.5, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset

                    0.5,    // front wheel height
                    0.5,    // rear wheel height

                    20,                              // wheel mass

                    gameScene.sedanSportsModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.75, 0.75, 0.75) // rear wheel model scale
                );
                maxHealth = 100            
                break;
        }
        
        return new Player(scene,
            isDebug,
            isCpuPlayer,
            vehicleType.toString(),
            playerColor,
            this.crosshairTexture,
            this.markerTexture,
            this.particleMaterial,
            vehicle,
            maxHealth,
            leftHeadlightOffset,
            rightHeadlightOffset,
            leftBrakeLightOffset,
            rightBrakeLightOffset,
            fireBulletSound,
            fireRocketSound,
            explosionSound,
            deathFireSound
        );
    }
}
