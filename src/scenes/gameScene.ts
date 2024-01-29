import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as CANNON from 'cannon-es'
import { GroundObject } from '../gameobjects/shapes/groundObject';
import { BoxObject } from '../gameobjects/shapes/boxObject';
import { SphereObject } from '../gameobjects/shapes/sphereObject';
import Stats from 'three/addons/libs/stats.module.js';
import SpotlightObject from '../gameobjects/shapes/spotlightObject';
import { randFloat } from 'three/src/math/MathUtils.js';
import { ParticleEmitter } from '../gameobjects/fx/particleEmitter';
import { GltfObject } from '../gameobjects/gltfObject';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Projectile, ProjectileLaunchLocation } from '../gameobjects/weapons/projectile';
import { CylinderObject } from '../gameobjects/shapes/cylinderObject';
import { RaycastVehicleObject } from '../gameobjects/vehicles/raycastVehicle/raycastVehicleObject';
import { RigidVehicleObject } from '../gameobjects/vehicles/rigidVehicle/rigidVehicleObject';
import { ProjectileType } from '../gameobjects/weapons/projectileType';
import ProjectileFactory from '../gameobjects/weapons/projectileFactory';
import { PickupObject } from '../gameobjects/pickupObject';
import HealthBar from '../gameobjects/healthBar';
import Headlights from '../gameobjects/vehicles/headLights';
import SceneController from './sceneController';
import { Player } from '../gameobjects/player';
import { FlamethrowerEmitter } from '../gameobjects/weapons/flamethrowerEmitter';
import { ParticleTrailObject } from '../gameobjects/fx/particleTrailObject';
import { SmokeObject } from '../gameobjects/fx/smokeObject';
import { VehicleExplosionObject } from '../gameobjects/fx/vehicleExplosionObject';
import { Utility } from '../utility';

// npm install cannon-es-debugger
// https://youtu.be/Ht1JzJ6kB7g?si=jhEQ6AHaEjUeaG-B&t=291

// https://www.youtube.com/watch?v=8J5xl9oijR8&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=3

export default class GameScene extends THREE.Scene {

    private stats: Stats = new Stats();

    private readonly mtlLoader = new MTLLoader();
    private readonly objLoader = new OBJLoader();

    private readonly gltfLoader = new GLTFLoader();
    private taxiModel?: GLTF;
    private policeModel?: GLTF;
    private ambulanceModel?: GLTF;
    private trashTruckModel?: GLTF;

    private readonly textureLoader = new THREE.TextureLoader();

    private readonly camera: THREE.PerspectiveCamera;

    private readonly keyDown = new Set<string>();
    private readonly keyUp = new Set<string>();

    private bulletMtl?: MTLLoader.MaterialCreator;
    private directionVector = new THREE.Vector3();

    private cubes: BoxObject[] = [];
    private targets: THREE.Group[] = [];

    private pickups: PickupObject[] = [];

    private projectileFactory: ProjectileFactory = new ProjectileFactory();
    private fireLeft: boolean = false;
    private projectiles: Projectile[] = [];

    private particleEmitters: ParticleEmitter[] = [];
    public explosionTexture: THREE.Texture | undefined;


    world: CANNON.World = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.81, 0)
    });
    
    ground?: GroundObject;
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
    player1: Player = new Player(this, "Ambulance");
    player2: Player = new Player(this, "Taxi");
    player3: Player = new Player(this, "Police");
    player4: Player = new Player(this, "Trash Truck");

    private allRigidVehicleObjects: RigidVehicleObject[] = [];

    private followCam?: THREE.Object3D;

    sphere?: SphereObject;

    spotlight?: SpotlightObject;

    flamethrowerEmitter?: FlamethrowerEmitter;

    //healthBar: HealthBar = new HealthBar(this, 100);
    //headLights: Headlights = new Headlights(this);

    sceneController: SceneController;

    divElementPlayerStats!: HTMLDivElement;
    divElementObjective!: HTMLDivElement;
    divElementWeaponParticleCount!: HTMLDivElement;
    divElementParticleCount!: HTMLDivElement;

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

        // https://www.youtube.com/watch?v=V_yjydXVIwQ&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=4

        this.world.broadphase = new CANNON.SAPBroadphase(this.world);

        var groundMaterial = new CANNON.Material("groundMaterial");
        this.ground = new GroundObject(this, 100, 100, 0x444444,
            new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true }),
            this.world, groundMaterial);

            
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

        this.cube2 = new BoxObject(this, 1,1,1, new THREE.Vector3(0, 20, -8), 0xffff00,
                        new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.world, objectMaterial);

        this.sphere = new SphereObject(this, 1, new THREE.Vector3(0.5, 5, -10), 0x00ff00,
                        new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
                        this.world, objectMaterial);

        this.cylinder = new CylinderObject(this, 1, 0.25, new THREE.Vector3(0, 3, -12), 0x00ff00,
            new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
            this.world, objectMaterial);


        this.gltfVehiclePlayer1 = new GltfObject(this,
            this.taxiModel,
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
            new THREE.Vector3(-5, 4, -15),
            0x00ff00,
            this.world,
            wheelMaterial);


        // player1 currently assigned when GameScene is created
        this.player1.rigidVehicleObject = new RigidVehicleObject(
            this,
            new THREE.Vector3(0, 4, 0),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            20,                            // chassis mass
            wheelMaterial,
            0.2,                           // wheel radius
            new CANNON.Vec3(0, -0.2, 0),   // wheel offset
            2,                              // wheel mass
            this.ambulanceModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );
        this.allPlayers.push(this.player1);

        this.player2.rigidVehicleObject = new RigidVehicleObject(
            this,
            new THREE.Vector3(5, 4, 5),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            20,                            // chassis mass
            wheelMaterial,
            0.2,                           // wheel radius
            new CANNON.Vec3(0, -0.2, 0),   // wheel offset
            2,                              // wheel mass
            this.taxiModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );
        this.allPlayers.push(this.player2);

        this.player3.rigidVehicleObject = new RigidVehicleObject(
            this,
            new THREE.Vector3(-5, 4, -5),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            20,                            // chassis mass
            wheelMaterial,
            0.2,                           // wheel radius
            new CANNON.Vec3(0, -0.2, 0),   // wheel offset
            2,                              // wheel mass
            this.policeModel,             // model            
            new THREE.Vector3(0.7, 0.7, 0.7), // model scale,
            new THREE.Vector3(0, 0, 0) // model offset
            //new THREE.Vector3(0, -0.35, 0) // model offset
        );
        this.allPlayers.push(this.player3);

        this.player4.rigidVehicleObject = new RigidVehicleObject(
            this,
            new THREE.Vector3(-5, 4, 5),   // position
            this.world,            
            new CANNON.Vec3(1, 0.5, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.4, 0),    // center of mass adjust
            20,                            // chassis mass
            wheelMaterial,
            0.2,                           // wheel radius
            new CANNON.Vec3(0, -0.2, 0),   // wheel offset
            2,                              // wheel mass
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
        
        this.player1.rigidVehicleObject.model?.add(this.followCam);
        this.followCam.position.set(5, 3, 0); // camera target offset related to car

        this.allRigidVehicleObjects.push(this.player1.rigidVehicleObject);
        
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
            this.ground.getPhysicsMaterial(),
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
        const distance = 30;
        const angle = Math.PI / 8;
        const penumbra = 0.25;
        const decay = 0.5;

        this.spotlight = new SpotlightObject(this, color, intensity, distance, angle, penumbra, decay,
            new THREE.Vector3(0,0,0),
            this.cube2.mesh);

        //const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        //this.add(ambientLight);

        const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.5 );
        this.add( light );

        this.explosionTexture = this.textureLoader.load('assets/particle-32x32.png');

        let pickupTexture = this.textureLoader.load('assets/rocketIcon-multiple.png');

        for(let i = 0; i < 10; i++) {
            this.generateRandomPickup(pickupTexture);
        }

        document.body.appendChild(this.stats.dom);

        this.divElementPlayerStats = this.generateDivElement(10, 50, "Player location");
        this.divElementObjective = this.generateDivElement(10, 100, "Objective");
        this.divElementParticleCount = this.generateDivElement(10, 150, "Particle count");
        this.divElementWeaponParticleCount = this.generateDivElement(10, 200, "Weapon count");

        //let healthBarTexture = this.textureLoader.load('assets/healthBarWhite-100x20.png');

        //this.healthBar = new HealthBar(this);
        
        /*
        let canvas = document.createElement("canvas") as HTMLCanvasElement;
        canvas.width = 64;
        canvas.height = 64;

        let texture = new THREE.Texture(canvas);
        const material = new THREE.MeshBasicMaterial({
          map: this.explosionTexture,
          depthTest: false,
          transparent: true,
        });
        const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    
        let statsPlane = new THREE.Mesh(geometry, material);
        statsPlane.position.x = 0;
        statsPlane.position.y = 1.5;
        statsPlane.position.z = 0;
        statsPlane.renderOrder = 9999;

        this.camera.add(statsPlane);
        */

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

        this.flamethrowerEmitter = new FlamethrowerEmitter(this,
            this.explosionTexture,
            new THREE.Color('yellow'),
            new THREE.Color('orange'),
            new THREE.Vector3(0, 1, 0),
            5
        );

        //this.particleEmitters.push(new SmokeObject(this, this.explosionTexture, new THREE.Vector3(0, 0, 0), 5, 200000));

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keyDown.add(event.key.toLowerCase());
    }

	private handleKeyUp = (event: KeyboardEvent) => {
		this.keyDown.delete(event.key.toLowerCase())

		if (event.key === ' ')
		{
			//this.createBullet();
            this.createProjectile(ProjectileType.Rocket, ProjectileLaunchLocation.Center);
            //this.generateRandomCube();
            //this.generateRandomExplosion();
		}
        if (event.key === 'c')
		{			
            this.generateRandomCube();
		}
        if (event.key === 'x')
		{
            this.fireLeft = !this.fireLeft;
            let launchLocation = this.fireLeft ? ProjectileLaunchLocation.Left : ProjectileLaunchLocation.Right;
            this.createProjectile(ProjectileType.Bullet, launchLocation);
			//this.generateRandomCube();
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
			this.player1.rigidVehicleObject?.resetPosition();
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

        // rigid body vehicle
        if(event.key === 'ArrowUp') {
            this.player1.rigidVehicleObject?.tryStopAccelerate();
        }
        else if(event.key === 'ArrowDown') {
            this.player1.rigidVehicleObject?.tryStopReverse();
        }

        if(event.key === 'ArrowLeft') {
            this.player1.rigidVehicleObject?.tryStopTurnLeft();
        }
        else if(event.key === 'ArrowRight') {
            this.player1.rigidVehicleObject?.tryStopTurnRight();
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
            this.player1.rigidVehicleObject?.tryAccelerate();
        }
        else if(this.keyDown.has('arrowdown')) {
            this.player1.rigidVehicleObject?.tryReverse();
        }

        if(this.keyDown.has('arrowleft')) {
            this.player1.rigidVehicleObject?.tryTurnLeft();
        }
        else if(this.keyDown.has('arrowright')) {
            this.player1.rigidVehicleObject?.tryTurnRight();
        }
        
        if (this.keyDown.has('z')) {
            this.flamethrowerEmitter?.setPosition(this.player1.getPosition());
            if(this.player1.rigidVehicleObject && this.player1.rigidVehicleObject.model) {                
                this.flamethrowerEmitter?.setQuaternion(this.player1.rigidVehicleObject.model.quaternion);
            }
        
            this.flamethrowerEmitter?.emitParticles();
        }
        /*
        if(this.keyDown.has('w')) {
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(-maxForce, 2);
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(-maxForce, 3);
        }
        else if(this.keyDown.has('s')) {
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(maxForce, 2);
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(maxForce, 3);
        }

        if(this.keyDown.has('a')) {
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(maxSteerVal, 0);
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(maxSteerVal, 1);
        }
        else if(this.keyDown.has('d')) {
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(-maxSteerVal, 0);
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(-maxSteerVal, 1);
        }
        */
    }

    updateCamera() {

        if(this.followCam != null)
            this.camera.position.lerp(this.followCam?.getWorldPosition(new THREE.Vector3()), 0.05);
		if(this.player1.rigidVehicleObject?.chassis.mesh != null)
            this.camera.lookAt(this.player1.rigidVehicleObject?.chassis.mesh?.position);
    }

    private async createProjectile(projectileType: ProjectileType, side: ProjectileLaunchLocation) {
        
        if(!this.player1.rigidVehicleObject || !this.player1.rigidVehicleObject.model) return;

        let forwardVector = new THREE.Vector3(-2, 0, 0);
        forwardVector.applyQuaternion(this.player1.rigidVehicleObject.model.quaternion);
        let projectileLaunchVector = forwardVector; 

        let sideOffset = 0;
        switch(projectileType) {
            case ProjectileType.Bullet:
                sideOffset = 3;
                break;
            case ProjectileType.Rocket:
                sideOffset = 5;
                break;
        }

        let sideVector = new THREE.Vector3();
        switch(side) {
            case ProjectileLaunchLocation.Left:                
                sideVector = new THREE.Vector3(0, 0, sideOffset);
                break;
            case ProjectileLaunchLocation.Center:
                sideVector = new THREE.Vector3(0, 0, 0);
                break;                
            case ProjectileLaunchLocation.Right:
                sideVector = new THREE.Vector3(0, 0, -sideOffset);
                break;
        }
        sideVector.applyQuaternion(this.player1.rigidVehicleObject.model.quaternion);

        //axis-aligned bounding box
        const aabb = new THREE.Box3().setFromObject(this.player1.rigidVehicleObject.chassis.mesh);
        const size = aabb.getSize(new THREE.Vector3());

        const vec = new THREE.Vector3();
        this.player1.rigidVehicleObject.model.getWorldPosition(vec) ;//this.rigidVehicleObject?.model?.position.clone();
        
        if(vec == null) return;
        // distance off ground
        //vec.y += 2;

        // offset to front of gun
        var tempPosition = vec.add(
                sideVector.clone().multiplyScalar(-size.z * 0.12)
        );

        // offset to side of car
        // +x is in left of car, -x is to right of car
        // +z is in front of car, -z is to rear of car
        //var tempPosition = vec.add(
            //this.directionVector.clone().multiplyScalar(-size.z * 5)
        //);
        //tempPosition.add(this.directionVector.clone().multiplyScalar(size.z * 1.5));

        let newProjectile = this.projectileFactory.generateProjectile(
            this,
            this.player1.playerId,
            projectileType,            
            tempPosition,           // launchPosition relative to chassis
            projectileLaunchVector,            
            this.explosionTexture);      

        this.projectiles.push(newProjectile);

        if(newProjectile.particleEmitterObject != null)
            this.particleEmitters.push(newProjectile.particleEmitterObject);
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
    
    
    private async generateRandomPickup(texture: THREE.Texture ) {

        let randPosition = new THREE.Vector3(randFloat(-20, 20), 0.75, randFloat(-20, 20));
        let randCubeSize = 0.5; //randFloat(0.5, 2);

        let randColor = THREE.MathUtils.randInt(0, 0xffffff);

        const cube = new PickupObject(this,
            randCubeSize, randCubeSize, randCubeSize,
            randPosition,
            randColor,
            texture
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

            this.particleEmitters.push(new VehicleExplosionObject(
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
            this.allGltfPlayers.forEach(player => {

                let playerPosition = player.getPosition();
                let pickupPosition = pickup.getPosition();
                if(playerPosition.distanceTo(pickupPosition) < 1) {
                    // tpdp
                    pickup.remove();
                }
            })
        });
    }

    update() {
        if(this.world != null)
            this.world.fixedStep();

        if(!this.player1.rigidVehicleObject) return;

        this.updateInput();  
        this.updateCamera();     

        this.ground?.update();
        this.cube?.update();
        this.cube2?.update();
        this.sphere?.update();
        this.cylinder?.update();

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

        if(this.cube != null) 
        {
            //this.spotlight?.setPosition(this.cube?.mesh.position);
        }

        this.spotlight?.update();

        this.particleEmitters.forEach(x => x.update());
        this.particleEmitters = this.particleEmitters.filter(x => !x.isDead);

        this.flamethrowerEmitter?.update();

        //this.healthBar.update(this.allPlayers[0].getPosition());

        //if(this.allPlayers[0].body != null)
        //this.headLights.update(this.allPlayers[0].getPosition(), this.allPlayers[0].mesh.quaternion);

        this.allPlayers.forEach(x => x.update());

        let playerPosition = this.player1.getPosition();

        if(this.player1.rigidVehicleObject.model != null) {
            let forwardVector = new THREE.Vector3(-10, 0, 0);
            forwardVector.applyQuaternion(this.player1.rigidVehicleObject.model.quaternion);
            this.crosshairSprite.position.addVectors(this.player1.rigidVehicleObject.model.position, forwardVector);//playerPosition.x, playerPosition.y - 2, playerPosition.z);
            //let size = 10;
            //this.crosshairSprite.scale.set(size, size, size);

            var otherPlayers = this.allPlayers.filter(x => x.playerId != this.player1.playerId);

            var otherPlayerBodies: CANNON.Body[] = [];
            for(var i = 0; i < otherPlayers.length; i++) {
                if(otherPlayers[i].rigidVehicleObject != null && otherPlayers[i].rigidVehicleObject?.chassis.body != null) {
                    let body = otherPlayers[i].rigidVehicleObject?.chassis.body ?? new CANNON.Body();
                    otherPlayerBodies.push(body); 
                }
            }

            /*
            var otherPlayerBodies = <unknown>otherPlayers.forEach(x => {
                return x.rigidVehicleObject?.chassis.body;
            });
            var temp = otherPlayerBodies as CANNON.Body[];
            */

            if(this.player2.rigidVehicleObject?.rigidVehicleObject != null) {
                let ray = new CANNON.Ray(Utility.ThreeVec3ToCannonVec3(playerPosition), Utility.ThreeVec3ToCannonVec3(this.crosshairSprite.position));
                
                var raycastResult: CANNON.RaycastResult = new CANNON.RaycastResult();

                // intersect single body
                ray.intersectBody(this.player2.rigidVehicleObject?.rigidVehicleObject?.chassisBody, raycastResult);

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

        this.divElementPlayerStats.innerHTML = `location: (${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z})`;
        this.divElementObjective.innerHTML = `scene objects: ${this.children.length}`;
        this.divElementWeaponParticleCount.innerHTML = `flamethrower particles: ${this.flamethrowerEmitter?.sprites.length}`; 
        this.divElementParticleCount.innerHTML = `total emitter particles: ${emitterTotalParticleCount}`; 

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
}