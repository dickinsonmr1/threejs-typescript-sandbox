import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import GameScene from './scenes/gameScene'
import HudScene from './scenes/hudScene'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js';
import CannonDebugger from 'cannon-es-debugger';
import SceneController from './scenes/sceneController';
import { GamepadControlScheme } from './scenes/gamePadEnums';
import MenuScene from './scenes/menuScene';
import GUI from 'lil-gui'; 
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

const mainCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, gameConfig.farDrawDistance);

const debugOrbitCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 5000);//gameConfig.farDrawDistance);
debugOrbitCamera.position.set(0, 10, 0);

const debugOrbitControls = new OrbitControls(debugOrbitCamera, renderer.domElement);
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

const gui = new GUI();
gui.title('Debug');

var sceneController = new SceneController(renderer, gui);
const gameScene = new GameScene(mainCamera, debugOrbitCamera, debugOrbitControls, sceneController, gameConfig);

// set up lil-gui debug panel
const gameConfigFolder = gui.addFolder( 'Game Config' );
gameConfigFolder.add(gameConfig, 'isDebug').listen();
gameConfigFolder.add(gameConfig, 'controlType', { 'Car Combat': 0, 'Racing': 1 } )
  .onChange((value: number) =>{
    sceneController.updateControlType(gameConfig.controlType);
  });
gameConfigFolder.add(mainCamera, 'far', 1, 500, 10)
  .onChange((value: number) => {
    mainCamera.far = value;
    mainCamera.updateProjectionMatrix(); // Important: update projection matrix after changing `far`
  });
gameConfigFolder.add(gameConfig, 'useFog').listen();
gameConfigFolder.add(gameConfig, 'isSoundEnabled').listen()
  .onChange((value: boolean) =>{
    gameScene.getAudioManager().enableAudio(value);
  });
//gameConfigFolder.add(gameConfig, 'fogNear', 0, 500, 10).listen();
//gameConfigFolder.add(gameConfig, 'fogFar', 0, 500, 10).listen();

let cannonDebugger: any = null;
if(gameConfig.isDebug) {
  cannonDebugger = CannonDebugger(gameScene, gameScene.world, {color: 0x0000ff });    
}

gameScene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();

// hud scene and camera
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = window.innerHeight;
var cameraOrtho = new THREE.OrthographicCamera(
    -frustumSize * aspect/2,
    frustumSize * aspect/2,
    frustumSize/2,
    -frustumSize/2,
    0.01, 100
);
cameraOrtho.position.z = 10;
            
let sceneOrtho = new HudScene(cameraOrtho, sceneController);

// menu scene and camera
const menuCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 75);
menuCamera.position.set(-5, 0, 0);

const menuScene = new MenuScene(menuCamera, sceneController);
menuScene.initialize();
menuScene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();

// scene controller 
sceneController.init(menuScene, gameScene, sceneOrtho);
sceneController.switchToMenuScene();
sceneController.setOnScreenControls();

var gamepads = navigator.getGamepads();
console.log(gamepads);

function onWindowResize(): void {
  const aspect = window.innerWidth / window.innerHeight;

  // Update camera aspect ratio
  mainCamera.aspect = aspect;
  mainCamera.updateProjectionMatrix();

  // Recalculate the camera's frustum
  cameraOrtho.left = -frustumSize * aspect / 2;
  cameraOrtho.right = frustumSize * aspect / 2;
  cameraOrtho.top = frustumSize / 2;
  cameraOrtho.bottom = -frustumSize / 2;

  cameraOrtho.updateProjectionMatrix();
  cameraOrtho.updateProjectionMatrix();

  menuCamera.aspect = aspect;
  menuCamera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Re-render the scene
  //render();
}

// Attach the window resize event listener
window.addEventListener('resize', onWindowResize, false);

function tick() {
  //mainCamera.near = gameConfig.fogNear;
  //mainCamera.far = gameConfig.fogFar;  
  sceneController.update(gameConfig,
    renderer,
    cannonDebugger,
    menuCamera,
    mainCamera,
    cameraOrtho,
    debugOrbitCamera,
    debugOrbitControls
  );

  requestAnimationFrame(tick);
  
  var scene = sceneController.currentScene;
  if(scene instanceof GameScene && !scene.isPaused) {
    scene.world.fixedStep();
  }
}

tick()