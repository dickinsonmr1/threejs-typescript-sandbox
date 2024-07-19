import { Player, PlayerTeam, VehicleType } from "./player";

export class VehicleFactory {
    crosshairTexture: THREE.Texture;
    markerTexture: THREE.Texture;
    particleMaterial: THREE.SpriteMaterial;
    constructor(crosshairTexture: THREE.Texture, markerTexture: THREE.Texture, particleMaterial: THREE.SpriteMaterial) {
        
        this.crosshairTexture = crosshairTexture;
        this.markerTexture = markerTexture;
        this.particleMaterial = particleMaterial;
        
    }

    generatePlayer(scene: THREE.Scene, playerName: string, vehicleType: VehicleType, playerColor: THREE.Color) : Player {
        //isCpuPlayer: boolean, playerTeam: PlayerTeam, scene: THREE.Scene) : Player {        

        switch(vehicleType) {
            default:
                return new Player(scene, playerName, playerColor, this.crosshairTexture, this.markerTexture, this.particleMaterial)
        }
    }
}