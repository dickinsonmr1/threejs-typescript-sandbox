import { GamepadControlScheme } from "./scenes/gamePadEnums";

export interface GameConfig {
    isDebug: boolean;    
    controlType: GamepadControlScheme;
    
    useFog: boolean;
    fogNear: number;
    fogFar: number;
}