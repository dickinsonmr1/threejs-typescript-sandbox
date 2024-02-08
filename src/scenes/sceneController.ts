
import GameScene from "./gameScene";
import HudScene from "./hudScene";
import { GamePadEnums } from "./gamePadEnums";

export default class SceneController {
    gameScene?: GameScene;
    hudScene?: HudScene;

    gamepad!: Gamepad;
    gamepadPrevious!: Gamepad;

    constructor() {

    }

    setGamePad1(gamepad: Gamepad) {
        this.gamepad = gamepad;
        this.gamepadPrevious = gamepad;
        console.log('gamepad1 assigned');
    }

    pollGamepads() {

        /*
        gamepad.BUTTONS = {
            FACE_1: 0, // Face (main) buttons
            FACE_2: 1,
            FACE_3: 2,
            FACE_4: 3,
            LEFT_SHOULDER: 4, // Top shoulder buttons
            RIGHT_SHOULDER: 5,
            LEFT_SHOULDER_BOTTOM: 6, // Bottom shoulder buttons
            RIGHT_SHOULDER_BOTTOM: 7,
            SELECT: 8,
            START: 9,
            LEFT_ANALOGUE_STICK: 10, // Analogue sticks (if depressible)
            RIGHT_ANALOGUE_STICK: 11,
            PAD_TOP: 12, // Directional (discrete) pad
            PAD_BOTTOM: 13,
            PAD_LEFT: 14,
            PAD_RIGHT: 15
        };
        
        gamepad.AXES = {
            LEFT_ANALOGUE_HOR: 0,
            LEFT_ANALOGUE_VERT: 1,
            RIGHT_ANALOGUE_HOR: 2,
            RIGHT_ANALOGUE_VERT: 3
        };
        */

        /*
        if(this.gamepad?.buttons[0].pressed)
            console.log('A pressed');
        if(this.gamepad?.buttons[1].pressed)
            console.log('B pressed');
        */  
        const gamepad = navigator.getGamepads()[0];
        if(!gamepad) return;

        this.gameScene?.player1.tryTurn(-gamepad.axes[0]);

        /*
        if(gamepad.axes[0] < -0.25) {
            this.gameScene?.player1.tryTurnLeftWithKeyboard();
        }
        else if(gamepad.axes[0] > 0.25) {
            this.gameScene?.player1.tryTurnRightWithKeyboard();
        }
        else {
            this.gameScene?.player1.tryStopTurnLeftWithKeyboard()
        }
        */
		//console.log(`Left stick at (${myGamepad.axes[0]}, ${myGamepad.axes[1]})` );
		//console.log(`Right stick at (${myGamepad.axes[2]}, ${myGamepad.axes[3]})` );


        gamepad.buttons.map(e => e.pressed).forEach((isPressed, buttonIndex) => {
            if(isPressed) {
                if(buttonIndex == GamePadEnums.RIGHT_SHOULDER_BOTTOM) {
                    console.log(`pressed: ${buttonIndex}`);
                    this.gameScene?.player1.tryAccelerateWithKeyboard();
                }
                if(buttonIndex == GamePadEnums.LEFT_SHOULDER_BOTTOM) {
                    console.log(`pressed: ${buttonIndex}`);
                    this.gameScene?.player1.tryReverseWithKeyboard();
                }
            }
            else {
                if(this.gamepadPrevious.buttons[GamePadEnums.RIGHT_SHOULDER_BOTTOM].pressed
                    && buttonIndex == GamePadEnums.RIGHT_SHOULDER_BOTTOM) {
                        console.log(`button no longer pressed: ${buttonIndex}`);
                        this.gameScene?.player1.tryStopAccelerateWithKeyboard();
                }
                if(this.gamepadPrevious.buttons[GamePadEnums.LEFT_SHOULDER_BOTTOM].pressed
                    && buttonIndex == GamePadEnums.LEFT_SHOULDER_BOTTOM) {
                        console.log(`button no longer pressed: ${buttonIndex}`);
                        this.gameScene?.player1.tryStopReverseWithKeyboard();
                }
            }
        })

        this.gamepadPrevious = gamepad;
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