import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import Bullet from '../gameobjects/bullet';
import * as CANNON from 'cannon-es'
import { GroundObject } from '../gameobjects/groundObject';
import { CubeObject } from '../gameobjects/cubeObject';
import { SphereObject } from '../gameobjects/sphereObject';
import Stats from 'three/addons/libs/stats.module.js';
import SpotlightObject from '../gameobjects/spotlightObject';
import { randFloat } from 'three/src/math/MathUtils.js';
import { PointLightObject } from '../gameobjects/pointLightObject';

export default class BlasterScene extends THREE.Scene {

    private stats: Stats = new Stats();

    private readonly mtlLoader = new MTLLoader();
    private readonly objLoader = new OBJLoader();

    private readonly camera: THREE.PerspectiveCamera;

    private readonly keyDown = new Set<string>();

    private blaster?: THREE.Group;
    private bulletMtl?: MTLLoader.MaterialCreator;
    private directionVector = new THREE.Vector3();

    private cubes: CubeObject[] = [];
    private bullets: Bullet[] = [];
    private targets: THREE.Group[] = [];

    world: CANNON.World = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.81, 0)
    });

    ground?: GroundObject;
    cube?: CubeObject;
    cube2?: CubeObject;

    sphere?: SphereObject;

    spotlight?: SpotlightObject;
    pointLight?: PointLightObject;

    //spotlight?: THREE.SpotLight;
    //spotlightHelper?: THREE.SpotLightHelper;

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

        var groundMaterial = new CANNON.Material();
        this.ground = new GroundObject(this, 100, 100, 0x444444,
            new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true }),
            this.world, groundMaterial);
        
        var objectMaterial = new CANNON.Material();
    
        this.cube = new CubeObject(this, 1,1,1, new THREE.Vector3(0, 20, -9.5), 0xffff00,
                        new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.world, objectMaterial);

        this.cube2 = new CubeObject(this, 1,1,1, new THREE.Vector3(0, 20, -8), 0xffff00,
                        new THREE.MeshPhongMaterial( { color: 0xFFFF00, depthWrite: true }),
                        this.world, objectMaterial);

        this.sphere = new SphereObject(this, 1, new THREE.Vector3(0.5, 5, -10), 0x00ff00,
                        new THREE.MeshPhongMaterial( { color: 0x00ff00, depthWrite: true }), 
                        this.world, objectMaterial);

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
        this.add(mesh);
        
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

        this.pointLight = new PointLightObject(this, new THREE.Color('white'), 0.5, 1, 0.5, new THREE.Vector3(0, 0.5, 0));

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        this.add(ambientLight);

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
			this.createBullet();
            this.generateRandomCube();
		}
        if (event.key === 'ctrl')
		{
			//this.generateRandomCube();
		}
	}

    private updateInput() {
        if(!this.blaster) {
            return;
        }

        const shiftKey = this.keyDown.has('shift');
        if(!shiftKey){
            if(this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
                this.blaster.rotateY(0.02);
            }
            else if(this.keyDown.has('d') || this.keyDown.has('arrowright')) {
                this.blaster.rotateY(-0.02);
            }
        }

        const dir = this.directionVector;

        this.camera.getWorldDirection(dir);
        const speed = 0.1;

        if(this.keyDown.has('w') || this.keyDown.has('arrowup')) {
            this.blaster.position.add(dir.clone().multiplyScalar(speed));
        }
        else if(this.keyDown.has('s') || this.keyDown.has('arrowdown')) {
            this.blaster.position.add(dir.clone().multiplyScalar(-speed));
        }

        if(shiftKey) {
            const strafeDir = dir.clone();
            const upVector = new THREE.Vector3(0, 1, 0);

            if(this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
                this.blaster.position.add(
                    strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
                        .multiplyScalar(speed)
                );
            }
            else if(this.keyDown.has('d') || this.keyDown.has('arrowright')) {
                this.blaster.position.add(
                    strafeDir.applyAxisAngle(upVector, -Math.PI * 0.5)
                        .multiplyScalar(speed)
                );
            }
        }
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
        vec.y += 0.06;

        bulletModel.position.add(
            vec.add(
                this.directionVector.clone().multiplyScalar(size.z * 0.5)
            )
        );

        // rotate children to match gun for simplicity
        bulletModel.children.forEach(child => child.rotateX(Math.PI * -0.5));

        // use the same rotation as the gun
        bulletModel.rotation.copy(this.blaster.rotation);

        this.add(bulletModel);

        const b = new Bullet(bulletModel);
        b.setVelocity(
            this.directionVector.x * 0.2,
            this.directionVector.y * 0.2,
            this.directionVector.z * 0.2
        );

        this.bullets.push(b);
    }

    private async generateRandomCube() {

        let randPosition = new THREE.Vector3(randFloat(-5, 5), randFloat(5, 15), randFloat(-5.5, -10.5));
        let randCubeSize = randFloat(0.5, 2);

        let randColor = THREE.MathUtils.randInt(0, 0xffffff)

        const cube = new CubeObject(this,
            randCubeSize, randCubeSize, randCubeSize,
            randPosition,
            randColor,
            new THREE.MeshPhongMaterial( { color: randColor, depthWrite: true }),
            this.world);

        this.cubes.push(cube);
    }

    private updateBullets() {
        for(let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];
            b.update();

            if(b.shouldRemove) {
                this.remove(b.group);
                this.bullets.splice(i, 1);
                i--;
            }
            else {
                for(let j = 0; j < this.targets.length; j++) {
                    const target = this.targets[j];
                    if(target.position.distanceToSquared(b.group.position) < 0.05) {
                        this.remove(b.group);
                        this.bullets.splice(i, 1);
                        i--;

                        target.visible = false;
                        setTimeout(() => {
                            target.visible = true
                        }, 1000);
                    }
                }
            }
        }
    }

    update() {
        // update

        if(this.world != null)
            this.world.fixedStep();

        this.updateInput();
        this.updateBullets();

        this.ground?.update();
        this.cube?.update();
        this.cube2?.update();
        this.sphere?.update();

        this.cubes.forEach(x => x.update());

        if(this.cube != null) 
        {
            //this.spotlight?.setPosition(this.cube?.mesh.position);

        }

        this.spotlight?.update();
       
        this.stats.update();
    }
}