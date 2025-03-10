import * as THREE from "three";

export class Shield {
        
    private shieldMesh: THREE.Mesh;

    constructor(scene: THREE.Scene, position: THREE.Vector3) {

        const meshMaterialBlue = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShaderBlue(),
            transparent: true, // Enable transparency,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });        

        /*
        var meshMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('blue'),
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.1        
        });
        */
       
        this.shieldMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.25, 16, 16),            
            meshMaterialBlue
        );

        this.shieldMesh.position.copy(position);    
        scene.add(this.shieldMesh);        
    }

    updatePosition(position: THREE.Vector3) {
        this.shieldMesh.position.copy(position)
        this.shieldMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 64);   
    }

    setVisible(isVisible: boolean) {
        this.shieldMesh.visible = isVisible;
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
     fragmentShaderBlue() {
        return `
            varying vec3 vPosition;
            void main()
            {
                // Map the y position to a 0-1 range for alpha
                //float alpha = vPosition.x / 5.0 + 0.05;
                //float alpha = vPosition.y + 0.1;
                //float alpha = 0;
                
                //if (vPosition.x > 0.1)
                float alpha = abs(vPosition.x) - 0.5;
                //if (vPosition.x < 0.1)
                 //alpha = vPosition.x - 0.1;
                gl_FragColor = vec4(0.0, 0.0, 1.0, alpha);
            }
            `
    }
}