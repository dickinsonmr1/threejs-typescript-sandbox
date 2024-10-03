import * as THREE from 'three';
import SceneController from './sceneController';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import HealthBar from '../gameobjects/healthBar';
import {Text} from 'troika-three-text'
import { VehicleType } from '../gameobjects/player/player';

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

        await this.loadVehicleModelAndStats(VehicleType.Offroader, 'assets/kenney-vehicles-2/suv.glb', modelPosition, 75, 25, 50, 75, 'Offroader');        
        await this.loadVehicleModelAndStats(VehicleType.Police, 'assets/kenney-vehicles-2/police.glb', modelPosition, 50, 25, 75, 100, 'The Law');                
        await this.loadVehicleModelAndStats(VehicleType.RaceCar, 'assets/kenney-vehicles-2/race-future.glb', modelPosition, 25, 75, 100, 50, 'Zoomer Blue');        
        await this.loadVehicleModelAndStats(VehicleType.RaceCarRed, 'assets/kenney-vehicles-2/race.glb', modelPosition, 25, 75, 100, 50, 'Zoomer Red');   
        await this.loadVehicleModelAndStats(VehicleType.TrashTruck, 'assets/kenney-vehicles-2/garbage-truck.glb', modelPosition, 100, 100, 25, 25, 'Compactor');   
        await this.loadVehicleModelAndStats(VehicleType.Ambulance, 'assets/kenney-vehicles-2/ambulance.glb', modelPosition, 75, 50, 50, 25, 'EMS');                
        await this.loadVehicleModelAndStats(VehicleType.FireTruck, 'assets/kenney-vehicles-2/firetruck.glb', modelPosition, 100, 25, 25, 50, 'Backdraft');                
        await this.loadVehicleModelAndStats(VehicleType.Taxi, 'assets/kenney-vehicles-2/taxi.glb', modelPosition, 50, 25, 75, 25, 'Sideswipe');        
        await this.loadVehicleModelAndStats(VehicleType.PickupTruck, 'assets/kenney-vehicles-2/truck.glb', modelPosition, 50, 100, 50, 25, 'Safari');                
        await this.loadVehicleModelAndStats(VehicleType.PoliceTractor, 'assets/kenney-vehicles-2/tractor-police.glb', modelPosition, 75, 25, 50, 75, 'Rural Patrol');        
        await this.loadVehicleModelAndStats(VehicleType.Killdozer, 'assets/kenney-vehicles-2/tractor-shovel.glb', modelPosition, 100, 75, 25, 25, 'Killdozer');        
        await this.loadVehicleModelAndStats(VehicleType.Harvester, 'assets/kenney-vehicles-2/tractor.glb', modelPosition, 75, 50, 25, 75, 'Harvester');        

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

    
    private async loadVehicleModelAndStats(vehicleType: VehicleType, asset: string, modelPosition: THREE.Vector3,
        health: number, special: number, speed: number, defensiveSpecial: number, vehicleName: string) {      
        
        var model = await this.gltfLoader.loadAsync(asset);
        var modelScene = model.scene;        
        modelScene.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
        modelScene.scale.set(1, 1, 1);    
        modelScene.visible = false;     
        
        modelScene.userData['vehicleType'] = vehicleType;
        modelScene.userData['health'] = health;
        modelScene.userData['special'] = special;
        modelScene.userData['speed'] = speed;
        modelScene.userData['defensiveSpecial'] = defensiveSpecial;

        modelScene.userData['vehicleName'] = vehicleName;
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

    selectVehicle() {
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
}