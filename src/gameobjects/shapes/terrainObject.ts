import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";


// TODO: combine PlaneObject and GroundObject (in progress)
export class TerrainObject {
    
    //displacementMesh: THREE.Mesh;
    generatedMesh: THREE.Mesh;

    body?: CANNON.Body;
    heightfieldShape!: CANNON.Heightfield;

    meshMaterial?: THREE.Material;
    physicsMaterial?: CANNON.Material;

    grid?: THREE.GridHelper;

    constructor(scene: THREE.Scene,
        height: number, width: number,
        meshMaterial: THREE.Material,
        world: CANNON.World,
        physicsMaterial: CANNON.Material,
        dataArray2D: number[][] = []) {
            
        this.meshMaterial = meshMaterial;        
        this.physicsMaterial = physicsMaterial;
        
        this.generatedMesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width, 100, 100),
            this.meshMaterial
        );

        let grid = new THREE.GridHelper( height, 10, 0xffffff, 0xffffff );
        grid.material.opacity = 1;
        grid.material.transparent = false;
        scene.add( grid );

        this.generateCannonHeightField(scene, world, 64, 64, dataArray2D);
        this.generateThreeMeshFromCannonHeightField(scene, 64, 64);
    }
    
    getPhysicsMaterial(): CANNON.Material {
        
        if(this.physicsMaterial != null)
            return this.physicsMaterial;
        else
            throw new Error("No physics material set!")
    }

    getPosition() {
        return this.generatedMesh?.position;
    }

    update() {
        if(this.body != null) {
            this.generatedMesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.generatedMesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
            this.body.updateAABB();
        }        
    }

    generateCannonHeightField(scene: THREE.Scene, world: CANNON.World, sizeX: number, sizeZ: number, dataArray2D: number[][] = []) {           
        // generate physics object
        var height = 3;        

        //const sizeX = 64;
        //const sizeZ = 64;

        var matrix: number[][] = [];

        if(dataArray2D.length > 0) {
          matrix = dataArray2D;
          for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeZ; j++) {
              matrix[i][j] *= 10;
              matrix[i][j] += 1;
            }
          }
        }
        else {
          for (let i = 0; i < sizeX; i++) {
            
            matrix.push([]);
            for (let j = 0; j < sizeZ; j++) {
              if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
                matrix[i].push(height);
                continue;
              }

              const height2 = Math.cos((i / sizeX) * Math.PI * 5) * Math.cos((j / sizeZ) * Math.PI * 5) * 2 + 2;
              matrix[i].push(height2);
            }
          }
        }

        const groundMaterial = new CANNON.Material('ground');
        this.heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 100 / sizeX,
        });

        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        heightfieldBody.addShape(this.heightfieldShape);

        heightfieldBody.position.set(
          // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
          -(sizeX * this.heightfieldShape.elementSize) / 2,
          -1,
          // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
          (sizeZ * this.heightfieldShape.elementSize) / 2
        );
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        
        world.addBody(heightfieldBody);
        this.body = heightfieldBody;
    
        // TODO: see if texture can be loaded into array to generate cannon heightfield (similiar to three.js displacement map)
        // https://threejs.org/docs/#api/en/textures/DataTexture       
    }    

    generateThreeMeshFromCannonHeightField(scene: THREE.Scene, sizeX: number, sizeZ: number) {
        // https://sbcode.net/threejs/physics-cannonDebugrenderer/
        // generate THREE mesh
        
        let points: THREE.Vector3[] = [];
        var tempGeometry = new THREE.BufferGeometry();

        var tmpVec0: CANNON.Vec3 = new CANNON.Vec3()
        var tmpVec1: CANNON.Vec3 = new CANNON.Vec3()
        var tmpVec2: CANNON.Vec3 = new CANNON.Vec3()
        //var tmpQuat0: CANNON.Quaternion = new CANNON.Quaternion()

        var shape = this.heightfieldShape;
        var v0 = tmpVec0;
        var v1 = tmpVec1;
        var v2 = tmpVec2;
        for (let xi = 0; xi < (shape as CANNON.Heightfield).data.length - 1; xi++) {
          for (let yi = 0; yi < (shape as CANNON.Heightfield).data[xi].length - 1; yi++) {
            for (let k = 0; k < 2; k++) {
              
              (shape as CANNON.Heightfield).getConvexTrianglePillar(xi, yi, k === 0);
              
              v0.copy((shape as CANNON.Heightfield).pillarConvex.vertices[0]);
              v1.copy((shape as CANNON.Heightfield).pillarConvex.vertices[1]);
              v2.copy((shape as CANNON.Heightfield).pillarConvex.vertices[2]);
              
              v0.vadd((shape as CANNON.Heightfield).pillarOffset, v0);
              v1.vadd((shape as CANNON.Heightfield).pillarOffset, v1);
              v2.vadd((shape as CANNON.Heightfield).pillarOffset, v2);

              points.push(new THREE.Vector3(v0.x, v0.y, v0.z), new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
              //const i = geometry.vertices.length - 3
              //geometry.faces.push(new THREE.Face3(i, i + 1, i + 2))
            }
          }
        }
        tempGeometry.setFromPoints(points);
        //tempGeometry.computeFaceNormals();
        tempGeometry.computeVertexNormals();
        //tempGeometry.computeTangents();
        tempGeometry.computeBoundingBox();

        var tempMesh = new THREE.Mesh(tempGeometry, this.meshMaterial);
        tempMesh.scale.set(1, 1, 1);
        tempMesh.position.set(
            // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
            -(sizeX * this.heightfieldShape.elementSize) / 2,
            -1,
            // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
            (sizeZ * this.heightfieldShape.elementSize) / 2
        );
        tempMesh.rotation.x = - Math.PI / 2;
        tempMesh.castShadow = false;
        tempMesh.receiveShadow = true;  
        
        scene.add(tempMesh);
    }

    generateSplattedMeshFromDisplacementPlane() {

    }
}