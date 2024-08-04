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

    generatePlayer(scene: THREE.Scene, world: CANNON.World, isCpuPlayer: boolean,
        vehicleType: VehicleType, playerColor: THREE.Color,        
        wheelMaterial: CANNON.Material) : Player {
        //isCpuPlayer: boolean, playerTeam: PlayerTeam, scene: THREE.Scene) : Player {        
        
        let gameScene = <GameScene>scene;

        let vehicle = null;

        switch(vehicleType) {
            case VehicleType.Taxi:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(5, 4, 5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.5, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset

                    20,                              // wheel mass

                    gameScene.taxiModel,             // model                            
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // wheel offset  new THREE.Vector3(0, -0.35, 0)

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.75, 0.75, 0.75) // rear wheel model scale
                );
                break;
            case VehicleType.Ambulance:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(5, 4, 5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.25, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.25, 0, 0),   // rear wheel offset

                    20,                              // wheel mass

                    gameScene.ambulanceModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset  new THREE.Vector3(0, -0.35, 0)
                    
                    new THREE.Vector3(1, 1, 1), // front wheel model scale,
                    new THREE.Vector3(1, 1, 1) // rear wheel model scale
                );
                break;
            case VehicleType.RaceCar:
                vehicle = new RaycastVehicleObject(
                    scene,
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

                    20,                              // wheel mass

                    gameScene.sedanSportsModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.75, 0.75, 0.75) // rear wheel model scale
                );
                break;
            case VehicleType.Police:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    
                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0, 0, 0),   // rear wheel offset

                    20,                              // wheel mass

                    gameScene.policeModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.75, 0.75, 0.75) // rear wheel model scale
                )
                break;                
            case VehicleType.Killdozer:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass

                    wheelMaterial,

                    0.20,                           // front wheel radius
                    0.3,                       //rear wheel radius

                    new CANNON.Vec3(0, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0.1, 0),   // rear wheel offset
                    20,                              // wheel mass

                    gameScene.tractorModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(1, 1, 1) // rear wheel model scale
                )
                break;
            case VehicleType.TrashTruck:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,

                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    
                    new CANNON.Vec3(0.25, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.6, 0, 0),   // rear wheel offset
                    20,                              // wheel mass
                    gameScene.trashTruckModel,             // model         
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(1, 1, 1), // front wheel model scale,
                    new THREE.Vector3(1, 1, 1) // rear wheel model scale
                )                
                break;
            case VehicleType.Offroader:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    
                    0.25,                           // front wheel radius
                    0.25,                       //rear wheel radius
                    new CANNON.Vec3(0.5, 0, 0),   // front wheel offset
                    new CANNON.Vec3(0.5, 0, 0),   // rear wheel offset

                    20,                              // wheel mass

                    gameScene.suvModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.75, 0.75, 0.75) // rear wheel model scale
                )
                break;
            default:
                vehicle = new RaycastVehicleObject(
                    scene,
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

                    20,                              // wheel mass

                    gameScene.sedanSportsModel,             // model        
                    gameScene.wheelModel,       // wheel model
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0), // model offset

                    new THREE.Vector3(0.75, 0.75, 0.75), // front wheel model scale,
                    new THREE.Vector3(0.75, 0.75, 0.75) // rear wheel model scale
                )                
                break;
        }
        
        return new Player(scene, isCpuPlayer, vehicleType.toString(), playerColor, this.crosshairTexture, this.markerTexture, this.particleMaterial, vehicle);
    }
}
