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
        //const displacementMap = new THREE.TextureLoader().load('assets/heightmaps/heightmapSS_480.png');
        const normalMap = new THREE.TextureLoader().load('assets/normal-map.png');
        
        const planeSize = 40;
        const repeats = planeSize / 2;

        const loader = new THREE.TextureLoader();

        //const texture = loader.load('assets/checker.png');
        const texture = loader.load('assets/tileable_grass_00.png');                
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(repeats, repeats);

        const texture2 = loader.load('assets/tileable_grass_01.png');
        texture2.wrapS = THREE.RepeatWrapping;
        texture2.wrapT = THREE.RepeatWrapping;
        texture2.magFilter = THREE.NearestFilter;
        texture2.colorSpace = THREE.SRGBColorSpace;
        texture2.repeat.set(repeats, repeats);

        const texture3 = loader.load('assets/stone 3.png');
        texture3.wrapS = THREE.RepeatWrapping;
        texture3.wrapT = THREE.RepeatWrapping;
        texture3.magFilter = THREE.NearestFilter;
        texture3.colorSpace = THREE.SRGBColorSpace;
        texture3.repeat.set(repeats, repeats);

        const texture4 = loader.load('assets/snow.png');
        texture4.wrapS = THREE.RepeatWrapping;
        texture4.wrapT = THREE.RepeatWrapping;
        texture4.magFilter = THREE.NearestFilter;
        texture4.colorSpace = THREE.SRGBColorSpace;
        texture4.repeat.set(repeats, repeats);

        //this.meshMaterial = new THREE.MeshPhongMaterial();
        //var temp = this.meshMaterial as THREE.MeshPhongMaterial;
        //temp.displacementMap = displacementMap;

        var material = new THREE.ShaderMaterial({
            uniforms: {
                level1Texture: { value: texture },
                level2Texture: { value: texture2 },
                level3Texture: { value: texture3 },
                level4Texture: { value: texture3 },
                level5Texture: { value: texture4 },
                displacementMap: { value: displacementMap },
                displacementScale: {value: 2},
                lightMap: { value: displacementMap }
            },
            vertexShader: this.vertexShader3(),
            fragmentShader: this.fragmentShader3(),
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

    vertexShader2() {
        return `
        // vertexShader
        varying vec2 vUv;
        varying float displacement;

        void main() {
            vUv = uv;
            vec3 newPosition = position + normal * texture2D(displacementMap, uv).r * 0.5; // Displacement mapping
            displacement = newPosition.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
        `;
    }

    fragmentShader2() {
        return `
        // fragmentShader
        uniform sampler2D grassTexture;
        uniform sampler2D rockTexture;
        uniform sampler2D snowTexture;

        varying vec2 vUv;
        varying float displacement;

        void main() {
            vec4 grassColor = texture2D(grassTexture, vUv);
            vec4 rockColor = texture2D(rockTexture, vUv);
            vec4 snowColor = texture2D(snowTexture, vUv);

            // Texture splatting based on displacement
            if (displacement < 0.2) {
                gl_FragColor = mix(grassColor, rockColor, (displacement - 0.1) * 5.0);
            } else if (displacement < 0.4) {
                gl_FragColor = mix(rockColor, snowColor, (displacement - 0.3) * 5.0);
            } else {
                gl_FragColor = snowColor;
            }
        }
        `;
    }

    vertexShader3() {
        return `
        uniform sampler2D displacementMap;
        uniform float displacementScale;

        varying float vAmount;
        varying vec2 vUV;

        void main() 
        { 
            vUV = uv;
            vec4 displacementData = texture2D( displacementMap, uv );
            
            vAmount = displacementData.r; // assuming map is grayscale it doesn't matter if you use r, g, or b.
            
            // move the position along the normal
            vec3 newPosition = position + normal * displacementScale * vAmount;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        }
        `
    }

    fragmentShader3() {
        return `
        uniform sampler2D level1Texture;
        uniform sampler2D level2Texture;
        uniform sampler2D level3Texture;
        uniform sampler2D level4Texture;
        uniform sampler2D level5Texture;

        varying vec2 vUV;

        varying float vAmount;

        void main() 
        {
            vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.24, 0.26, vAmount)) * texture2D( level1Texture, vUV * 10.0 );
            vec4 sandy = (smoothstep(0.24, 0.27, vAmount) - smoothstep(0.28, 0.31, vAmount)) * texture2D( level2Texture, vUV * 10.0 );
            vec4 grass = (smoothstep(0.28, 0.32, vAmount) - smoothstep(0.35, 0.40, vAmount)) * texture2D( level3Texture, vUV * 20.0 );
            vec4 rocky = (smoothstep(0.30, 0.50, vAmount) - smoothstep(0.40, 0.70, vAmount)) * texture2D( level4Texture, vUV * 20.0 );
            vec4 snowy = (smoothstep(0.50, 0.65, vAmount))                                   * texture2D( level5Texture, vUV * 10.0 );
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rocky + snowy; //, 1.0);
        }  
        `
    }
}