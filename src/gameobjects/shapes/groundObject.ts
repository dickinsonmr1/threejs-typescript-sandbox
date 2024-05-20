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
            //displacementMap: displacementMap,
            //displacementScale: 2,
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
        
        //scene.add(this.mesh);
                
        let grid = new THREE.GridHelper( height, 10, 0xffffff, 0xffffff );
        grid.material.opacity = 1;
        grid.material.transparent = false;
        scene.add( grid );

        if(world != null)
            this.generateHeightfieldv2(scene, world);
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

    generateHeightfield(planeMesh: THREE.Mesh, world: CANNON.World) {
        
        var height = 3;

        // 60000
        var buffer = planeMesh.geometry.getIndex()?.array;
        
        // 30603
        var position = planeMesh.geometry.getAttribute('position').array;

        // https://discourse.threejs.org/t/mesh-model-into-canon-convex-trimesh/38813/2

        /*
        const points: CANNON.Vec3[] = []
        for (let i = 0; i < position.length; i += 3) {
            points.push(new CANNON.Vec3(position[i], position[i + 1], position[i + 2]))
        }
        const faces: number[][] = []
        for (let i = 0; i < position.length / 3; i += 3) {
            faces.push([i, i + 1, i + 2])
        }
        
        //var trimesh = new CANNON.Trimesh(points, faces);
        
        var polyhedron = new CANNON.ConvexPolyhedron({
                vertices: points,
                faces: faces,
        });

        const polyhedonBody = new CANNON.Body({ mass: 1 })
        polyhedonBody.addShape(polyhedron)
        polyhedonBody.position.x = planeMesh.position.x
        polyhedonBody.position.y = planeMesh.position.y
        polyhedonBody.position.z = planeMesh.position.z

        world.addBody(polyhedonBody);
        */

        // Add the ground
        const sizeX = 64;
        const sizeZ = 64;
        var matrix: number[][] = [];
        for (let i = 0; i < sizeX; i++) {
          matrix.push([])
          for (let j = 0; j < sizeZ; j++) {
            if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
              matrix[i].push(height);
              continue;
            }

            const height2 = Math.cos((i / sizeX) * Math.PI * 5) * Math.cos((j / sizeZ) * Math.PI * 5) * 2 + 2;
            matrix[i].push(height2);
          }
        }

        const groundMaterial = new CANNON.Material('ground')
        const heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 100 / sizeX,
        })
        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial })
        heightfieldBody.addShape(heightfieldShape)
        heightfieldBody.position.set(
          // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
          -(sizeX * heightfieldShape.elementSize) / 2,
          -1,
          // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
          (sizeZ * heightfieldShape.elementSize) / 2
        )
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(heightfieldBody)
    }

    generateHeightfieldv2(scene: THREE.Scene, world: CANNON.World) {
        
        // generate physics object
        var height = 3;        
        const sizeX = 64;
        const sizeZ = 64;
        var matrix: number[][] = [];
        for (let i = 0; i < sizeX; i++) {
          matrix.push([])
          for (let j = 0; j < sizeZ; j++) {
            if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
              matrix[i].push(height);
              continue;
            }

            const height2 = Math.cos((i / sizeX) * Math.PI * 5) * Math.cos((j / sizeZ) * Math.PI * 5) * 2 + 2;
            matrix[i].push(height2);
          }
        }

        const groundMaterial = new CANNON.Material('ground')
        const heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 100 / sizeX,
        })
        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial })
        heightfieldBody.addShape(heightfieldShape)
       heightfieldBody.position.set(
          // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
          -(sizeX * heightfieldShape.elementSize) / 2,
          -1,
          // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
          (sizeZ * heightfieldShape.elementSize) / 2
        ) 
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(heightfieldBody);

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
              ;(shape as CANNON.Heightfield).getConvexTrianglePillar(xi, yi, k === 0)
              v0.copy((shape as CANNON.Heightfield).pillarConvex.vertices[0])
              v1.copy((shape as CANNON.Heightfield).pillarConvex.vertices[1])
              v2.copy((shape as CANNON.Heightfield).pillarConvex.vertices[2])
              v0.vadd((shape as CANNON.Heightfield).pillarOffset, v0)
              v1.vadd((shape as CANNON.Heightfield).pillarOffset, v1)
              v2.vadd((shape as CANNON.Heightfield).pillarOffset, v2)
              points.push(new THREE.Vector3(v0.x, v0.y, v0.z), new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z))
              //const i = geometry.vertices.length - 3
              //geometry.faces.push(new THREE.Face3(i, i + 1, i + 2))
            }
          }
        }
        tempGeometry.setFromPoints(points);
        //geometry.computeBoundingSphere()
        //geometry.computeFaceNormals()
        var tempMaterial = new THREE.MeshBasicMaterial({
            color: 0x007700,
            wireframe: false,
            fog: true
          });

        var tempMesh = new THREE.Mesh(tempGeometry, tempMaterial);
        tempMesh.scale.set(1, 1, 1);
        tempMesh.position.set(
            // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
            -(sizeX * heightfieldShape.elementSize) / 2,
            -1,
            // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
            (sizeZ * heightfieldShape.elementSize) / 2
        );
        tempMesh.rotation.x = - Math.PI / 2;
        tempMesh.castShadow = true;
        tempMesh.receiveShadow = false;  
        
        scene.add(tempMesh);

        // https://dustinpfister.github.io/2022/12/09/threejs-buffer-geometry-index/

        //var group = this.bodyToMesh(heightfieldBody, new THREE.Material());
        //this.add(group);
        //demo.addVisual(heightfieldBody)
    }
    
    addHeightField(world: CANNON.World) {
        
        var height = 3;

        // Add the ground
        const sizeX = 64;
        const sizeZ = 64;
        var matrix: number[][] = [];
        for (let i = 0; i < sizeX; i++) {
          matrix.push([])
          for (let j = 0; j < sizeZ; j++) {
            if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
              matrix[i].push(height);
              continue;
            }

            const height2 = Math.cos((i / sizeX) * Math.PI * 5) * Math.cos((j / sizeZ) * Math.PI * 5) * 2 + 2;
            matrix[i].push(height2);
          }
        }

        const groundMaterial = new CANNON.Material('ground')
        const heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 100 / sizeX,
        })
        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial })
        heightfieldBody.addShape(heightfieldShape)
        heightfieldBody.position.set(
          // -((sizeX - 1) * heightfieldShape.elementSize) / 2,
          -(sizeX * heightfieldShape.elementSize) / 2,
          -1,
          // ((sizeZ - 1) * heightfieldShape.elementSize) / 2
          (sizeZ * heightfieldShape.elementSize) / 2
        )
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(heightfieldBody)

        //var group = this.bodyToMesh(heightfieldBody, new THREE.Material());
        //this.add(group);
        //demo.addVisual(heightfieldBody)
    }

    /*
    bodyToMesh(body: CANNON.Body, material: THREE.Material): THREE.Group {
        const group = new THREE.Group()
      
        group.position.copy(Utility.CannonVec3ToThreeVec3(body.position));
        group.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(body.quaternion));
      
        const meshes = body.shapes.map((shape) => {       
          const geometry = this.heightFieldToThreeGeometry(shape);      
          return new THREE.Mesh(geometry, material);
        });
      
        meshes.forEach((mesh, i) => {
          const offset: CANNON.Vec3 = body.shapeOffsets[i];
          const orientation: CANNON.Quaternion = body.shapeOrientations[i];
          mesh.position.copy(Utility.CannonVec3ToThreeVec3(offset));
          mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(orientation));
      
          group.add(mesh);
        })
      
        return group;
      }
    */
   /*
    heightFieldToThreeGeometry(heightField: CANNON.Shape): THREE.Group {
        const geometry = new THREE.BufferGeometry();
        
        const v0 = new CANNON.Vec3()
        const v1 = new CANNON.Vec3()
        const v2 = new CANNON.Vec3()

        const shape = heightField as CANNON.Heightfield;

        var group = new THREE.Group();

        for (let xi = 0; xi < shape.data.length - 1; xi++) {
            for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
                for (let k = 0; k < 2; k++) {
                    shape.getConvexTrianglePillar(xi, yi, k === 0)
                    v0.copy(shape.pillarConvex.vertices[0]);
                    v1.copy(shape.pillarConvex.vertices[1]);
                    v2.copy(shape.pillarConvex.vertices[2]);

                    v0.vadd(shape.pillarOffset, v0);
                    v1.vadd(shape.pillarOffset, v1);
                    v2.vadd(shape.pillarOffset, v2);

                    
                    geometry.vertices.push(
                        new THREE.Vector3(v0.x, v0.y, v0.z),
                        new THREE.Vector3(v1.x, v1.y, v1.z),
                        new THREE.Vector3(v2.x, v2.y, v2.z)
                    );                    

                    // https://dustinpfister.github.io/2018/04/14/threejs-geometry/

                    const vertices = new Float32Array( [
                            v0.x, v0.y, v0.z,
                            v1.x, v1.y, v1.z,
                            v2.x, v2.y, v2.z
                         ] );

                    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
                    
                    
                    //const i = geometry.vertices.length - 3;                    
                    //geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
                    
                    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
                    const mesh = new THREE.Mesh( geometry, material );

                    group.add(mesh);
                }
            }
        }
        */
        /*
        geometry.computeBoundingSphere()

        //if (flatShading) {
        //    geometry.computeFaceNormals();
        //}
        //else {
            geometry.computeVertexNormals();
        //}

        return geometry;
        */

        //return group;
    //}    
}