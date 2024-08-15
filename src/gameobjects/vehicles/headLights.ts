import * as THREE from 'three';

export default class Headlights {

    mesh1: THREE.Mesh;
    mesh2: THREE.Mesh;
    group: THREE.Group = new THREE.Group();
    /**
     *
     */
    constructor(scene: THREE.Scene, leftHeadlightOffset: THREE.Vector3, rightHeadlightOffset: THREE.Vector3) {        
        /*let meshMaterial = new THREE.MeshBasicMaterial({
            color: 'white',
            //side: THREE.DoubleSide,
            wireframe: false,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.05
        });
        */

        const meshMaterial = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true, // Enable transparency,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        this.mesh1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.6, 3, 16),    
            meshMaterial
        );
        
        // gltf
        //this.mesh1.position.set(-0.25, 0, -1.5);        
        //this.mesh1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        //this.mesh1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);        

        // rigid body vehicle
        this.mesh1.position.copy(leftHeadlightOffset);
        this.mesh1.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.mesh1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.mesh1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);        
        this.group.add(this.mesh1);

        this.mesh2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.6, 3, 16),    
            meshMaterial
        );
        
        // gltf
        //this.mesh2.position.set(0.25, 0, -1.5);        
        //this.mesh2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        //this.mesh2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

        // rigid body vehicle
        this.mesh2.position.copy(rightHeadlightOffset);
        this.mesh2.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.mesh2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.mesh2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.group.add(this.mesh2);

        scene.add(this.group);
    }

    update(position: THREE.Vector3, quaternion: THREE.Quaternion) {
        this.group.position.set(position.x, position.y, position.z);
        this.group.quaternion.copy(quaternion);
    }

    // Vertex shader
    vertexShader() {    
        return `
            varying vec3 vPosition;
            void main()
            {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `
    }


    // Fragment shader
    fragmentShader() {
        return `
            varying vec3 vPosition;
            void main()
            {
                // Map the y position to a 0-1 range for alpha
                //float alpha =  vPosition.x / 5.0 + 0.05;
                float alpha =  vPosition.y  * 0.5;
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
            }
            `
    }
}