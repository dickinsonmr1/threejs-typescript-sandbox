import { GamepadControlScheme } from "./scenes/gamePadEnums";

export interface GameConfig {
    isDebug: boolean;    
    controlType: GamepadControlScheme;
    isSoundEnabled: boolean;

    farDrawDistance: number;
    
    useFog: boolean;
    fogNear: number;
    fogFar: number;
    
    wheelGroundContactMaterialFriction: number;
    wheelGroundContactMaterialRestitution: number;
}