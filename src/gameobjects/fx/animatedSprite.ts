import * as THREE from 'three';

export class AnimatedSprite {
    private texture: THREE.Texture;
    private material: THREE.SpriteMaterial;
    private sprite: THREE.Sprite;
    private frameX: number = 0;
    private frameY: number = 0;
    private frameCountX: number;
    private frameCountY: number;
    private frameRate: number;
    private elapsedTime: number = 0;

    constructor(texturePath: string, frameCountX: number, frameCountY: number, frameRate: number) {
        const textureLoader = new THREE.TextureLoader();
        this.texture = textureLoader.load(texturePath);
        this.texture.magFilter = THREE.NearestFilter; // Avoid blurring
        this.texture.minFilter = THREE.NearestFilter;
        
        this.frameCountX = frameCountX;
        this.frameCountY = frameCountY;
        this.frameRate = frameRate;

        this.material = new THREE.SpriteMaterial({ map: this.texture });
        this.sprite = new THREE.Sprite(this.material);

        // Set the correct UV scale for one frame
        this.texture.repeat.set(1 / this.frameCountX, 1 / this.frameCountY);
    }

    getMesh(): THREE.Sprite {
        return this.sprite;
    }

    update(deltaTime: number): void {
        this.elapsedTime += deltaTime;

        if (this.elapsedTime > 1 / this.frameRate) {
            this.elapsedTime = 0;

            this.frameX++;
            if (this.frameX >= this.frameCountX) {
                this.frameX = 0;
                this.frameY++;
                if (this.frameY >= this.frameCountY) {
                    this.frameY = 0;
                }
            }

            this.texture.offset.set(this.frameX / this.frameCountX, 1 - (this.frameY + 1) / this.frameCountY);
        }
    }
}
