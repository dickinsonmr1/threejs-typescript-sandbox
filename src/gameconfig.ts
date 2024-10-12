import { GamepadControlScheme } from "./scenes/gamePadEnums";

export interface GameConfig {
    isDebug: boolean;    
    controlType: GamepadControlScheme;

    farDrawDistance: number;
    
    useFog: boolean;
    fogNear: number;
    fogFar: number;
}