import * as THREE from 'three';
import HudHealthBar, { HudBarType } from '../gameobjects/hudHealthBar';
import SceneController from './sceneController';
import { HudDivElementManager } from './hudDivElementManager';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import HealthBar from '../gameobjects/healthBar';

export default class MenuScene extends THREE.Scene {

    camera: THREE.PerspectiveCamera;
    private healthBar?: HudHealthBar;
    private turboBar?: HudHealthBar;
    private shieldBar?: HudHealthBar;

    sceneController: SceneController;

    hudDivElementManager!: HudDivElementManager;

    private readonly gltfLoader = new GLTFLoader();

    private group: THREE.Group;

    private selectedVehicleIndex: number = 0;

    constructor(camera: THREE.PerspectiveCamera, sceneController: SceneController) {
        super();

        this.camera = camera;
        this.sceneController = sceneController;       

        this.group = new THREE.Group();
    }

    async initialize() {
        let textureLoader = new THREE.TextureLoader();
        
        let dummyTexture = textureLoader.load('assets/DPAD.png');
        dummyTexture.colorSpace = THREE.SRGBColorSpace;

        let sprite = this.generateIcon(dummyTexture, new THREE.Color('blue'));//, HudIconLocation.CenterBottom);
        this.add(sprite);

        this.generateVehicle();

        var statBar1 = new HealthBar(this, 100, new THREE.Color('orange'));
        statBar1.update(new THREE.Vector3(0, -4, 0));
        statBar1.updateValue(80);

        var statBar2 = new HealthBar(this, 100, new THREE.Color('orange'));
        statBar2.update(new THREE.Vector3(0, -4.5, 0));
        statBar2.updateValue(25);

        var statBar3 = new HealthBar(this, 100, new THREE.Color('orange'));
        statBar3.update(new THREE.Vector3(0, -5, 0));
        statBar3.updateValue(50);

        var statBar3 = new HealthBar(this, 100, new THREE.Color('orange'));
        statBar3.update(new THREE.Vector3(0, -5.5, 0));
        statBar3.updateValue(33);
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

    async generateVehicle() {
        
        var modelPosition = new THREE.Vector3(0,-2,0);

        await this.loadTaxiModel(modelPosition);
        await this.loadPoliceModel(modelPosition);

        this.group.children[0].visible = false;
        this.group.children[1].visible = true;

        this.add(this.group);
    }

    
    private async loadTaxiModel(modelPosition: THREE.Vector3) {      
        
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/taxi.glb');
        var modelScene = model.scene;        
        modelScene.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
        modelScene.scale.set(1, 1, 1);         
        //modelScene.rotateY(Math.PI / 2);

        this.camera.lookAt(modelPosition);

        this.group.add(modelScene);
    }

    private async loadPoliceModel(modelPosition: THREE.Vector3) {      
        
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/police.glb');
        var modelScene = model.scene;        
        modelScene.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
        modelScene.scale.set(1, 1, 1);         
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
        this.group.children[this.selectedVehicleIndex].visible = true;
    }

    update() {
        this.group.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 64);        
    }
}