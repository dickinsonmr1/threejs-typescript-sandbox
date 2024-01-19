import { Scene } from "three";
import GameScene from "./gameScene";
import HudScene from "./hudScene";

export default class SceneController {
    gameScene?: GameScene;
    hudScene?: HudScene;

    constructor() {

    }

    init(gameScene: GameScene, hudScene: HudScene) {
        this.gameScene = gameScene;
        this.hudScene = hudScene;
    }

    updateHealthOnHud(currentValue: number) {
        this.hudScene?.updateHealthBar(currentValue);
    }

    updateShieldOnHud(currentValue: number) {
        this.hudScene?.updateShieldBar(currentValue);
    }

    updateTurboOnHud(currentValue: number) {
        this.hudScene?.updateTurboBar(currentValue);
    }
}