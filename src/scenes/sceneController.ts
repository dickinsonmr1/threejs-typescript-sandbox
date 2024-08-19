
import GameScene from "./gameScene";
import HudScene from "./hudScene";
import MenuScene from "./menuScene";
import { GamepadControlScheme, GamepadEnums } from "./gamePadEnums";
import { ProjectileType } from "../gameobjects/weapons/projectileType";
import nipplejs from 'nipplejs';
import { Scene } from "three";
import { VehicleType } from "../gameobjects/player/player";
import { WorldConfig } from "../gameobjects/world/worldConfig";

import arenaLevelJson from '../levelData/arena.json';
import fieldLevelJson from '../levelData/field.json';

export default class SceneController {

    arenaLevelConfig: WorldConfig = arenaLevelJson;
    fieldLevelConfig: WorldConfig = fieldLevelJson;

    menuScene?: MenuScene;
    gameScene?: GameScene;
    hudScene?: HudScene;

    currentScene?: THREE.Scene;

    gamepad!: Gamepad;
    gamepadPrevious!: Gamepad;
    gamepadControlScheme!: GamepadControlScheme;

    renderer: THREE.WebGLRenderer;

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
    }

    accelerateGamepadIndex!: number;
    brakeOrReverseGamepadIndex!: number;
    firePrimaryWeaponGamepadIndex!: number;
    fireSecondaryWeaponGamepadIndex!: number;
    fireFlameThrowerGamepadIndex!: number;

    gamePausedDivElement!: HTMLElement;
    inGameOnScreenControlsDiv!: HTMLElement;

    turboLastPressTime: number = 0;
    turboTapCount: number = 0;
    //turboIsHolding: boolean = false;

    static readonly DOUBLE_TAP_THRESHOLD: number = 250; // Max time between taps (ms)
    static readonly HOLD_THRESHOLD: number = 100; // Time to consider a hold (ms)

    setGamePad1(gamepad: Gamepad, gamepadControlScheme: GamepadControlScheme) {
        this.gamepad = gamepad;
        this.gamepadPrevious = gamepad;

        this.gamepadControlScheme = gamepadControlScheme;

        console.log('gamepad1 assigned');

        if(gamepadControlScheme == GamepadControlScheme.Racing) {
            this.accelerateGamepadIndex = GamepadEnums.RIGHT_SHOULDER_BOTTOM;
            this.brakeOrReverseGamepadIndex = GamepadEnums.LEFT_SHOULDER_BOTTOM;
            this.firePrimaryWeaponGamepadIndex = GamepadEnums.FACE_2;
            this.fireSecondaryWeaponGamepadIndex = GamepadEnums.FACE_1;
            this.fireFlameThrowerGamepadIndex = GamepadEnums.FACE_3;
        }
        else {
            this.accelerateGamepadIndex = GamepadEnums.FACE_3;
            this.brakeOrReverseGamepadIndex = GamepadEnums.FACE_1
            this.firePrimaryWeaponGamepadIndex = GamepadEnums.RIGHT_SHOULDER_BOTTOM;
            this.fireSecondaryWeaponGamepadIndex = GamepadEnums.LEFT_SHOULDER_BOTTOM;
            this.fireFlameThrowerGamepadIndex = GamepadEnums.FACE_2;
        }
    }

    getButton(name: string): HTMLElement {
        return document.getElementById(name)!;
    }

    setOnScreenControls() {
        
        // game scene buttons
        const leftButton = this.getButton('left');
        const rightButton = this.getButton('right');
        const upButton = this.getButton('up');
        const downButton = this.getButton('down');

        const primaryWeaponButton = this.getButton('primaryweapon');
        const secondaryWeaponButton = this.getButton('secondaryweapon');
        const specialWeaponButton = this.getButton('specialweapon');
        const jumpButton = this.getButton('jump');
        const turboButton = this.getButton('turbo');

        const toggleDebugButton = this.getButton('toggledebug');
        const resetButton = this.getButton('reset');

        // menu scene buttons
        const startGameLevel1Button = this.getButton('startgameLevel1');
        const startGameLevel2Button = this.getButton('startgameLevel2');
        const menuLeftButton = this.getButton('menuLeft');
        const menuRightButton = this.getButton('menuRight');

        this.gamePausedDivElement = document.getElementById('gamePausedDiv')!;
        this.inGameOnScreenControlsDiv = document.getElementById('inGameOnScreenControlsDiv')!;

        if(leftButton != null) {

            leftButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryTurnLeftWithKeyboard();
            });
            leftButton.addEventListener('touchend', () => {
                this.gameScene?.player1.tryStopTurnLeftWithKeyboard();
            });
        }

        if(rightButton != null) {
            rightButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryTurnRightWithKeyboard();
            });
            rightButton.addEventListener('touchend', () => {
                this.gameScene?.player1.tryStopTurnRightWithKeyboard();
            });
        }

        if(upButton != null) {
            upButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryAccelerateWithKeyboard();
            });
            upButton.addEventListener('touchend', () => {
                this.gameScene?.player1.tryStopAccelerateWithKeyboard();
            });
        }

        if(downButton != null) {
            downButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryReverseWithKeyboard();
            });
            downButton.addEventListener('touchend', () => {
                this.gameScene?.player1.tryStopReverseWithKeyboard();
            });            
        }

        if(primaryWeaponButton != null) {
            primaryWeaponButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryFireRocket();
            });
            primaryWeaponButton.addEventListener('touchend', () => {
                //
            });
        }

        if(secondaryWeaponButton != null) {
            secondaryWeaponButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryFireBullets();
            });
            secondaryWeaponButton.addEventListener('touchend', () => {
                //
            });
        }

        if(specialWeaponButton != null) {
            specialWeaponButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryFireFlamethrower();
            });
            specialWeaponButton.addEventListener('touchend', () => {
                //
            });
        }


        if(jumpButton != null) {
            jumpButton.addEventListener('touchstart', () => {
                this.gameScene?.player1.tryJump();
            });
        }

        if(turboButton != null) {
            turboButton.addEventListener('touchstart ', () => {
                this.gameScene?.player1.tryTurbo();
            });
        }


        if(toggleDebugButton != null) {
            toggleDebugButton.addEventListener('touchstart', () => {
                //this.gameScene?.debugDivElementManager.toggleShowHideAllElements();
                //this.hudScene?.hudDivElementManager.toggleShowHideAllElements();
            });
            toggleDebugButton.addEventListener('click', () => {
                this.gameScene?.debugDivElementManager.toggleShowHideAllElements();
                this.hudScene?.hudDivElementManager.toggleShowHideAllElements();
            });
            toggleDebugButton.addEventListener('touchend', () => {
                //this.gameScene?.debugDivElementManager.toggleShowHideAllElements();
                //this.hudScene?.hudDivElementManager.toggleShowHideAllElements();
            });
        }

        if(resetButton != null) {
            resetButton.addEventListener('touchstart', () => {
                //this.gameScene?.player1.tryResetPosition();
            });
            resetButton.addEventListener('click', () => {
                this.gameScene?.player1.tryResetPosition();
            });
            resetButton.addEventListener('touchend', () => {
                //
            });
        }

        // menu scene buttons

        if(menuLeftButton != null) {

            menuLeftButton.addEventListener('touchstart', () => {
                //this.menuScene?.selectPreviousVehicle();
            });
            menuLeftButton.addEventListener('click', () => {
                this.menuScene?.selectPreviousVehicle();
            });
            menuLeftButton.addEventListener('touchend', () => {

            });
        }
        if(menuRightButton != null) {
            menuRightButton.addEventListener('touchstart', () => {
                //this.menuScene?.selectNextVehicle();
            });
            menuRightButton.addEventListener('click', () => {
                this.menuScene?.selectNextVehicle();
            });
            menuRightButton.addEventListener('touchend', () => {

            });
        }

        if(startGameLevel1Button != null) {
            startGameLevel1Button.addEventListener('touchstart', () => {
                //this.switchToGameScene();
                //startGameButton.style.visibility = "hidden";
            });
            startGameLevel1Button.addEventListener('click', () => {
                this.switchToGameScene(this.menuScene!.getSelectedVehicleType() ?? VehicleType.Killdozer, "arena");
                startGameLevel1Button.style.visibility = "hidden";
            });
            startGameLevel1Button.addEventListener('touchend', () => {
                //
            });
        }

        if(startGameLevel2Button != null) {
            startGameLevel2Button.addEventListener('touchstart', () => {
                //this.switchToGameScene();
                //startGameButton.style.visibility = "hidden";
            });
            startGameLevel2Button.addEventListener('click', () => {
                this.switchToGameScene(this.menuScene!.getSelectedVehicleType() ?? VehicleType.Killdozer, "field");
                startGameLevel2Button.style.visibility = "hidden";
            });
            startGameLevel2Button.addEventListener('touchend', () => {
                //
            });
        }


        // static
        /*
        let joystickManager : nipplejs.JoystickManager = nipplejs.create({
            zone: document.getElementById('joystickContainerStatic')!,
            mode: 'static',
            position: { left: '20%', bottom: '20%' },
            color: 'blue',
            restOpacity: 0.75
        });
        */

        // dynamic
        let joystickManager : nipplejs.JoystickManager = nipplejs.create({
            zone: document.getElementById('joystickContainerDynamic')!,
            mode: 'dynamic',
            position: { left: '50%', top: '50%' },
            color: 'blue',
            restOpacity: 0.75
        });


        // listener to be triggered when the joystick moves
        joystickManager.on('move',  (data : nipplejs.EventData, output : nipplejs.JoystickOutputData) => {
             
            
            /*
            // get the force and don't let it be greater than 1
            let force : number = Math.min(output.force, 1);
 
            // get the angle, in radians
            let angle : number = output.angle.radian;
 
            // determine the speed, according to force and player speed
            let speed : number = GameOptions.playerSpeed * force;
 
            // set player velocity using trigonometry
            this.player.setVelocity(speed * Math.cos(angle), speed * Math.sin(angle) * -1);
            */
           this.gameScene?.player1.tryTurn(-output.vector.x);
           
            if(output.vector.y > 0.25)
                this.gameScene?.player1.tryAccelerateWithJoystick(output.vector.y);
            else if (output.vector.y < -0.25)
                this.gameScene?.player1.tryReverseWithJoystick(output.vector.y);
            else {
                this.gameScene?.player1.tryStopAccelerateWithKeyboard();           
            }
        });
 
        // listener to be triggered when the joystick stops moving
        joystickManager.on('end',  () => {
 
            // stop the player
            //this.player.setVelocity(0, 0);
            this.gameScene?.player1.tryStopAccelerateWithKeyboard();       
            this.gameScene?.player1.tryStopReverseWithKeyboard();
        })
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

        
        /*
        if(gamepad.buttons[this.brakeOrReverseGamepadIndex].pressed) {
            this.gameScene?.player1.tryTightTurn(-gamepad.axes[0]);
        }
        else 
        */
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

        // https://gabrielromualdo.com/articles/2020-12-15-how-to-use-the-html5-gamepad-api       
        
        var leftShoulderJustPressed = false;
        var rightShoulderJustPressed = false;

        this.processTurboPresses(gamepad.buttons[this.accelerateGamepadIndex], this.gamepadPrevious.buttons[this.accelerateGamepadIndex]);

        gamepad.buttons.map(e => e.pressed).forEach((isPressed, buttonIndex) => {

            if(!this.gameScene) return;

            if(isPressed && buttonIndex == GamepadEnums.START && !this.gamepadPrevious.buttons[GamepadEnums.START].pressed) {
                this.tryTogglePauseMenu();
            }

            if(!this.gameScene.isPaused) {
                if(isPressed) {                
                    if(buttonIndex == this.accelerateGamepadIndex) {
                        //console.log(`pressed: ${buttonIndex}`);
                        this.gameScene?.player1.tryAccelerateWithKeyboard();
                    }
                    if(buttonIndex == this.brakeOrReverseGamepadIndex) {
                        console.log(`pressed: ${buttonIndex}`);
                        this.gameScene?.player1.tryReverseWithKeyboard();
                    }
                    if(buttonIndex == this.firePrimaryWeaponGamepadIndex) { // && !this.gamepadPrevious.buttons[this.firePrimaryWeaponGamepadIndex].pressed) {
                        console.log(`pressed: ${buttonIndex}`);
                        this.gameScene.player1.tryFireBullets();
                    }
                    if(buttonIndex == this.fireSecondaryWeaponGamepadIndex) { // && !this.gamepadPrevious.buttons[this.fireSecondaryWeaponGamepadIndex].pressed) {
                        console.log(`pressed: ${buttonIndex}`);

                        this.gameScene.player1.tryFireRocket();
                    }
                    if(buttonIndex == this.fireFlameThrowerGamepadIndex) {
                        console.log(`pressed: ${buttonIndex}`);
                        this.gameScene?.player1.tryFireFlamethrower();
                    }
                    if(buttonIndex == GamepadEnums.FACE_4) {
                        console.log(`pressed: ${buttonIndex}`);
                        //this.gameScene?.player2.tryFireFlamethrower();
                        this.gameScene?.player1.tryFireAirStrike();
                    }

                    if(buttonIndex == GamepadEnums.SELECT && !this.gamepadPrevious.buttons[GamepadEnums.SELECT].pressed) {
                        console.log(`pressed: ${buttonIndex}`);
                        this.gameScene.player1.tryResetPosition();
                    }
                    
                    if(buttonIndex == GamepadEnums.RIGHT_SHOULDER && !this.gamepadPrevious.buttons[GamepadEnums.RIGHT_SHOULDER].pressed) {
                        console.log(`pressed: ${buttonIndex}`);
                        rightShoulderJustPressed = true;                    
                        this.gameScene.player1.tryJump();
                    }

                    if(buttonIndex == GamepadEnums.LEFT_SHOULDER) { // && !this.gamepadPrevious.buttons[GamepadEnums.LEFT_SHOULDER].pressed) {
                        console.log(`pressed: ${buttonIndex}`);                    
                        leftShoulderJustPressed = true;
                        this.gameScene.player1.tryTurbo();
                    }
                    if(buttonIndex == GamepadEnums.LEFT_SHOULDER) { // && !this.gamepadPrevious.buttons[GamepadEnums.LEFT_SHOULDER].pressed) {
                        console.log(`pressed: ${buttonIndex}`);                    
                        leftShoulderJustPressed = true;
                        this.gameScene.player1.tryTurbo();
                    }                    
                }
                else {
                    if(this.gamepadPrevious.buttons[this.accelerateGamepadIndex].pressed
                        && buttonIndex == this.accelerateGamepadIndex) {
                            console.log(`button no longer pressed: ${buttonIndex}`);
                            this.gameScene?.player1.tryStopAccelerateWithKeyboard();
                    }
                    if(this.gamepadPrevious.buttons[this.brakeOrReverseGamepadIndex].pressed
                        && buttonIndex == this.brakeOrReverseGamepadIndex) {
                            console.log(`button no longer pressed: ${buttonIndex}`);
                            this.gameScene?.player1.tryStopReverseWithKeyboard();
                    }
                    if(this.gamepadPrevious.buttons[GamepadEnums.LEFT_SHOULDER].pressed
                        && buttonIndex == GamepadEnums.LEFT_SHOULDER) {
                            console.log(`button no longer pressed: ${buttonIndex}`);
                            this.gameScene?.player1.tryStopTurbo();
                    }
                }
            }
        })

        if(leftShoulderJustPressed && rightShoulderJustPressed) {
            // TODO: experiment with LB+RB = jumping
            // this.gameScene?.player1.tryJump();
        }            

        this.gamepadPrevious = gamepad;
    }

    init(menuScene: MenuScene, gameScene: GameScene, hudScene: HudScene) {
        this.menuScene = menuScene;
        this.gameScene = gameScene;
        this.hudScene = hudScene;
    }

    getCurrentScene(scene: Scene) {
        return this.currentScene;
    }

    setCurrentScene(scene: Scene) {
        this.currentScene = scene;
    }

    switchToMenuScene() {
        this.currentScene = this.menuScene;
        document.getElementById('menuSceneDiv')!.style.visibility = 'visible';
        document.getElementById('gameSceneDiv')!.style.visibility = 'hidden';
    }

    switchToGameScene(player1VehicleType: VehicleType, levelName: string) {

        switch(levelName) {
            case "field":
                this.gameScene?.preloadMapData(this.fieldLevelConfig);
                this.gameScene?.preloadSkybox(this.fieldLevelConfig);
                break;
            case "arena":
            default:
                this.gameScene?.preloadMapData(this.arenaLevelConfig);
                this.gameScene?.preloadSkybox(this.arenaLevelConfig);
                break;
        }
                
        this.currentScene = this.gameScene;
        document.getElementById('menuSceneDiv')!.style.visibility = 'hidden';
        document.getElementById('gameSceneDiv')!.style.visibility = 'visible';
        this.gameScene?.initialize(player1VehicleType);

        // todo: fix behavior because of async
        var player1MaxHealth = this.gameScene?.player1?.maxHealth ?? 100;
        this.hudScene?.initialize(player1MaxHealth);
    }

    tryTogglePauseMenu() {
        if(this.currentScene instanceof GameScene ) {
            this.gameScene?.togglePauseGame();
            
            if(this.gameScene?.isPaused) {
                this.gamePausedDivElement.style.visibility = "visible";
                this.inGameOnScreenControlsDiv.style.visibility = "hidden";
            }
            else {
                this.gamePausedDivElement.style.visibility = "hidden";
                this.inGameOnScreenControlsDiv.style.visibility = "visible";
            }
        }
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

    getWebGLRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    processTurboPresses(button: GamepadButton, previousButtonState: GamepadButton) {
        /*
        const gamepads = navigator.getGamepads();
        if (!gamepads || !gamepads[gamepadIndex]) return;
    
        const gamepad = gamepads[gamepadIndex];
        const button = gamepad.buttons[buttonIndex];
        */

        const currentTime = performance.now();
        if (button.pressed) {
    
            if(!previousButtonState.pressed) {
                if (this.turboTapCount === 0 || currentTime - this.turboLastPressTime > SceneController.DOUBLE_TAP_THRESHOLD) {
                    this.turboTapCount = 1;
                    this.turboLastPressTime = currentTime;
                    return;
                }    
                if (this.turboTapCount === 1 && currentTime - this.turboLastPressTime < SceneController.DOUBLE_TAP_THRESHOLD) {
                    this.turboTapCount++;
                    this.turboLastPressTime = currentTime;
                    console.log('Double tap detected');
                    setTimeout(() => {
                        if (button.pressed) {
                            console.log('Double tap and hold detected');
                        }
                    }, SceneController.HOLD_THRESHOLD);
                    return;
                }
            }
                
            if (this.turboTapCount === 2) {
                this.gameScene?.player1.tryTurbo();
            }
            
        } else if (!button.pressed && previousButtonState.pressed) {
            
            if(currentTime - this.turboLastPressTime > SceneController.DOUBLE_TAP_THRESHOLD) {
                console.log('Hold released');
                this.gameScene?.player1.tryStopTurbo();
                this.turboTapCount = 0;
            }        
        }
    }
}