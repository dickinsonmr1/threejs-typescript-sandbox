import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import Bullet from '../gameobjects/bullet';
import * as CANNON from 'cannon-es'
import { GroundObject } from '../gameobjects/groundObject';
import { BoxObject } from '../gameobjects/boxObject';
import { SphereObject } from '../gameobjects/sphereObject';
import Stats from 'three/addons/libs/stats.module.js';
import SpotlightObject from '../gameobjects/spotlightObject';
import { randFloat } from 'three/src/math/MathUtils.js';
import { ExplosionObject } from '../gameobjects/explosionObject';
import { GltfObject } from '../gameobjects/gltfObject';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Utility } from '../utility';
import { Projectile } from '../gameobjects/projectile';
import { CylinderObject } from '../gameobjects/cylinderObject';
import { RaycastVehicleObject } from '../gameobjects/raycastVehicle/raycastVehicleObject';
import { RigidVehicleObject } from '../gameobjects/rigidVehicle/rigidVehicleObject';

// npm install cannon-es-debugger
// https://youtu.be/Ht1JzJ6kB7g?si=jhEQ6AHaEjUeaG-B&t=291

// https://www.youtube.com/watch?v=8J5xl9oijR8&list=PLFky-gauhF46LALXSriZcXLJjwtZLjehn&index=3

export default class BlasterScene extends THREE.Scene {

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

    private blaster?: THREE.Group;
    private bulletMtl?: MTLLoader.MaterialCreator;
    private directionVector = new THREE.Vector3();

    private cubes: BoxObject[] = [];
    private bullets: Bullet[] = [];
    private targets: THREE.Group[] = [];

    private projectiles: Projectile[] = [];
    projectileSpeed: number = 0.5;

    private explosions: ExplosionObject[] = [];
    private explosionTexture?: THREE.Texture;

    world: CANNON.World = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.81, 0)
    });
    
    ground?: GroundObject;
    cube?: BoxObject;
    cube2?: BoxObject;
    cylinder?: CylinderObject;

    private allPlayers: GltfObject[] = [];

    vehiclePlayer1?: GltfObject;
    vehiclePlayer2?: GltfObject;
    vehiclePlayer3?: GltfObject;
    vehiclePlayer4?: GltfObject;

    raycastVehicleObject?: RaycastVehicleObject;
    rigidVehicleObject?: RigidVehicleObject;

    sphere?: SphereObject;

    spotlight?: SpotlightObject;

    constructor(camera: THREE.PerspectiveCamera) {
        super();
        
        this.camera = camera;
        this.background = new THREE.Color(0xB1E1FF);
    }

    async initialize() {

        // load a shared MTL (Material Template Library) for the targets
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl');
        targetMtl.preload();

        this.bulletMtl = await this.mtlLoader.loadAsync('assets/foamBulletB.mtl');
        this.bulletMtl.preload();

        this.taxiModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/taxi.glb');
        this.policeModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/police.glb');
        this.ambulanceModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/ambulance.glb');
        this.trashTruckModel = await this.gltfLoader.loadAsync('assets/kenney-vehicles/garbageTruck.glb');
                
        // create 4 targets
        const t1 = await this.createTarget(targetMtl);
        t1.position.x = -1;
        t1.position.z = -3;

        const t2 = await this.createTarget(targetMtl);
        t2.position.x = 1;
        t2.position.z = -3;

        const t3 = await this.createTarget(targetMtl);
        t3.position.x = 2;
        t3.position.z = -3;

        const t4 = await this.createTarget(targetMtl);
        t4.position.x = -2;
        t4.position.z = -3;

        this.add(t1, t2, t3, t4);
        this.targets.push(t1, t2, t3, t4);
        this.blaster = await this.createBlaster();
        this.add(this.blaster);
        this.blaster.position.z = -1;

        // attach blaster to camera
        this.blaster.add(this.camera);
        this.camera.position.z = 1;
        this.camera.position.y = 0.5;

        /*
            // Create a slippery material (friction coefficient = 0.0)
            var physicsMaterial = new CANNON.Material('physics')
            const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
            friction: 0.0,
            restitution: 0.3,
            });

            this.world.addContactMaterial(physics_physics);

            // Create the user collision sphere (attached to camera)
            const radius = 1.3
            var sphereShape = new CANNON.Sphere(radius)
            var sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
            sphereBody.addShape(sphereShape)
            sphereBody.position.set(0, 5, 0);
            sphereBody.linearDamping = 0.9;
            this.world.addBody(sphereBody)
        */

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

        /*
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        const chassisBody = new CANNON.Body({ mass: 150 });
        chassisBody.addShape(chassisShape);
        chassisBody.position.set(0, 4, 0);
        // this.help.addVisual(chassisBody, 'car');

        const options = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        const vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indexForwardAxis: 2
        });

        options.chassisConnectionPointLocal.set(1, 0, -1);
        vehicle.addWheel(options);
        options.chassisConnectionPointLocal.set(-1, 0, -1);
        vehicle.addWheel(options);
        options.chassisConnectionPointLocal.set(1, 0, 1);
        vehicle.addWheel(options);
        options.chassisConnectionPointLocal.set(-1, 0, 1);
        vehicle.addWheel(options);

        vehicle.addToWorld(this.world);

		var wheelBodies: CANNON.Body[] = [];    

		vehicle.wheelInfos.forEach(wheel => {
			const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);

			const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
			const q = new CANNON.Quaternion();
			q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
			wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
			wheelBodies.push(wheelBody);
			//game.helper.addVisual(wheelBody, 'wheel');
		});

		// Update wheels
		this.world.addEventListener('postStep', function(){
			let index = 0;
			vehicle.wheelInfos.forEach(wheel => {
            	vehicle.updateWheelTransform(index);
                const t = wheel.worldTransform;
                wheelBodies[index].position.copy(t.position);
                wheelBodies[index].quaternion.copy(t.quaternion);
				index++; 
			});
		});        
        */

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

        this.raycastVehicleObject = new RaycastVehicleObject(
            this,
            new THREE.Vector3(-5, 4, -15),
            0x00ff00,
            this.world,
            wheelMaterial);

        this.rigidVehicleObject = new RigidVehicleObject(
            this,
            new THREE.Vector3(0, 4, 0),   // position
            0x00ff00,
            this.world,            
            new CANNON.Vec3(1, 0.25, 0.5), // chassis dimensions
            new CANNON.Vec3(0, 0.2, 0),    // center of mass adjust
            20,                            // chassis mass
            wheelMaterial,
            0.2,                           // wheel radius
            new CANNON.Vec3(0, -0.2, 0),   // wheel offset
            1                              // wheel mass
        );

        this.vehiclePlayer1 = new GltfObject(this,
            this.taxiModel,
            //'assets/kenney-vehicles/taxi.glb',
            new THREE.Vector3(2, 2, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(0.5, 0.5, 1), // bounding box size,
            new THREE.Vector3(0, -0.25, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allPlayers.push(this.vehiclePlayer1);

        this.vehiclePlayer2 = new GltfObject(this,
            this.policeModel,
            new THREE.Vector3(-2, 2, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(0.5, 0.5, 1), // bounding box size,
            new THREE.Vector3(0, -0.25, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allPlayers.push(this.vehiclePlayer2);

        this.vehiclePlayer3 = new GltfObject(this,
            this.trashTruckModel,
            new THREE.Vector3(-6, 2, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(1, 1, 1.5), // bounding box size,
            new THREE.Vector3(0, -0.5, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allPlayers.push(this.vehiclePlayer3);

        this.vehiclePlayer4 = new GltfObject(this,
            this.ambulanceModel,
            new THREE.Vector3(-3, 5, -2), // position
            new THREE.Vector3(0.5, 0.5, 0.5), // scale
            new THREE.Vector3(1, 1, 1.5), // bounding box size,
            new THREE.Vector3(0, -0.5, 0), // physics offset,
            this.world,
            objectMaterial);
        this.allPlayers.push(this.vehiclePlayer4);

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

        document.body.appendChild(this.stats.dom);

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
            this.createProjectile();
            //this.generateRandomCube();
            //this.generateRandomExplosion();
		}
        if (event.key === 'x')
		{
			this.generateRandomCube();
		}

        if(event.key === 'w') {
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(0, 2);
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(0, 3);
        }
        else if(event.key === 's') {
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(0, 2);
            this.raycastVehicleObject?.raycastVehicle?.applyEngineForce(0, 3);
        }

        if(event.key === 'a') {
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(0, 0);
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(0, 1);
        }
        else if(event.key === 'd') {
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(0, 0);
            this.raycastVehicleObject?.raycastVehicle?.setSteeringValue(0, 1);
        }

        // rigid body vehicle
        if(event.key === 't') {
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(0, 2);
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(0, 3);
        }
        else if(event.key === 'g') {
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(0, 2);
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(0, 3);
        }

        if(event.key === 'f') {
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(0, 0);
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(0, 1);
        }
        else if(event.key === 'h') {
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(0, 0);
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(0, 1);
        }
	}

    private updateInput() {
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

        const dir = this.directionVector;

        this.camera.getWorldDirection(dir);
        const speed = 0.1;

        const maxSteerVal = 0.5;
        const maxForce = 1000;
        const brakeForce = 1000000;

        // raycast vehicle controls
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

        // rigid body vehicle controls
        const maxForceRigidBodyVehicle = 10;
        const rigidMaxSteerVal = Math.PI / 8;
        if(this.keyDown.has('t')) {
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(-maxForceRigidBodyVehicle, 2);
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(-maxForceRigidBodyVehicle, 3);
        }
        else if(this.keyDown.has('g')) {
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(maxForceRigidBodyVehicle, 2);
            this.rigidVehicleObject?.rigidVehicleObject?.setWheelForce(maxForceRigidBodyVehicle, 3);
        }

        if(this.keyDown.has('f')) {
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(rigidMaxSteerVal, 0);
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(rigidMaxSteerVal, 1);
        }
        else if(this.keyDown.has('h')) {
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(-rigidMaxSteerVal, 0);
            this.rigidVehicleObject?.rigidVehicleObject?.setSteeringValue(-rigidMaxSteerVal, 1);
        }
        
        // camera FPS controller
        if(this.keyDown.has('arrowup')) {
            this.blaster.position.add(dir.clone().multiplyScalar(speed));
        }
        else if(this.keyDown.has('arrowdown')) {
            this.blaster.position.add(dir.clone().multiplyScalar(-speed));
        }

        if(shiftKey) {
            const strafeDir = dir.clone();
            const upVector = new THREE.Vector3(0, 1, 0);

            if(this.keyDown.has('arrowleft')) {
                this.blaster.position.add(
                    strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
                        .multiplyScalar(speed)
                );
            }
            else if(this.keyDown.has('arrowright')) {
                this.blaster.position.add(
                    strafeDir.applyAxisAngle(upVector, -Math.PI * 0.5)
                        .multiplyScalar(speed)
                );
            }
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

    private async createTarget(mtl: MTLLoader.MaterialCreator) {
        this.objLoader.setMaterials(mtl);

        const modelRoot = await this.objLoader.loadAsync('assets/targetA.obj');
        modelRoot.rotateY(Math.PI * 0.5);

        return modelRoot;
    }

    private async createBlaster() {
        const mtl = await this.mtlLoader.loadAsync('assets/blaster6.mtl');
        mtl.preload();
        
        this.objLoader.setMaterials(mtl);
        const modelRoot = await this.objLoader.loadAsync('assets/blasterG.obj');

        return modelRoot;
    }

    private async createBullet() {
        if(!this.blaster) 
            return;
        else if (this.bulletMtl) {
            this.objLoader.setMaterials(this.bulletMtl);
        }

        const bulletModel = await this.objLoader.loadAsync('assets/foamBulletB.obj');

        this.camera.getWorldDirection(this.directionVector);

        //axis-aligned bounding box
        const aabb = new THREE.Box3().setFromObject(this.blaster);
        const size = aabb.getSize(new THREE.Vector3());

        const vec = this.blaster.position.clone();
        
        // distance off ground
        vec.y += 0.25;

        bulletModel.position.add(
            vec.add(
                this.directionVector.clone().multiplyScalar(size.z * 0.5)
            )
        );

        bulletModel.scale.set(5, 5, 5);

        // rotate children to match gun for simplicity
        bulletModel.children.forEach(child => child.rotateX(Math.PI * -0.5));

        // use the same rotation as the gun
        bulletModel.rotation.copy(this.blaster.rotation);

        this.add(bulletModel);

        const b = new Bullet(this, bulletModel);
        b.setVelocity(
            this.directionVector.x * 0.2,
            this.directionVector.y * 0.2,
            this.directionVector.z * 0.2
        );

        this.bullets.push(b);
    }

    private async createProjectile() {
        
        if(!this.blaster) 
            return;

        let projectileLaunchVector = new THREE.Vector3;
        this.camera.getWorldDirection(projectileLaunchVector);

        //axis-aligned bounding box
        const aabb = new THREE.Box3().setFromObject(this.blaster);
        const size = aabb.getSize(new THREE.Vector3());

        const vec = this.blaster.position.clone();
        
        // distance off ground
        vec.y += 0.25;

        // offset to front of gun
        var tempPosition = vec.add(
                this.directionVector.clone().multiplyScalar(size.z * 0.5)
            );

        var tempProjectile = new Projectile(this, 0.05, tempPosition,
            projectileLaunchVector,
            this.projectileSpeed,
            0xff0000,
            new THREE.MeshPhongMaterial( { color: 0xff0000, depthWrite: true }));      

        this.projectiles.push(tempProjectile);
    }

    private async generateRandomCube() {

        let randPosition = new THREE.Vector3(randFloat(-5, 5), randFloat(5, 15), randFloat(-5.5, -10.5));
        let randCubeSize = randFloat(0.5, 2);

        let randColor = THREE.MathUtils.randInt(0, 0xffffff);

        const cube = new BoxObject(this,
            randCubeSize, randCubeSize, randCubeSize,
            randPosition,
            randColor,
            new THREE.MeshPhongMaterial( { color: randColor, depthWrite: true }),
            this.world);

        this.cubes.push(cube);
    }

    private async generateRandomExplosion(position?: THREE.Vector3) {

        if(this.explosionTexture != null) {
            //let randPosition = new THREE.Vector3(randFloat(-5, 5), randFloat(5, 15), randFloat(-5.5, -10.5));
            if(position == null)
                position = new THREE.Vector3(0, 1, 0);

            let randColorR = THREE.MathUtils.randInt(0, 255);
            let randColorG = THREE.MathUtils.randInt(0, 255);
            let randColorB = THREE.MathUtils.randInt(0, 255);

            let color = new THREE.Color(randColorR, randColorG, randColorB);

            this.explosions.push(new ExplosionObject(this, this.explosionTexture,
                color,
                position,
                100,
                0.05));
        }
    }

    private updateBullets() {
        for(let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];
            b.update();

            if(b.shouldRemove) {
                b.removeLight();
                this.remove(b.group);

                this.bullets.splice(i, 1);
                i--;
            }
            else {


                for(let j = 0; j < this.allPlayers.length; j++) {
                    const otherPlayerBody = this.allPlayers[j].body;
                    if(otherPlayerBody != null) {
                        if(otherPlayerBody.position.distanceTo(Utility.ThreeVec3ToCannonVec3(b.group.position)) < 1) {
                            this.generateRandomExplosion(b.group.position);

                            b.removeLight();
                            this.remove(b.group);

                            this.bullets.splice(i, 1);
                            i--;                        
                        }
                    }
                }
                    
                /*
                for(let j = 0; j < this.targets.length; j++) {
                    const target = this.targets[j];
                    if(target.position.distanceToSquared(b.group.position) < 0.05) {

                        this.generateRandomExplosion(b.group.position);

                        b.removeLight();
                        this.remove(b.group);

                        this.bullets.splice(i, 1);
                        i--;

                        target.visible = false;
                        setTimeout(() => {
                            target.visible = true
                        }, 1000);                        
                    }
                }
                */
            }
        }
    }

    private checkProjectilesForCollision() { 
        this.projectiles.forEach(projectile => {
            if(projectile.shouldRemove) {
                projectile.kill();
                this.remove(projectile.mesh);                
            }
            else {
                this.allPlayers.forEach(player => {
                    if(player.getPosition().distanceTo(projectile.getPosition()) < 1){
                        this.generateRandomExplosion(projectile.getPosition());
                        projectile.kill();
                        this.remove(projectile.mesh);
                    }
                })
            }
            
        });
    }

    update() {
        if(this.world != null)
            this.world.fixedStep();

        this.updateInput();
        this.updateBullets();
        

        this.ground?.update();
        this.cube?.update();
        this.cube2?.update();
        this.sphere?.update();
        this.cylinder?.update();

        this.vehiclePlayer1?.update();
        this.vehiclePlayer2?.update();
        this.vehiclePlayer3?.update();
        this.vehiclePlayer4?.update();

        this.raycastVehicleObject?.update();
        this.rigidVehicleObject?.update();

        this.cubes.forEach(x => x.update());

        this.projectiles.forEach(x => x.update());
        this.checkProjectilesForCollision();

        if(this.cube != null) 
        {
            //this.spotlight?.setPosition(this.cube?.mesh.position);
        }

        this.spotlight?.update();

        this.explosions.forEach(x => {
            x.update();
        });
        this.explosions = this.explosions.filter(x => x.isActive);
       
        this.stats.update();
    }
}