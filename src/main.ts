import * as THREE from 'three'
import GameScene from './scenes/gameScene'
import HudScene from './scenes/hudScene'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js';
import CannonDebugger from 'cannon-es-debugger';
import SceneController from './scenes/sceneController';
import { GamepadControlScheme } from './scenes/gamePadEnums';

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

const mainCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 75);

// needed for GLTF models to light correctly
// https://discourse.threejs.org/t/directional-light-and-gltf-model-not-working-together/49358
const environment = new RoomEnvironment( renderer );
const pmremGenerator = new THREE.PMREMGenerator( renderer );

window.addEventListener("gamepadconnected", (event) => {
  console.log("A gamepad connected:");
  console.log(event.gamepad);
  sceneController.setGamePad1(event.gamepad, GamepadControlScheme.CarCombat);
});

window.addEventListener("gamepaddisconnected", (event) => {
  console.log("A gamepad disconnected:");
  console.log(event.gamepad);
});

var sceneController = new SceneController(renderer);

const scene = new GameScene(mainCamera, sceneController);
scene.initialize();

const cannonDebugger = CannonDebugger(scene, scene.world, {color: 0x0000ff });

scene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();


let hudwidth = width;
let hudheight = height;

var cameraOrtho = new THREE.OrthographicCamera(
    -hudwidth/2, hudwidth/2,
    hudheight/2, -hudheight/2,
    1, 10
);
cameraOrtho.position.z = 1;
//cameraOrtho.position.x = 1;
//cameraOrtho.lookAt(new THREE.Vector3(0, 0, 0));
            
let sceneOrtho = new HudScene(cameraOrtho, sceneController);
sceneOrtho.initialize();

sceneController.init(scene, sceneOrtho)

var gamepads = navigator.getGamepads();
console.log(gamepads);

function tick() {
  scene.updateWater();
  scene.update();
  sceneOrtho.update();
  cannonDebugger.update();

  renderer.clear();
  renderer.render(scene, mainCamera);
  renderer.clearDepth();
  renderer.render(sceneOrtho, cameraOrtho);
  requestAnimationFrame(tick);

  scene.world.fixedStep();
}

tick()