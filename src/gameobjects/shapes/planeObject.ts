import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
export class PlaneObject {
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
        //meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material) {
            
        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true
        });

        // https://sbcode.net/threejs/displacmentmap/
        const displacementMap = new THREE.TextureLoader().load('assets/heightmap_64x64.png');
        const normalMap = new THREE.TextureLoader().load('assets/normal-map.png');
        
        const planeSize = 40;
 
        const loader = new THREE.TextureLoader();
        //const texture = loader.load('assets/checker.png');
        const texture = loader.load('assets/tileable_grass_00.png');
        const texture2 = loader.load('assets/tileable_grass_01.png');
        const texture3 = loader.load('assets/stone 03.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        //this.meshMaterial = new THREE.MeshPhongMaterial();
        //var temp = this.meshMaterial as THREE.MeshPhongMaterial;
        //temp.displacementMap = displacementMap;

        var material = new THREE.ShaderMaterial({
            uniforms: {
                grassTexture: { value: texture },
                rockTexture: { value: texture2 },
                snowTexture: { value: texture3 },
                //displacementMap: { value: displacementMap },
            },
            vertexShader: this.vertexShader1(),
            fragmentShader: this.fragmentShader1(),
        });
        this.meshMaterial = material;
        
        /*
        this.meshMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            displacementMap: displacementMap,
            displacementScale: 2,
            //color: color,
            fog: true,
            normalMap: displacementMap,
            //bumpMap: displacementMap,
            lightMap: displacementMap,
            lightMapIntensity: 2,
            depthTest: true            
        });
        */        
                    
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
            this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            //this.body.position.set(10, 20, 10);
            world.addBody(this.body);
        }

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width, 100, 100),
            this.meshMaterial
        );

        this.mesh.position.set(0, 0, 0.5);
        this.mesh.rotation.x = - Math.PI / 2;
        this.mesh.rotation.z = Math.PI / 2;

        this.mesh.scale.set(5, 5, 5);
        /*
        this.mesh.position.setX(height / 2);
        this.mesh.position.setY(0);
        this.mesh.position.setZ(-width);
        */

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;  

        const uv = this.mesh.geometry.getAttribute('uv');
        const position = this.mesh.geometry.getAttribute('position');

        console.log(position.count); // 4 ( the are points or vertices )
        console.log(position.array.length); // 12 ( x, y, and z for each point )
        // THE UV ATTRIBUTE
        console.log(uv.count); // 4 ( the are points or vertices )
        console.log(uv.array.length); // 8 ( there is a u and v value for each point )

        scene.add(this.mesh)
                
        let grid = new THREE.GridHelper( height, 10, 0xffffff, 0xffffff );
        grid.material.opacity = 1;
        grid.material.transparent = false;
        scene.add( grid );

        //if(world != null)
            //this.generateHeightfieldv2(scene, world);
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

    vertexShader1() {
        return `
		// vertexShader
		varying vec2 vUv;
		
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
        `;
    }

    fragmentShader1() {
        return `
        // fragmentShader
		uniform sampler2D grassTexture;
		uniform sampler2D rockTexture;
		uniform sampler2D snowTexture;
		
		varying vec2 vUv;
		
		void main() {
			vec4 grassColor = texture2D(grassTexture, vUv);
			vec4 rockColor = texture2D(rockTexture, vUv);
			vec4 snowColor = texture2D(snowTexture, vUv);
		
			// You can implement texture splatting logic here to blend textures based on terrain attributes
		
			// For simplicity, let's just blend based on height
			float height = texture2D(grassTexture, vUv).r * 0.3 + texture2D(rockTexture, vUv).r * 0.5 + texture2D(snowTexture, vUv).r * 0.2;
			if (height < 0.5) {
				gl_FragColor = mix(grassColor, rockColor, height * 2.0);
			} else {
				gl_FragColor = mix(rockColor, snowColor, (height - 0.5) * 2.0);
			}
		}
        `;
    }
}