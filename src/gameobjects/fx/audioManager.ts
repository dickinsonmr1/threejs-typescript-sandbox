import * as THREE from 'three'

export class AudioManager {
    /**
     *
     */
    private audioListener: THREE.AudioListener
    private audioLoader: THREE.AudioLoader;
    private sharedAudioBuffer!: AudioBuffer;

    constructor() {        
        this.audioLoader = new THREE.AudioLoader();
        //this.sharedAudioBuffer = new AudioBuffer(new THREE.Audiob);
        this.audioListener = new THREE.AudioListener();
    }

    public getAudioLoader(): THREE.AudioLoader {
        return this.audioLoader;
    }

    public getAudioListener(): THREE.AudioListener {
        return this.audioListener;
    }

    public loadPositionalSound(asset: string, volume: number, refDistance: number, maxDistance: number): THREE.PositionalAudio {

        let positionalSound!: THREE.PositionalAudio;

        this.audioLoader.load('assets/audio/gunshot.ogg', (buffer) => {
            this.sharedAudioBuffer = buffer;
            console.log('Audio loaded successfully');

            positionalSound = this.createPositionalAudio(this.sharedAudioBuffer, this.audioListener, volume, refDistance, maxDistance)
        });

        return positionalSound;
    }

    public createPositionalAudio(sharedAudioBuffer: AudioBuffer, listener: THREE.AudioListener, volume: number, refDistance: number, maxDistance: number): THREE.PositionalAudio {//} | null {
        if (!sharedAudioBuffer) {
            console.warn('Audio buffer not loaded yet');
            return new THREE.PositionalAudio(new THREE.AudioListener());
        }
    
        const positionalAudio = new THREE.PositionalAudio(listener);
        positionalAudio.setBuffer(sharedAudioBuffer);
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