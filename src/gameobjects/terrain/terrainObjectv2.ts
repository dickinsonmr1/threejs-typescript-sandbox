import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
import { TextureToArray } from "../shapes/textureToArray";
import { WorldConfig } from "../world/worldConfig";


export class TerrainObjectv2 {
    
    body?: CANNON.Body;
    heightfieldShape!: CANNON.Heightfield;
    physicsMaterial?: CANNON.Material;

    generatedMesh: THREE.Mesh;
    grid?: THREE.GridHelper;

    displacementMesh?: THREE.Mesh;

    fog: THREE.Fog;

    constructor(scene: THREE.Scene,
        meshMaterial: THREE.Material,
        world: CANNON.World,
        physicsMaterial: CANNON.Material,
        heightMapTextureAsArray: TextureToArray,
        heightFactor: number,
        worldConfig: WorldConfig) {
            
        // important: width and height used in this class need to match dimensions of heightmap!
        var height = heightMapTextureAsArray.getImageHeight();
        var width = heightMapTextureAsArray.getImageWidth();

        this.physicsMaterial = physicsMaterial;
        
        this.generatedMesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width, 100, 100),
            meshMaterial
        );

        this.fog = scene.fog as THREE.Fog;

        let grid = new THREE.GridHelper( height, 10, 0xffffff, 0xffffff );
        grid.material.opacity = 1;
        grid.material.transparent = false;
        scene.add( grid );
              
        // physics object and mesh generated directly from physics object
        var dataArray2D = heightMapTextureAsArray.getArray();
        this.body = this.generateCannonHeightField(world, height, width, heightFactor, dataArray2D);        

        const planeSize = width * 2;
        var geometry = this.generateMeshFromHeightData(height, width, dataArray2D);
        var material = this.generateMaterialv2(
            planeSize,
            heightFactor,
            worldConfig
        );

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = Math.PI / 2;
        scene.add(mesh);        
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

    generateCannonHeightField(world: CANNON.World, sizeX: number, sizeZ: number, heightFactor: number, dataArray2D: number[][] = []): CANNON.Body {           

      // generate physics object
        var matrix: number[][] = [];

        // scale by heightFactor
        if(dataArray2D.length > 0) {
          matrix = dataArray2D;
          for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeZ; j++) {
              matrix[i][j] *= heightFactor;              
            }
          }
        }
        
        const groundMaterial = new CANNON.Material('ground');
        this.heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 1
        });

        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial, isTrigger: false });
        heightfieldBody.addShape(this.heightfieldShape);

        heightfieldBody.position.set(
          -(sizeX * this.heightfieldShape.elementSize) / 2,
          0,
          (sizeZ * this.heightfieldShape.elementSize) / 2
        );
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        
        world.addBody(heightfieldBody);

        heightfieldBody.addEventListener('collide', (event: any) => {
          let body = <CANNON.Body>event.body;
          //console.log('body collided with terrain', event);
        });

        return heightfieldBody;
    }    

    generateMaterialv2(planeSize: number, heightFactor: number, worldConfig: WorldConfig
    ): THREE.Material {

      const repeats = planeSize / 2;
      const loader = new THREE.TextureLoader();

      const texture1 = this.loadAndConfigureTexture(loader, worldConfig.texture1, repeats);                
      const texture2 = this.loadAndConfigureTexture(loader, worldConfig.texture2, repeats);        
      const texture3 = this.loadAndConfigureTexture(loader, worldConfig.texture3, repeats);        
      const texture4 = this.loadAndConfigureTexture(loader, worldConfig.texture4, repeats);
      const texture5 = this.loadAndConfigureTexture(loader, worldConfig.texture5, repeats);

      return new THREE.ShaderMaterial({
          uniforms: {
            lowTexture: { value: texture1},
            lowMidTexture: { value: texture2 },
            midTexture: { value: texture3 },
            highMidTexture: { value: texture4 },
            highTexture: { value: texture5 },
            heightFactor: { value: heightFactor },
            fogColor: { value: this.fog?.color ?? new THREE.Color('white') },
            fogNear: { value: (this.fog as THREE.Fog)?.near ?? 10000 },
            fogFar: { value: (this.fog as THREE.Fog)?.far ?? 10000 },
          },
          fog: true,
          vertexShader: this.vertexShader4(),
          fragmentShader: this.fragmentShader4(),
      });
    }

    generateMeshFromHeightData(height: number, width: number, matrix: number[][]): THREE.PlaneGeometry {
      const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);

      // Apply the height data to the plane geometry vertices
      for (let i = 0; i < geometry.attributes.position.array.length; i += 3) {
        const x = i / 3 % width;
        const y = Math.floor(i / 3 / width);
        geometry.attributes.position.array[i + 2] = matrix[y][x];
      }
      geometry.computeVertexNormals();

      return geometry;
    }

    loadAndConfigureTexture(loader: THREE.TextureLoader, asset: string, repeats: number): THREE.Texture
    {
        const texture = loader.load(asset);                
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestMipMapLinearFilter;
        //texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(repeats, repeats);
        texture.needsUpdate = true;

        return texture;
    }

    vertexShader4() {
      return `
      varying vec3 vPosition;
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        vPosition = position;
        vUv = uv;
        
        // Calculate model-view position (required for fog)
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // Pass the fog depth (distance from the camera)
        vFogDepth = -mvPosition.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `
    }

    fragmentShader4() {
      return `

      uniform sampler2D lowTexture;
      uniform sampler2D lowMidTexture;
      uniform sampler2D midTexture;
      uniform sampler2D highMidTexture;
      uniform sampler2D highTexture;      
      
      uniform float heightFactor;

      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;

      varying vec3 vPosition;      
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        float height = vPosition.z / heightFactor; // Normalize height to 0.0 - 1.0

        vec2 repeatedUv = vUv * 10.0; // Adjust the number of repetitions here

        vec4 lowColor = texture2D(lowTexture, repeatedUv);
        vec4 lowMidColor = texture2D(lowMidTexture, repeatedUv);
        vec4 midColor = texture2D(midTexture, repeatedUv);
        vec4 highMidColor = texture2D(highMidTexture, repeatedUv);
        vec4 highColor = texture2D(highTexture, repeatedUv);

        vec4 color = mix(lowColor, lowMidColor, smoothstep(0.0, 0.25, height));
        color = mix(color, midColor, smoothstep(0.25, 0.5, height));
        color = mix(color, highMidColor, smoothstep(0.5, 0.75, height));
        color = mix(color, highColor, smoothstep(0.75, 1.0, height));

        //gl_FragColor = color;

        // Fog factor calculation (standard linear fog)
        float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

        // Mix base color with fog color based on fog factor
        gl_FragColor = vec4(mix(color.rgb, fogColor, fogFactor), color.a);
      }
        `
    }
}
