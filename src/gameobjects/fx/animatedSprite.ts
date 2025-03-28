import * as THREE from 'three';

export class AnimatedSprite {
    private texture: THREE.Texture;
    private material: THREE.SpriteMaterial;
    private sprite: THREE.Sprite;
    private frameX: number = 0;
    private frameY: number = 0;
    private elapsedTime: number = 0;
    private isAlive: boolean = true;

    constructor(scene: THREE.Scene, texturePath: string,
            private frameCountX: number, private frameCountY: number, private frameRate: number,
            private loop: boolean,
            position: THREE.Vector3 = new THREE.Vector3(0,0,0), 
            scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)) {

        let textureLoader = new THREE.TextureLoader();
        this.texture = textureLoader.load(texturePath);
        this.texture.magFilter = THREE.NearestFilter; // Avoid blurring
        this.texture.minFilter = THREE.NearestFilter;
        
        this.material = new THREE.SpriteMaterial({ map: this.texture });
        this.sprite = new THREE.Sprite(this.material);
        this.sprite.position.copy(position);
        this.sprite.scale.copy(scale);
        
        // Set the correct UV scale for one frame
        this.texture.repeat.set(1 / this.frameCountX, 1 / this.frameCountY);

        this.isAlive = true;

        scene.add(this.sprite);
    }

    setScale(position: THREE.Vector3) {
        this.sprite.scale.copy(position);
    }

    setPosition(position: THREE.Vector3) {
        this.sprite.position.copy(position);
    }

    getSprite(): THREE.Sprite {
        return this.sprite;
    }

    update(deltaTime: number): void {

        if(this.isAlive) {
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

                // if(!this.loop)
                // this.kill();
                this.texture.offset.set(this.frameX / this.frameCountX, 1 - (this.frameY + 1) / this.frameCountY);
            }
        }
    }

    kill() {
        this.isAlive = false;
    }
}
