import * as THREE from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as CANNON from 'cannon-es'
import { BoxObject } from '../gameobjects/shapes/boxObject';
import { SphereObject } from '../gameobjects/shapes/sphereObject';
import Stats from 'three/addons/libs/stats.module.js';
import SpotlightObject from '../gameobjects/shapes/spotlightObject';
import { randFloat, randInt } from 'three/src/math/MathUtils.js';
import { ParticleEmitter } from '../gameobjects/fx/particleEmitter';
import { GltfObject, GltfObjectPhysicsObjectShape } from '../gameobjects/shapes/gltfObject';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Projectile } from '../gameobjects/weapons/projectile';
import { CylinderObject } from '../gameobjects/shapes/cylinderObject';
import { ProjectileType } from '../gameobjects/weapons/projectileType';
import SceneController from './sceneController';
import { Player, PlayerState, VehicleType } from '../gameobjects/player/player';
import { FlamethrowerEmitter } from '../gameobjects/weapons/flamethrowerEmitter';
import { VehicleExplosionObject } from '../gameobjects/fx/vehicleExplosionObject';
import { Utility } from '../utility';
import { TextureToArray } from '../gameobjects/shapes/textureToArray';
import { Water } from 'three/addons/objects/Water.js';
import { DebugDivElementManager } from './debugDivElementManager';
import { TerrainObjectv2 } from '../gameobjects/shapes/terrainObjectv2';
import { PickupObject2 } from '../gameobjects/pickupObject2';
import { SmokeObject } from '../gameobjects/fx/smokeObject';
import { CpuPlayerPattern } from '../gameobjects/player/cpuPlayerPatternEnums';
import { VehicleFactory } from '../gameobjects/player/vehicleFactory';
import { RainShaderParticleEmitter } from '../gameobjects/fx/rainShaderParticleEmitter';
import { WorldConfig } from '../gameobjects/world/worldConfig';

// npm install cannon-es-debugger
// https://youtu.be/Ht1JzJ6kB7g?si=jhEQ6AHaEjUeaG-B&t=291

// https://www.youtube.com/watch?v=8J5xl9oijR8&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=3

export default class GameScene extends THREE.Scene {

    private stats: Stats = new Stats();

    private readonly mtlLoader = new MTLLoader();

    private readonly gltfLoader = new GLTFLoader();

    public taxiModel!: GLTF;
    public policeModel!: GLTF;
    public ambulanceModel!: GLTF;
    public trashTruckModel!: GLTF;
    public sedanSportsModel!: GLTF;
    public raceCarBlueModel!: GLTF;
    public raceCarRedModel!: GLTF;
    public suvModel!: GLTF;
    
    public killdozerModel!: GLTF;

    public policeTractorModel!: GLTF;    
    public tractorModel!: GLTF;
    public pickupTruckModel!: GLTF;

    public fireTruckModel!: GLTF;


    public wheelModel!: GLTF;

    private readonly textureLoader = new THREE.TextureLoader();

    private readonly camera: THREE.PerspectiveCamera;

    private readonly keyDown = new Set<string>();

    private directionVector = new THREE.Vector3();

    private cubes: BoxObject[] = [];
    private debrisWheels: GltfObject[] = [];
    private bouncyWheelMaterial!: CANNON.Material;

    private lightning!: THREE.Line;

    private pickups: PickupObject2[] = [];

    private projectiles: Projectile[] = [];

    private particleEmitters: ParticleEmitter[] = [];
    //private rainShaderParticleEmitter: RainShaderParticleEmitter;

    public explosionTexture: THREE.Texture = new THREE.Texture();
    public crosshairTexture: THREE.Texture = new THREE.Texture();
    public playerMarkerTexture: THREE.Texture = new THREE.Texture();

    public groundMaterial!: CANNON.Material;
    public wheelGroundContactMaterial!: CANNON.ContactMaterial;

    private worldConfig!: WorldConfig;
    private heightMapTextureAsArray!: TextureToArray; //= new TextureToArray(this.textureLoader, 'assets/heightmaps/heightmap_arena_128x128.png');
    //private heightMapTextureAsArray: TextureToArray = new TextureToArray(this.textureLoader, 'assets/heightmaps/heightmap_128x128.png');

    public getMapDimensions(): THREE.Vector3 {
        return new THREE.Vector3(this.heightMapTextureAsArray.getImageWidth(), 0, this.heightMapTextureAsArray.getImageHeight());
    }

    world: CANNON.World = new CANNON.World({
        gravity: new CANNON.Vec3(0, -14.81, 0)
    });

    getWorld(): CANNON.World {
        return this.world;
    }

    basicMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFF00 });
    basicSemitransparentMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial( { color: 0xFFFF00, transparent: true, opacity: 0.5 });
    
    terrain!: TerrainObjectv2;
    water!: Water;

    grassBillboards?: THREE.Points;
    
    cube?: BoxObject;
    cube2?: BoxObject;
    cylinder?: CylinderObject;

    debrisDriveTrain!: GltfObject;
    //debrisWheel!: GltfObject;

    private allPlayers: Player[] = [];
    player1!: Player;
    player2!: Player;
    player3!: Player;
    player4!: Player;

    cpuPlayerBehavior: CpuPlayerPattern = CpuPlayerPattern.Patrol;

    //private allRigidVehicleObjects: IPlayerVehicle[] = [];

    private followCam?: THREE.Object3D;

    sphere?: SphereObject;

    spotlight?: SpotlightObject;

    flamethrowerEmitters: FlamethrowerEmitter[] = [];
    //turboParticleEmitters: SmokeObject[] = []

    //healthBar: HealthBar = new HealthBar(this, 100);
    //headLights: Headlights = new Headlights(this);

    sceneController: SceneController;

    debugDivElementManager!: DebugDivElementManager;

    /*
    divElementPlayerStats!: HTMLDivElement;
    divElementObjective!: HTMLDivElement;
    divElementWeaponParticleCount!: HTMLDivElement;
    divElementParticleCount!: HTMLDivElement;
    divElementPhysicsObjectCount!: HTMLDivElement;
    divElementLightObjectCount!: HTMLDivElement;
    divElementParticleEmitterCount!: HTMLDivElement;
    divElementShaderParticleCount!: HTMLDivElement;
    */

    crosshairSprite!: THREE.Sprite;

    constructor(camera: THREE.PerspectiveCamera, sceneController: SceneController) {
        super();
        
        this.camera = camera;
        this.sceneController = sceneController;

        //const color = 0xFFFFFF;
        //const density = 0.1;
        //this.fog = new THREE.FogExp2(color, density);

        //this.overrideMaterial = new THREE.MeshBasicMaterial({ color: "green" });
        //this.background = new THREE.Color(0xB1E1FF);
    }

    preloadMapData(worldConfig: WorldConfig) {
        
        this.worldConfig = worldConfig;
        
        this.heightMapTextureAsArray = new TextureToArray(this.textureLoader, worldConfig.heightMap);
    }

    async initialize(player1VehicleType: VehicleType): Promise<void> {
       
        await this.loadVehicleAssets();

        this.explosionTexture = this.textureLoader.load('assets/particle-16x16.png');
        //this.explosionTexture = this.textureLoader.load('assets/tank_explosion3.png');
        this.crosshairTexture = this.textureLoader.load('assets/crosshair061.png');
        this.playerMarkerTexture = this.textureLoader.load('assets/playerMarkerIcon.png');

        // https://www.youtube.com/watch?v=V_yjydXVIwQ&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=4

        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        //this.world.broadphase = new CANNON.NaiveBroadphase;        
        //(this.world.solver as CANNON.GSSolver).iterations = 20;

        this.generateMap();

        

        var objectMaterial = new CANNON.Material();
    
        this.cube = new BoxObject(this, 1,1,1, new THREE.Vector3(0, 20, -9.5), 0xffff00,
                        //new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.basicMaterial,
                        this.world, objectMaterial);

        this.cube2 = new BoxObject(this, 1,1,1, new THREE.Vector3(0, 10, -8), 0xffff00,
                        //new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.basicMaterial,
                        this.world, objectMaterial);

        this.sphere = new SphereObject(this, 1, new THREE.Vector3(0.5, 5, -10), 0x00ff00,
                        //new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
                        this.basicMaterial,
                        this.world, objectMaterial);

        this.cylinder = new CylinderObject(this, 1, 0.25, new THREE.Vector3(0, 3, -12), 0x00ff00,
            //new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
            this.basicMaterial,
            this.world, objectMaterial);

        let cylinderMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 200, 16, 1, true),
            this.basicSemitransparentMaterial);
        cylinderMesh.position.set(20, 0, 20);            
        this.add(cylinderMesh);

        
        this.bouncyWheelMaterial = new CANNON.Material();
        const wheelGroundContactMaterial = new CANNON.ContactMaterial(this.bouncyWheelMaterial, this.groundMaterial, {
            friction: 0.3,
            restitution: 0.9 // High restitution for bounciness
        });
        this.world.addContactMaterial(wheelGroundContactMaterial);

       
        let particleMaterial = new THREE.SpriteMaterial({
            map: this.explosionTexture,
            depthTest: true
        });

        await this.generatePlayers(particleMaterial, player1VehicleType);

        let material = new THREE.SpriteMaterial( { map: this.crosshairTexture, color: 0xffffff, depthTest: false, depthWrite: false });//,transparent: true, opacity: 0.5 } );
        this.crosshairSprite = new THREE.Sprite( material );
        this.add(this.crosshairSprite);

        /*
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
        */
        
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

        this.debugDivElementManager = new DebugDivElementManager(25, 25);

        this.debugDivElementManager.addElement("PlayerLocation", "");
        this.debugDivElementManager.addElement("Objective", "");
        this.debugDivElementManager.addElement("ParticleCount", "");
        this.debugDivElementManager.addElement("WeaponCount", "");
        this.debugDivElementManager.addElement("PhysicsObjectCount", "");
        this.debugDivElementManager.addElement("LightObjectCount", "");
        this.debugDivElementManager.addElement("ParticleEmitterCount", "");
        this.debugDivElementManager.addElement("ShaderParticleCount", "");
        this.debugDivElementManager.addElement("RendererTotalGeometry", "");
        this.debugDivElementManager.addElement("RendererTotalTextures", "");
        this.debugDivElementManager.addElement("RendererTotalPrograms", "");
        this.debugDivElementManager.addElement("TraverseTotalTextures", "");
        this.debugDivElementManager.addElement("cpuOverrideBehavior", "");
        this.debugDivElementManager.addElement("player2status", "");
        this.debugDivElementManager.addElement("player3status", "");
        this.debugDivElementManager.addElement("player4status", "");

        this.debugDivElementManager.hideAllElements();
       
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
        this.water.position.y += 0.75; // 1.5
        this.add( this.water );

        //this.rainShaderParticleEmitter = new RainShaderParticleEmitter(this);

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

        //this.addToParticleEmitters(new SmokeObject(this, this.explosionTexture, new THREE.Vector3(0, 0, 0), 5, 200000));

        /*
        const lightningMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 5 });
        const points = [];
        points.push(this.player1.getPosition());
        for (let i = 1; i < 10; i++) {
            points.push(new THREE.Vector3(10 + Math.random() - 0.5, 10 - i, 10 + Math.random() - 0.5));
        }
        points.push(this.player2.getPosition());
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                
        this.lightning = new THREE.Line(geometry, lightningMaterial);
        this.add(this.lightning);
        */
                
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }
    generateGrassBillboards(mapWidth: number, mapHeight: number, yMin: number, yMax: number) {

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const sprite = new THREE.TextureLoader().load( 'assets/billboard_grass_32x32.png' );
        sprite.colorSpace = THREE.SRGBColorSpace;

        for ( let i = 0; i < 100000; i ++ ) {

            const x = mapWidth * Math.random() - mapWidth / 2;
            const z = mapHeight * Math.random() - mapHeight / 2;

            let tempVector3 = this.getWorldPositionOnTerrain(x, z);
            if(tempVector3.y > yMin && tempVector3.y < yMax)
                vertices.push( tempVector3.x, tempVector3.y, tempVector3.z );
        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        var material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: true } );
        //material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );

        this.grassBillboards = new THREE.Points( geometry, material );
        this.add( this.grassBillboards );
    }

    async generateWheelModel(): Promise<GLTF>{

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/wheel-racing.glb');
        
        //model.scene.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        //model.scene.scale.set(10, 10, 10);
        model.scene.position.set(0,0,0);

        return model;
    }

    async generateWheelModelAsGroup(): Promise<THREE.Group>{

        var model = (await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/wheel-racing.glb')).scene;
        
        //model.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        //model.scale.set(10, 10, 10);
        //model.position.set(10, 10, 10);

        //model.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        //model.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 4);

        //const quaternion = new THREE.Quaternion();
        ////quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2); // Rotate 90 degrees around the X axis
        //quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2); // Rotate 90 degrees around the Z axis
        //model.quaternion.multiplyQuaternions(quaternion, model.quaternion);

        //this.add(wheelModel2.scene);
        return model;
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
        if (event.key === 'p')
        {			
            this.generateRandomDebrisWheel();
        }
        if (event.key === 'o')
        {			
            this.player1.tryDamage(ProjectileType.Rocket, new THREE.Vector3(0,0,0));
            this.sceneController.updateHealthOnHud(this.player1.currentHealth);
            
            this.player2.tryKill();
            this.player3.tryKill();
            this.player4.tryKill();
        }
            /*
        /*
        if (event.key === 'x')
		{            
            let newProjectile = this.player1.createProjectile(ProjectileType.Bullet);
            this.addNewProjectile(newProjectile);		
		}
        */
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
            this.cpuPlayerBehavior = CpuPlayerPattern.Follow;
		}
        if (event.key === '2')
		{
            this.sceneController.updateHealthOnHud(50);
            this.cpuPlayerBehavior = CpuPlayerPattern.FollowAndAttack;
		}
        if (event.key === '3')
		{
            this.sceneController.updateHealthOnHud(80);
            this.cpuPlayerBehavior = CpuPlayerPattern.Stop;
		}
        if (event.key === '4')
		{
            this.sceneController.updateShieldOnHud(25);
            this.cpuPlayerBehavior = CpuPlayerPattern.StopAndAttack;
		}
        if (event.key === '5')
		{
            this.sceneController.updateTurboOnHud(50);
            this.cpuPlayerBehavior = CpuPlayerPattern.Flee;
		}        
        if (event.key === '6')
		{
            this.player1.healthBar.updateValue(50);
            this.cpuPlayerBehavior = CpuPlayerPattern.Patrol;
		}      
        if (event.key === '7')
		{
            this.player1.healthBar.updateValue(19);
		}      
        if (event.key === 'Escape')
		{
			this.player1.tryResetPosition();
		}

        // player 1
        if(event.key === 'ArrowUp') {
            this.player1.tryStopAccelerateWithKeyboard();
        }
        else if(event.key === 'ArrowDown') {
            this.player1.tryStopReverseWithKeyboard();
        }

        if(event.key === 'ArrowLeft') {
            this.player1.tryStopTurnLeftWithKeyboard();
        }
        else if(event.key === 'ArrowRight') {
            this.player1.tryStopTurnRightWithKeyboard();
        }

        if(event.key === ' ') {
            this.player1.tryJump();
        }
        if (event.key === 'Shift') {
            this.player1.tryStopTurbo();
        }
	}

    private updateInput() {

        this.sceneController.pollGamepads();

        // player 1 vehicle controls
        if(this.keyDown.has('arrowup')) {
            this.player1.tryAccelerateWithKeyboard();
        }
        else if(this.keyDown.has('arrowdown')) {
            this.player1.tryReverseWithKeyboard();
        }

        if(this.keyDown.has('arrowleft')) {
            this.player1.tryTurnLeftWithKeyboard();
        }
        else if(this.keyDown.has('arrowright')) {
            this.player1.tryTurnRightWithKeyboard();
        }
        
        if (this.keyDown.has('x')) {
            let newProjectile = this.player1.tryFireBullets();
        }        
        if (this.keyDown.has('z')) {
            this.player1.tryFireFlamethrower();
        }

        if (this.keyDown.has('q')) {
            this.player2.tryFireFlamethrower();
        }
        if (this.keyDown.has('shift')) {
            this.player1.tryTurbo();
        }
    }

    updateCamera() {

        if(this.followCam != null)
            this.camera.position.lerp(this.followCam?.getWorldPosition(new THREE.Vector3()), 0.05);
		if(this.player1 != null && !this.player1.isModelNull())
            this.camera.lookAt(this.player1.getModelPosition());
    }

    public async addNewProjectile(projectile: Projectile) {
        this.projectiles.push(projectile);
        if(projectile.particleEmitterObject != null)
            this.addToParticleEmitters(projectile.particleEmitterObject);	
        if(projectile.particleEmitterSmokeObject != null)
            this.addToParticleEmitters(projectile.particleEmitterSmokeObject);	
    }

    public addToParticleEmitters(emitter: ParticleEmitter) {
        this.particleEmitters.push(emitter);
    }

    public addToFlamethrowerEmitters(emitter: FlamethrowerEmitter) {
        this.flamethrowerEmitters.push(emitter);
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

    public async generateRandomDebrisWheel(randPosition?: THREE.Vector3, quaternion?: THREE.Quaternion) {
        
        if(randPosition == null)
            randPosition = new THREE.Vector3(randFloat(-10, 10), randFloat(5, 10), randFloat(-10, -10));

        if(quaternion == null)
            quaternion = new THREE.Quaternion();
        
        var wheelModel = await this.generateWheelModel();

        var debrisWheel = new GltfObject(
            this,
            wheelModel.scene,
            randPosition,
            quaternion,
            new THREE.Vector3(1, 1, 1), // scale                
            new THREE.Vector3(randFloat(-10, 10), randFloat(2, 5), randFloat(-10, 10)), // initial velocity            
            new THREE.Vector3(1, 1, 1), // physics object scale
            new THREE.Vector3(0, 0, 0), // physics object offset
            this.world,
            this.bouncyWheelMaterial,
            GltfObjectPhysicsObjectShape.Cylinder
        );

        this.debrisWheels.push(debrisWheel);
    }
    
    
    private async generateRandomPickup(mapWidth: number, mapHeight: number) {

        
        let pickupTextureRocket = this.textureLoader.load('assets/pickup-rockets.png');
        let pickupTextureHealth = this.textureLoader.load('assets/pickup-health.png');
        let pickupTextureFlamethrower = this.textureLoader.load('assets/pickup-fire.png');
        let pickupTextureFreeze = this.textureLoader.load('assets/pickup-freeze.png');
        let pickupTextureLightning = this.textureLoader.load('assets/pickup-lightning-2.png');
        let pickupTextureShockwave = this.textureLoader.load('assets/pickup-shockwave.png');
        let pickupTextureShield = this.textureLoader.load('assets/pickup-shield.png');
        let pickupTextureAirstrike = this.textureLoader.load('assets/pickup-airstrike.png');

        //let boxTextureArmor = this.textureLoader.load('assets/pickup-fire.png');
        
        let texture: THREE.Texture;
        let randIconIndex = THREE.MathUtils.randInt(0, 7);
        let outlineColor = 0xffffff;
        switch(randIconIndex) {
            case 0:
                texture = pickupTextureRocket;
                outlineColor = 0xff0000;
                break;
            case 1:
                texture = pickupTextureHealth;
                outlineColor = 0x22ff22;
                break;
            case 2:
                texture = pickupTextureFlamethrower;
                outlineColor = 0xffcc00;
                break;
            case 3:
                texture = pickupTextureFreeze;
                outlineColor = 0x7777dd;
                break;
            case 4:
                texture = pickupTextureLightning;
                outlineColor = 0xffff11;
                break;
            case 5:
                texture = pickupTextureShockwave;
                outlineColor = 0xADFFDE;
                break;
            case 6:
                texture = pickupTextureShield;
                outlineColor = 0x7777ff;
                break;
            case 7:
                texture = pickupTextureAirstrike;
                outlineColor = 0xdf6620;
                break;                
            default:
                texture = pickupTextureRocket;
                outlineColor = 0xff0000;
                break;
        }


        let randX = randFloat(-mapWidth / 2, mapWidth / 2);        
        let randZ = randFloat(-mapHeight / 2, mapHeight / 2);
        let spawnPosition = this.getWorldPositionOnTerrain(randX, randZ);
        spawnPosition.y += 0.75;

        let randCubeSize = 0.75; //randFloat(0.5, 2);
        //let randColor = THREE.MathUtils.randInt(0, 0xffffff);

        /*
        const cube = new PickupObject(this,
            randCubeSize, randCubeSize, randCubeSize,
            spawnPosition,
            outlineColor,
            texture,
            0.75
        );
        */

        const cube = new PickupObject2(this,
            randCubeSize, randCubeSize, randCubeSize,
            spawnPosition,
            0xffffff,
            outlineColor,
            texture,
            1
        );

        this.pickups.push(cube);
    }

    async generateRandomExplosion(
        projectileType: ProjectileType,
        position: THREE.Vector3,
        lightColor: THREE.Color,
        particleColor1: THREE.Color,
        particleColor2: THREE.Color,
        particleColor3: THREE.Color,
        particleColor4: THREE.Color) {

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

            let particleInitialScale = 0.1;
            let numberParticles: number;
            let scaleMultiplier = 1;
            let opacityReduction = 0.01;
            let velocityMultiplier = 0.98;
            switch(projectileType) {                
                case ProjectileType.Bullet:
                    numberParticles = 5;
                    particleInitialScale = 0.1;
                    scaleMultiplier = 0.95;
                    opacityReduction = 0.0075;
                    break;
                case ProjectileType.Rocket:                
                    numberParticles = 25;
                    particleInitialScale = 0.5;
                    scaleMultiplier = 0.99;
                    opacityReduction = 0.0075;
                    break;
                case ProjectileType.Airstrike:
                default:
                    numberParticles = 20;
                    particleInitialScale = 2;
                    scaleMultiplier = 0.99;
                    opacityReduction = 0.0075;
                    break;                
            }

            this.addToParticleEmitters(new VehicleExplosionObject(
                this,
                this.explosionTexture,
                lightColor,
                particleColor1,
                particleColor2,
                particleColor3,
                particleColor4,
                position,
                numberParticles,
                0.02,
                velocityMultiplier,
                particleInitialScale,
                opacityReduction,
                scaleMultiplier)            
            );
        }
    }

    async generateSmoke(position: THREE.Vector3) {
        this.addToParticleEmitters(new SmokeObject(this, this.explosionTexture, position, 2, 500));
    }

    private async loadVehicleAssets(): Promise<void> {
       
        this.taxiModel = await this.loadTaxiModel();
        this.policeModel = await this.loadPoliceModel();
        this.ambulanceModel = await this.loadAmbulanceModel();
        this.trashTruckModel = await this.loadTrashTruckModel();
        this.sedanSportsModel = await this.loadSedanSportsModel();
        this.raceCarBlueModel = await this.loadRaceCarBlueModel();
        this.raceCarRedModel = await this.loadRaceCarRedModel();       
        this.policeTractorModel = await this.loadPoliceTractorModel();       
        this.tractorModel = await this.loadTractorModel();       
        this.pickupTruckModel = await this.loadPickupTruckModel();       

        this.suvModel = await this.loadSuvModel();
        this.killdozerModel = await this.loadKilldozerModel();
        this.fireTruckModel = await this.loadFireTruckModel();
        
        this.wheelModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/wheel-racing.glb');
        //this.wheelModel.scene.scale.set(1, 1, 1);
        //this.add(this.wheelModel.scene);
    }

    private async loadTaxiModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/taxi.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    private async loadPoliceModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/police.glb');        
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    private async loadAmbulanceModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/ambulance.glb');
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));

        var doorLeft = modelScene.children.find(x => x.name == 'door-left');
        doorLeft?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        doorLeft?.position.add(new THREE.Vector3(1, -0.5, 2));

        var doorRight = modelScene.children.find(x => x.name == 'door-right');
        doorRight?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        doorRight?.position.add(new THREE.Vector3(2.1, -0.5, 0.9));

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;          
    }

    private async loadTrashTruckModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/garbage-truck.glb');
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, 0, 0));

        var arm = modelScene.children.find(x => x.name == 'arm');
        arm?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        arm?.position.add(new THREE.Vector3(-0.45, 0.1, -0.3));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    private async loadSedanSportsModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/sedan-sports.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadRaceCarBlueModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/race-future.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadRaceCarRedModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/race.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadSuvModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/suv.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadKilldozerModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/tractor-shovel.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadPoliceTractorModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/tractor-police.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadTractorModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/tractor.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadPickupTruckModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/truck.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    private async loadFireTruckModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/firetruck.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async generatePlayers(particleMaterial: THREE.SpriteMaterial, player1VehicleType: VehicleType): Promise<void> {

        await this.loadVehicleAssets();

        var wheelMaterial = new CANNON.Material("wheelMaterial");
        var wheelGroundContactMaterial = new CANNON.ContactMaterial(
            wheelMaterial,
            this.groundMaterial,
            {
                friction: 0.3, restitution: 0, contactEquationStiffness: 1000
            }
        );
        this.world.addContactMaterial(wheelGroundContactMaterial);

        var vehicleFactory = new VehicleFactory(this.crosshairTexture, this.playerMarkerTexture, particleMaterial);

        this.player1 = vehicleFactory.generatePlayer(this, this.world, false, player1VehicleType, new THREE.Color('red'), wheelMaterial);
        this.player2 = vehicleFactory.generatePlayer(this, this.world, true, randInt(0, 12), new THREE.Color('blue'), wheelMaterial);
        this.player3 = vehicleFactory.generatePlayer(this, this.world, true, randInt(0, 12), new THREE.Color('green'), wheelMaterial);
        this.player4 = vehicleFactory.generatePlayer(this, this.world, true, randInt(0, 12), new THREE.Color('yellow'), wheelMaterial);

        this.allPlayers.push(this.player1);          
        this.allPlayers.push(this.player2);
        this.allPlayers.push(this.player3);
        this.allPlayers.push(this.player4);

        //this.rigidVehicleObject.model?.add(this.camera);        
        this.camera.position.x = 0;
        this.camera.position.y = 2;        
        this.camera.position.z = 5;

        this.followCam = new THREE.Object3D();
		this.followCam.position.copy(this.camera.position);
		this.add(this.followCam);   
        
        // attach follow camera to player 1
        this.player1.getVehicleObject().getModel()?.add(this.followCam);
        this.followCam.position.set(5, 3, 0); // camera target offset related to car

        //this.allRigidVehicleObjects.push(this.player1.getVehicleObject());        
    }

    private generateMap(): void {
        this.groundMaterial = new CANNON.Material("groundMaterial");
        const normalMap = new THREE.TextureLoader().load('assets/normal-map.png');
        

        // width and height need to match dimensions of heightmap
        this.terrain = new TerrainObjectv2(this,
            /*
            new THREE.MeshPhongMaterial(
                {
                    color: 0x44dd44,
                    depthWrite: true,
                    //wireframe: true,
                    side: THREE.DoubleSide,
                    bumpMap: normalMap,                    
                    //vertexColors: true
                }),
            */                 
            new THREE.MeshBasicMaterial({
                color: 0x007700,
                //wireframe: false,
                //depthWrite: true,
                //fog: true,
                //map: texture
            }),
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
            this.groundMaterial,
            this.heightMapTextureAsArray,
            5,
            this.worldConfig
        );

        this.generateGroundPlane();
        this.generateBoundingWalls();

        this.generateGrassBillboards(this.heightMapTextureAsArray.getImageWidth(), this.heightMapTextureAsArray.getImageHeight(), 2, 4);
            
    }

    private generateGroundPlane(): void {
       
        // adding phyics plane to avoid falling through
        const groundShape = new CANNON.Plane();
        var body = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            material: new CANNON.Material});
        body.addShape(groundShape);     

        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);        
        this.world.addBody(body);
    }
    private generateBoundingWalls(): void {

        var height = this.heightMapTextureAsArray.getImageHeight();
        const wallShape = new CANNON.Box(new CANNON.Vec3(height / 2, 20, 1));

        var wallBody1 = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            material: new CANNON.Material});
        wallBody1.addShape(wallShape);            
        wallBody1.position.set(0, 0, height / 2);       
        wallBody1.quaternion.setFromEuler(Math.PI, 0, 0);        
        this.world.addBody(wallBody1);

        var wallBody2 = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            material: new CANNON.Material});
        wallBody2.addShape(wallShape);            
        wallBody2.position.set(0, 0, -height / 2);       
        wallBody2.quaternion.setFromEuler(Math.PI, 0, 0);        
        this.world.addBody(wallBody2);

        var wallBody3 = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            material: new CANNON.Material});
        wallBody3.addShape(wallShape);            
        wallBody3.position.set(height / 2, 0, 0);       
        wallBody3.quaternion.setFromEuler(Math.PI, Math.PI/2, 0);        
        this.world.addBody(wallBody3);

        var wallBody4 = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            material: new CANNON.Material});
        wallBody4.addShape(wallShape);            
        wallBody4.position.set(-height / 2, 0, 0);       
        wallBody4.quaternion.setFromEuler(Math.PI, Math.PI/2, 0);        
        this.world.addBody(wallBody4);
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

                    if(projectile.projectileType == ProjectileType.Airstrike && projectile.detonationBoundingMesh != null) {

                        if(player.getPosition().distanceTo(projectile.detonationBoundingMesh.position) < projectile.detonationDamageRadius && player.currentHealth > 0){
                            
                            player.tryDamageWithAirstrike();                            
                            if(player.playerId == this.player1.playerId) {
                                this.sceneController.updateHealthOnHud(this.player1.currentHealth);
                            }
                        }
                    }
                    else {
                        if(player.getPosition().distanceTo(projectile.getPosition()) < 1 && player.currentHealth > 0){
                            this.generateRandomExplosion(
                                projectile.projectileType,
                                projectile.getPosition(),
                                projectile.getLightColor(),
                                projectile.getParticleColor1(),
                                projectile.getParticleColor2(),
                                projectile.getParticleColor3(),
                                projectile.getParticleColor4()
                            );
                            projectile.kill();
                            this.remove(projectile.group);
                            player.tryDamage(projectile.projectileType, projectile.getPosition());
                            
                            if(player.playerId == this.player1.playerId) {
                                this.sceneController.updateHealthOnHud(this.player1.currentHealth);
                            }
                        }
                    }
                });

                
                // TODO: fix me
                /*
                this.world.contacts.forEach((contact) => {

                    if(contact.bi === projectile.body || contact.bj === projectile.body) {
                        console.log('Collision detected involving projectile');
                    }
                    else 
                        return;


                    if(contact.bi === this.terrain?.body || contact.bj === this.terrain?.body) {
                        console.log('Collision detected involving ground');
                    }
                    else
                        return;

                    if ((contact.bi === projectile.body && contact.bj === this.terrain?.body) || 
                        (contact.bj === projectile.body && contact.bi === this.terrain?.body)) {
                        
                        console.log('Collision detected between projectile and ground');
                        projectile.kill();
                        this.remove(projectile.group);
                        // Perform additional collision handling logic here
                }
                });
                */

                // alternate collision: based on calculating height of terrain
                let worldPosition = this.getWorldPositionOnTerrain(projectile.group.position.x, projectile.group.position.z );        
                if(projectile.group.position.y <= worldPosition.y) {
                    
                    this.generateRandomExplosion(
                        projectile.projectileType,
                        projectile.getPosition(),
                        projectile.getLightColor(),
                        projectile.getParticleColor1(),
                        projectile.getParticleColor2(),
                        projectile.getParticleColor3(),
                        projectile.getParticleColor4()
                    );
                    
                    projectile.kill();
                    this.remove(projectile.group);
                }
            
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

    private checkFlamethrowerForCollision() {
        
        this.allPlayers.forEach(player => {
            
            var anyHits = false;
            if(player.flamethrowerBoundingBox.visible) {

                var enemyPlayers = this.allPlayers.filter(x => x.playerId != player.playerId);
                enemyPlayers.forEach(enemy => {
                    
                    
                    const flamethrowerBoundingBox = new THREE.Box3().setFromObject(player.flamethrowerBoundingBox);
                    var enemyBoundingBox = new THREE.Box3().setFromObject(enemy.getVehicleObject().getChassis().mesh);

                    if(flamethrowerBoundingBox != null && enemyBoundingBox != null && flamethrowerBoundingBox?.intersectsBox(enemyBoundingBox)){
                        enemy.tryDamageWithFlamethrower();
                        player.flamethrowerBoundingBoxMaterial.color.set(0xff0000);
                        anyHits = true;
                    }
                });
            }
            if(!anyHits) {
                player.flamethrowerBoundingBoxMaterial.color.set(0xffffff);
            }
        });
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

    public getWorldPositionOnTerrain(x: number, z: number): THREE.Vector3 {

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

    public getWorldPositionOnTerrainAndWater(x: number, z: number): THREE.Vector3 {

        let waterPosition = new THREE.Vector3(0,0,0);
        
        if(this.water != null)
            waterPosition = this.water.position;

        var position = this.getWorldPositionOnTerrain(x, z);

        if(this.water != null && waterPosition.y > position.y)
            position.y = waterPosition.y;

        return position;
    }

    updateWater() {
        if(!this.water)
            return;

        this.water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
    }

    update() {
        if(this.world != null) {
            //// called in main.ts
            //this.world.fixedStep();
        }
        this.traverse(x => {
        
        });
        
        this.traverseVisible(x => {
            
        });

        if(!this.player1 || this.player1.isVehicleObjectNull()) return;

        this.updateInput();          

        var cpuPlayers = this.allPlayers.filter(x => x.isCpuPlayer);// && x.playerState == PlayerState.Alive);
        for(var i = 0; i < cpuPlayers.length; i++) {
            
            let cpuPlayer = cpuPlayers[i];

            if(cpuPlayer.playerState != PlayerState.Alive){
                cpuPlayer.tryStopTurnLeftWithKeyboard();
                cpuPlayer.tryStopAccelerateWithKeyboard();
                cpuPlayer.tryStopReverseWithKeyboard();
                continue;
            }

            if(this.cpuPlayerBehavior == CpuPlayerPattern.Stop) {
                cpuPlayer.tryStopAccelerateWithKeyboard();
                cpuPlayer.tryStopReverseWithKeyboard();
                continue;
            }

            let temp = THREE.MathUtils.randInt(0, 200);
            switch(temp) {
            case 1:
            case 2:
                cpuPlayer.tryAccelerateWithKeyboard();
                break;
            case 3:
            case 4:
                cpuPlayer.tryAccelerateWithKeyboard();
                cpuPlayer.tryTurnLeftWithKeyboard();
                break;
            case 5:
            case 6:
                cpuPlayer.tryAccelerateWithKeyboard();
                cpuPlayer.tryTurn(-0.5);
                break;
            case 7:
            case 8:
                cpuPlayer.tryAccelerateWithKeyboard();
                cpuPlayer.tryTurnRightWithKeyboard();
                break;
            case 9:
            case 10:
                cpuPlayer.tryAccelerateWithKeyboard();
                cpuPlayer.tryTurn(0.5);
                break;
            case 50:
                cpuPlayer.tryReverseWithKeyboard();
                //cpuPlayer.tryTurn(0.5);
                break;
            case 60:
                cpuPlayer.tryJump();                
                //cpuPlayer.tryTurn(0.5);
                break;
            case 70:
                cpuPlayer.tryTurbo();
                break;
            case 80:
            case 81:
                var projectile = cpuPlayer.createProjectile(ProjectileType.Bullet);
                this.addNewProjectile(projectile);
                break;
            case 90:
                var projectile = cpuPlayer.createProjectile(ProjectileType.Rocket);
                this.addNewProjectile(projectile);
                break;
            case 100:
            case 101:
                cpuPlayer.tryFireFlamethrower();
                break;
            case 110:
            case 111:
                    cpuPlayer.tryFireAirStrike();
                    break;
            default:
            }
        }

        this.updateCamera(); 
        
        this.terrain?.update();

        this.cube?.update();
        this.cube2?.update();
        this.sphere?.update();
        this.cylinder?.update();
        
        this.cubes.forEach(x => x.update());

        this.debrisWheels.forEach(x => x.update());

        this.pickups.forEach(x => x.update());

        this.projectiles.forEach(x => x.update());
        this.particleEmitters.forEach(x => x.update());

        //this.rainShaderParticleEmitter.update();

        this.checkProjectilesForCollision();
        this.checkFlamethrowerForCollision();
        this.checkPickupsForCollisionWithPlayers();

        this.world.contacts.forEach((contact) => {
            if ((contact.bi === this.player1.getChassisBody() && contact.bj === this.player2.getChassisBody()) || 
                (contact.bj === this.player1.getChassisBody() && contact.bi === this.player2.getChassisBody())) {
                console.log('Collision detected between player 1 and player 2');
                // Perform additional collision handling logic here
        }
        });

        if(this.cube != null) 
        {
            //this.spotlight?.setPosition(this.cube?.mesh.position);
        }

        if(this.lightning != null ) {
             // Update lightning geometry

            const positions = this.lightning.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                if(i == 0) {
                    var position = this.player1.getPosition();
                    positions[i] = position.x;
                    positions[i+1] = position.y;
                    positions[i+2] = position.z;
                }
                else if(i == positions.length - 4) {
                    var position = this.player2.getPosition();
                    positions[i] = position.x;
                    positions[i+1] = position.y;
                    positions[i+2] = position.z;
                }
                else {
                    positions[i] += (Math.random() - 0.5) * 1;   // x
                    positions[i + 1] += (Math.random() - 0.5) * 1; // y
                    positions[i + 2] += (Math.random() - 0.5) * 1; // z
                }                            
            }
         
             // Notify Three.js that the position attribute has changed
            this.lightning.geometry.attributes.position.needsUpdate = true;

            /*
            this.remove(this.lightning);
            this.lightning.geometry.dispose();
            */
        }

        this.spotlight?.update();

        this.particleEmitters.forEach(x => x.update());
        this.particleEmitters = this.particleEmitters.filter(x => !x.isDead);

        this.flamethrowerEmitters.forEach(x => x.update());

        //this.healthBar.update(this.allPlayers[0].getPosition());

        //if(this.allPlayers[0].body != null)
        //this.headLights.update(this.allPlayers[0].getPosition(), this.allPlayers[0].mesh.quaternion);

        this.allPlayers.forEach(player => player.update());
        
        let playerPosition = this.player1.getPosition();

        var otherPlayers = this.allPlayers.filter(x => x.playerId != this.player1.playerId);
        otherPlayers.forEach(enemy => {
            if(this.player1.getPosition().distanceTo(enemy.getPosition()) > 15) {
                enemy.healthBar.setVisible(false);                
            }
            else {
                enemy.healthBar.setVisible(true);                
            }
        });


    
        if(!this.player1.isModelNull() && this.crosshairSprite != null) {
            let forwardVector = new THREE.Vector3(-10, 0, 0);
            forwardVector.applyQuaternion(this.player1.getModelQuaternion());
            this.crosshairSprite.position.addVectors(this.player1.getModelPosition(), forwardVector);//playerPosition.x, playerPosition.y - 2, playerPosition.z);
            
            //let size = 10;
            //this.crosshairSprite.scale.set(size, size, size);

            // otherPlayers still alive
            var otherPlayersStillAlive = this.allPlayers.filter(x => x.playerId != this.player1.playerId && x.currentHealth > 0);

            var otherPlayerBodies: CANNON.Body[] = [];
            for(var i = 0; i < otherPlayersStillAlive.length; i++) {
                if(!otherPlayersStillAlive[i].isVehicleObjectNull() && otherPlayersStillAlive[i].getChassisBody() != null) {
                    let body = otherPlayersStillAlive[i].getChassisBody() ?? new CANNON.Body();
                    otherPlayerBodies.push(body); 
                }
            }

            /*
            var otherPlayerBodies = <unknown>otherPlayers.forEach(x => {
                return x.rigidVehicleObject?.chassis.body;
            });
            var temp = otherPlayerBodies as CANNON.Body[];
            */

            let ray = new CANNON.Ray(Utility.ThreeVec3ToCannonVec3(playerPosition), Utility.ThreeVec3ToCannonVec3(this.crosshairSprite.position));                
            var raycastResult: CANNON.RaycastResult = new CANNON.RaycastResult();

            /*
            var otherVehicleObject = this.player2.getChassisBody();
            if(otherVehicleObject != null) {
                // intersect single body
                ray.intersectBody(otherVehicleObject, raycastResult);
            }
            */

            // intersect multiple bodies
            ray.intersectBodies(otherPlayerBodies, raycastResult);

            if(raycastResult != null && raycastResult.hasHit) {
                this.crosshairSprite.material.color.set(new THREE.Color('red'));
            }
            else {
                this.crosshairSprite.material.color.set(new THREE.Color('white'));
            }        
        }
        
        this.updateDebugDivElements();
        this.stats.update();
    }

    updateDebugDivElements() {

        if(this.debugDivElementManager == null) return;

        let playerPosition = this.player1.getPosition();
        this.debugDivElementManager.updateElementText("PlayerLocation", `Player 1 position: (${playerPosition.x.toFixed(2)}, ${playerPosition.y.toFixed(2)}, ${playerPosition.z.toFixed(2)})`);
        
        this.debugDivElementManager.updateElementText("Objective", `Scene objects: ${this.children.length}`);
        
        // flamethrower particles
        let flameThrowerEmitterTotalParticleCount: number = 0;
        this.flamethrowerEmitters.forEach(x => {
            flameThrowerEmitterTotalParticleCount += x.sprites.length;
        });
        this.debugDivElementManager.updateElementText("WeaponCount", `flamethrower particles (sprites): ${flameThrowerEmitterTotalParticleCount}`);

        // total particles
        let emitterTotalParticleCount: number = 0;
        this.particleEmitters.forEach(x => {
            emitterTotalParticleCount += x.getParticleCount();
        });

        this.allPlayers.forEach(x => {
            emitterTotalParticleCount += x.getTotalParticleCount();
        })
        this.debugDivElementManager.updateElementText("ParticleCount", `total emitter particles (sprites): ${emitterTotalParticleCount}`);

        // physics objects
        let totalPhysicsObjectCount: number = this.world.bodies.length;        
        this.debugDivElementManager.updateElementText("PhysicsObjectCount", `total physics objects: ${totalPhysicsObjectCount}`);

        // lights
        var arrayLightTypes = ['SpotLight', 'HemisphereLight', 'AmbientLight', 'DirectionalLight', 'PointLight', 'RectAreaLight'];
        var totalLightCountInGroup = 0;        
        var allGroups = this.children.filter(x => x.type == 'Group');
        allGroups.forEach(x => {
            totalLightCountInGroup += x.children.filter(y => arrayLightTypes.includes(y.type)).length;
        });
        let totalLightObjectCount: number = this.children.filter(x => arrayLightTypes.includes(x.type)).length;
        this.debugDivElementManager.updateElementText("LightObjectCount", `total light objects: ${totalLightObjectCount + totalLightCountInGroup}`);

        // particle emitters
        let particleEmitterCount: number = this.particleEmitters.length;
        this.debugDivElementManager.updateElementText("ParticleEmitterCount", `Particle emitter count: ${particleEmitterCount}`);

        // grass billboards
        let shaderParticleCount = this.grassBillboards?.geometry.attributes.position.count ?? 0;
        this.projectiles.forEach(x => {
            if(x.particleEmitterObject != null)
                shaderParticleCount += x.particleEmitterObject.getParticleCount();
        });
        this.debugDivElementManager.updateElementText("ShaderParticleCount", `Shader particle count: ${shaderParticleCount}`);

        const renderer = this.sceneController.getWebGLRenderer();
        if(renderer.info != null) {
            this.debugDivElementManager.updateElementText("RendererTotalGeometry", `WebGLRenderer total geometry: ${renderer.info.memory.geometries}`);
            this.debugDivElementManager.updateElementText("RendererTotalTextures", `WebGLRenderer total textures: ${renderer.info.memory.textures}`);
            this.debugDivElementManager.updateElementText("RendererTotalPrograms", `WebGLRenderer total programs: ${renderer.info?.programs?.length ?? 0}`);
        }

        this.debugDivElementManager.updateElementText("cpuOverrideBehavior", `CPU Override Behavior: ${this.cpuPlayerBehavior.toString()}`);

        this.debugDivElementManager.updateElementText("player2status", `player2status: ${this.player2.playerState}`);
        this.debugDivElementManager.updateElementText("player3status", `player3status: ${this.player3.playerState}`);
        this.debugDivElementManager.updateElementText("player4status", `player4status: ${this.player4.playerState}`);

        //let textureCount = this.getAllLoadedTextures(this);
        //this.debugDivElementManager.updateElementText("TraverseTotalTextures", `Total Textures: ${textureCount}`);
    }
   
    // Function to get all loaded textures in the scene
    getAllLoadedTextures(scene: THREE.Scene): THREE.Texture[] {
        const textures = new Set<THREE.Texture>();
    
        scene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;
                const material = mesh.material;
                if (Array.isArray(material)) {
                    material.forEach((mat) => {
                        this.collectTextures(mat, textures);
                    });
                } else if (material) {
                    this.collectTextures(material, textures);
                }
            }
        });
    
        return Array.from(textures);
    }

    collectTextures(material: THREE.Material, textures: Set<THREE.Texture>): void {
        const textureProps: string[] = [
            'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap',
            'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap',
            'envMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
            'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap'
        ];
    
        textureProps.forEach((prop) => {
            //var temp = prop as keyof THREE.Material;
            const texture = material[prop as keyof THREE.Material] as THREE.Texture | undefined;
            if (texture) {
                textures.add(texture);
            }
        });
    }

    //generateArrayFromTexture() {
        //var textureToArray = new TextureToArray(this.textureLoader);
    //}    
}