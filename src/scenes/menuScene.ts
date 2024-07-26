import * as THREE from 'three';
import HudHealthBar, { HudBarType } from '../gameobjects/hudHealthBar';
import SceneController from './sceneController';
import { HudDivElementManager } from './hudDivElementManager';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class MenuScene extends THREE.Scene {

    camera: THREE.PerspectiveCamera;
    private healthBar?: HudHealthBar;
    private turboBar?: HudHealthBar;
    private shieldBar?: HudHealthBar;

    sceneController: SceneController;

    hudDivElementManager!: HudDivElementManager;

    private readonly gltfLoader = new GLTFLoader();

    private group: THREE.Group;

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
    }

    generateIcon(texture: THREE.Texture, color: THREE.Color): THREE.Sprite {

        let spriteWidth: number = 64;
        
        let material = new THREE.SpriteMaterial( { map: texture, color: color });//,transparent: true, opacity: 0.5 } );
        let sprite = new THREE.Sprite( material );
        sprite.center.set( 0.5, 0.5 );
        sprite.scale.set( spriteWidth, spriteWidth, 1 );
        this.add(sprite);
        sprite.position.set(50, 0, 0);

        return sprite;
    }

    async generateVehicle() {
        
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/taxi.glb');
        var modelScene = model.scene;
        
        modelScene.position.set(0,0,0);
        modelScene.scale.set(1, 1, 1);         
        //modelScene.rotateY(Math.PI / 2);

        this.camera.lookAt(modelScene.position);

        this.group.add(modelScene);

        this.add(this.group);
    }

    update() {
        this.group.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 64);        
    }
}