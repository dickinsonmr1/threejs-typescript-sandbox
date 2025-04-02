import * as THREE from 'three'

export class AudioManager {

    private audioListener: THREE.AudioListener
    private audioLoader: THREE.AudioLoader;
    private audioBuffers: Map<string, AudioBuffer>;

    private positionalSounds: Map<string, THREE.PositionalAudio> = new Map<string, THREE.PositionalAudio>;

    constructor(camera: THREE.Camera) {        
        this.audioLoader = new THREE.AudioLoader();
        this.audioListener = new THREE.AudioListener();
        this.audioBuffers = new Map();

        camera.add(this.audioListener);
    }

    public getAudioLoader(): THREE.AudioLoader {
        return this.audioLoader;
    }

    public getAudioListener(): THREE.AudioListener {
        return this.audioListener;
    }    

    public async loadPositionalSound(asset: string, volume: number, refDistance: number, maxDistance: number, loop: boolean = false): Promise<THREE.PositionalAudio> {

        return await this.createPositionalAudio(asset, this.audioListener, volume, refDistance, maxDistance, loop);
    }

    private async loadAudio(url: string): Promise<AudioBuffer> {
        if (this.audioBuffers.has(url)) {
          return this.audioBuffers.get(url)!;
        }
    
        return new Promise((resolve, reject) => {
          this.audioLoader.load(
            url,
            (buffer) => {
              this.audioBuffers.set(url, buffer);
              resolve(buffer);
            },
            undefined,
            reject
          );
        });
      }

    private async createPositionalAudio(asset: string, listener: THREE.AudioListener, volume: number, refDistance: number, maxDistance: number, loop: boolean): Promise<THREE.PositionalAudio> {//} | null {

        const buffer = await this.loadAudio(asset);

        const positionalAudio = new THREE.PositionalAudio(listener);
        positionalAudio.setBuffer(buffer);
        positionalAudio.setRefDistance(refDistance);
        positionalAudio.setMaxDistance(maxDistance);
        positionalAudio.setLoop(false);
        positionalAudio.setRolloffFactor(0.1);
        positionalAudio.setVolume(volume);        
        //positionalAudio.position.set(100, 100, 100);
        //positionalAudio.play();
    
        return positionalAudio;
    }    

    public addSound(key: string, sound: THREE.PositionalAudio): void {      
      this.positionalSounds.set(key, sound);
    }

    public addSoundWithPlayerIndexPrefix(playerIndexPrefix: number, key: string, sound: THREE.PositionalAudio): void {      
      this.positionalSounds.set(`player${playerIndexPrefix+1}-${key}`, sound);
    }

    public getSound(key: string): THREE.PositionalAudio | null {
      let sound = this.positionalSounds.get(key);
      return sound ?? null;
    }

    public getPlayerSpecificSound(playerIndexPrefix: number, key: string): THREE.PositionalAudio | null {
      let sound = this.positionalSounds.get(`player${playerIndexPrefix+1}-${key}`);
      return sound ?? null;
    }

    public playLoopedSound(key: string) {
      const sound = this.positionalSounds.get(key);
      if(sound && !sound.isPlaying)
          sound.play();
    }

    public playPlayerSpecificLoopedSound(playerIndex: number, key: string) {
      this.playLoopedSound(`player${playerIndex+1}-${key}`);
    }

    public playSound(key: string, detune: boolean) {
      const sound = this.positionalSounds.get(key);
      if(sound) {          
        if(sound.isPlaying)
          sound.stop();

        sound.play();

        if(detune) {
          sound.detune = Math.floor(Math.random() * 1600 - 800);
        }
      }          
    }

    public playPlayerSpecificSound(playerIndex: number, key: string, detune: boolean) {
      this.playSound(`player${playerIndex+1}-${key}`, detune);
    }

    public playSoundIfNotCurrentlyPlaying(key: string, detune: boolean) {
      const sound = this.positionalSounds.get(key);
      if(sound) {          
        if(sound.isPlaying)
          return;

        sound.play();

        if(detune) {
          sound.detune = Math.floor(Math.random() * 1600 - 800);
        }
      }          
    }

    public playPlayerSpecificSoundIfNotCurrentlyPlaying(playerIndex: number, key: string, detune: boolean) {
      this.playSoundIfNotCurrentlyPlaying(`player${playerIndex+1}-${key}`, detune);        
    }

    public stopSound(key: string, playerIndex?: number) {
      let prefix = '';
      if(playerIndex != null)
        prefix = `player${playerIndex+1}-`;

      const sound = this.positionalSounds.get(`${prefix}${key}`);
      if(sound && sound.isPlaying)
          sound.stop();        
    }

    update(newListenerPosition: THREE.Vector3): void {
        this.audioListener.position.copy(newListenerPosition);
        
        const worldPos = new THREE.Vector3();
        this.audioListener.updateMatrixWorld(true);
        this.audioListener.getWorldPosition(worldPos);
        //console.log(worldPos);

        const audioContext = THREE.AudioContext.getContext();
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => console.log('AudioContext resumed'));
        }
    }
}