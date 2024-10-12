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
import { GLTF, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
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
import { TerrainObjectv2 } from '../gameobjects/terrain/terrainObjectv2';
import { PickupObject2 } from '../gameobjects/pickupObject2';
import { SmokeObject } from '../gameobjects/fx/smokeObject';
import { CpuPlayerPattern } from '../gameobjects/player/cpuPlayerPatternEnums';
import { VehicleFactory } from '../gameobjects/player/vehicleFactory';
import { RainShaderParticleEmitter } from '../gameobjects/fx/rainShaderParticleEmitter';
import { WorldConfig } from '../gameobjects/world/worldConfig';
import { GameConfig } from '../gameconfig';
import { PrecipitationSystem, PrecipitationType } from '../gameobjects/world/precipitationSystem';
import { DumpsterFireObject } from '../gameobjects/weapons/dumpsterFireObject';
import { VehicleUtil } from '../gameobjects/vehicles/vehicleUtil';
import GameAssetModelLoader from '../gameobjects/shapes/gameAssetModelLoader';

// npm install cannon-es-debugger
// https://youtu.be/Ht1JzJ6kB7g?si=jhEQ6AHaEjUeaG-B&t=291

// https://www.youtube.com/watch?v=8J5xl9oijR8&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=3

export default class GameScene extends THREE.Scene {

    private stats: Stats = new Stats();

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
    public dumpsterModel!: GLTF;

    private readonly textureLoader = new THREE.TextureLoader();

    private readonly camera: THREE.PerspectiveCamera;
    
    private readonly debugOrbitCamera: THREE.PerspectiveCamera;
    private readonly debugOrbitControls: OrbitControls;

    private readonly keyDown = new Set<string>();

    private cubes: BoxObject[] = [];
    private debrisWheels: GltfObject[] = [];
    private bouncyWheelMaterial!: CANNON.Material;

    private lightning!: THREE.Line;

    private pickups: PickupObject2[] = [];
    private projectiles: Projectile[] = [];

    private particleEmitters: ParticleEmitter[] = [];
    private fireParticleEmitters: ParticleEmitter[] = [];

    public explosionTexture: THREE.Texture = new THREE.Texture();
    public crosshairTexture: THREE.Texture = new THREE.Texture();
    public playerMarkerTexture: THREE.Texture = new THREE.Texture();

    public groundMaterial!: CANNON.Material;
    public wheelGroundContactMaterial!: CANNON.ContactMaterial;

    private worldConfig!: WorldConfig;
    private heightMapTextureAsArray!: TextureToArray; //= new TextureToArray(this.textureLoader, 'assets/heightmaps/heightmap_arena_128x128.png');
    gameConfig: GameConfig;
    gameAssetModelLoader: GameAssetModelLoader;

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
    precipitationSystem!: PrecipitationSystem;

    grassBillboards?: THREE.Points;
    
    cube?: BoxObject;
    cube2?: BoxObject;
    cylinder?: CylinderObject;

    debrisDriveTrain!: GltfObject;

    private allPlayers: Player[] = [];
    player1!: Player;
    player2!: Player;
    player3!: Player;
    player4!: Player;

    cpuPlayerBehavior: CpuPlayerPattern = CpuPlayerPattern.FollowAndAttack;

    private followCam?: THREE.Object3D;

    sphere?: SphereObject;

    spotlight?: SpotlightObject;

    flamethrowerEmitters: FlamethrowerEmitter[] = [];

    sceneController: SceneController;

    debugDivElementManager!: DebugDivElementManager;

    crosshairSprite!: THREE.Sprite;

    public isPaused: boolean = false;

    constructor(camera: THREE.PerspectiveCamera,
        debugOrbitCamera: THREE.PerspectiveCamera,
        debugOrbitControls: OrbitControls,
        sceneController: SceneController, gameConfig: GameConfig) {
        super();
        
        this.camera = camera;

        this.debugOrbitCamera = debugOrbitCamera;
        this.debugOrbitControls = debugOrbitControls;

        this.sceneController = sceneController;
        this.gameConfig = gameConfig;

        this.gameAssetModelLoader = new GameAssetModelLoader(this.gltfLoader);
    }

    preloadMapData(worldConfig: WorldConfig) {        
        this.worldConfig = worldConfig;
        this.heightMapTextureAsArray = new TextureToArray(this.textureLoader, worldConfig.heightMap);
    }

    preloadSkybox(worldConfig: WorldConfig) {
        // skybox tutorial: https://threejs.org/manual/#en/backgrounds
        // asset source: https://polyhaven.com/a/industrial_sunset_puresky
        let skyTexture = this.textureLoader.load(
            worldConfig.skyTexture,
            () => {

                skyTexture.mapping = THREE.EquirectangularReflectionMapping;
                skyTexture.colorSpace = THREE.SRGBColorSpace;
                this.background = skyTexture;
            }  
        );
    }

    async initialize(player1VehicleType: VehicleType): Promise<void> {       
        if(this.gameConfig.useFog)
            this.fog = new THREE.Fog(this.worldConfig.fogColor, this.gameConfig.fogNear, this.gameConfig.fogFar);

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

        var treeModelData = await this.gameAssetModelLoader.generateTreeModel();
        let treeModel = treeModelData.scene.clone();
        treeModel.position.copy(this.getWorldPositionOnTerrainAndWater(0, 0));
        treeModel.scale.set(3, 3, 3);
        this.add(treeModel);

        var barrelModelData = await this.gameAssetModelLoader.generateBarrelModel();
        let barrelModel = barrelModelData.scene.clone();
        barrelModel.position.copy(this.getWorldPositionOnTerrainAndWater(2, 2));
        barrelModel.position.y += 0.5;
        barrelModel.scale.set(2, 2, 2);
        this.add(barrelModel);

        this.dumpsterModel = await this.gameAssetModelLoader.generateDumpsterModel();
        
        var groundCubeContactMaterial = new CANNON.ContactMaterial(
            this.terrain.getPhysicsMaterial(),
            this.cube.getPhysicsMaterial(),
            {
                friction: 0
            }            
        );
        this.world.addContactMaterial(groundCubeContactMaterial);

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
        this.debugDivElementManager.addNamedElementPlaceholders([
            "PlayerLocation",
            "Objective",
            "ParticleCount",
            "WeaponCount",
            "PhysicsObjectCount",
            "LightObjectCount",

            "ParticleEmitterCount",
            "ShaderParticleCount",
            "RendererTotalGeometry",
            "RendererTotalTextures",
            "RendererTotalPrograms",
            "TraverseTotalTextures",
            "cpuOverrideBehavior",
            
            "player2status",
            "player2Target",
            "player3status",
            "player3Target",
            "player4status",
            "player4Target",
        ]);
        this.debugDivElementManager.hideAllElements();
       
        // https://threejs.org/examples/?q=water#webgl_shaders_ocean

        if(this.worldConfig.waterY != null) {
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
            this.water.position.y += this.worldConfig.waterY; // 1.5
            this.add( this.water );
        }

        if(this.worldConfig.precipitationType != PrecipitationType.None) {
            this.precipitationSystem = new PrecipitationSystem(this, this.worldConfig.precipitationType);
        }
            
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
    generateGrassBillboards(textureName: string, mapWidth: number, mapHeight: number, yMin: number, yMax: number, maxCount: number) {

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;

        for ( let i = 0; i < maxCount; i ++ ) {

            const x = mapWidth * Math.random() - mapWidth / 2;
            const z = mapHeight * Math.random() - mapHeight / 2;

            let tempVector3 = this.terrain.getWorldPositionOnTerrain(x, z);
            if(tempVector3.y > yMin && tempVector3.y < yMax)
                vertices.push( tempVector3.x, tempVector3.y, tempVector3.z );
        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        var material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false, depthTest: true, depthWrite: false } );
        //material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );

        this.grassBillboards = new THREE.Points( geometry, material );
        this.add( this.grassBillboards );
    }

    private handleKeyDown = (event: KeyboardEvent) => {        
        /*
        if (['w', 'a', 's', 'd'].includes(event.key)) {
            event.preventDefault();
            return;
        }            
        */
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

            let forwardVector = new THREE.Vector3(-10, 4, 0);
            forwardVector.applyQuaternion(this.player1.getVehicleObject().getModel().quaternion);
            let projectileLaunchVector = forwardVector; 

            this.generateRandomDumpster(this.player1.getPosition(), projectileLaunchVector);
        }
        if (event.key === 'o')
        {			
            this.player1.tryDamage(ProjectileType.Rocket, new THREE.Vector3(0,0,0));            
            this.sceneController.updateHealthOnHud(this.player1.currentHealth);
        }
        if (event.key === 'y')
        {			
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
            this.cpuPlayerBehavior = CpuPlayerPattern.Follow;
		}
        if (event.key === '2')
		{
            this.cpuPlayerBehavior = CpuPlayerPattern.FollowAndAttack;
		}
        if (event.key === '3')
		{
            this.cpuPlayerBehavior = CpuPlayerPattern.Stop;
		}
        if (event.key === '4')
		{
            this.cpuPlayerBehavior = CpuPlayerPattern.StopAndAttack;
		}
        if (event.key === '5')
		{
            this.cpuPlayerBehavior = CpuPlayerPattern.Flee;
		}        
        if (event.key === '6')
		{
            this.cpuPlayerBehavior = CpuPlayerPattern.Patrol;
		}      
        if (event.key === '7')
		{

		}      
        if (event.key === 'Enter')
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

        if (event.key === 'Escape') {
            this.sceneController.tryTogglePauseMenu();
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

    public togglePauseGame() {
        this.isPaused = !this.isPaused;

        this.debugOrbitCamera.position.copy(this.camera.position);            
        this.debugOrbitCamera.lookAt(this.player1.getPosition());
        this.debugOrbitControls.enabled = this.isPaused;        
    }

    public updateInputForDebug() {
            
        let cameraMovement = 0.15;

        this.sceneController.pollGamepads();

        if(this.keyDown.has('shift')) {
            cameraMovement = 0.9;
        }

        // forward
        if(this.keyDown.has('w')) {
            const moveDirection = new THREE.Vector3();
            this.debugOrbitCamera.getWorldDirection(moveDirection); // Get the current forward direction
            
            this.debugOrbitCamera.position.addScaledVector(moveDirection, cameraMovement); // Move the camera forward by 1 unit
            this.debugOrbitControls.target.addScaledVector(moveDirection, cameraMovement);
        }       

        // left
        if(this.keyDown.has('a')) {

            const forwardVector = new THREE.Vector3();
            this.debugOrbitCamera.getWorldDirection(forwardVector); // Get the current forward direction

            const leftVector = new THREE.Vector3();
            leftVector.crossVectors(new THREE.Vector3(0, 1, 0), forwardVector).normalize();

            this.debugOrbitCamera.position.addScaledVector(leftVector, cameraMovement); // Move the camera forward by 1 unit
            this.debugOrbitControls.target.addScaledVector(leftVector, cameraMovement);
        }   

        // right
        if(this.keyDown.has('d')) {
            const forwardVector = new THREE.Vector3();
            this.debugOrbitCamera.getWorldDirection(forwardVector); // Get the current forward direction

            const leftVector = new THREE.Vector3();
            leftVector.crossVectors(new THREE.Vector3(0, 1, 0), forwardVector).normalize();

            this.debugOrbitCamera.position.addScaledVector(leftVector, -cameraMovement); // Move the camera forward by 1 unit
            this.debugOrbitControls.target.addScaledVector(leftVector, -cameraMovement);
        } 

        // backwards
        if(this.keyDown.has('s')) {
            const moveDirection = new THREE.Vector3();
            this.debugOrbitCamera.getWorldDirection(moveDirection); // Get the current forward direction
            this.debugOrbitCamera.position.add(moveDirection.multiplyScalar(-cameraMovement)); // Move the camera forward by 1 unit
        }   

        // up
        if(this.keyDown.has('q')) {
            const upVector = new THREE.Vector3(0, 1, 0);

            this.debugOrbitCamera.position.addScaledVector(upVector, cameraMovement); // Move the camera forward by 1 unit
            this.debugOrbitControls.target.addScaledVector(upVector, cameraMovement);
        }   

        // down
        if(this.keyDown.has('z')) {

            const upVector = new THREE.Vector3(0, 1, 0);

            this.debugOrbitCamera.position.addScaledVector(upVector, -cameraMovement); // Move the camera forward by 1 unit
            this.debugOrbitControls.target.addScaledVector(upVector, -cameraMovement);
        }   

         // down
        if(this.keyDown.has('0')) {
            var targetPosition = this.debugOrbitCamera.position;
            //this.debugOrbitCamera.position.copy(targetPosition).add(new THREE.Vector3(5, 2, 5));
            this.debugOrbitControls.target = this.player1.getPosition();
            
        }   
        // down
        if(this.keyDown.has('1')) {
            var targetPosition = this.player1.getPosition();

            this.debugOrbitCamera.position.copy(targetPosition).add(new THREE.Vector3(5, 2, 5));
            this.debugOrbitControls.target = this.player1.getPosition();
            
        }   
        if(this.keyDown.has('2')) {
            var targetPosition = this.player2.getPosition();

            this.debugOrbitCamera.position.copy(targetPosition).add(new THREE.Vector3(5, 2, 5));
            this.debugOrbitControls.target = targetPosition;
        }   
        if(this.keyDown.has('3')) {
            var targetPosition = this.player3.getPosition();
            this.debugOrbitCamera.position.copy(targetPosition).add(new THREE.Vector3(5, 2, 5));
            this.debugOrbitControls.target = targetPosition;
        }   
        if(this.keyDown.has('4')) {
            var targetPosition = this.player4.getPosition();
            this.debugOrbitCamera.position.copy(targetPosition).add(new THREE.Vector3(5, 2, 5));
            this.debugOrbitControls.target = targetPosition;
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
        
        var wheelModel = await this.gameAssetModelLoader.generateWheelModel();

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

    public async generateRandomDumpster(position: THREE.Vector3, launchVector: THREE.Vector3, quaternion?: THREE.Quaternion) {
        
        if(quaternion == null)
            quaternion = new THREE.Quaternion();
        
        position.y += 2;
        var debrisWheel = new DumpsterFireObject(
            this,
            this.dumpsterModel.scene,
            position,
            quaternion,
            new THREE.Vector3(2, 2, 2), // scale                
            launchVector, //new THREE.Vector3(randFloat(-10, 10), randFloat(2, 5), randFloat(-10, 10)), // initial velocity            
            new THREE.Vector3(1, 1, 1), // physics object scale
            new THREE.Vector3(0, 0, 0), // physics object offset
            this.world,
            this.bouncyWheelMaterial
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
        let spawnPosition = this.terrain.getWorldPositionOnTerrain(randX, randZ);
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
                    particleInitialScale = 5;
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
       
        this.taxiModel = await this.gameAssetModelLoader.loadTaxiModel();
        this.policeModel = await this.gameAssetModelLoader.loadPoliceModel();
        this.ambulanceModel = await this.gameAssetModelLoader.loadAmbulanceModel();
        this.trashTruckModel = await this.gameAssetModelLoader.loadTrashTruckModel();
        this.sedanSportsModel = await this.gameAssetModelLoader.loadSedanSportsModel();
        this.raceCarBlueModel = await this.gameAssetModelLoader.loadRaceCarBlueModel();
        this.raceCarRedModel = await this.gameAssetModelLoader.loadRaceCarRedModel();       
        this.policeTractorModel = await this.gameAssetModelLoader.loadPoliceTractorModel();       
        this.tractorModel = await this.gameAssetModelLoader.loadTractorModel();       
        this.pickupTruckModel = await this.gameAssetModelLoader.loadPickupTruckModel();       

        this.suvModel = await this.gameAssetModelLoader.loadSuvModel();
        this.killdozerModel = await this.gameAssetModelLoader.loadKilldozerModel();
        this.fireTruckModel = await this.gameAssetModelLoader.loadFireTruckModel();
        
        this.wheelModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/wheel-racing.glb');
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

        this.player1 = vehicleFactory.generatePlayer(this, this.gameConfig.isDebug, this.world, false, player1VehicleType, new THREE.Color('red'), wheelMaterial);
        this.player2 = vehicleFactory.generatePlayer(this, this.gameConfig.isDebug,this.world, true, randInt(0, 12), new THREE.Color('blue'), wheelMaterial);
        this.player3 = vehicleFactory.generatePlayer(this, this.gameConfig.isDebug,this.world, true, randInt(0, 12), new THREE.Color('green'), wheelMaterial);
        this.player4 = vehicleFactory.generatePlayer(this, this.gameConfig.isDebug,this.world, true, randInt(0, 12), new THREE.Color('yellow'), wheelMaterial);

        this.allPlayers.push(this.player1);          
        this.allPlayers.push(this.player2);
        this.allPlayers.push(this.player3);
        this.allPlayers.push(this.player4);

        this.allPlayers.forEach(x => x.tryRespawn());

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
            new THREE.MeshStandardMaterial({
                color: 0x007700,
                //wireframe: false,
                //depthWrite: true,
                fog: true,
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

        if(this.worldConfig.grassBillboard != null && this.worldConfig.grassBillboardStartY != null && this.worldConfig.grassBillboardEndY != null ) {
            this.generateGrassBillboards(
                this.worldConfig.grassBillboard,
                this.heightMapTextureAsArray.getImageWidth(),
                this.heightMapTextureAsArray.getImageHeight(),
                this.worldConfig.grassBillboardStartY,
                this.worldConfig.grassBillboardEndY,
                100000
            );
        }                
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
                let worldPosition = this.terrain.getWorldPositionOnTerrain(projectile.group.position.x, projectile.group.position.z );        
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
            if(player.flamethrowerActive) {

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

    public getWorldPositionOnTerrainAndWater(x: number, z: number): THREE.Vector3 {

        let waterPosition = new THREE.Vector3(0,0,0);
        
        if(this.water != null)
            waterPosition = this.water.position;

        var position = this.terrain.getWorldPositionOnTerrain(x, z);

        if(this.water != null && waterPosition.y > position.y)
            position.y = waterPosition.y;

        return position;
    }

    updateWater() {
        if(!this.water)
            return;

        this.water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
    }

    updatePrecipitation() {
        if(this.precipitationSystem != null) {
            this.precipitationSystem.animateRain();
        }
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

            if(this.cpuPlayerBehavior == CpuPlayerPattern.Follow || this.cpuPlayerBehavior == CpuPlayerPattern.FollowAndAttack) {                
                //VehicleUtil.updateFollowerBehavior(this.player1.getVehicleObject().getRaycastVehicle(), cpuPlayer.getVehicleObject().getRaycastVehicle())
                VehicleUtil.updateFollowerBehaviorOnIPlayerVehicle(this.player1.getVehicleObject(), cpuPlayer.getVehicleObject());
                //cpuPlayer.setTargetLocation(this.player1.getPosition());
            }

            // movement
            let randMovement = THREE.MathUtils.randInt(0, 200);
            switch(randMovement) {
            /*
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
            */
            case 60:
                cpuPlayer.tryJump();                
                //cpuPlayer.tryTurn(0.5);
                break;
            case 70:
                cpuPlayer.tryTurbo();
                break;
            default:
                break;
            }

            // weapons
            if(this.cpuPlayerBehavior == CpuPlayerPattern.FollowAndAttack || this.cpuPlayerBehavior == CpuPlayerPattern.StopAndAttack) {
                let randomWeaponFiring = THREE.MathUtils.randInt(80, 200);
                switch(randomWeaponFiring) {            
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
                case 120:
                    cpuPlayer.tryFireDumpster();
                    break;
                default:
                    break;
                }
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

        this.fireParticleEmitters.forEach(x => x.update());
        this.fireParticleEmitters.forEach(x => x.setEmitPosition(new THREE.Vector3(-3, 2.5, -3)));

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

        this.allPlayers.forEach(player => player.update(this.cpuPlayerBehavior));
        
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

        this.debugDivElementManager.updateElementText("cpuOverrideBehavior", `CPU Override Behavior: ${Utility.getEnumName(CpuPlayerPattern, this.cpuPlayerBehavior)}`);

        this.debugDivElementManager.updateElementText("player2status", `Player 2 | position: ${Utility.ThreeVector3ToString(this.player2.getPosition())} | ${Utility.getEnumName(PlayerState, this.player2.playerState)} | velocity: ${Utility.CannonVec3ToString(this.player2.getChassisBody().velocity)}`);
        this.debugDivElementManager.updateElementText("player2Target", `Player 2 Target: ${Utility.ThreeVector3ToString(this.player2.target.groundTargetMesh.position)} | Distance: ${this.player1.getPosition().distanceTo(this.player2.getPosition()).toFixed(2)}`);        

        this.debugDivElementManager.updateElementText("player3status", `Player 3 | position: ${Utility.ThreeVector3ToString(this.player3.getPosition())} | ${Utility.getEnumName(PlayerState, this.player3.playerState)} | velocity: ${Utility.CannonVec3ToString(this.player3.getChassisBody().velocity)}`);
        this.debugDivElementManager.updateElementText("player3Target", `Player 3 Target: ${Utility.ThreeVector3ToString(this.player3.target.groundTargetMesh.position)} | Distance: ${this.player1.getPosition().distanceTo(this.player3.getPosition()).toFixed(2)}`);

        this.debugDivElementManager.updateElementText("player4status", `Player 4 | position: ${Utility.ThreeVector3ToString(this.player4.getPosition())} | ${Utility.getEnumName(PlayerState, this.player4.playerState)} | velocity: ${Utility.CannonVec3ToString(this.player4.getChassisBody().velocity)}`);
        this.debugDivElementManager.updateElementText("player4Target", `Player 4 Target: ${Utility.ThreeVector3ToString(this.player4.target.groundTargetMesh.position)} | Distance: ${this.player1.getPosition().distanceTo(this.player4.getPosition()).toFixed(2)}`);

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