import * as THREE from 'three';
import SceneController from './sceneController';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import HealthBar from '../gameobjects/healthBar';
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

    private statBar1!: HealthBar;
    private statBar2!: HealthBar;
    private statBar3!: HealthBar;
    private statBar4!: HealthBar;

    private vehicleNameText!: Text;
    private statBar1Text!: Text;
    private statBar2Text!: Text;
    private statBar3Text!: Text;
    private statBar4Text!: Text;

    constructor(camera: THREE.PerspectiveCamera, sceneController: SceneController) {
        super();

        this.camera = camera;
        this.sceneController = sceneController;       

        this.group = new THREE.Group();
    }

    async initialize() {
        let textureLoader = new THREE.TextureLoader();
        
        //let dummyTexture = textureLoader.load('assets/DPAD.png');
        //dummyTexture.colorSpace = THREE.SRGBColorSpace;
        //let sprite = this.generateIcon(dummyTexture, new THREE.Color('blue'));//, HudIconLocation.CenterBottom);
        //this.add(sprite);

        this.statBar1 = new HealthBar(this, 100, new THREE.Color('orange'));
        this.statBar1.update(new THREE.Vector3(0, -4, 0));
        this.statBar1.updateValue(80);

        this.statBar2 = new HealthBar(this, 100, new THREE.Color('orange'));
        this.statBar2.update(new THREE.Vector3(0, -4.5, 0));
        this.statBar2.updateValue(25);

        this.statBar3 = new HealthBar(this, 100, new THREE.Color('orange'));
        this.statBar3.update(new THREE.Vector3(0, -5, 0));
        this.statBar3.updateValue(50);

        this.statBar4 = new HealthBar(this, 100, new THREE.Color('orange'));
        this.statBar4.update(new THREE.Vector3(0, -5.5, 0));
        this.statBar4.updateValue(33);

        this.vehicleNameText = this.generateTroikaThreeText(new THREE.Vector3(5, 1, 0), "", 1, 'center', 'center', 0x0000AA);
        this.add(this.vehicleNameText);

        this.statBar1Text = this.generateTroikaThreeText(new THREE.Vector3(0, -3, -0.5), "Health", 0.4, 'right', 'middle', 0x0000AA);
        this.add(this.statBar1Text);

        this.statBar2Text = this.generateTroikaThreeText(new THREE.Vector3(0, -3.5, -0.5), "Special", 0.4, 'right', 'middle', 0x0000AA);
        this.add(this.statBar2Text);

        this.statBar3Text = this.generateTroikaThreeText(new THREE.Vector3(0, -4, -0.5), "Speed", 0.4, 'right', 'middle', 0x0000AA);
        this.add(this.statBar3Text);

        this.statBar4Text = this.generateTroikaThreeText(new THREE.Vector3(0, -4.5, -0.5), "Defense", 0.4, 'right', 'middle', 0x0000AA);
        this.add(this.statBar4Text);

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

        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/hatchback-sports.glb', modelPosition, 50, 75, 25, 25, 'Hybrid Theory');        
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/delivery-flat.glb', modelPosition, 75, 25, 50, 25, 'Flatbed');        
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/delivery.glb', modelPosition, 100, 25, 50, 33, 'Overnight');        
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/sedan-sports.glb', modelPosition, 50, 25, 50, 25, 'Sedanimal');        
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/sedan.glb', modelPosition, 50, 25, 50, 25, 'Compact');        
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/suv-luxury.glb', modelPosition, 75, 25, 50, 50, 'Midas');        
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/truck-flat.glb', modelPosition, 50, 25, 50, 25, 'Weekend Warrior');                
        //await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/van.glb', modelPosition, 50, 25, 50, 25, 'Carpool');        
        
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
        this.vehicleNameText.text = selectedItem.userData["vehicleName"];
        this.statBar1.updateValue(selectedItem.userData["health"]);
        this.statBar2.updateValue(selectedItem.userData["special"]);
        this.statBar3.updateValue(selectedItem.userData["speed"]);
        this.statBar4.updateValue(selectedItem.userData["defensiveSpecial"]);
    }

    update() {
        this.sceneController.pollGamepadsForMenu();
        
        this.group.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 64);       
        
        if(this.vehicleNameText != null)
            this.vehicleNameText.quaternion.copy(this.camera.quaternion);       

        if(this.statBar1Text != null)
            this.statBar1Text.quaternion.copy(this.camera.quaternion);
        
        if(this.statBar2Text != null)
            this.statBar2Text.quaternion.copy(this.camera.quaternion);
        
        if(this.statBar3Text != null)
            this.statBar3Text.quaternion.copy(this.camera.quaternion);
        
        if(this.statBar4Text != null)
            this.statBar4Text.quaternion.copy(this.camera.quaternion);
    }

    getSelectedVehicleName(): string {
        return this.vehicleNameText.text;
    }

    getSelectedVehicleType(): VehicleType {
        return this.group.children[this.selectedVehicleIndex].userData['vehicleType'];
    }

    public handleKeyUp = (event: KeyboardEvent) => {
            
        if (event.key === 'Enter') {
            this.sceneController.switchToGameScene(this.getSelectedVehicleType() ?? VehicleType.Killdozer, "arena");
        }
        if(event.key === 'ArrowLeft') {
            this.selectPreviousVehicle();
        }
        else if(event.key === 'ArrowRight') {
            this.selectNextVehicle();
        }
    }
}