import * as THREE from "three";
import { DriveSystem, RaycastVehicleObject } from "./raycastVehicle/raycastVehicleObject";
import { Player, PlayerTeam, VehicleType } from "../player/player";
import * as CANNON from 'cannon-es'
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import GameScene from "../../scenes/gameScene";

import { VehicleConfig } from './config/vehicleConfig';
import vehicleConfigDefault from './config/99-default.json'
import vehicleConfigOffroader from './config/07-offroader.json'
import vehicleConfigTaxi from './config/00-taxi.json'
import vehicleConfigAmbulance from './config//01-ambulance.json'
import vehicleConfigRaceCarBlue from './config//02-racecar-blue.json'
import vehicleConfigRaceCarRed from './config/03-racecar-red.json'
import vehicleConfigPolice from './config/05-police.json'
import vehicleConfigCompactor from './config/06-trashTruck.json'
import vehicleConfigFireTruck from './config/08-fireTruck.json'
import vehicleConfigPickupTruck from './config/11-pickupTruck.json'
import vehicleConfigPoliceTractor from './config/09-policeTractor.json'
import vehicleConfigKilldozer from './config/04-killdozer.json'
import vehicleConfigHarvester from './config/10-harvester.json'
import { PlayerSoundKeyMap } from "../player/playerSoundKeyMap";
export class VehicleFactory {
    
    crosshairTexture: THREE.Texture;
    markerTexture: THREE.Texture;
    particleMaterial: THREE.SpriteMaterial;

    //public vehicleConfigDefault: VehicleConfig = vehicleConfigDefaultJson;
    
    // TODO: investigate adding one for each car
    //public vehicleConfigOffroader: VehicleConfig = vehicleConfigOffroader;
    //public vehicleConfigTaxi: VehicleConfig = vehicleConfigTaxi;

    constructor(crosshairTexture: THREE.Texture, markerTexture: THREE.Texture, particleMaterial: THREE.SpriteMaterial) {
        
        this.crosshairTexture = crosshairTexture;
        this.markerTexture = markerTexture;
        this.particleMaterial = particleMaterial;        
    }

    generatePlayer(scene: THREE.Scene,
        playerIndex: number,
        isDebug: boolean,
        world: CANNON.World, isCpuPlayer: boolean,
        vehicleType: VehicleType, playerColor: THREE.Color,        
        deadzoneX: number,
        wheelMaterial: CANNON.Material,
        playerSoundKeyMap: PlayerSoundKeyMap
        ) : Player {
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
                    world,            
                    wheelMaterial,
                    gameScene.taxiModel,             // model                            
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigTaxi
                );
                maxHealth = 100;
                break;
            case VehicleType.Ambulance:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.ambulanceModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigAmbulance
                );
                maxHealth = 150;
                break;
            case VehicleType.RaceCar:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.raceCarBlueModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigRaceCarBlue
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
                    world,            
                    wheelMaterial,
                    gameScene.raceCarRedModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigRaceCarRed
                );
                maxHealth = 50;
                leftHeadlightOffset = new THREE.Vector3(-2, -0.1, -0.3);
                rightHeadlightOffset = new THREE.Vector3(-2, -0.1, 0.3);
                leftBrakeLightOffset = new THREE.Vector3(1.15, 0.0, -0.2);
                rightBrakeLightOffset = new THREE.Vector3(1.15, 0.0, 0.2);
                break;
            case VehicleType.Police:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.policeModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigPolice
                );
                maxHealth = 125;
                break; 
            case VehicleType.Harvester:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.tractorModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigHarvester
                );
                maxHealth = 150;
                break;         
            case VehicleType.PoliceTractor:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.policeTractorModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigPoliceTractor
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
                    world,            
                    wheelMaterial,
                    gameScene.killdozerModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigKilldozer
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
                    world,            
                    wheelMaterial,
                    gameScene.trashTruckModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigCompactor
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
                    world,            
                    wheelMaterial,
                    gameScene.suvModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigOffroader
                );
                maxHealth = 100;
                leftHeadlightOffset = new THREE.Vector3(-2.25, 0.1, -0.3);
                rightHeadlightOffset = new THREE.Vector3(-2.25, 0.1, 0.3);
                break;
            case VehicleType.PickupTruck:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.pickupTruckModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigPickupTruck
                );
                maxHealth = 100;
                break;
            case VehicleType.FireTruck:
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.fireTruckModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigFireTruck
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
                    world,            
                    wheelMaterial,
                    gameScene.sedanSportsModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigDefault
                );
                maxHealth = 100            
                break;
        }
        
        return new Player(scene,
            playerIndex,
            isDebug,
            isCpuPlayer,
            vehicleType,
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
            playerSoundKeyMap,
            deadzoneX,
            vehicle.vehicleOverrideConfig
        );
    }
}

