export interface WorldConfig {
    name: string;
    heightMap: string;
    texture1: string;
    texture2: string;
    texture3: string;
    texture4: string;
    texture5: string;  
    
    waterY?: number;

    grassBillboard: string;
    grassBillboardStartY: number;
    grassBillboardEndY: number;
}  