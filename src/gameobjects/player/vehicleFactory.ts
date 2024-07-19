import * as THREE from "three";
import { RaycastVehicleObject } from "../vehicles/raycastVehicle/raycastVehicleObject";
import { Player, PlayerTeam, VehicleType } from "./player";
import * as CANNON from 'cannon-es'
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class VehicleFactory {
    crosshairTexture: THREE.Texture;
    markerTexture: THREE.Texture;
    particleMaterial: THREE.SpriteMaterial;
    constructor(crosshairTexture: THREE.Texture, markerTexture: THREE.Texture, particleMaterial: THREE.SpriteMaterial) {
        
        this.crosshairTexture = crosshairTexture;
        this.markerTexture = markerTexture;
        this.particleMaterial = particleMaterial;
        
    }

    generatePlayer(scene: THREE.Scene, world: CANNON.World,
        playerName: string, vehicleType: VehicleType, playerColor: THREE.Color,
        model: GLTF, wheelModel: GLTF,
        wheelMaterial: CANNON.Material) : Player {
        //isCpuPlayer: boolean, playerTeam: PlayerTeam, scene: THREE.Scene) : Player {        
        
        let vehicle;

        switch(vehicleType) {
            case VehicleType.Taxi:

            case VehicleType.Ambulance:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(5, 4, 5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    0.25,                           // wheel radius
                    new CANNON.Vec3(0, 0, 0),   // wheel offset
                    20,                              // wheel mass
                    model,             // model        
                    wheelModel,        
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0) // model offset
                    //new THREE.Vector3(0, -0.35, 0) // model offset
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
                    0.25,                           // wheel radius
                    new CANNON.Vec3(0, 0, 0),   // wheel offset
                    20,                              // wheel mass
                    model,             // model        
                    wheelModel,    
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0) // model offset
                    //new THREE.Vector3(0, -0.35, 0) // model offset
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
                    0.25,                           // wheel radius
                    new CANNON.Vec3(0, 0, 0),   // wheel offset
                    20,                              // wheel mass
                    model,             // model        
                    wheelModel,        
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0) // model offset
                    //new THREE.Vector3(0, -0.35, 0) // model offset
                )
                break;
            case VehicleType.PickupTruck:
            case VehicleType.Hearse:
            case VehicleType.Killdozer:
            case VehicleType.MonsterTruck:
            default:
                vehicle = new RaycastVehicleObject(
                    scene,
                    new THREE.Vector3(-5, 4, -5),   // position
                    world,            
                    new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
                    new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
                    500,                            // chassis mass
                    wheelMaterial,
                    0.25,                           // wheel radius
                    new CANNON.Vec3(0, 0, 0),   // wheel offset
                    20,                              // wheel mass
                    model,             // model         
                    wheelModel,       
                    new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
                    new THREE.Vector3(0, 0, 0) // model offset
                    //new THREE.Vector3(0, -0.35, 0) // model offset
                )
                break;
        }
        
        return new Player(scene, playerName, playerColor, this.crosshairTexture, this.markerTexture, this.particleMaterial, vehicle)
    }
}