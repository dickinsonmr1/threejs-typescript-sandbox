import { NumberController } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { PrecipitationType } from "./precipitationSystem";

export interface WorldConfig {
    name: string;
    heightMap: string;
    texture1: string;
    texture2: string;
    texture3: string;
    texture4: string;
    texture5: string;  
    
    skyTexture: string;

    precipitationType: PrecipitationType;

    waterY?: number;

    grassBillboard: string;
    grassBillboardStartY: number;
    grassBillboardEndY: number;

    fogColor: string;
}  