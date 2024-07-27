import * as THREE from 'three';
import HudHealthBar, { HudBarType } from '../gameobjects/hudHealthBar';
import SceneController from './sceneController';
import { HudDivElementManager } from './hudDivElementManager';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import HealthBar from '../gameobjects/healthBar';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import {Text} from 'troika-three-text'

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

    private statBar1!: HealthBar;
    private statBar2!: HealthBar;
    private statBar3!: HealthBar;
    private statBar4!: HealthBar;

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

        const loader = new FontLoader();
        var font = await loader.loadAsync('assets/fonts/helvetiker_regular.typeface.json');
        const geometry = new TextGeometry( 'Vehicle Selection', {
            font: font,
            size: 12,
            depth: 1,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 8,
            bevelSize: 1.5,
            bevelOffset: 0,
            bevelSegments: 5,
        } );

        
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.set(126, 0, -60);        
        textMesh.rotation.y = 3 * Math.PI / 2;

        this.add(textMesh);

        /*
        loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

            const geometry = new TextGeometry( 'Hello three.js!', {
                font: font,
                size: 80,
                depth: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5,
            } );

            
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const textMesh = new THREE.Mesh(geometry, material);

            scene.add(textMesh);
        });
        */

        // Create:
        const myText = new Text()
        this.add(myText)

        // Set properties to configure:
        myText.text = 'Vehicle Selection';
        myText.fontSize = 1;
        myText.position.set(0, -5, 0);
        myText.color = 0x9966FF;
        myText.rotation.y = -Math.PI / 2;

        // Update the rendering:
        myText.sync();
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

        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/ambulance.glb', modelPosition, 100, 50, 50, 66);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/firetruck.glb', modelPosition, 100, 25, 10, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/delivery-flat.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/delivery.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/garbage-truck.glb', modelPosition, 40, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/police.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/hatchback-sports.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/race-future.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/race.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/sedan-sports.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/sedan.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/suv-luxury.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/suv.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/taxi.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/tractor-police.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/tractor-shovel.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/tractor.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/truck-flat.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/truck.glb', modelPosition, 100, 25, 50, 33);        
        await this.loadVehicleModelAndStats('assets/kenney-vehicles-2/van.glb', modelPosition, 100, 25, 50, 33);        
        
        this.add(this.group);

        this.selectVehicle();
    }

    
    private async loadVehicleModelAndStats(asset: string, modelPosition: THREE.Vector3,
        health: number, special: number, speed: number, defensiveSpecial: number) {      
        
        var model = await this.gltfLoader.loadAsync(asset);
        var modelScene = model.scene;        
        modelScene.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
        modelScene.scale.set(1, 1, 1);    
        modelScene.visible = false;     

        modelScene.userData['health'] = health;
        modelScene.userData['special'] = special;
        modelScene.userData['speed'] = speed;
        modelScene.userData['defensiveSpecial'] = defensiveSpecial;
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
        this.statBar1.updateValue(selectedItem.userData["health"]);
        this.statBar2.updateValue(selectedItem.userData["special"]);
        this.statBar3.updateValue(selectedItem.userData["speed"]);
        this.statBar4.updateValue(selectedItem.userData["defensiveSpecial"]);
    }

    update() {
        this.group.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 64);        
    }
}