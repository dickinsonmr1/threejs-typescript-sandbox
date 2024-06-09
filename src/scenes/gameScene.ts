import * as THREE from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as CANNON from 'cannon-es'
import { BoxObject } from '../gameobjects/shapes/boxObject';
import { SphereObject } from '../gameobjects/shapes/sphereObject';
import Stats from 'three/addons/libs/stats.module.js';
import SpotlightObject from '../gameobjects/shapes/spotlightObject';
import { randFloat } from 'three/src/math/MathUtils.js';
import { ParticleEmitter } from '../gameobjects/fx/particleEmitter';
import { GltfObject } from '../gameobjects/gltfObject';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Projectile } from '../gameobjects/weapons/projectile';
import { CylinderObject } from '../gameobjects/shapes/cylinderObject';
import { RaycastVehicleObject } from '../gameobjects/vehicles/raycastVehicle/raycastVehicleObject';
import { ProjectileType } from '../gameobjects/weapons/projectileType';
import { PickupObject } from '../gameobjects/pickupObject';
import SceneController from './sceneController';
import { Player } from '../gameobjects/player';
import { FlamethrowerEmitter } from '../gameobjects/weapons/flamethrowerEmitter';
import { SmokeObject } from '../gameobjects/fx/smokeObject';
import { VehicleExplosionObject } from '../gameobjects/fx/vehicleExplosionObject';
import { Utility } from '../utility';
import { IPlayerVehicle } from '../gameobjects/vehicles/IPlayerVehicle';
import { TextureToArray } from '../gameobjects/shapes/textureToArray';
import { TerrainObject } from '../gameobjects/shapes/terrainObject';
import { Water } from 'three/addons/objects/Water.js';

// npm install cannon-es-debugger
// https://youtu.be/Ht1JzJ6kB7g?si=jhEQ6AHaEjUeaG-B&t=291

// https://www.youtube.com/watch?v=8J5xl9oijR8&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=3

export default class GameScene extends THREE.Scene {

    private stats: Stats = new Stats();

    private readonly mtlLoader = new MTLLoader();

    private readonly gltfLoader = new GLTFLoader();
    private taxiModel?: GLTF;
    private policeModel?: GLTF;
    private ambulanceModel?: GLTF;
    private trashTruckModel?: GLTF;
    private sedanSportsModel?: GLTF;

    private readonly textureLoader = new THREE.TextureLoader();

    private readonly camera: THREE.PerspectiveCamera;

    private readonly keyDown = new Set<string>();

    private bulletMtl?: MTLLoader.MaterialCreator;
    private directionVector = new THREE.Vector3();

    private cubes: BoxObject[] = [];

    private pickups: PickupObject[] = [];

    private projectiles: Projectile[] = [];

    private particleEmitters: ParticleEmitter[] = [];
    public explosionTexture: THREE.Texture = new THREE.Texture();

    private heightMapTextureAsArray: TextureToArray = new TextureToArray(this.textureLoader, 'assets/heightmaps/heightmap_arena_128x128.png');


    world: CANNON.World = new CANNON.World({
        gravity: new CANNON.Vec3(0, -14.81, 0)
    });

    getWorld(): CANNON.World {
        return this.world;
    }
    
    terrain?: TerrainObject;
    water?: Water;

    grassBillboards?: THREE.Points;
    
    cube?: BoxObject;
    cube2?: BoxObject;
    cylinder?: CylinderObject;

    private allGltfPlayers: GltfObject[] = [];

    gltfVehiclePlayer1?: GltfObject;
    gltfVehiclePlayer2?: GltfObject;
    gltfVehiclePlayer3?: GltfObject;
    gltfVehiclePlayer4?: GltfObject;

    raycastVehicleObject?: RaycastVehicleObject;
    //rigidVehicleObject?: RigidVehicleObject;

    private allPlayers: Player[] = [];
    player1!: Player;
    player2!: Player;
    player3!: Player;
    player4!: Player;

    private allRigidVehicleObjects: IPlayerVehicle[] = [];

    private followCam?: THREE.Object3D;

    sphere?: SphereObject;

    spotlight?: SpotlightObject;

    flamethrowerEmitters: FlamethrowerEmitter[] = [];
    //turboParticleEmitters: SmokeObject[] = []

    //healthBar: HealthBar = new HealthBar(this, 100);
    //headLights: Headlights = new Headlights(this);

    sceneController: SceneController;

    divElementPlayerStats!: HTMLDivElement;
    divElementObjective!: HTMLDivElement;
    divElementWeaponParticleCount!: HTMLDivElement;
    divElementParticleCount!: HTMLDivElement;
    divElementPhysicsObjectCount!: HTMLDivElement;
    divElementLightObjectCount!: HTMLDivElement;

    crosshairSprite!: THREE.Sprite;

    constructor(camera: THREE.PerspectiveCamera, sceneController: SceneController) {
        super();
        
        this.camera = camera;
        this.sceneController = sceneController;
        //this.background = new THREE.Color(0xB1E1FF);
    }

    async initialize() {

        // load a shared MTL (Material Template Library) for the targets
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl');
        targetMtl.preload();

        this.bulletMtl = await this.mtlLoader.loadAsync('assets/foamBulletB.mtl');
        this.bulletMtl.preload();

        this.taxiModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/taxi.glb');
        this.taxiModel.scene.children[0].rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.taxiModel.scene.children[0].position.add(new THREE.Vector3(0, -0.5, 0));

        this.policeModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/police.glb');        
        this.policeModel.scene.children[0].rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.policeModel.scene.children[0].position.add(new THREE.Vector3(0, -0.5, 0));
                        
        this.ambulanceModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/ambulance.glb');
        this.ambulanceModel.scene.children[0].rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.ambulanceModel.scene.children[0].position.add(new THREE.Vector3(0, -0.5, 0));
                
        this.trashTruckModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/garbageTruck.glb');
        this.trashTruckModel.scene.children[0].rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.trashTruckModel.scene.children[0].position.add(new THREE.Vector3(0, -0.5, 0));

        this.sedanSportsModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/sedanSports.glb');
        this.sedanSportsModel.scene.children[0].rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.sedanSportsModel.scene.children[0].position.add(new THREE.Vector3(0, -0.5, 0));

        this.explosionTexture = this.textureLoader.load('assets/particle-32x32.png');

        // https://www.youtube.com/watch?v=V_yjydXVIwQ&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=4

        this.world.broadphase = new CANNON.SAPBroadphase(this.world);

        var groundMaterial = new CANNON.Material("groundMaterial");
        const normalMap = new THREE.TextureLoader().load('assets/normal-map.png');
        

        // width and height need to match dimensions of heightmap
        this.terrain = new TerrainObject(this,
            new THREE.MeshPhongMaterial(
                {
                    color: 0x44dd44,
                    depthWrite: true,
                    //wireframe: true,
                    side: THREE.DoubleSide,
                    bumpMap: normalMap,                    
                    //vertexColors: true
                }),
                 /*
            new THREE.MeshBasicMaterial({
                //color: 0x007700,
                //wireframe: false,
                //depthWrite: true,
                //fog: true,
                map: texture
            }),
            */
            /*
            new THREE.MeshStandardMaterial({
                color: 0x004400, 
                emissive: 0x004400,
                roughness: 0.9,
                metalness: 0.3,
                map: texture 
            }),            
            */
            /*
            new THREE.MeshLambertMaterial({
                color: 0x004400,
                emissive: 0x004400,
                emissiveIntensity: 0.5,
                map: texture,

            }),
            */
            this.world,
            groundMaterial,
            this.heightMapTextureAsArray,
            2,
            false,
            true,
            false
        );

        // adding phyics plane to avoid falling through
        const groundShape = new CANNON.Plane();
        var body = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            material: new CANNON.Material});
        body.addShape(groundShape);            
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);        
        this.world.addBody(body);


        this.generateGrassBillboards(this.heightMapTextureAsArray.getImageWidth(), this.heightMapTextureAsArray.getImageHeight());

            
        var wheelMaterial = new CANNON.Material("wheelMaterial");
        var wheelGroundContactMaterial = new CANNON.ContactMaterial(
            wheelMaterial,
            groundMaterial,
            {
                friction: 0.3, restitution: 0, contactEquationStiffness: 1000
            }
        );
        this.world.addContactMaterial(wheelGroundContactMaterial);

        var objectMaterial = new CANNON.Material();
    
        this.cube = new BoxObject(this, 1,1,1, new THREE.Vector3(0, 20, -9.5), 0xffff00,
                        new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.world, objectMaterial);

        this.cube2 = new BoxObject(this, 1,1,1, new THREE.Vector3(0, 10, -8), 0xffff00,
                        new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.world, objectMaterial);

        this.sphere = new SphereObject(this, 1, new THREE.Vector3(0.5, 5, -10), 0x00ff00,
                        new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
                        this.world, objectMaterial);

        this.cylinder = new CylinderObject(this, 1, 0.25, new THREE.Vector3(0, 3, -12), 0x00ff00,
            new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
            this.world, objectMaterial);

        this.player1 = new Player(this, "Ambulance");
        this.player2 = new Player(this, "Taxi");
        this.player3 = new Player(this, "Police");
        this.player4 = new Player(this, "Trash Truck");


        this.gltfVehiclePlayer1 = new GltfObject(this,
            this.sedanSportsModel,
            //'assets/kenney-vehicles/taxi.glb',
            new THREE.Vector3(2, 2, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(0.5, 0.5, 1), // bounding boxf size,
            new THREE.Vector3(0, -0.25, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allGltfPlayers.push(this.gltfVehiclePlayer1);

        this.gltfVehiclePlayer2 = new GltfObject(this,
            this.policeModel,
            new THREE.Vector3(-2, 2, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(0.5, 0.5, 1), // bounding box size,
            new THREE.Vector3(0, -0.25, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allGltfPlayers.push(this.gltfVehiclePlayer2);

        this.gltfVehiclePlayer3 = new GltfObject(this,
            this.trashTruckModel,
            new THREE.Vector3(-6, 2, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(1, 1, 1.5), // bounding box size,
            new THREE.Vector3(0, -0.5, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allGltfPlayers.push(this.gltfVehiclePlayer3);

        this.gltfVehiclePlayer4 = new GltfObject(this,
            this.ambulanceModel,
            new THREE.Vector3(-3, 5, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(1, 1, 1.5), // bounding box size,
            new THREE.Vector3(0, -0.5, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allGltfPlayers.push(this.gltfVehiclePlayer4);
              
        this.raycastVehicleObject = new RaycastVehicleObject(
            this,
            new THREE.Vector3(-5, 4, -15),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.5, 0),    // center of mass adjust
            500,                            // chassis mass
            wheelMaterial,
            0.25,                           // wheel radius
            new CANNON.Vec3(0, 0, 0),   // wheel offset
            20,                              // wheel mass
            this.trashTruckModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );

        this.player1.vehicleObject = new RaycastVehicleObject(
            this,
            new THREE.Vector3(-10, 5, -10),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.5, 0),    // center of mass adjust
            500,                            // chassis mass
            wheelMaterial,
            0.25,                           // wheel radius
            new CANNON.Vec3(0, 0, 0),   // wheel offset
            20,                              // wheel mass
            this.sedanSportsModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );
        this.allPlayers.push(this.player1);
        
        this.player2.vehicleObject = new RaycastVehicleObject(
            this,
            new THREE.Vector3(5, 4, 5),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            500,                            // chassis mass
            wheelMaterial,
            0.25,                           // wheel radius
            new CANNON.Vec3(0, 0, 0),   // wheel offset
            20,                              // wheel mass
            this.taxiModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );
        this.allPlayers.push(this.player2);

        this.player3.vehicleObject = new RaycastVehicleObject(
            this,
            new THREE.Vector3(-5, 4, -5),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            500,                            // chassis mass
            wheelMaterial,
            0.25,                           // wheel radius
            new CANNON.Vec3(0, 0, 0),   // wheel offset
            20,                              // wheel mass
            this.policeModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );
        this.allPlayers.push(this.player3);

        this.player4.vehicleObject = new RaycastVehicleObject(
            this,
            new THREE.Vector3(-5, 4, -5),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            500,                            // chassis mass
            wheelMaterial,
            0.25,                           // wheel radius
            new CANNON.Vec3(0, 0, 0),   // wheel offset
            20,                              // wheel mass
            this.trashTruckModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );       
        this.allPlayers.push(this.player4);

        //this.rigidVehicleObject.model?.add(this.camera);        
        this.camera.position.x = 0;
        this.camera.position.y = 2;        
        this.camera.position.z = 5;

        this.followCam = new THREE.Object3D();
		this.followCam.position.copy(this.camera.position);
		this.add(this.followCam);   
        
        this.player1.vehicleObject.getModel()?.add(this.followCam);
        this.followCam.position.set(5, 3, 0); // camera target offset related to car

        this.allRigidVehicleObjects.push(this.player1.vehicleObject);
        
        let crosshairTexture = this.textureLoader.load('assets/crosshair061.png');
        let material = new THREE.SpriteMaterial( { map: crosshairTexture, color: 0xffffff, depthTest: false });//,transparent: true, opacity: 0.5 } );
        this.crosshairSprite = new THREE.Sprite( material );
        this.add(this.crosshairSprite);

        // bounding box to show shadows
        const cubeSize = 30;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({
            color: '#CCC',
            side: THREE.BackSide,
        });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.receiveShadow = true;
        mesh.position.set(0, cubeSize / 2 - 0.1, 0);
        //this.add(mesh);
        
        var groundCubeContactMaterial = new CANNON.ContactMaterial(
            this.terrain.getPhysicsMaterial(),
            this.cube.getPhysicsMaterial(),
            {
                friction: 0
            }            
        );
        this.world.addContactMaterial(groundCubeContactMaterial);

        //const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        //light.position.set(0, 20, 2);
        //this.add(light);
        const color = new THREE.Color('white');
        const intensity = 1;
        const distance = 50;
        const angle = Math.PI / 8;
        const penumbra = 0.25;
        const decay = 0.1;

        this.spotlight = new SpotlightObject(this, color, intensity, distance, angle, penumbra, decay,
            new THREE.Vector3(0,15,0),
            this.cube2.mesh);

        //const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        //this.add(ambientLight);

        const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.5 );
        this.add( light );

        for(let i = 0; i < 50; i++) {
            this.generateRandomPickup(this.heightMapTextureAsArray.getImageWidth(), this.heightMapTextureAsArray.getImageHeight());
        }

        document.body.appendChild(this.stats.dom);

        this.divElementPlayerStats = this.generateDivElement(10, 50, "Player location");
        this.divElementObjective = this.generateDivElement(10, 100, "Objective");
        this.divElementParticleCount = this.generateDivElement(10, 150, "Particle count");
        this.divElementWeaponParticleCount = this.generateDivElement(10, 200, "Weapon count");
        this.divElementPhysicsObjectCount = this.generateDivElement(10, 250, "Physics object count");
        this.divElementLightObjectCount = this.generateDivElement(10, 300, "Light object count");

        // skybox tutorial: https://threejs.org/manual/#en/backgrounds
        // asset source: https://polyhaven.com/a/industrial_sunset_puresky
        let skyTexture = this.textureLoader.load(
            'assets/industrial_sunset_puresky.jpg',
            () => {

                skyTexture.mapping = THREE.EquirectangularReflectionMapping;
                skyTexture.colorSpace = THREE.SRGBColorSpace;
                this.background = skyTexture;
            } 
        );

        // https://threejs.org/examples/?q=water#webgl_shaders_ocean
        const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.fog !== undefined
            }
        );
        this.water.rotation.x = - Math.PI / 2;
        this.water.position.y += 1.5;
        this.add( this.water );

        // TODO: sun from https://threejs.org/examples/?q=water#webgl_shaders_ocean
        /*
        const parameters = {
            elevation: 2,
            azimuth: 180
        };
        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

        var sun = new THREE.Vector3();
        sun.setFromSphericalCoords( 1, phi, theta );
        //sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        this.water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();        
        */

        var flamethrowerEmitter = new FlamethrowerEmitter(this,
            this.player1.playerId,
            this.explosionTexture,
            new THREE.Color('yellow'),
            new THREE.Color('orange'),
            new THREE.Vector3(0, 1, 0),
            5
        );
        this.flamethrowerEmitters.push(flamethrowerEmitter);

        
        var flamethrowerEmitter2 = new FlamethrowerEmitter(this,
            this.player2.playerId,
            this.explosionTexture,
            new THREE.Color('yellow'),
            new THREE.Color('orange'),
            new THREE.Vector3(0, 1, 0),
            5
        );
        this.flamethrowerEmitters.push(flamethrowerEmitter2);

        this.addToParticleEmitters(new SmokeObject(this, this.explosionTexture, new THREE.Vector3(0, 0, 0), 5, 200000));
                
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }
    generateGrassBillboards(mapWidth: number, mapHeight: number) {

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const sprite = new THREE.TextureLoader().load( 'assets/billboard_grass_256x256.png' );
        sprite.colorSpace = THREE.SRGBColorSpace;

        for ( let i = 0; i < 10000; i ++ ) {

            const x = mapWidth * Math.random() - mapWidth / 2;
            const z = mapHeight * Math.random() - mapHeight / 2;

            let tempVector3 = this.getWorldPositionOnTerrain(x, z);
            vertices.push( tempVector3.x, tempVector3.y, tempVector3.z );
        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        var material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true } );
        //material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );

        const particles = new THREE.Points( geometry, material );
        this.add( particles );
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keyDown.add(event.key.toLowerCase());
    }

	private handleKeyUp = (event: KeyboardEvent) => {
		this.keyDown.delete(event.key.toLowerCase())

		if (event.key === 'Control')
		{            
            let newProjectile = this.player1.createProjectile(ProjectileType.Rocket);
            this.addNewProjectile(newProjectile);	            
		}
        if (event.key === 'c')
		{			
            this.generateRandomCube();
		}
        if (event.key === 'x')
		{            
            let newProjectile = this.player1.createProjectile(ProjectileType.Bullet);
            this.addNewProjectile(newProjectile);		
		}
        if (event.key === 'e')
		{                        
            let newProjectile = this.player2.createProjectile(ProjectileType.Bullet);
            this.addNewProjectile(newProjectile);		
		}
        if (event.key === 'r')
		{                        
            let newProjectile = this.player2.createProjectile(ProjectileType.Rocket);
            this.addNewProjectile(newProjectile);		
		}
        if (event.key === '1')
		{
            this.sceneController.updateHealthOnHud(19);
		}
        if (event.key === '2')
		{
            this.sceneController.updateHealthOnHud(50);
		}
        if (event.key === '3')
		{
            this.sceneController.updateHealthOnHud(80);
		}
        if (event.key === '4')
		{
            this.sceneController.updateShieldOnHud(25);
		}
        if (event.key === '5')
		{
            this.sceneController.updateTurboOnHud(50);
		}        
        if (event.key === '6')
		{
            this.player1.healthBar.updateValue(50);
		}      
        if (event.key === '7')
		{
            this.player1.healthBar.updateValue(19);
		}      
        if (event.key === 'Escape')
		{
			this.player1.vehicleObject?.resetPosition();
		}

        if(event.key === 'w') {
            this.raycastVehicleObject?.tryStopAccelerate();
        }
        else if(event.key === 's') {
            this.raycastVehicleObject?.tryStopReverse();
        }

        if(event.key === 'a') {
            this.raycastVehicleObject?.tryStopTurnLeft();
        }
        else if(event.key === 'd') {
            this.raycastVehicleObject?.tryStopTurnRight();
        }

        // player 1
        if(event.key === 'ArrowUp') {
            this.player1.vehicleObject?.tryStopAccelerate();
        }
        else if(event.key === 'ArrowDown') {
            this.player1.vehicleObject?.tryStopReverse();
        }

        if(event.key === 'ArrowLeft') {
            this.player1.vehicleObject?.tryStopTurnLeft();
        }
        else if(event.key === 'ArrowRight') {
            this.player1.vehicleObject?.tryStopTurnRight();
        }

        if(event.key === ' ') {
            this.player1.tryJump();
        }
        if (event.key === 'shift') {
            this.player1.tryStopTurbo();
        }
	}

    private updateInput() {

        /*
        if(!this.blaster) {
            return;
        }

        const shiftKey = this.keyDown.has('shift');
        if(!shiftKey){
            if(this.keyDown.has('arrowleft')) {
                this.blaster.rotateY(0.02);
            }
            else if(this.keyDown.has('arrowright')) {
                this.blaster.rotateY(-0.02);
            }
        }
        */

        const dir = this.directionVector;

        this.camera.getWorldDirection(dir);

        this.sceneController.pollGamepads();

        // raycast vehicle controls
        if(this.keyDown.has('w')) {
            this.raycastVehicleObject?.tryAccelerate();
        }
        else if(this.keyDown.has('s')) {
            this.raycastVehicleObject?.tryReverse();
        }

        if(this.keyDown.has('a')) {
            this.raycastVehicleObject?.tryTurnLeft();
        }
        else if(this.keyDown.has('d')) {
            this.raycastVehicleObject?.tryTurnRight();
        }

        // rigid body vehicle controls
        if(this.keyDown.has('arrowup')) {
            this.player1.vehicleObject?.tryAccelerate();
        }
        else if(this.keyDown.has('arrowdown')) {
            this.player1.vehicleObject?.tryReverse();
        }

        if(this.keyDown.has('arrowleft')) {
            this.player1.vehicleObject?.tryTurnLeft();
        }
        else if(this.keyDown.has('arrowright')) {
            this.player1.vehicleObject?.tryTurnRight();
        }
        
        if (this.keyDown.has('z')) {
            this.firePlayerFlamethrower();
        }

        if (this.keyDown.has('q')) {
            this.fireEnemyFlamethrower();
        }
        if (this.keyDown.has('shift')) {
            this.player1.tryTurbo();
        }
    }

    updateCamera() {

        if(this.followCam != null)
            this.camera.position.lerp(this.followCam?.getWorldPosition(new THREE.Vector3()), 0.05);
		if(this.player1.vehicleObject?.getChassis().mesh != null)
            this.camera.lookAt(this.player1.vehicleObject?.getChassis().mesh?.position);
    }

    public async addNewProjectile(projectile: Projectile) {
        this.projectiles.push(projectile);
        if(projectile.particleEmitterObject != null)
            this.addToParticleEmitters(projectile.particleEmitterObject);	
    }

    public firePlayerFlamethrower() {

        let flamethrowerEmitter = this.flamethrowerEmitters[0];
        flamethrowerEmitter.setPosition(this.player1.getPosition());
        if(this.player1.vehicleObject && this.player1.vehicleObject.getModel()) {                
            flamethrowerEmitter.setQuaternion(this.player1.vehicleObject.getModel().quaternion);
        }
    
        flamethrowerEmitter.emitParticles();
    }

    public fireEnemyFlamethrower() {

        // TODO: refactor and link to specific enemies

        let flamethrowerEmitter = this.flamethrowerEmitters[1];
        flamethrowerEmitter.setPosition(this.player2.getPosition());
        if(this.player2.vehicleObject && this.player2.vehicleObject.getModel()) {                
            flamethrowerEmitter.setQuaternion(this.player2.vehicleObject.getModel().quaternion);
        }
    
        flamethrowerEmitter.emitParticles();
    }

    public addToParticleEmitters(emitter: ParticleEmitter) {
        this.particleEmitters.push(emitter);
    }

    private async generateRandomCube() {

        let randPosition = new THREE.Vector3(randFloat(-10, 10), 5, randFloat(-10, -10));
        let randCubeSize = randFloat(0.5, 1);

        let randColor = THREE.MathUtils.randInt(0, 0xffffff);

        const cube = new BoxObject(this,
            randCubeSize, randCubeSize, randCubeSize,
            randPosition,
            randColor,
            new THREE.MeshPhongMaterial( { color: randColor, depthWrite: true }),
            this.world,
            new CANNON.Material(),
            randCubeSize);

        this.cubes.push(cube);
    }
    
    
    private async generateRandomPickup(mapWidth: number, mapHeight: number) {

        
        let pickupTextureRocket = this.textureLoader.load('assets/rocketIcon-multiple.png');
        let pickupTextureHealth = this.textureLoader.load('assets/DPAD.png');
        let pickupTextureFlamethrower = this.textureLoader.load('assets/fire.png');
        let pickupTextureFreeze = this.textureLoader.load('assets/freezeIcon.png');
        let pickupTextureLightning = this.textureLoader.load('assets/shockwaveIcon2.png');
        let pickupTextureShockwave = this.textureLoader.load('assets/shockwaveIcon3.png');
        
        let texture: THREE.Texture;
        let randIconIndex = THREE.MathUtils.randInt(0, 5);
        switch(randIconIndex) {
            case 0:
                texture = pickupTextureRocket;
                break;
            case 1:
                texture = pickupTextureHealth;
                break;
            case 2:
                texture = pickupTextureFlamethrower;
                break;
            case 3:
                texture = pickupTextureFreeze;
                break;
            case 4:
                texture = pickupTextureLightning;
                break;
            case 5:
                texture = pickupTextureShockwave;
                break;
            default:
                texture = pickupTextureRocket;
                break;
        }


        let randX = randFloat(-mapWidth / 2, mapWidth / 2);        
        let randZ = randFloat(-mapHeight / 2, mapHeight / 2);
        let spawnPosition = this.getWorldPositionOnTerrain(randX, randZ);
        spawnPosition.y += 0.75;

        let randCubeSize = 0.75; //randFloat(0.5, 2);
        let randColor = THREE.MathUtils.randInt(0, 0xffffff);

        const cube = new PickupObject(this,
            randCubeSize, randCubeSize, randCubeSize,
            spawnPosition,
            randColor,
            texture,
            0.75
        );

        this.pickups.push(cube);
    }

    private async generateRandomExplosion(projectileType: ProjectileType, position: THREE.Vector3, lightColor: THREE.Color, particleColor: THREE.Color) {

        if(this.explosionTexture != null) {
            //let randPosition = new THREE.Vector3(randFloat(-5, 5), randFloat(5, 15), randFloat(-5.5, -10.5));

            /*
            if(color == null) {
                let randColorR = THREE.MathUtils.randInt(0, 255);
                let randColorG = THREE.MathUtils.randInt(0, 255);
                let randColorB = THREE.MathUtils.randInt(0, 255);

                color = new THREE.Color(randColorR, randColorG, randColorB);
            }
            */

            let numberParticles: number;
            switch(projectileType) {
                case ProjectileType.Bullet:
                    numberParticles = 5;
                    break;
                case ProjectileType.Rocket:
                    numberParticles = 100;
                    break;
            }

            this.addToParticleEmitters(new VehicleExplosionObject(
                this,
                this.explosionTexture,
                lightColor,
                particleColor,
                position,
                numberParticles,
                0.03)
            );
        }
    }

    private checkProjectilesForCollision() { 
        this.projectiles.forEach(projectile => {
            if(projectile.shouldRemove) {
                projectile.kill();
                projectile.group.children.forEach(x => this.remove(x));
                this.remove(projectile.group);      
            }
            else
            {
                let playersToCheck = this.allPlayers.filter(x => x.playerId != projectile.playerId);
                playersToCheck.forEach(player => {
                    if(player.getPosition().distanceTo(projectile.getPosition()) < 1 && player.currentHealth > 0){
                        this.generateRandomExplosion(
                            projectile.projectileType,
                            projectile.getPosition(),
                            projectile.getLightColor(),
                            projectile.getParticleColor()
                        );
                        projectile.kill();
                        this.remove(projectile.group);
                        player.tryDamage(projectile.projectileType, projectile.getPosition());
                    }
                });

                
                // TODO: fix me
                /*
                this.world.contacts.forEach((contact) => {

                    if(contact.bi === projectile.body || contact.bj === projectile.body)
                        console.log('Collision detected involving projectile');


                    if(contact.bi === this.terrain?.body || contact.bj === this.terrain?.body)
                        console.log('Collision detected involving ground');

                    if ((contact.bi === projectile.body && contact.bj === this.terrain?.body) |s| 
                        (contact.bj === projectile.body && contact.bi === this.terrain?.body)) {
                        
                        console.log('Collision detected between projectile and ground');
                        projectile.kill();
                        this.remove(projectile.group);
                        // Perform additional collision handling logic here
                }
                });
                */
        

                /*
                this.allRigidVehicleObjects.forEach(player => {
                    if(player.getPosition().distanceTo(projectile.getPosition()) < 1){
                        this.generateRandomExplosion(
                            projectile.getPosition(),
                            projectile.getLightColor(),
                            projectile.getParticleColor()
                        );
                        projectile.kill();
                            this.remove(projectile.mesh);
                    }
                });
                */
            };
            
        });

        this.projectiles = this.projectiles.filter(x => !x.shouldRemove);
    }

    private checkPickupsForCollisionWithPlayers() {
        this.pickups.forEach(pickup => {
            this.allPlayers.forEach(player => {

                let playerPosition = player.getPosition();
                let pickupPosition = pickup.getPosition();
                if(playerPosition.distanceTo(pickupPosition) < 1.5) {
                    // TODO: logic for player receiving pickup item
                    pickup.remove();
                }
            })
        });
    }

    getWorldPositionOnTerrain(x: number, z: number): THREE.Vector3 {

        let worldPosition = new THREE.Vector3(0,0,0);

        if(!this.terrain || !this.terrain.heightfieldShape)
            return new THREE.Vector3(0,0,0);

        let startPosition = new THREE.Vector3(x, 100, z);
        let endPosition = new THREE.Vector3(x, -100, z);

        let ray = new CANNON.Ray(Utility.ThreeVec3ToCannonVec3(startPosition), Utility.ThreeVec3ToCannonVec3(endPosition));                
        var raycastResult: CANNON.RaycastResult = new CANNON.RaycastResult();
        if(this.terrain.body != null) {
            ray.intersectBody(this.terrain.body, raycastResult);
        }
        if(raycastResult != null && raycastResult.hasHit) {
            worldPosition = Utility.CannonVec3ToThreeVec3(raycastResult.hitPointWorld);
        }

        return worldPosition;
    }

    updateWater() {
        if(!this.water)
            return;

        this.water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
    }

    update() {
        if(this.world != null)
            this.world.fixedStep();

        if(!this.player1 || !this.player1.vehicleObject) return;

        this.updateInput();          
        this.updateCamera(); 
        
        this.terrain?.update();

        this.cube?.update();
        this.cube2?.update();
        this.sphere?.update();
        this.cylinder?.update();

        //const time = performance.now() * 0.001;

        this.gltfVehiclePlayer1?.update();
        this.gltfVehiclePlayer2?.update();
        this.gltfVehiclePlayer3?.update();
        this.gltfVehiclePlayer4?.update();

        this.raycastVehicleObject?.update();    
        //this.player1.rigidVehicleObject?.update();

        
        this.cubes.forEach(x => x.update());

        this.pickups.forEach(x => x.update());

        this.projectiles.forEach(x => x.update());
        this.particleEmitters.forEach(x => x.update());

        this.checkProjectilesForCollision();
        this.checkPickupsForCollisionWithPlayers();

        this.world.contacts.forEach((contact) => {
            if ((contact.bi === this.player1.vehicleObject.getChassis().body && contact.bj === this.player2.vehicleObject.getChassis().body) || 
                (contact.bj === this.player1.vehicleObject.getChassis().body && contact.bi === this.player2.vehicleObject.getChassis().body)) {
                console.log('Collision detected between player 1 and player 2');
                // Perform additional collision handling logic here
        }
        });

        if(this.cube != null) 
        {
            //this.spotlight?.setPosition(this.cube?.mesh.position);
        }

        this.spotlight?.update();

        this.particleEmitters.forEach(x => x.update());
        this.particleEmitters = this.particleEmitters.filter(x => !x.isDead);

        this.flamethrowerEmitters.forEach(x => x.update());

        //this.healthBar.update(this.allPlayers[0].getPosition());

        //if(this.allPlayers[0].body != null)
        //this.headLights.update(this.allPlayers[0].getPosition(), this.allPlayers[0].mesh.quaternion);

        this.allPlayers.forEach(x => x.update());

        let playerPosition = this.player1.getPosition();

        if(this.player1.vehicleObject.getModel() != null) {
            let forwardVector = new THREE.Vector3(-10, 0, 0);
            forwardVector.applyQuaternion(this.player1.vehicleObject.getModel().quaternion);
            this.crosshairSprite.position.addVectors(this.player1.vehicleObject.getModel().position, forwardVector);//playerPosition.x, playerPosition.y - 2, playerPosition.z);
            //let size = 10;
            //this.crosshairSprite.scale.set(size, size, size);

            // otherPlayers still alive
            var otherPlayersStillAlive = this.allPlayers.filter(x => x.playerId != this.player1.playerId && x.currentHealth > 0);

            var otherPlayerBodies: CANNON.Body[] = [];
            for(var i = 0; i < otherPlayersStillAlive.length; i++) {
                if(otherPlayersStillAlive[i].vehicleObject != null && otherPlayersStillAlive[i].vehicleObject?.getChassis().body != null) {
                    let body = otherPlayersStillAlive[i].vehicleObject?.getChassis().body ?? new CANNON.Body();
                    otherPlayerBodies.push(body); 
                }
            }

            /*
            var otherPlayerBodies = <unknown>otherPlayers.forEach(x => {
                return x.rigidVehicleObject?.chassis.body;
            });
            var temp = otherPlayerBodies as CANNON.Body[];
            */

            if(this.player2.vehicleObject?.getCannonVehicleChassisBody() != null) {
                let ray = new CANNON.Ray(Utility.ThreeVec3ToCannonVec3(playerPosition), Utility.ThreeVec3ToCannonVec3(this.crosshairSprite.position));
                
                var raycastResult: CANNON.RaycastResult = new CANNON.RaycastResult();

                var otherVehicleObject = this.player2.vehicleObject?.getCannonVehicleChassisBody();
                if(otherVehicleObject != null) {
                    // intersect single body
                    ray.intersectBody(otherVehicleObject, raycastResult);
                }

                // intersect multiple bodies
                ray.intersectBodies(otherPlayerBodies, raycastResult);

                if(raycastResult != null && raycastResult.hasHit) {
                    this.crosshairSprite.material.color.set(new THREE.Color('red'));
                }
                else {
                    this.crosshairSprite.material.color.set(new THREE.Color('white'));
                }
            }
        }

        let emitterTotalParticleCount: number = 0;
        this.particleEmitters.forEach(x => {
            emitterTotalParticleCount += x.getParticleCount();
        });

        this.allPlayers.forEach(x => {
            emitterTotalParticleCount += x.getTotalParticleCount();
        })

        this.divElementPlayerStats.innerHTML = `location: (${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)})`;
        this.divElementObjective.innerHTML = `scene objects: ${this.children.length}`;

        let flameThrowerEmitterTotalParticleCount: number = 0;
        this.flamethrowerEmitters.forEach(x => {
            flameThrowerEmitterTotalParticleCount += x.sprites.length;
        });
        this.divElementWeaponParticleCount.innerHTML = `flamethrower particles: ${flameThrowerEmitterTotalParticleCount}`; 
        this.divElementParticleCount.innerHTML = `total emitter particles: ${emitterTotalParticleCount}`; 

        let totalPhysicsObjectCount: number = this.world.bodies.length;        
        this.divElementPhysicsObjectCount.innerHTML = `total physics objects: ${totalPhysicsObjectCount}`; 

        var arrayLightTypes = ['SpotLight', 'HemisphereLight', 'AmbientLight', 'DirectionalLight', 'PointLight', 'RectAreaLight'];

        var totalLightCountInGroup = 0;
        
        var allGroups = this.children.filter(x => x.type == 'Group');
        allGroups.forEach(x => {
            totalLightCountInGroup += x.children.filter(y => arrayLightTypes.includes(y.type)).length;
        });

        let totalLightObjectCount: number = this.children.filter(x => arrayLightTypes.includes(x.type)).length;
        this.divElementLightObjectCount.innerHTML = `total light objects: ${totalLightObjectCount + totalLightCountInGroup}`; 
        
        this.stats.update();
    }

    generateDivElement(screenX: number, screenY: number, text: string): HTMLDivElement {
        let div = document.createElement('div');
        div.style.position = 'absolute';
        //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        div.style.width = "200";
        div.style.height = "200";
        //text2.style.backgroundColor = "blue";
        div.style.color = "white";
        div.innerHTML = text;
        div.style.left = screenX + 'px';
        div.style.top = screenY + 'px';
        document.body.appendChild(div);
        
        return div;
    }

    //generateArrayFromTexture() {
        //var textureToArray = new TextureToArray(this.textureLoader);
    //}    
}