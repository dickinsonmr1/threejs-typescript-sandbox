import * as THREE from 'three'
import BlasterScene from './scenes/blasterScene'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js';

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement
});

renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = 'srgb';

const mainCamera = new THREE.PerspectiveCamera(60, width/height, 0.1, 100);

// needed for GLTF models to light correctly
// https://discourse.threejs.org/t/directional-light-and-gltf-model-not-working-together/49358
const environment = new RoomEnvironment( renderer );
const pmremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new BlasterScene(mainCamera);
scene.initialize();

scene.environment = pmremGenerator.fromScene( environment ).texture;
environment.dispose();

function tick() {
  scene.update();
  renderer.render(scene, mainCamera);
  requestAnimationFrame(tick);
}

tick()