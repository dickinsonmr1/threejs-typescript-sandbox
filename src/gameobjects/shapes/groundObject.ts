import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";


export class GroundObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;

    meshMaterial?: THREE.Material;
    physicsMaterial?: CANNON.Material;

    grid?: THREE.GridHelper;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number,
        color: number = 0xffffff,
        meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material) {

            /*
        this.meshMaterial = meshMaterial ?? new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true
        })
        */

        // https://sbcode.net/threejs/displacmentmap/
        const displacementMap = new THREE.TextureLoader().load('assets/displacement-map.png');
        const normalMap = new THREE.TextureLoader().load('assets/normal-map.png');
        
        const planeSize = 40;
 
        const loader = new THREE.TextureLoader();
        const texture = loader.load('assets/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        //this.meshMaterial = new THREE.MeshPhongMaterial();
        //var temp = this.meshMaterial as THREE.MeshPhongMaterial;
        //temp.displacementMap = displacementMap;

        this.meshMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            displacementMap: displacementMap,
            displacementScale: 2,
            color: color,
            fog: true,
            normalMap: normalMap,
            depthTest: true            
        });
        
        
        
        if(world != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();
                        
            /*
            this.body = new CANNON.Body({
                shape: new CANNON.Plane(),
                type: CANNON.Body.STATIC,
                material: this.physicsMaterial,
                mass: 0
            });
            */
            const groundShape = new CANNON.Plane();
            this.body = new CANNON.Body({
                mass: 0,
                type: CANNON.Body.STATIC,
                material:
                this.physicsMaterial});
            this.body.addShape(groundShape);            
            //this.body.position.set(0, 0, -width);
            this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
            world.addBody(this.body)
        }

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width, 100, 100),
            this.meshMaterial
        );
        this.mesh.position.setX(height / 2);
        this.mesh.position.setY(0);
        this.mesh.position.setZ(-width);
        this.mesh.rotation.x = - Math.PI / 2;

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;  
        
        scene.add(this.mesh);
                
        let grid = new THREE.GridHelper( height, 10, 0xffffff, 0xffffff );
        grid.material.opacity = 1;
        grid.material.transparent = false;
        scene.add( grid );
    }
    
    getPhysicsMaterial(): CANNON.Material {
        
        if(this.physicsMaterial != null)
            return this.physicsMaterial;
        else
            throw new Error("No physics material set!")
    }

    getPosition() {
        return this.mesh?.position;
    }

    update() {
        if(this.body != null) {
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}