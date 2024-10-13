import { TerrainChunk } from "./terrainChunk";

export default class TerrainSystem {

    terrainChunks: TerrainChunk[] = [];

    private chunkSize: number;

    constructor(chunkSize: number) {
        this.chunkSize = chunkSize;        
    }
}