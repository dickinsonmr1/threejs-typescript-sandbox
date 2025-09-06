import * as THREE from 'three'
import { GltfObject, GltfObjectPhysicsObjectShape } from './gltfObject';
import { GLTF, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

export default class GameAssetModelLoader {

    /**
     *
     */

    gltfLoader: GLTFLoader
    constructor(gltfLoader: GLTFLoader) {
        this.gltfLoader = gltfLoader;        
    }

    async generateWheelModel(): Promise<GLTF>{

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/wheel-racing.glb');
        
        //model.scene.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        //model.scene.scale.set(10, 10, 10);
        model.scene.position.set(0,0,0);

        return model;
    }

    async generateTreeModel(): Promise<GLTF>{
        var model = await this.gltfLoader.loadAsync('assets/models/tree2.glb');
        model.scene.position.set(0,0,0);
        return model;
    }

    
    async generateBarrelModel(): Promise<GLTF>{
        var model = await this.gltfLoader.loadAsync('assets/models/barrel.glb');
        model.scene.position.set(0,0,0);
        return model;
    }

    async generateDumpsterModel(): Promise<GLTF>{
        var model = await this.gltfLoader.loadAsync('assets/models/dumpster.glb');
        model.scene.position.set(0,0,0);
        return model;
    }

    async generateWheelModelAsGroup(): Promise<THREE.Group>{

        var model = (await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/wheel-racing.glb')).scene;
        return model;
    }

    async loadTaxiModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/taxi.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    async loadPoliceModel(): Promise<GLTF> {                

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/police.glb');        
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    async loadPoliceRetroModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/vehicles-custom/hotrod-black-5.glb');        
        //var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/police.glb');        
        var modelScene = model.scene;
        modelScene.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);

        var body = modelScene.children.find(x => x.name == 'body');
        
        //body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        //body?.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 16);
        //body?.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 16);
        //body?.position.add(new THREE.Vector3(0.15, -0.5, -1.5));
        
        //body?.rotateY(Math.PI);
        

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    async loadTankModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/vehicles-custom/tank.glb');        
        //var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/police.glb');        
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 16);
        body?.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 16);
        body?.position.add(new THREE.Vector3(0.15, -0.5, -1.5));
        
        //body?.rotateY(Math.PI);
        

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

     async loadTankerModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/vehicles-custom/tanker.glb');        
        //var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/police.glb');        
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 16);
        body?.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 16);
        //body?.position.add(new THREE.Vector3(0.15, -0.5, -1.5));
        
        //body?.rotateY(Math.PI);
        

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }


    async loadAmbulanceModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/ambulance.glb');
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));

        var doorLeft = modelScene.children.find(x => x.name == 'door-left');
        doorLeft?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        doorLeft?.position.add(new THREE.Vector3(1, -0.5, 2));

        var doorRight = modelScene.children.find(x => x.name == 'door-right');
        doorRight?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        doorRight?.position.add(new THREE.Vector3(2.1, -0.5, 0.9));

        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;          
    }

    async loadTrashTruckModel(): Promise<GLTF> {        

        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/garbage-truck.glb');
        var modelScene = model.scene;

        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, 0, 0));

        var arm = modelScene.children.find(x => x.name == 'arm');
        arm?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        arm?.position.add(new THREE.Vector3(-0.45, 0.1, -0.3));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();

        return model;
    }

    async loadSedanSportsModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/sedan-sports.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadRaceCarBlueModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/race-future.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadRaceCarRedModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/race.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadSuvModel(): Promise<GLTF> {        

        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/suv.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadKilldozerModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/tractor-shovel.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        // TODO: killdozer shovel
        //var shovel = body?.children.find(x => x.name == 'shovel');
        //shovel?.position.add(new THREE.Vector3(0, 3, 0));
        //shovel?.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadPoliceTractorModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/tractor-police.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadTractorModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/tractor.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadPickupTruckModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/truck.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }

    async loadFireTruckModel(): Promise<GLTF> {
        
        // vehicles v2 have wheels as separate children
        var model = await this.gltfLoader.loadAsync('assets/kenney-vehicles-2/firetruck.glb');
        var modelScene = model.scene;
        
        var body = modelScene.children.find(x => x.name == 'body');
        body?.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        body?.position.add(new THREE.Vector3(0, -0.5, 0));
        
        var wheel1 = modelScene.children.find(x => x.name == 'wheel-back-left');
        var wheel2 = modelScene.children.find(x => x.name == 'wheel-back-right');
        var wheel3 = modelScene.children.find(x => x.name == 'wheel-front-left');
        var wheel4 = modelScene.children.find(x => x.name == 'wheel-front-right');

        wheel1?.removeFromParent();
        wheel2?.removeFromParent();
        wheel3?.removeFromParent();
        wheel4?.removeFromParent();
        
        return model;
    }
}