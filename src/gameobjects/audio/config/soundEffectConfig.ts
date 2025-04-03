export interface SoundEffectConfig {
    soundKey: string;
    asset: string;
    volume: number;
    refDistance: number;
    maxDistance: number;
    loop?: boolean;
}