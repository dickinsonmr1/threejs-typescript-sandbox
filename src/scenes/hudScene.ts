import * as THREE from 'three';
import HealthBar from '../gameobjects/healthBar';

export default class HudScene extends THREE.Scene {
    /**
     *
     */
    camera: THREE.OrthographicCamera;
    healthBar: HealthBar = new HealthBar(this);

    constructor(camera: THREE.OrthographicCamera) {
        super();

        this.camera = camera;
    }


    async initialize() {

        const hudWidth = window.innerWidth / 2.5;
        const hudHeight = window.innerHeight / 2.5;

        //var healthBar = new HealthBar(this);
        this.healthBar.group.position.set(0,0,0);

        var temp = new THREE.Sprite( new THREE.SpriteMaterial({
            //map: healthBarTexture,// this.explosionTexture,
            color: 'red',
            sizeAttenuation: false,
            rotation: 0,        
            //depthTest: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.3
        }));
        //this.healthBarSpriteOutline.position.set( 8, 2, 8 );
        temp.center.set( 0, 0.5);
        
        //temp.scale.set(100, 20, 1); // 1x scale = dimensions of image
        temp.scale.set(200, 40, 1); // 1x scale = dimensions of image

        //this.healthBarSpriteOutline.scale.set(0.25, 0.25, 0.25);
        this.add( temp );
        temp.position.set(-hudWidth, -hudHeight, 0);        
    }

    update() {
    }
}