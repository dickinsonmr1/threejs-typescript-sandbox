import * as THREE from 'three';
import SceneController from './sceneController';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Text} from 'troika-three-text'
import { VehicleType } from '../gameobjects/player/player';

import vehicleConfigOffroader from '../gameobjects/vehicles/config/07-offroader.json'
import vehicleConfigTaxi from '../gameobjects/vehicles/config/00-taxi.json'
import vehicleConfigAmbulance from '../gameobjects/vehicles/config//01-ambulance.json'
import vehicleConfigRaceCarBlue from '../gameobjects/vehicles/config//02-racecar-blue.json'
import vehicleConfigRaceCarRed from '../gameobjects/vehicles/config/03-racecar-red.json'
import vehicleConfigPolice from '../gameobjects/vehicles/config/05-police.json'
import vehicleConfigCompactor from '../gameobjects/vehicles/config/06-trashTruck.json'
import vehicleConfigFireTruck from '../gameobjects/vehicles/config/08-fireTruck.json'
import vehicleConfigPickupTruck from '../gameobjects/vehicles/config/11-pickupTruck.json'
import vehicleConfigPoliceTractor from '../gameobjects/vehicles/config/09-policeTractor.json'
import vehicleConfigKilldozer from '../gameobjects/vehicles/config/04-killdozer.json'
import vehicleConfigHarvester from '../gameobjects/vehicles/config/10-harvester.json'
import { VehicleConfig } from '../gameobjects/vehicles/config/vehicleConfig';

export default class MenuScene extends THREE.Scene {

    camera: THREE.PerspectiveCamera;
    sceneController: SceneController;

    private readonly gltfLoader = new GLTFLoader();

    private group: THREE.Group;

    private selectedMapIndex: number = 0;
    private selectedVehicleIndex: number = 0;

    constructor(camera: THREE.PerspectiveCamera, sceneController: SceneController) {
        super();

        this.camera = camera;
        this.sceneController = sceneController;       

        this.group = new THREE.Group();

        this.background = new THREE.Color('lightgray');
    }

    async initialize() {
        let textureLoader = new THREE.TextureLoader();
        
        //let dummyTexture = textureLoader.load('assets/DPAD.png');
        //dummyTexture.colorSpace = THREE.SRGBColorSpace;
        //let sprite = this.generateIcon(dummyTexture, new THREE.Color('blue'));//, HudIconLocation.CenterBottom);
        //this.add(sprite);

        this.generateVehicles();    
    }

    generateIcon(texture: THREE.Texture, color: THREE.Color): THREE.Sprite {
        let spriteWidth: number = 1;
        
        let material = new THREE.SpriteMaterial( { map: texture, color: color });//,transparent: true, opacity: 0.5 } );
        let sprite = new THREE.Sprite( material );
        sprite.center.set( 0.5, 0.5 );
        sprite.scale.set( spriteWidth, spriteWidth, 1 );
        this.add(sprite);
        sprite.position.set(5, 0, 0);

        return sprite;
    }

    generateTroikaThreeText(position: THREE.Vector3, title: string, fontSize: number, anchorX: string, anchorY: string, colorNumber: number): Text {
        const text = new Text();

        text.text = title;
        text.fontSize = fontSize;
        text.position.set(position.x, position.y, position.z);
        text.color = colorNumber;
        text.anchorX = anchorX;
        text.anchorY = anchorY;
        //text.sync();

        return text;
    }

    async generateVehicles() {
        
        var modelPosition = new THREE.Vector3(0, -2, 0);

        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigOffroader, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigPolice, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigRaceCarBlue, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigRaceCarRed, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigCompactor, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigAmbulance, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigFireTruck, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigTaxi, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigPickupTruck, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigPoliceTractor, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigKilldozer, modelPosition);
        await this.loadVehicleModelAndStatsFromConfig(vehicleConfigHarvester, modelPosition);

        this.add(this.group);

        this.selectVehicle();
    }

    private async loadVehicleModelAndStatsFromConfig(config: VehicleConfig, modelPosition: THREE.Vector3) {      
        
        var model = await this.gltfLoader.loadAsync(config.asset);
        var modelScene = model.scene.clone();        
        modelScene.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
        modelScene.scale.set(1, 1, 1);    
        modelScene.visible = false;     
        
        modelScene.userData['vehicleType'] = config.vehicleTypeEnum as VehicleType;
        modelScene.userData['health'] = config.health;
        modelScene.userData['special'] = config.special;
        modelScene.userData['speed'] = config.speed;
        modelScene.userData['defensiveSpecial'] = config.defensiveSpecial;

        modelScene.userData['vehicleName'] = config.vehicleName;
        //modelScene.rotateY(Math.PI / 2);

        this.camera.lookAt(modelPosition);

        this.group.add(modelScene);
    }

    selectPreviousVehicle() {
        this.group.children[this.selectedVehicleIndex].visible = false;

        this.selectedVehicleIndex--;
        if(this.selectedVehicleIndex < 0) {
            this.selectedVehicleIndex = this.group.children.length - 1;
        }        
        this.selectVehicle();
    }

    selectNextVehicle() {
        this.group.children[this.selectedVehicleIndex].visible = false;

        this.selectedVehicleIndex++;        
        if(this.selectedVehicleIndex > this.group.children.length-1) {
            this.selectedVehicleIndex = 0;
        }
        this.selectVehicle();
    }

    private selectVehicle() {
        var selectedItem = this.group.children[this.selectedVehicleIndex];
        selectedItem.visible = true;

        document.getElementById('vehicleName')!.innerText = selectedItem.userData["vehicleName"];

        const fill1 = document.getElementById('healthbar-fill-1');
        fill1!.style.width = selectedItem.userData["health"]*2 + 'px';

        const fill2 = document.getElementById('healthbar-fill-2');
        fill2!.style.width = selectedItem.userData["special"]*2 + 'px';

        const fill3 = document.getElementById('healthbar-fill-3');        
        fill3!.style.width = selectedItem.userData["speed"]*2 + 'px';

        const fill4 = document.getElementById('healthbar-fill-4');
        fill4!.style.width = selectedItem.userData["defensiveSpecial"]*2 +'px';
    }

    update() {
        this.sceneController.pollGamepadsForMenu();
        
        this.group.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 64);       
    }

    getSelectedVehicleType(): VehicleType {
        return this.group.children[this.selectedVehicleIndex].userData['vehicleType'];
    }

    public handleKeyUp = (event: KeyboardEvent) => {
            
        if (event.key === 'Enter') {
            this.sceneController.switchToGameScene(this.getSelectedVehicleType() ?? VehicleType.Killdozer, this.sceneController.worldLibrary.find(x => x.name == 'Arena')!);
        }
        if(event.key === 'ArrowLeft') {
            this.selectPreviousVehicle();
        }
        else if(event.key === 'ArrowRight') {
            this.selectNextVehicle();
        }
    }
}