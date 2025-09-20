export default class KeyboardState {
    public keys: Record<string, boolean> = {};
    public keysPressedThisFrame: Record<string, boolean> = {};
    public keysReleasedThisFrame: Record<string, boolean> = {};

    constructor() {
        
    }
}