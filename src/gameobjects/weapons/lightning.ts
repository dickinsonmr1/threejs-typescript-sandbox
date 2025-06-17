import * as THREE from "three";


export enum LightningType {
    Line = 0,
    CircleVertical = 1,
    CircleHorizontal = 2
}

export class Lightning {

    material: THREE.ShaderMaterial;
    mesh: THREE.Mesh;
    
    branchMeshes: THREE.Mesh[] = [];
    meshGroup: THREE.Group = new THREE.Group();

    lastStrikeTime: number = 0;
    
    constructor(scene: THREE.Scene, private lightningType: LightningType, private length: number) {                        
        
        const start = new THREE.Vector3(0, 0, 0);
        const end = new THREE.Vector3(-length, 0, 0);

        //const curve = this.generateLightningPath(start, end, 16, 0.3);
        const curve = this.lightningType == LightningType.Line
            ? this.generateLightningPath(start, end, 16, 0.3)
            : this.generateCircularLightningPath(length, 16, 0.02);

        //const lightningCylinderGeometry2 = new THREE.CylinderGeometry(0.05, 0.05, 20, 32, 32, true);
        const lightningCylinderGeometry2 = new THREE.TubeGeometry(curve, 64, 0.1, 64, true);
        //lightningCylinderGeometry2.rotateZ(Math.PI / 2); // Horizontal lightning bolt

        this.material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vPos;
                varying vec2 vUv;
                uniform float time;

                void main() {
                    vPos = position;
                    vUv = uv;

                    vec3 pos = position;

                    float freq1 = 40.0;
                    float freq2 = 70.0;

                    float amp1 = 0.05;
                    float amp2 = 0.03;

                    pos.x += sin(pos.y * freq1 + time * 20.0) * amp1;
                    pos.z += cos(pos.y * freq2 + time * 30.0) * amp2;
                    pos.y += sin(pos.y * 60.0 - time * 50.0) * 0.01;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPos;
                varying vec2 vUv;
                uniform float time;

                void main() {
                    // Flicker
                    float flicker = sin(time * 100.0 + vPos.x * 10.0) * 0.2 + 0.8;

                    // Taper edge using vUv.y (0–1 along side of cylinder)
                    float taper = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

                    // Lateral edge fade using vUv.x (around circumference)
                    float rimFade = 1.0 - abs(vUv.x - 0.5) * 2.0; // 1 in center, 0 at rim

                    // Combine for final intensity
                    float intensity = mix(0.5, 1.0, rimFade * taper) * flicker;

                    // Electric blue to white
                    vec3 color = mix(vec3(0.2, 0.6, 1.0), vec3(1.0), rimFade * taper);

                    float alpha = intensity;

                    if (alpha < 0.05) discard;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: true,
            uniforms: {
                time: { value: 0.0 },
            },
        });

        this.mesh = new THREE.Mesh(lightningCylinderGeometry2, this.material);
        //this.lightningCylinderMesh2.position.set(0, 5, 0);
        this.meshGroup.add(this.mesh);

        scene.add(this.meshGroup);
        //this.add(this.lightningCylinderMesh2);
    }

    update(scene: THREE.Scene, position: THREE.Vector3, quaternion: THREE.Quaternion): void {
        this.meshGroup.position.copy(position);
        this.meshGroup.quaternion.copy(quaternion);
        
        
        if(this.lightningType == LightningType.CircleVertical) {

        }
        else if(this.lightningType == LightningType.CircleHorizontal) {
            
            const axis = new THREE.Vector3(1, 0, 0); // e.g., Y axis
            const angle = Math.PI / 2;
            
            const additionalQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
            
            this.meshGroup.quaternion.multiply(additionalQuat); // Rotates baseQuat by the new angle 
        }

        const time = performance.now() / 1000;
        this.material.uniforms.time.value = time;

        // regenerate if enough time has elapsed
        if (time - this.lastStrikeTime > 0.03) {
            const start = new THREE.Vector3(0, 0, 0);
            const end = new THREE.Vector3(-this.length, 0, 0);
            
            const newCurve = this.lightningType == LightningType.Line
                ? this.generateLightningPath(start, end, 16, 0.3)
                : this.generateCircularLightningPath(this.length, 16, 0.02);
                        
            this.mesh.geometry.dispose();
            this.mesh.geometry = new THREE.TubeGeometry(newCurve, 64, 0.03, 8, false);

                // Remove old branches
            for (const b of this.branchMeshes) {
                this.meshGroup.remove(b);
                scene.remove(b);
                b.geometry.dispose();
            }
            this.branchMeshes.length = 0;

            // Generate new branches
            const newPoints = newCurve.getPoints(32);
            for (let i = 4; i < newPoints.length - 4; i += 8) {
                const basePoint = newPoints[i];
                const tangent = newCurve.getTangent(i / newPoints.length).normalize();
                const randDir = new THREE.Vector3(Math.random(), Math.random(), Math.random()).subScalar(0.5).normalize().cross(tangent).normalize();

                const branchCurve = this.generateBranchCurve(basePoint, randDir, 0.5 + Math.random() * 0.3);
                const branchGeometry = new THREE.TubeGeometry(branchCurve, 32, 0.015, 6, false);
                const branchMesh = new THREE.Mesh(branchGeometry, this.material);
                //this.add(branchMesh);
                this.branchMeshes.push(branchMesh);
                this.meshGroup.add(branchMesh);
            }

            this.lastStrikeTime = time;
        }
    }

    generateLightningPath(start: THREE.Vector3, end: THREE.Vector3, segments = 8, spread = 5) {
        const points: THREE.Vector3[] = [];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pos = new THREE.Vector3().lerpVectors(start, end, t);

            // Add randomness perpendicular to the path
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread
            );

            pos.add(offset);
            points.push(pos);
        }

        return new THREE.CatmullRomCurve3(points);
    }

    generateBranchCurve(basePoint: THREE.Vector3, direction: THREE.Vector3, length = 5): THREE.CatmullRomCurve3 {
        const segments = 16;
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = basePoint.clone().addScaledVector(direction, t * length);
            point.x += (Math.random() - 0.5) * 0.1;
            point.y += (Math.random() - 0.5) * 0.1;
            point.z += (Math.random() - 0.5) * 0.1;
            points.push(point);
        }

        return new THREE.CatmullRomCurve3(points);
    }

    generateCircularLightningPath(radius = 1, segments = 100, noise = 0.05) {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * noise;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const z = (Math.random() - 0.5) * noise * 2; // slight vertical offset
            points.push(new THREE.Vector3(x, y, z));
        }

        return new THREE.CatmullRomCurve3(points, true); // closed loop
    }

    spawnBranchMeshes(mainCurve: THREE.CatmullRomCurve3): void {
        
        const mainPoints = mainCurve.getPoints(32);

        for (let i = 4; i < mainPoints.length - 4; i += 8) {
            const basePoint = mainPoints[i];
            const tangent = mainCurve.getTangent(i / mainPoints.length).normalize();

            // Random direction perpendicular to main path
            const randomDir = new THREE.Vector3(
                (Math.random() - 0.5),
                (Math.random() - 0.5),
                (Math.random() - 0.5)
            ).normalize().cross(tangent).normalize();

            const branchCurve = this.generateBranchCurve(basePoint, randomDir, 0.5 + Math.random() * 0.3);
            const branchGeometry = new THREE.TubeGeometry(branchCurve, 32, 0.015, 6, false);
            const branchMesh = new THREE.Mesh(branchGeometry, this.material);
            
            this.meshGroup.add(branchMesh);
            //this.add(branchMesh);
            this.branchMeshes.push(branchMesh);
        }
    }
}