export class SoundEffectConfig {
    soundKey?: string;
    asset?: string;
    volume?: number;
    refDistance?: number;
    maxDistance?: number;
    loop?: boolean;
    createInstancePerPlayer?: boolean;
    comment?: string;
}

export interface SoundEffectLibrary {
    items: SoundEffectConfig[];
}