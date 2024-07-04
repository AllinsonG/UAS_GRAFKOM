import './style.css'
import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/Addons.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
//Edit the transparency
import { Water } from './Water.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
import { Player1,  ThirdPersonCamera1 } from "./player2.js";
import { positionWorld } from 'three/examples/jsm/nodes/Nodes.js';
import * as TWEEN from "three/addons/libs/tween.module.js";

const clock = new THREE.Clock();

let skybox,skyboxGeo,water,sun;
var mixers = [];

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);


//setup scene and camera
const scene = new THREE.Scene();
const camera =  new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,3,100);
camera.lookAt(0,0,0);

const camera1 =  new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera1.position.set(0,3,100);
camera1.lookAt(0,0,0);

// zoom in/out
{
  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min;  // this will call the min setter
    }
  }
  
  function updateCamera() {
    camera.updateProjectionMatrix();
    camera1.updateProjectionMatrix();
  }

  
  
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
  
  
  let zoomIn = false;
  let zoomOut = false;
  
  function zoomCamera() {
    if (zoomIn) {
      camera.zoom += 0.1;
      if (camera.zoom > 5) camera.zoom = 5; 
      updateCamera();
    }
    if (zoomOut) {
      camera.zoom -= 0.1;
      if (camera.zoom < 0.5) camera.zoom = 0.5; 
      updateCamera();
    }
    requestAnimationFrame(zoomCamera);
  }
  
  window.addEventListener('keydown', (event) => {
    if (event.key === 'z') {
      zoomIn = true;
    }
    if (event.key === 'x') {
      zoomOut = true;
    }
  });
  
  window.addEventListener('keyup', (event) => {
    if (event.key === 'z') {
      zoomIn = false;
    }
    if (event.key === 'x') {
      zoomOut = false;
    }
  });
  
  zoomCamera();  
}


//Rotate tilt

const controls = new FlyControls(camera, renderer.domElement)
controls.movementSpeed = 100;
controls.rollSpeed = Math.PI / 6;
controls.autoForward = false;
controls.dragToLook = true;
controls.update(0.01)


{
//Orbit Controls
const controls1 = new OrbitControls(camera, renderer.domElement);
controls1.target.set(0,-50,-175);
controls1.update();
}

{
// Light and shadow
// Directional Light
var color = 0xFFFFFF;
var light  = new THREE.DirectionalLight(0xFFFFFF, 10);
light.position.set(3,10,10);
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
light.shadow.camera.left = -100;
light.shadow.camera.right = 100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;

light.castShadow = true;


scene.add(light);
scene.add(light.target);


// HemiSphere light
                                //   Skycolor  //GroundColor //Intensity
light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 5);
light.castShadow = true;
scene.add(light);


// Point Light
                            // Color //Intensity
light = new THREE.PointLight(0xFFFF00,50);
light.castShadow = true;
light.position.set(10,10,0);
scene.add(light);

// //Spot Light
light = new THREE.SpotLight(0xFF0000, 50);
light.castShadow = true;
light.position.set(10,10,0);
scene.add(light);

//Ambient Light
var ambientLight = new THREE.AmbientLight(0x404040);

scene.add(ambientLight);



const cam = light.shadow.camera;
cam.near = 1;
cam.far = 15;
cam.left = - 10;
cam.right = 10;
cam.top = 10;
cam.bottom = - 10;

const cameraHelper = new THREE.CameraHelper( cam );
scene.add( cameraHelper );
cameraHelper.visible = false;
const helper = new THREE.DirectionalLightHelper( light, 100 );
scene.add( helper );
helper.visible = false;

//Additional light

// point lights
var shereSize = 3;
var light = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light.position.set( -3,10, -147);
scene.add( light );
light.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light, shereSize);
scene.add(pointLightHelper);


var light2 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light2.position.set( -8,11, -139);
scene.add( light2 );
// light2.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light2, shereSize);
scene.add(pointLightHelper);


var light3 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light3.position.set( -17,11, -140);
scene.add( light3 );
// light3.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light3, shereSize);
scene.add(pointLightHelper);


var light4 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light4.position.set( -22,11, -147);
scene.add( light4 );
// light4.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light4, shereSize);
scene.add(pointLightHelper);


var light5 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light5.position.set( 4, 6, -178);
scene.add( light5 );
light5.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light5, shereSize);
scene.add(pointLightHelper);

var light6 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light6.position.set( 27.5, 6, -149.5);
scene.add( light6 );
light6.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light6, shereSize);
scene.add(pointLightHelper);


var light7 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light7.position.set( 42.5, 6, -206);
scene.add( light7 );
// light7.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light7, shereSize);
scene.add(pointLightHelper);

var light8 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light8.position.set( 42.5, 6, -201);
scene.add( light8 );
// light8.castShadow = true;

var pointLightHelper = new THREE.PointLightHelper(light8, shereSize);
scene.add(pointLightHelper);


var light9 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light9.position.set( 35, 6, -197.5);
scene.add( light9 );
light9.castShadow = true;
 
var pointLightHelper = new THREE.PointLightHelper(light9, shereSize);
scene.add(pointLightHelper);
 
var light10 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light10.position.set( 6, 6, -214);
scene.add( light10 );
light10.castShadow = true;
 
var pointLightHelper = new THREE.PointLightHelper(light10, shereSize);
scene.add(pointLightHelper);
 
var light11 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light11.position.set( 65, 6, -105);
scene.add( light11);
// light12.castShadow = true;
 
var pointLightHelper = new THREE.PointLightHelper(light11, shereSize);
scene.add(pointLightHelper);
 
var light12 = new THREE.PointLight( 0x00FFFF, 300, 0,2);
light12.position.set( -38, 6, -194);
scene.add( light12);
// light13.castShadow = true;
 
var pointLightHelper = new THREE.PointLightHelper(light12, shereSize);
scene.add(pointLightHelper);

}

{
//Sun
sun = new THREE.Vector3();
// //Water

  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'resources/test/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
      opacity: 0.5,  // Set the desired opacity here
      transparent: true
    }
  );


  water.rotation.x = - Math.PI / 2;
  
  scene.add( water );


const parameters = {
  elevation: 2,
  azimuth: 180
};

const pmremGenerator = new THREE.PMREMGenerator( renderer );
const sceneEnv = new THREE.Scene();

let renderTarget;

function updateSun() {

  const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
  const theta = THREE.MathUtils.degToRad( parameters.azimuth );

  sun.setFromSphericalCoords( 1, phi, theta );


  water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

  if ( renderTarget !== undefined ) renderTarget.dispose();


  renderTarget = pmremGenerator.fromScene( sceneEnv );


  scene.environment = renderTarget.texture;

}

updateSun();

}

{
let skyboxImage = 'purplenebula';
function createPathStrings(filename) {
  const basePath = `https://raw.githubusercontent.com/codypearce/some-skyboxes/master/skyboxes/${filename}/`;
  const baseFilename = basePath + filename;
  const fileType = filename == 'purplenebula' ? '.png' : '.jpg';
  const sides = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
  const pathStings = sides.map(side => {
    return baseFilename + '_' + side + fileType;
  });

  return pathStings;
}


function createMaterialArray(filename) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map(image => {
    let texture = new THREE.TextureLoader().load(image);

    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}
const materialArray = createMaterialArray(skyboxImage);

skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
skybox = new THREE.Mesh(skyboxGeo, materialArray);
skybox.receiveShadow = true;

scene.add(skybox);
}

// const loader1 = new FBXLoader();
// loader1.load('resources/character1/silly dancing.fbx', function (object) {
//   object.scale.multiplyScalar(0.05);//0.05
//   object.position.set(5, 0.2, 20);
//   mixer = new THREE.AnimationMixer(object);

//   const action = mixer.clipAction(object.animations[0]);
//   action.play();

//   object.traverse(function (child) {

//     if (child.isMesh) {
//       child.castShadow = true;
//     }

//   });
//   scene.add(object);
// });







// 				loader1.load( 'resources/character1/Standing Death Forward 01.fbx', function ( object ) {
//           object.scale.multiplyScalar(0.05);//0.05
//           object.position.set(0,0.3,-100);
//           object.castShadow = true;
// 					mixer = new THREE.AnimationMixer( object );

// 					const action = mixer.clipAction( object.animations[ 0 ] );
// 					action.play();

// 					object.traverse( function ( child ) {

// 						if ( child.isMesh ) {
// 							child.castShadow = true;
//                             child.receiveShadow = true;
// 						}

// 					} );

// 					scene.add( object );

// } );
// if (WEBGL.isWebGLAvailable() === false) {

//   document.body.appendChild(WEBGL.getWebGLErrorMessage());

// }

var run = 0.1;
var objects = [];
let treadmillModel = null;

function loadModel(file, x, y, z, rot, scale, isTreadmill = false) {
  var loader1 = new FBXLoader();
  loader1.load(file, function (object) {
    object.scale.multiplyScalar(0.05);
    object.position.set(x, y, z);
    object.rotation.y = rot;
    object.mixer = new THREE.AnimationMixer(object);
    mixers.push(object.mixer);
    var action = object.mixer.clipAction(object.animations[0]);
    action.play();
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(object);
    objects.push(object);

    // Store the reference if it's the treadmill model
    if (isTreadmill) {
      treadmillModel = object;
    }
  });
}

loadModel('resources/character1/standing clap.fbx', 19, 0.2, -150, -20.5, 0.05);
loadModel('resources/character1/silly dancing.fbx', 4, 0.2, -150, 20, 0.05);
loadModel('resources/character1/throwing dice.fbx', -19, -0.2, -203, 0, 0.1);
loadModel('resources/character1/Treadmill Running.fbx', 12, 0.2, -178, 0, 0.05, true);

const geometry = new THREE.BoxGeometry( 1.5, 16, 1.5 ); 
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00,opacity: 0.0,transparent: true} ); 
const cube = new THREE.Mesh( geometry, material );
cube.position.set(17,0.2,-150)
objects.push(cube);
scene.add( cube );

const cube2 = new THREE.Mesh( geometry, material );
cube2.position.set(4.5,0.2,-150)
objects.push(cube2);
scene.add( cube2 );

const cube3 = new THREE.Mesh( geometry, material );
cube3.position.set(-19,0.2,-203)
objects.push(cube3);
scene.add( cube3 );

const cube4 = new THREE.Mesh( geometry, material );
cube4.position.set(12,0.2,-177)
objects.push(cube4);
scene.add( cube4 );


let isFirstPerson = 1;
let player,player1,player2, thirdPersonCamera, firstPersonCamera;
{
// Instantiate both cameras and players
function setupCameras() {


      firstPersonCamera = new ThirdPersonCamera1(
        camera,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0)
    );
    thirdPersonCamera = new ThirdPersonCamera(
        camera1,
        new THREE.Vector3(-10, 15, 0),
        new THREE.Vector3(0, 0, 0)
    );



    player1 = new Player(thirdPersonCamera, new PlayerController(), scene, 10, objects);
    player2 = new Player1(firstPersonCamera, scene, 10, new THREE.Vector3());
}

// Switch camera mode
function switchCameraMode() {
    if (isFirstPerson == 1) {
        player = player2;
    }  if (isFirstPerson == 2) {
        player = player1;
    }
}

// Initialize cameras
setupCameras();
switchCameraMode();

//Cinematography
function panCamera() {
  new TWEEN.Tween(camera.position)
      .to({ x: 50, y: 3, z: 100 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
}

function zoomCameraIn() {
  new TWEEN.Tween(camera)
      .to({ fov: 30 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => camera.updateProjectionMatrix())
      .start();
}

function zoomCameraOut() {
  new TWEEN.Tween(camera)
      .to({ fov: 75 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => camera.updateProjectionMatrix())
      .start();
}

function rotateCamera() {
  new TWEEN.Tween(camera.rotation)
      .to({ y: camera.rotation.y + Math.PI }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
}

function tiltCamera() {
  new TWEEN.Tween(camera.rotation)
      .to({ x: camera.rotation.x + Math.PI / 4 }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
}
function panAndZoom() {
  new TWEEN.Tween(camera.position)
      .to({ x: -50, y: 10, z: 50 }, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  
  new TWEEN.Tween(camera)
      .to({ fov: 45 }, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => camera.updateProjectionMatrix())
      .start();
}

function spiralCamera() {
  new TWEEN.Tween(camera.position)
      .to({ x: 50, y: 50, z: 50 }, 4000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  
  new TWEEN.Tween(camera.rotation)
      .to({ x: camera.rotation.x + Math.PI / 2, y: camera.rotation.y + Math.PI / 2 }, 4000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
}
const pivot = new THREE.Object3D();
function trigger(){
  pivot.position.set(0, 0, -100);
  scene.add(pivot);
  pivot.add(camera);
}
function rotateCamera1() {
  new TWEEN.Tween(pivot.rotation)
      .to({ y: pivot.rotation.y + Math.PI * 2 }, 10000) 
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
}


function rotateAroundPivotWithZoomAndRoll() {
  camera.position.setY(100);
  camera.lookAt(new THREE.Vector3(5, 5, 0)); 

  new TWEEN.Tween(pivot.rotation)
      .to({ y: pivot.rotation.y + Math.PI * 2 }, 10000) 
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();

  new TWEEN.Tween(camera)
      .to({ fov: 50 }, 5000) 
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => camera.updateProjectionMatrix())
      .start()
      .onComplete(() => {
          new TWEEN.Tween(camera)
              .to({ fov: 75 }, 5000) 
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => camera.updateProjectionMatrix())
              .start();
      });

  new TWEEN.Tween(camera.rotation)
      .to({ z: camera.rotation.z + Math.PI * 2 }, 10000) 
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
}

function zoomOutAndPanToCharacter() {
 
  const endPosition = new THREE.Vector3(-20, 10, -50); 
  const endRotation = new THREE.Euler(0, Math.PI, 0); 


  new TWEEN.Tween(camera.position)
    .to(endPosition, 2000) 
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();

  new TWEEN.Tween(camera.rotation)
    .to(endRotation, 2000) 
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();
}
function finish(){
  camera.position.set(0,3,100);
  camera.lookAt(0,0,0);
}
function finish2(){
  pivot.clear();
  scene.remove(pivot);
}
window.addEventListener('keydown', (event) => {
    if (event.key === 'o') {
        isFirstPerson = 1;
        switchCameraMode();
    }
    if (event.key === 'p') {
        isFirstPerson = 2;
        switchCameraMode();
    }
    if (event.key === '0'){
      isFirstPerson =3;
      switchCameraMode();
    }
    if (event.key === '1'){
      isFirstPerson =3;
      switchCameraMode();
      trigger();
      const startPosition = camera.position.clone();
          const endPosition = new THREE.Vector3(10, 5, -50); 
          const startRotation = camera.rotation.clone();
          const endRotation = new THREE.Euler(0, Math.PI, 0); 

         
  
          new TWEEN.Tween(camera.position)
              .to(endPosition, 1000)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start();
          
          new TWEEN.Tween(camera.rotation)
              .to(endRotation, 1000)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start();
          panCamera();
          zoomCameraIn();
          rotateCamera();
          tiltCamera();
          setTimeout(zoomCameraOut, 4000);
          setTimeout(panAndZoom, 6000); 
          setTimeout(spiralCamera, 10000); 
          setTimeout(rotateCamera1,14000);
          setTimeout(zoomOutAndPanToCharacter,20000);
          setTimeout(rotateAroundPivotWithZoomAndRoll,24000);
          setTimeout(finish,30000);
          setTimeout(finish2,35000);
          
    }
});

}



const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
//Object Collision
//Maju


//Map
// const loader = new GLTFLoader().setPath('resources/test/');
// loader.load('Map.gltf', async function (gltf) {



//   const model = gltf.scene;
  
// //   model.children[0].children.forEach(element => {

// //     element.receiveShadow = true;
// //     element.material.wireframe = false;
// //   });

//   model.traverse( function ( node ) {


//     if ( node.isMesh || node.isLight ) 

//     node.receiveShadow = true;
//     node.castShadow = true;

//   } );


//   model.position.set(0, 0.2, 0);
//   model.scale.set( 2, 2, 2 );
//   scene.add(model);
//   objects.push(model);
//   checkCollisions();
//   checkCollisionBackward();
//   checkCollisionLeft();
//   checkCollisionRight();

// });




//Maju
const objectBoundingBox = new THREE.Box3();
const cameraBoundingBox = new THREE.Box3();

function checkCollisions() {
    cameraBoundingBox.setFromObject(camera1);

    for (let i = 0; i < objects.length; i++) {
        objectBoundingBox.setFromObject(objects[i]);

        if (cameraBoundingBox.intersectsBox(objectBoundingBox)) {
            // Handle collision here, for example, move the camera away
            
            const newPosition = calculateCollisionResponse(cameraBoundingBox, objectBoundingBox);
            camera1.position.copy(newPosition);
        }
    }
}

function checkCollisionBackward() {
    const originalPosition = camera1.position.clone();
    const direction = new THREE.Vector3();
    camera1.getWorldDirection(direction);
    direction.negate();

    raycaster.set(originalPosition, direction);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0 && intersects[0].distance < 1) {
        const newPosition = direction.multiplyScalar(intersects[0].distance - 1);
        camera1.position.copy(originalPosition).add(newPosition);
    }
}

function checkCollisionLeft() {
    const originalPosition = camera1.position.clone();
    const direction = new THREE.Vector3();
    camera1.getWorldDirection(direction);
    const leftVector = new THREE.Vector3(-direction.z, 0, direction.x);

    raycaster.set(originalPosition, leftVector);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0 && intersects[0].distance < 2) {
        const newPosition = leftVector.multiplyScalar(intersects[0].distance - 1);
        camera1.position.copy(originalPosition).add(newPosition);
    }
}

function checkCollisionRight() {
    const originalPosition = camera1.position.clone();
    const direction = new THREE.Vector3();
    camera1.getWorldDirection(direction);
    const rightVector = new THREE.Vector3(direction.z, 0, -direction.x);

    raycaster.set(originalPosition, rightVector);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0 && intersects[0].distance < 2) {
        const newPosition = rightVector.multiplyScalar(intersects[0].distance - 1);
        camera1.position.copy(originalPosition).add(newPosition);
    }
}

function calculateCollisionResponse(cameraBB, objectBB) {
  const response = cameraBB.clone().intersect(objectBB);

  // Move the camera away from the object based on the response
  const newPosition = camera1.position.clone().sub(response);

  return newPosition;
}





// function checkCollisions() {

//   var direction = new THREE.Vector3();
//   camera.getWorldDirection(direction);
//   raycaster.set(camera.position, direction);
//   var intersects = raycaster.intersectObjects(objects);
//   if (intersects.length > 0 && intersects[0].distance < 1) {
//       // Calculate the new position to move camera away from the object
//       var newPosition = direction.multiplyScalar(intersects[0].distance - 1);
//       camera.position.add(newPosition);
//   }
  
// }
// //Mundur
// function checkCollisionBackward() {
//   var originalPosition = camera.position.clone();
//   var direction = new THREE.Vector3();
//   camera.getWorldDirection(direction);
//   direction.negate(); // Mengubah arah menjadi arah mundur

//   raycaster.set(originalPosition, direction);

//   var intersects = raycaster.intersectObjects(objects);

//   if (intersects.length > 0 && intersects[0].distance < 1) {
//       var newPosition = direction.multiplyScalar(intersects[0].distance - 1);
//       camera.position.copy(originalPosition).add(newPosition);
//   }
// }

// //Kiri
// function checkCollisionLeft() {
//   var originalPosition = camera.position.clone();
//   var direction = new THREE.Vector3();
//   camera.getWorldDirection(direction);
//   var leftVector = new THREE.Vector3(-direction.z, 0, direction.x); // Menghasilkan vektor ke kiri

//   raycaster.set(originalPosition, leftVector);

//   var intersects = raycaster.intersectObjects(objects);

//   if (intersects.length > 0 && intersects[0].distance < 1) {
//       var newPosition = leftVector.multiplyScalar(intersects[0].distance - 1);
//       camera.position.copy(originalPosition).add(newPosition);
//   }
// }

// function checkCollisionRight() {
//   var originalPosition = camera.position.clone();
//   var direction = new THREE.Vector3();
//   camera.getWorldDirection(direction);
//   var rightVector = new THREE.Vector3(direction.z, 0, -direction.x); // Menghasilkan vektor ke kanan

//   raycaster.set(originalPosition, rightVector);

//   var intersects = raycaster.intersectObjects(objects);

//   if (intersects.length > 0 && intersects[0].distance < 1) {
//       var newPosition = rightVector.multiplyScalar(intersects[0].distance - 1);
//       camera.position.copy(originalPosition).add(newPosition);
//   }
// } 



var time_prev = 0;
function animate(time){
  var dt = time- time_prev;
  dt *=  0.1;

  
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

    if (isFirstPerson !== 3 ){
      player.update(dt * 0.01);    //active
    }
    
    controls.update(0.01);
    const delta = clock.getDelta();
    if (mixers.length > 0) {

        for (var i = 0; i < mixers.length; i++) {
    
          mixers[i].update(1.0/60);
        
        }
    
      }

    
    
      

      if (treadmillModel) {
        const speed = 0.1 * dt; // Adjust the speed as needed
      
        // Move from (12, -178) to (65, -178)
        if (treadmillModel.position.x < 65 && treadmillModel.position.z < -177) {
          treadmillModel.position.x += speed;
          cube4.position.x += speed;
          treadmillModel.rotation.y = 20.5;
        }
        // Move from (65, -178) to (65, 137)
        else if (treadmillModel.position.x > 65 && treadmillModel.position.z < -137) {
          treadmillModel.position.z += speed;
          cube4.position.z += speed;
          treadmillModel.rotation.y = 0;
    
        }
        // Move from (65, 137) to (12, 137)
        else if (treadmillModel.position.x > 12 && treadmillModel.position.z > -137) {
          treadmillModel.position.x -= speed;
          cube4.position.x -= speed;
          treadmillModel.rotation.y = -8;
    
        }
        // Move from (12, 137) to (12, -178)
        else if (treadmillModel.position.x < 12 && treadmillModel.position.z > -178) {
          treadmillModel.position.z -= speed;
          cube4.position.z -= speed;
          treadmillModel.rotation.y = -15.5;
    
        }
        cube.position.x += 0;
        cube.position.z += 0;
        cube.position.y += 0;
        cube2.position.x += 0;
        cube2.position.z += 0;
        cube2.position.y += 0;
        cube3.position.x += 0;
        cube3.position.z += 0;
        cube3.position.y += 0;
      }
  checkCollisions();
  checkCollisionBackward();
  checkCollisionLeft();
  checkCollisionRight();
  


  if (isFirstPerson === 1){
    renderer.render(scene,camera);
  }
  if (isFirstPerson ===2){
    renderer.render(scene,camera1);
  }
  if(isFirstPerson === 3){
    renderer.render(scene,camera);
  }
  TWEEN.update(); 
  time_prev = time;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);