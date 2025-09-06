import * as THREE from "three";
import { DriveSystem, RaycastVehicleObject } from "./raycastVehicle/raycastVehicleObject";
import { Player, VehicleType } from "../player/player";
import * as CANNON from 'cannon-es'
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import GameScene from "../../scenes/gameScene";
import { Utility } from "../../utility";

import { VehicleConfig } from "./config/vehicleConfig";
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

import vehicleConfigTank from './config/12-tank.json'
import vehicleConfigTanker from './config/13-tanker.json'


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
        wheelMaterial: CANNON.Material
        ) : Player {
        //isCpuPlayer: boolean, playerTeam: PlayerTeam, scene: THREE.Scene) : Player {        
        
        let gameScene = <GameScene>scene;

        let vehicle = null;
        let maxHealth = 100;

        let leftHeadlightOffset = new THREE.Vector3(-2, 0, -0.3);
        let rightHeadlightOffset = new THREE.Vector3(-2, 0, 0.3);

        let leftBrakeLightOffset = new THREE.Vector3(1.15, 0.15, -0.3);
        let rightBrakeLightOffset = new THREE.Vector3(1.15, 0.15, 0.3);

        let selectedVehicleConfig: VehicleConfig;

        switch(vehicleType) {
            case VehicleType.Taxi:
                selectedVehicleConfig = vehicleConfigTaxi
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
                selectedVehicleConfig = vehicleConfigAmbulance
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
                selectedVehicleConfig = vehicleConfigRaceCarBlue;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.raceCarBlueModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigRaceCarBlue
                );
                maxHealth = 50;
                break;
            case VehicleType.RaceCarRed:
                selectedVehicleConfig = vehicleConfigRaceCarRed;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.raceCarRedModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigRaceCarRed
                );
                maxHealth = 50;
                break;
            case VehicleType.Police:
                selectedVehicleConfig = vehicleConfigPolice;
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
                selectedVehicleConfig = vehicleConfigHarvester;
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
                selectedVehicleConfig = vehicleConfigPoliceTractor;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.policeTractorModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigPoliceTractor
                );
                maxHealth = 150;
            case VehicleType.Killdozer:
                selectedVehicleConfig = vehicleConfigKilldozer;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.killdozerModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigKilldozer
                );
                maxHealth = 150;
                break;
            case VehicleType.TrashTruck:
                selectedVehicleConfig = vehicleConfigCompactor;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.trashTruckModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigCompactor
                );
                maxHealth = 150;           
                break;
            case VehicleType.Offroader:
                selectedVehicleConfig = vehicleConfigOffroader;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.suvModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigOffroader
                );
                maxHealth = 100;
                break;
            case VehicleType.PickupTruck:
                selectedVehicleConfig = vehicleConfigPickupTruck;
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
                selectedVehicleConfig = vehicleConfigFireTruck;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.fireTruckModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigFireTruck
                );
                maxHealth = 150;
                break;
            case VehicleType.Tank:
                selectedVehicleConfig = vehicleConfigTank;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.tankModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigTank
                );
                maxHealth = 150;
            case VehicleType.Tanker:
                selectedVehicleConfig = vehicleConfigTanker;
                vehicle = new RaycastVehicleObject(
                    scene, isDebug,
                    world,            
                    wheelMaterial,
                    gameScene.tankerModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    vehicleConfigTanker
                );
                maxHealth = 150;
                break;
            default:
                selectedVehicleConfig = vehicleConfigDefault;
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
            Utility.ArrayToThreeVector3(selectedVehicleConfig.leftHeadlightOffset),
            Utility.ArrayToThreeVector3(selectedVehicleConfig.rightHeadlightOffset),
            Utility.ArrayToThreeVector3(selectedVehicleConfig.leftBrakeLightOffset),
            Utility.ArrayToThreeVector3(selectedVehicleConfig.rightBrakeLightOffset),
            deadzoneX,
            vehicle.vehicleOverrideConfig
        );
    }
}

