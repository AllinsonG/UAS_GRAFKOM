import './style.css'
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/Addons.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';




const clock = new THREE.Clock();

let mixer,skybox,skyboxGeo;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);


//setup scene and camera
const scene = new THREE.Scene();
const camera =  new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,3,100);
camera.lookAt(0,0,0);

//geometry
// const points = [];
// points.push(new THREE.Vector3(-1,0,0));
// points.push(new THREE.Vector3(0,1,0));
// points.push(new THREE.Vector3(1,0,0));
// var linegeometry = new THREE.BufferGeometry().setFromPoints(points);
// var linematerial = new THREE.LineBasicMaterial({color:0xffffff});
// var line = new THREE.Line(linegeometry,linematerial);
// scene.add(line);
// var geometry = new THREE.BoxGeometry(1,1,1);
// var geometry = new THREE.TorusGeometry(10,3,16,100);
// var material = new THREE.MeshBasicMaterial({color:0x00FF00});
// var cube = new THREE.Mesh(geometry,material);
// scene.add(cube);


// var points_custom = [-1,-1,1,1,-1,1,-1,1,1,-1,1,1,1,-1,1,1,1,1,1,-1,1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,1,1,-1,1,1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1,1,-1,1,1,1,1,-1,-1,1,-1,1,1,1,1,1,1,-1,1,-1,-1,1,1,1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,-1]
// var geometry = new THREE.BufferGeometry();
// geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points_custom),3));
// var material = new THREE.MeshBasicMaterial({color:0xFF0000});
// var custom_cube = new THREE.Mesh(geometry, material);
// scene.add(custom_cube);

const objects = [];


//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,5,0);
controls.update();


//Light
//Directional Light
var color = 0xFFFFFF;
var light  = new THREE.DirectionalLight(color, 0.5);
light.castShadow = true;
light.position.set(0,10,0);
light.target.position.set(-5,0,0);
scene.add(light);
scene.add(light.target);


//HemiSphere light
                                  //Skycolor  //GroundColor //Intensity
light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 5);
light.castShadow = true;
scene.add(light);


//Point Light
                            //Color //Intensity
light = new THREE.PointLight(0xFFFF00,50);
light.castShadow = true;
light.position.set(10,10,0);
scene.add(light);

//Spot Light
light = new THREE.SpotLight(0xFF0000, 50);
light.castShadow = true;
light.position.set(10,10,0);
scene.add(light);




// //Geometry
// //plane
// {
//   var planetGeo = new THREE.PlaneGeometry(40,40);
//   var planetMat = new THREE.MeshPhongMaterial({color: '#8AC'});
//   const mesh = new THREE.Mesh(planetGeo, planetMat);
//   mesh.rotation.x = Math.PI * -0.5;
//   scene.add(mesh);
// }
// //cube
// {
//   var cubeGeo = new THREE.BoxGeometry(4,4,4);
//   var cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
//   const mesh = new THREE.Mesh(cubeGeo, cubeMat);
//   mesh.position.set(5,3.5,0);
//   scene.add(mesh);
// }
// //sphere
// {
//   var sphereGeo = new THREE.SphereGeometry(3,32,16);
//   var sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
//   const mesh = new THREE.Mesh(sphereGeo,sphereMat);
//   mesh.position.set(-5,3.5,0);
//   scene.add(mesh);
// }

// const loader = new GLTFLoader().setPath( 'resources/Medieval Kingdom/' );
// 						loader.load( 'Map_1.gltf', function ( gltf ) {

// 							const model = gltf.scene;

// 							// wait until the model can be added to the scene without blocking due to shader compilation

// 							renderer.compileAsync( model, camera, scene );

// 							scene.add( model );

			
// 						} );


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

scene.add(skybox);

const onProgress = function (xhr){
  if(xhr.lengthComputable){
    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log(percentComplete.toFixed(2) + '% downloaded');
  }
}


const loader = new GLTFLoader().setPath('resources/test/');
loader.load('Map.gltf', async function (gltf) {


  const model = gltf.scene;
  console.log(model)
  // model.children[0].children.forEach(element => {
  //   element.castShadow = true;
  //   element.receiveShadow = true;
  //   element.material.wireframe = false;
  // });


  model.position.set(0, -5, 0);
  model.scale.set( 2, 2, 2 );
  scene.add(model);


});


const loader1 = new FBXLoader();
				loader1.load( 'resources/character1/Standing Death Forward 01.fbx', function ( object ) {
          object.scale.multiplyScalar(0.05);
          object.position.set(0,-5,-100);
					mixer = new THREE.AnimationMixer( object );

					const action = mixer.clipAction( object.animations[ 0 ] );
					action.play();

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;
              

						}

					} );

					scene.add( object );

} );



// // instantiate a loader
// const loader = new OBJLoader();



// const onProgress = function ( xhr ) {

//   if ( xhr.lengthComputable ) {

//     const percentComplete = xhr.loaded / xhr.total * 100;
//     console.log( percentComplete.toFixed( 2 ) + '% downloaded' );

//   }

// };
// new MTLLoader()
// .setPath( 'resources/' )
// .load( 'magic_book_OBJ.mtl', function ( materials ) {

//   materials.preload();

//   new OBJLoader()
//     .setMaterials( materials )
//     .setPath( 'resources/' )
//     .load( 'magic_book_OBJ.obj', function ( object ) {


//       scene.add( object );

//     }, onProgress );

// } );




// // load a resource
// loader.load(
// 	// resource URL
// 	'resources/magic_book_OBJ.obj',
// 	// called when resource is loaded
// 	function ( object ) {

// 		scene.add( object );

// 	},
// 	// called when loading is in progresses
// 	function ( xhr ) {

// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

// 	},
// 	// called when loading has errors
// 	function ( error ) {

// 		console.log( 'An error happened' );

// 	}
// );





var time_prev = 0;
function animate(time){
  var dt = time- time_prev;
  dt *=  0.1;

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  

  // objects.forEach((obj)=>{
  //   obj.rotation.z += dt * 0.01;
  // });
  // cube.rotation.x += 0.01 *dt;
  // cube.rotation.y += 0.01 *dt;

  // custom_cube.rotation.x += 0.01 *dt;
  // custom_cube.rotation.y += 0.01 *dt;


  
  renderer.render(scene,camera);
  time_prev = time;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);