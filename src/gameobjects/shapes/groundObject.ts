import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
export class GroundObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;
    //triggerBody?: CANNON.Body;
    heightfield!: CANNON.Heightfield;

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
        physicsMaterial?: CANNON.Material,
        dataArray2D: number[][] = []) {
            
        this.meshMaterial = meshMaterial ?? new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true
        });

        // https://sbcode.net/threejs/displacmentmap/
        const displacementMap = new THREE.TextureLoader().load('assets/displacement-map.png');
        const normalMap = new THREE.TextureLoader().load('assets/normal-map.png');
        
        //var temp = normalMap.image.data;

        const planeSize = 40;
 
        const loader = new THREE.TextureLoader();
        const texture = loader.load('assets/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        //const dataTexture = new THREE.DataTextureLoader().load('assets/normal-map.png');
        //var temp = dataTexture.image.data;

        //this.meshMaterial = new THREE.MeshPhongMaterial();
        //var temp = this.meshMaterial as THREE.MeshPhongMaterial;
        //temp.displacementMap = displacementMap;

        /*
        this.meshMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            //displacementMap: displacementMap,
            //displacementScale: 2,
            color: color,
            fog: true,
            normalMap: normalMap,
            depthTest: true            
        });
        */
                  
        
        if(world != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();
                        
            
            //this.body = new CANNON.Body({
                //shape: new CANNON.Plane(),
                //type: CANNON.Body.STATIC,
                //material: this.physicsMaterial,
                //mass: 0
            //});

            /*
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
            */
        }
        
          this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width, 100, 100),
            this.meshMaterial
        );


        /*
        this.mesh.position.setX(height / 2);
        this.mesh.position.setY(0);
        this.mesh.position.setZ(-width);
        this.mesh.rotation.x = - Math.PI / 2;

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;  
        */

        //scene.add(this.mesh);
                
        let grid = new THREE.GridHelper( height, 10, 0xffffff, 0xffffff );
        grid.material.opacity = 1;
        grid.material.transparent = false;
        scene.add( grid );

        if(world != null)
            this.generateHeightfieldv2(scene, world, 64, 64, dataArray2D);
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
            this.body.updateAABB();
        }        
    }

    generateHeightfieldv2(scene: THREE.Scene, world: CANNON.World, sizeX: number, sizeZ: number, dataArray2D: number[][] = []) {           
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
        const heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 100 / sizeX,
        });

        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        heightfieldBody.addShape(heightfieldShape);

        heightfieldBody.position.set(
          // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
          -(sizeX * heightfieldShape.elementSize) / 2,
          -1,
          // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
          (sizeZ * heightfieldShape.elementSize) / 2
        );
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        
        world.addBody(heightfieldBody);
        this.body = heightfieldBody;

        /*
        this.triggerBody = new CANNON.Body({isTrigger: true});
        this.triggerBody.addShape(heightfieldShape)
        world.addBody(this.triggerBody);

        this.triggerBody.addEventListener('collide', (event: { body: any; }) => {
          if (event.body === sphereBody) {
            console.log('The sphere entered the trigger!', event)
          }
        })
        */
                
        // TODO: see if texture can be loaded into array to generate cannon heightfield (similiar to three.js displacement map)
        // https://threejs.org/docs/#api/en/textures/DataTexture


        // https://sbcode.net/threejs/physics-cannonDebugrenderer/
        // generate THREE mesh
        
        let points: THREE.Vector3[] = [];
        var tempGeometry = new THREE.BufferGeometry();

        var tmpVec0: CANNON.Vec3 = new CANNON.Vec3()
        var tmpVec1: CANNON.Vec3 = new CANNON.Vec3()
        var tmpVec2: CANNON.Vec3 = new CANNON.Vec3()
        //var tmpQuat0: CANNON.Quaternion = new CANNON.Quaternion()

        var shape = heightfieldShape;
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

        
        //alert(uv.toJSON());
        //https://dustinpfister.github.io/2021/06/09/threejs-buffer-geometry-attributes-uv/

        //var boundingBox = tempGeometry.boundingBox?.clone();

        /*
        alert('bounding box coordinates: ' + 
        '(' + boundingBox?.min.x + ', ' + boundingBox?.min.y + ', ' + boundingBox?.min.z + '), ' + 
        '(' + boundingBox?.max.x + ', ' + boundingBox?.max.y + ', ' + boundingBox?.max.z + ')' );
        *
        /
        let uvMapSize = 10;

        const uv = tempGeometry.getAttribute('uv');

        // https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
        
        //let bboxSize = tempGeometry.boundingBox?.getSize());
        //let uvMapSize = Math.min(bboxSize.x, bboxSize.y, bboxSize.z);

        //tempGeometry.computeTangents();
        //geometry.computeBoundingSphere()
        //geometry.computeFaceNormals()
        /*
        var tempMaterial = new THREE.MeshBasicMaterial({
            color: 0x007700,
            wireframe: false,
            fog: true
          });
        */

        var tempMesh = new THREE.Mesh(tempGeometry, this.meshMaterial);
        tempMesh.scale.set(1, 1, 1);
        tempMesh.position.set(
            // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
            -(sizeX * heightfieldShape.elementSize) / 2,
            -1,
            // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
            (sizeZ * heightfieldShape.elementSize) / 2
        );
        tempMesh.rotation.x = - Math.PI / 2;
        tempMesh.castShadow = false;
        tempMesh.receiveShadow = true;  
        
        //disabled for investigations on heightmap with displacement / shaders
        //scene.add(tempMesh);

        // https://dustinpfister.github.io/2022/12/09/threejs-buffer-geometry-index/

        //var group = this.bodyToMesh(heightfieldBody, new THREE.Material());
        //this.add(group);
        //demo.addVisual(heightfieldBody)
    }    
}