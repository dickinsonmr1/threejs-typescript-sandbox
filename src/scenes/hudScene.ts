import * as THREE from 'three';
import HudHealthBar, { HudBarType } from '../gameobjects/hudHealthBar';
import SceneController from './sceneController';

export enum HudIconLocation {
    UpperLeft,
    UpperRight,
    Center,
    CenterBottom,
    LowerLeft,
    LowerRight,
}

export default class HudScene extends THREE.Scene {
    /**
     *
     */
    camera: THREE.OrthographicCamera;
    private healthBar?: HudHealthBar;
    private turboBar?: HudHealthBar;
    private shieldBar?: HudHealthBar;

    sceneController: SceneController;

    constructor(camera: THREE.OrthographicCamera, sceneController: SceneController) {
        super();

        this.camera = camera;
        this.sceneController = sceneController;

       
    }

    private readonly hudWidth = window.innerWidth / 2.25;
    private readonly hudHeight = window.innerHeight / 2.25;

    async initialize() {

        
        /////////////////////////////////////////////

        let textureLoader = new THREE.TextureLoader();
        
        let healthIconTexture = textureLoader.load('assets/DPAD.png');
        healthIconTexture.colorSpace = THREE.SRGBColorSpace;

        let shieldIconTexture = textureLoader.load('assets/shield.png');
        shieldIconTexture.colorSpace = THREE.SRGBColorSpace;

        let rocketTexture = textureLoader.load('assets/rocketIcon-multiple.png');
        healthIconTexture.colorSpace = THREE.SRGBColorSpace;

        let fireIconTexture = textureLoader.load('assets/fire.png');
        healthIconTexture.colorSpace = THREE.SRGBColorSpace;

        let freezeIconTexture = textureLoader.load('assets/freezeIcon.png');
        freezeIconTexture.colorSpace = THREE.SRGBColorSpace;
        
        let turboIconTexture = textureLoader.load('assets/turboIcon.png');
        freezeIconTexture.colorSpace = THREE.SRGBColorSpace;

        this.healthBar = new HudHealthBar(this, HudBarType.LowerLeftMain,
            this.hudWidth, this.hudHeight,
            200,
            40,
            100,
            healthIconTexture);

        this.turboBar = new HudHealthBar(this, HudBarType.LowerRightMain,
            this.hudWidth, this.hudHeight,
            200,
            20,
            100,
            turboIconTexture,
            new THREE.Color('yellow'),
            );
        
        this.shieldBar = new HudHealthBar(this, HudBarType.LowerLeftSecondary,
            this.hudWidth, this.hudHeight,
            200,
            20,
            100,
            shieldIconTexture,
            new THREE.Color('blue'));


        let material = new THREE.SpriteMaterial( { map: healthIconTexture });//,transparent: true, opacity: 0.5 } );

        //const spriteWidth = material.map?.image.width;
        //const spriteHeight = material.map?.image.height;

        //let spriteCenter = this.generateIcon(freezeIconTexture, new THREE.Color('white'), HudIconLocation.Center);
        let spriteCenterBottom = this.generateIcon(freezeIconTexture, new THREE.Color('white'), HudIconLocation.CenterBottom);
        //let spriteTL = this.generateIcon(rocketTexture, new THREE.Color('white'), HudIconLocation.UpperLeft);    
        //let spriteTR = this.generateIcon(fireIconTexture, new THREE.Color('white'), HudIconLocation.UpperRight);
        //let spriteLL = this.generateIcon(healthIconTexture, new THREE.Color('white'), HudIconLocation.LowerLeft);
        //let spriteLR = this.generateIcon(turboIconTexture, new THREE.Color('white'), HudIconLocation.LowerRight);    
    }

    generateIcon(texture: THREE.Texture, color: THREE.Color, location: HudIconLocation): THREE.Sprite {

        let spriteWidth: number = 64;
        let spriteHeight: number = 64;
        let spritePosition: THREE.Vector2;
        
        let material = new THREE.SpriteMaterial( { map: texture, color: color });//,transparent: true, opacity: 0.5 } );
        let sprite = new THREE.Sprite( material );
        switch(location) {
            case HudIconLocation.Center:                
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(0, 0, 0);
                break;
            case HudIconLocation.CenterBottom:                
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(0, -this.hudHeight, 0);
                break;
            case HudIconLocation.UpperLeft:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(-this.hudWidth, this.hudHeight, 0);               
                break;
            case HudIconLocation.UpperRight:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(this.hudWidth, this.hudHeight, 0);
                break;
            case HudIconLocation.LowerLeft:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add( sprite);
                sprite.position.set(-this.hudWidth, -this.hudHeight, 0);                
                break;
            case HudIconLocation.LowerRight:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(this.hudWidth, -this.hudHeight, 0);
                break;
        }

        return sprite;
    }

    update() {
    }

    updateHealthBar(currentValue: number) {
        this.healthBar?.updateValue(currentValue);
    }

    updateShieldBar(currentValue: number) {
        this.shieldBar?.updateValue(currentValue);
    }

    updateTurboBar(currentValue: number) {
        this.turboBar?.updateValue(currentValue);
    }
}
