import * as THREE from "three";
import HealthBar from "./healthBar";

export default class MeshHealthBar {
    barMesh: THREE.Mesh;
    outlineMesh: THREE.Mesh;

    barMaterial: THREE.MeshBasicMaterial;
    outlineMaterial: THREE.MeshBasicMaterial;

    group: THREE.Group = new THREE.Group();


    static maxWidth: number = 150;
    static maxHeight: number = 20;
    static borderWidth: number = 2;

    private readonly maxValue: number;
    private currentValue: number;

    constructor(scene: THREE.Scene, maxValue: number, private overrideColor?: THREE.Color) {

        this.maxValue = maxValue;
        this.currentValue = this.maxValue;

        if(overrideColor != null)
            this.overrideColor = overrideColor;

        const outlineGeometry = new THREE.PlaneGeometry(
            MeshHealthBar.maxWidth + MeshHealthBar.borderWidth*2,
            MeshHealthBar.maxHeight + MeshHealthBar.borderWidth*2
        );
        this.outlineMaterial = new THREE.MeshBasicMaterial({
            color: 'grey',
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        this.outlineMesh = new THREE.Mesh(outlineGeometry, this.outlineMaterial);
        this.group.add(this.outlineMesh);

        // Health bar foreground (actual health)
        const barGeometry = new THREE.PlaneGeometry(MeshHealthBar.maxWidth, MeshHealthBar.maxHeight);
        this.barMaterial = new THREE.MeshBasicMaterial({
            color: overrideColor ?? 'green',
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        this.barMesh = new THREE.Mesh(barGeometry, this.barMaterial);
        this.group.add(this.barMesh);

        scene.add(this.group);
    }
    
    updateValue(value: number): void {

        let oldValue = this.currentValue;
        this.currentValue = value;

        if(this.currentValue <= 0) {
            
            this.barMesh.visible = false;
            this.outlineMesh.visible = false;
            return;
        }
        else if(this.currentValue > 0 && oldValue <= 0) {
            this.barMesh.visible = true;
            this.outlineMesh.visible = true;
        };

        this.barMesh.scale.x =  this.calculateCurrentHealthBarWidth();
        
        if(!this.overrideColor) {
            if(this.currentValue > 0.5 * this.maxValue) {
                this.barMaterial.color.set(new THREE.Color('green'));
            }
            else if(this.currentValue <= 0.5 * this.maxValue &&
                this.currentValue > 0.2 * this.maxValue) {
                    this.barMaterial.color.set(new THREE.Color('yellow'));
            }
            else if(this.currentValue <= 0.2 * this.maxValue) {
                    this.barMaterial.color.set(new THREE.Color('red'));
            }
        }
    }


    private calculateCurrentHealthBarWidth(): number {
        return (this.currentValue / this.maxValue) * HealthBar.maxWidth;
    }

    /*
    update(position: THREE.Vector3) {

        this.group.position.set(
            position.x ,
            position.y,
            position.z
        );            
    }
    */

    updateHealthBarPosition(orthoCamera: THREE.OrthographicCamera, objectPosition: THREE.Vector3, gameCamera: THREE.Camera) {//targetObject: THREE.Object3D) {
        const position = objectPosition.clone();
        position.y += 1.0; // offset above object
    
        const projected = position.project(gameCamera);

        // 3. Check if the object is on screen
        const isOnScreen =
            projected.x >= -1 && projected.x <= 1 &&
            projected.y >= -1 && projected.y <= 1 &&
            projected.z >= -1 && projected.z <= 1;

        this.barMesh.visible = isOnScreen;
        this.outlineMesh.visible = isOnScreen;
        if(!isOnScreen)
            return;
    
        const x = (position.x * 0.5 + 0.5) * window.innerWidth;
        const y = ((position.y * 0.5) + 0.5) * window.innerHeight;
    
        const hudX = x - window.innerWidth / 2;
        const hudY = y - window.innerHeight / 2;
    
        this.outlineMesh.position.set(hudX, hudY, 0);
        this.barMesh.position.set(hudX, hudY, 0);
    }
    
    setVisible(isVisible: boolean) {
        this.group.visible = isVisible;
    }
}