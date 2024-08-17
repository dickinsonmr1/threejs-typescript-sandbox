import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import GameScene from './scenes/gameScene'
import HudScene from './scenes/hudScene'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js';
import CannonDebugger from 'cannon-es-debugger';
import SceneController from './scenes/sceneController';
import { GamepadControlScheme } from './scenes/gamePadEnums';
import MenuScene from './scenes/menuScene';
import { GameConfig } from './gameconfig';

import gameconfigJson from '../gameconfig.json'
const gameConfig: GameConfig = gameconfigJson;

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement
});

renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = 'srgb';

// https://threejs.org/examples/?q=sprites#webgl_sprites
renderer.autoClear = false; // To allow render overlay

const mainCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 500);

const debugOrbitCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 500);
debugOrbitCamera.position.set(0, 10, 0);

const debugOrbitControls = new OrbitControls(debugOrbitCamera, renderer.domElement);
//debugOrbitControls.enablePan = true;
/*
debugOrbitControls.keys = {
	LEFT: 'a',
	UP: 'w',
	RIGHT: 'd',
	BOTTOM: 's' 
};
*/
debugOrbitControls.enabled = false; // Disable controls initially

// needed for GLTF models to light correctly
// https://discourse.threejs.org/t/directional-light-and-gltf-model-not-working-together/49358
const environment = new RoomEnvironment( renderer );
const pmremGenerator = new THREE.PMREMGenerator( renderer );

window.addEventListener("gamepadconnected", (event) => {
  console.log("A gamepad connected:");
  console.log(event.gamepad);
  sceneController.setGamePad1(event.gamepad, gameConfig.controlType);
});

window.addEventListener("gamepaddisconnected", (event) => {
  console.log("A gamepad disconnected:");
  console.log(event.gamepad);
});

var sceneController = new SceneController(renderer);

const gameScene = new GameScene(mainCamera, debugOrbitCamera, debugOrbitControls, sceneController, gameConfig);
//gameScene.initialize();

let cannonDebugger: any = null;

if(gameConfig.isDebug) {
  cannonDebugger = CannonDebugger(gameScene, gameScene.world, {color: 0x0000ff });  
}

gameScene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();

let hudwidth = width;
let hudheight = height;

var cameraOrtho = new THREE.OrthographicCamera(
    -hudwidth/2, hudwidth/2,
    hudheight/2, -hudheight/2,
    1, 10
);
cameraOrtho.position.z = 10;
//cameraOrtho.position.x = 1;
//cameraOrtho.lookAt(new THREE.Vector3(0, 0, 0));
            
let sceneOrtho = new HudScene(cameraOrtho, sceneController);
//sceneOrtho.initialize();

const menuCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 75);
menuCamera.position.set(-5, 0, 0);
const menuScene = new MenuScene(menuCamera, sceneController);
menuScene.initialize();

menuScene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();

sceneController.init(menuScene, gameScene, sceneOrtho);
sceneController.switchToMenuScene();
//sceneController.setCurrentScene(menuScene);
//sceneController.setCurrentScene(gameScene);

sceneController.setOnScreenControls();

var gamepads = navigator.getGamepads();
console.log(gamepads);

function tick() {

  var scene = sceneController.currentScene;

  if(scene instanceof GameScene) {

    if(!scene.isPaused) {
      scene.updateWater();
      scene.updatePrecipitation();
      scene.update();
      sceneOrtho.update();

      if(gameConfig.isDebug && cannonDebugger != null) {
        cannonDebugger.update();
      }

      renderer.clear();
      renderer.render(scene, mainCamera);
      renderer.clearDepth();
      renderer.render(sceneOrtho, cameraOrtho);
    }
    else {
      debugOrbitControls.update();
      scene.updateInputForDebug();
      renderer.render(scene, debugOrbitCamera);
    }
    
  }
  else if(scene instanceof MenuScene) {
    scene.update();
    renderer.render(scene, menuCamera);
  }
  
  requestAnimationFrame(tick);
  
  if(scene instanceof GameScene && !scene.isPaused) {
    scene.world.fixedStep();
  }
}

tick()