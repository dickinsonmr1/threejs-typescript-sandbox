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
}