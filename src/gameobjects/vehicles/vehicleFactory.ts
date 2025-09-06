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

        let selectedVehicleConfig: VehicleConfig;
        let vehicleModel: GLTF;
        let wheelModel: GLTF = gameScene.wheelModel;

        switch(vehicleType) {
            case VehicleType.Taxi:
                selectedVehicleConfig = vehicleConfigTaxi
                vehicleModel = gameScene.taxiModel;
                break;
            case VehicleType.Ambulance:
                selectedVehicleConfig = vehicleConfigAmbulance
                vehicleModel = gameScene.ambulanceModel;
                break;
            case VehicleType.RaceCar:
                selectedVehicleConfig = vehicleConfigRaceCarBlue;
                vehicleModel = gameScene.raceCarBlueModel;
                break;
            case VehicleType.RaceCarRed:
                selectedVehicleConfig = vehicleConfigRaceCarRed;
                vehicleModel = gameScene.raceCarRedModel;
                break;
            case VehicleType.Police:
                selectedVehicleConfig = vehicleConfigPolice;
                vehicleModel = gameScene.policeModel;
                break; 
            case VehicleType.Harvester:
                selectedVehicleConfig = vehicleConfigHarvester;
                vehicleModel = gameScene.tractorModel;
                break;         
            case VehicleType.PoliceTractor:
                selectedVehicleConfig = vehicleConfigPoliceTractor;
                vehicleModel = gameScene.policeTractorModel;
                break;
            case VehicleType.Killdozer:
                selectedVehicleConfig = vehicleConfigKilldozer;
                vehicleModel = gameScene.killdozerModel;
                break;
            case VehicleType.TrashTruck:
                selectedVehicleConfig = vehicleConfigCompactor;
                vehicleModel = gameScene.trashTruckModel;   
                break;
            case VehicleType.Offroader:
                selectedVehicleConfig = vehicleConfigOffroader;
                vehicleModel = gameScene.suvModel;   
                break;
            case VehicleType.PickupTruck:
                selectedVehicleConfig = vehicleConfigPickupTruck;
                vehicleModel = gameScene.pickupTruckModel
                break;
            case VehicleType.FireTruck:
                selectedVehicleConfig = vehicleConfigFireTruck;
                vehicleModel = gameScene.fireTruckModel
                break;
            case VehicleType.Tank:
                selectedVehicleConfig = vehicleConfigTank;
                vehicleModel = gameScene.tankModel
                break;
            case VehicleType.Tanker:
                selectedVehicleConfig = vehicleConfigTanker;
                vehicleModel = gameScene.tankerModel;
                break;
            default:
                selectedVehicleConfig = vehicleConfigDefault;
                vehicleModel = gameScene.sedanSportsModel;
                break;
        }

        maxHealth = selectedVehicleConfig.health * 2;

        vehicle = new RaycastVehicleObject(
            scene, isDebug,
            world,            
            wheelMaterial,
            vehicleModel,             // model        
            wheelModel,               // wheel model
            selectedVehicleConfig
        );
        
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

