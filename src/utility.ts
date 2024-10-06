import * as THREE from "three";
import * as CANNON from 'cannon-es'

export class Utility {
    constructor() {

    }

    static CannonVec3ToThreeVec3(position: CANNON.Vec3): THREE.Vector3 {
        return new THREE.Vector3(position.x, position.y, position.z);
    }

    static CannonQuaternionToThreeQuaternion(quaternion: CANNON.Quaternion): THREE.Quaternion {
        return new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }

    static ThreeQuaternionToCannonQuaternion(quaternion: THREE.Quaternion): CANNON.Quaternion {
      return new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }
    
    static ThreeVec3ToCannonVec3(position: THREE.Vector3): CANNON.Vec3 {
        return new CANNON.Vec3(position.x, position.y, position.z);
    }
        
    static CannonVec3Add(position1: CANNON.Vec3, position2: CANNON.Vec3): CANNON.Vec3 {
      return new CANNON.Vec3(
        position1.x + position2.x,
        position1.y + position2.y,
        position1.z + position2.z);
    }

    static ThreeVector3Add(position1: THREE.Vector3, position2: THREE.Vector3): THREE.Vector3 {
      return new THREE.Vector3(
        position1.x + position2.x,
        position1.y + position2.y,
        position1.z + position2.z);
    }

    static ThreeVector3ToString(position: THREE.Vector3): string {
      return `(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`;
    }

    static cylinderBodyToMesh(body: CANNON.Body, material: THREE.Material, radius: number, numSegments: number): THREE.Group {
      const group = new THREE.Group()
    
      group.position.copy(Utility.CannonVec3ToThreeVec3(body.position));
      group.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(body.quaternion));
    
      const meshes = body.shapes.map((shape) => {
        //const geometry = shapeToGeometry(shape)
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, radius / 2, numSegments);
    
        return new THREE.Mesh(cylinderGeometry, material)
      })
    
      meshes.forEach((mesh, i) => {
        const offset = body.shapeOffsets[i];
        const orientation = body.shapeOrientations[i];
        mesh.position.copy(Utility.CannonVec3ToThreeVec3(offset));
        mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(orientation));
    
        group.add(mesh)
      })
    
      return group
    }

    static disposeMesh(object: THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
        } else {
            object.material.dispose();
        }
      }
    }

    static disposeSprite(sprite: THREE.Sprite) {

      if (sprite.material) {
        if (sprite.material.map) {
            sprite.material.map.dispose(); // Dispose of the texture
        }
        sprite.material.dispose(); // Dispose of the material
      }
    
      if(sprite.geometry)
        sprite.geometry.dispose();      
    }

    static disposePoints(points: THREE.Points) {

      if (points.geometry) {
        points.geometry.dispose(); // Dispose of the geometry
      }

      //if (points.material) {
          //<THREE.PointsMaterial>(points.material).dispose(); // Dispose of the material
      //}   
    }
}