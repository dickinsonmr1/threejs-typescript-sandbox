import * as THREE from 'three'

export class AudioManager {
    /**
     *
     */
    private audioListener: THREE.AudioListener
    private audioLoader: THREE.AudioLoader;
    //private sharedAudioBuffer!: AudioBuffer;

    private audioBuffers: Map<string, AudioBuffer>;

    constructor() {        
        this.audioLoader = new THREE.AudioLoader();
        //this.sharedAudioBuffer = new AudioBuffer(new THREE.Audiob);
        this.audioListener = new THREE.AudioListener();
        this.audioBuffers = new Map();
    }

    public getAudioLoader(): THREE.AudioLoader {
        return this.audioLoader;
    }

    public getAudioListener(): THREE.AudioListener {
        return this.audioListener;
    }

    public async loadPositionalSound(asset: string, volume: number, refDistance: number, maxDistance: number): Promise<THREE.PositionalAudio> {

        //let positionalSound!: THREE.PositionalAudio;
        /*
        this.sharedAudioBuffer = await this.audioLoader.loadAsync('assets/audio/gunshot.ogg', (buffer) => {
            //this.sharedAudioBuffer = buffer;
            console.log('Audio loaded successfully');            
        });
        */

        let positionalSound = await this.createPositionalAudio(asset, this.audioListener, volume, refDistance, maxDistance)

        return positionalSound;
    }

    async loadAudio(url: string): Promise<AudioBuffer> {
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

    private async createPositionalAudio(asset: string, listener: THREE.AudioListener, volume: number, refDistance: number, maxDistance: number): Promise<THREE.PositionalAudio> {//} | null {
        /*if (!this.sharedAudioBuffer) {
            console.warn('Audio buffer not loaded yet');
            return new THREE.PositionalAudio(new THREE.AudioListener());
        }
    */
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

    playSound(key: string) {

    }

    update(newListenerPosition: THREE.Vector3): void {
        this.audioListener.position.copy(newListenerPosition);
        
        const worldPos = new THREE.Vector3();
        this.audioListener.updateMatrixWorld(true);
        this.audioListener.getWorldPosition(worldPos);
        console.log(worldPos);

        const audioContext = THREE.AudioContext.getContext();
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => console.log('AudioContext resumed'));
        }
    }
}