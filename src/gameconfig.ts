import { GamepadControlScheme } from "./scenes/gamePadEnums";

export interface GameConfig {
    isDebug: boolean;    
    controlType: GamepadControlScheme
}