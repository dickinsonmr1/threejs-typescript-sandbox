import * as THREE from 'three';

export default class EmergencyLights {

    mesh1: THREE.Mesh;
    mesh2: THREE.Mesh;
    group: THREE.Group = new THREE.Group();
    /**
     *
     */
    constructor(scene: THREE.Scene, leftLightOffset: THREE.Vector3, rightLightOffset: THREE.Vector3) {        

        const meshMaterialRed = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShaderRed(),
            transparent: true, // Enable transparency,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });

        const meshMaterialBlue = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShaderBlue(),
            transparent: true, // Enable transparency,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        this.mesh1 = new THREE.Mesh(
            //new THREE.CylinderGeometry(0.1, 0.2, 0.5, 16),    
            new THREE.SphereGeometry(0.25),
            meshMaterialRed
        );
        this.mesh1.position.copy(leftLightOffset);// .set(1.15, 0.15, -0.3);        
        this.mesh1.rotateOnAxis(new THREE.Vector3(0, 1, 0), 3 * Math.PI / 2);
        this.mesh1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.mesh1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);        
        this.group.add(this.mesh1);

        this.mesh2 = new THREE.Mesh(
            //new THREE.CylinderGeometry(0.1, 0.2, 0.5, 16),    
            new THREE.SphereGeometry(0.25),
            meshMaterialBlue
        );
        this.mesh2.position.copy(rightLightOffset); // .set(1.15, 0.15, 0.3);        
        this.mesh2.rotateOnAxis(new THREE.Vector3(0, 1, 0), 3 * Math.PI / 2);
        this.mesh2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.mesh2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        this.group.add(this.mesh2);

        scene.add(this.group);
    }

    update(position: THREE.Vector3, quaternion: THREE.Quaternion) {
        this.group.position.set(position.x, position.y, position.z);
        //this.group.quaternion.copy(quaternion);
        this.group.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 32);        
        //this.mesh1.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 32);        
        //this.mesh2.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 32);        
    }

    setVisible(isVisible: boolean) {
        this.group.visible = isVisible;
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
    fragmentShaderRed() {
        return `
            varying vec3 vPosition;
            void main()
            {
                // Map the y position to a 0-1 range for alpha
                //float alpha =  vPosition.x / 5.0 + 0.05;
                float alpha =  vPosition.z + 0.1;
                gl_FragColor = vec4(1.0, 0.0, 0.0, alpha);
            }
            `
    }

     // Fragment shader
     fragmentShaderBlue() {
        return `
            varying vec3 vPosition;
            void main()
            {
                // Map the y position to a 0-1 range for alpha
                //float alpha =  vPosition.x / 5.0 + 0.05;
                float alpha =  vPosition.z + 0.1;
                gl_FragColor = vec4(0.0, 0.0, 1.0, alpha);
            }
            `
    }
}