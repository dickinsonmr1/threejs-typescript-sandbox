import * as THREE from 'three'
import GameScene from './scenes/gameScene'
import HudScene from './scenes/hudScene'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js';
import CannonDebugger from 'cannon-es-debugger';
import SceneController from './scenes/sceneController';
import { GamepadControlScheme } from './scenes/gamePadEnums';
import { TextureToArray } from './gameobjects/shapes/textureToArray';

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

const mainCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 100);

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

var sceneController = new SceneController();

const scene = new GameScene(mainCamera, sceneController);
scene.initialize();

//const cannonDebugger = CannonDebugger(scene, scene.world, {color: 0x0000ff });

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

// https://gabrielromualdo.com/articles/2020-12-15-how-to-use-the-html5-gamepad-api
/*
setInterval(() => {
	if(gamepads[0] !== undefined) {

		// a gamepad is connected and has an index
		const myGamepad = navigator.getGamepads()[0];
    if(!myGamepad) return;
		console.log(`Left stick at (${myGamepad.axes[0]}, ${myGamepad.axes[1]})` );
		console.log(`Right stick at (${myGamepad.axes[2]}, ${myGamepad.axes[3]})` );

    myGamepad.buttons.map(e => e.pressed).forEach((isPressed, buttonIndex) => {
			if(isPressed) {
				// button is pressed; indicate this on the page
				document.body.innerHTML += `<h1>Button ${buttonIndex} is pressed</h1>`;
        console.log(`pressed: ${buttonIndex}`);
			}
		})
	}
}, 100) // print axes 10 times per second
*/

/*
var hudTexture = new THREE.Texture(hudCanvas)
hudTexture.needsUpdate = true;
var material = new THREE.MeshBasicMaterial( {map: hudTexture, opacity: 0.1 } );
material.transparent = true;

var planeGeometry = new THREE.PlaneGeometry( hudwidth, hudheight );
var plane = new THREE.Mesh( planeGeometry, material );
sceneHUD.add( plane );
*/

/*
function startPollingForGamepads() {
  // Don't accidentally start a second loop, man.
  if (!gamepadSupport.ticking) {
  gamepadSupport.ticking = true;
  gamepadSupport.tick();
  }
}
*/

function tick() {
  scene.update();
  sceneOrtho.update();
  //cannonDebugger.update();

  /*
  if(hudBitmap != null) {
    hudBitmap.clearRect(0, 0, hudwidth, hudheight);
    hudBitmap.fillText("Health", 0, 0);
    hudTexture.needsUpdate = true;
  }
  */
  renderer.clear();
  renderer.render(scene, mainCamera);
  renderer.clearDepth();
  renderer.render(sceneOrtho, cameraOrtho);
  requestAnimationFrame(tick);
}

tick()