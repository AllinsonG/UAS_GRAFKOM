import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Player1 {
  constructor(camera,scene, speed,positionObject) {
    this.camera = camera;
    this.controller = new PlayerController(camera,positionObject); // Pass the camera here
    this.scene = scene;
    this.speed = speed;
    this.state = "idle";
    this.rotationVector = new THREE.Vector3(0, 0, 0);
    this.animations = {};
    this.lastRotation = 0;
    this.positionObject = positionObject;

    this.camera.setup(positionObject);

    this.loadModel();
  }

  loadModel() {
    var loader = new FBXLoader();
    loader.setPath("./resources/Knight/");
    loader.load("Dwarf Idle.fbx", (fbx) => {
      fbx.scale.setScalar(0.05);
      fbx.position.set(0,0.2,-100);
      fbx.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true; // Menambahkan receiveShadow pada setiap mesh
      });
      this.mesh = fbx;
      this.scene.add(this.mesh);
      this.mesh.position.set(this.positionObject.x,this.positionObject.y,this.positionObject.z);
      this.mesh.scale.set(0.09, 0.09, 0.09);
      this.mesh.rotation.y += Math.PI / -2;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.mixer = new THREE.AnimationMixer(this.mesh);

      var onLoad = (animName, anim) => {
        const clip = anim.animations[0]; //6,14
        const action = this.mixer.clipAction(clip);
        
        this.animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader();
      loader.setPath("./resources/Knight/");
      loader.load('Dwarf Idle.fbx', (fbx) => { onLoad('idle', fbx) });
      loader.load('Sword And Shield Run.fbx', (fbx) => { onLoad('run', fbx) });
      //loader.load('untitled.fbx', (fbx) => { onLoad('run', fbx) });
    });
  }

  update(dt) {
    if (this.mesh && this.animations) {
      this.lastRotation = this.mesh.rotation.y;

      var forwardVector = new THREE.Vector3();
      this.camera.camera.getWorldDirection(forwardVector);
      forwardVector.normalize();
      forwardVector = new THREE.Vector3(forwardVector.x,0,forwardVector.z);
      


      var direction = new THREE.Vector3(0, 0, 0);

      if (this.controller.keys["forward"]) {
        this.mesh.position.add(
          forwardVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle;
        // this.camera.camera.rotation.y -= 0.1;
        console.log(angle);
      }
      if (this.controller.keys["backward"]) {
        this.mesh.position.add(
          forwardVector.multiplyScalar(dt * -this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle;
      }
      if (this.controller.keys["left"]) {
        // Calculate left vector by rotating the forward vector 90 degrees around the up axis
        const leftVector = new THREE.Vector3(forwardVector.z, 0, -forwardVector.x).normalize();
        this.mesh.position.add(
          leftVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle + Math.PI/2;
      }
      if (this.controller.keys["right"]) {
        // Calculate right vector by rotating the forward vector -90 degrees around the up axis
        const rightVector = new THREE.Vector3(-forwardVector.z, 0, forwardVector.x).normalize();
        this.mesh.position.add(
          rightVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle - Math.PI/2;
      }
      if (this.controller.keys["rotatexLeft"]) {
        this.camera.camera.rotation.y += 0.1;
      }
      if (this.controller.keys["rotatexRight"]) {
        this.camera.camera.rotation.y -= 0.1;
      }
      this.lastRotation = this.mesh.rotation.y;
      if (direction.length() == 0) {
        if (this.animations["idle"]) {
          if (this.state != "idle") {
            this.mixer.stopAllAction();
            this.state = "idle";
          }
          this.mixer.clipAction(this.animations["idle"].clip).play();
        }
      } else {
        if (this.animations["run"]) {
          if (this.state != "run") {
            this.mixer.stopAllAction();
            this.state = "run";
          }
          this.mixer.clipAction(this.animations["run"].clip).play();
        }
      }


      this.mesh.rotation.y += this.rotationVector.y;
      if (this.obstacles) {
        for (let obstacle of this.obstacles) {
            if (this.isColliding(obstacle)) {
                // Jika terjadi collision, kembalikan posisi ke posisi sebelumnya
                this.mesh.position.copy(previousPosition);
                break; // Hentikan loop setelah collision terdeteksi
            }
        }
      }
      // var forwardVector = new THREE.Vector3(1, 0, 0);
      // var rightVector = new THREE.Vector3(0, 0, 1);
      // forwardVector.applyAxisAngle(
      //   new THREE.Vector3(0, 1, 0),
      //   this.rotationVector.y
      // );
      // rightVector.applyAxisAngle(
      //   new THREE.Vector3(0, 1, 0),
      //   this.rotationVector.y
      // );


      

      this.camera.setup(this.positionObject);

      this.positionObject = this.mesh.position;

      if (this.mixer) {
        this.mixer.update(dt);
      }
    }
  }
  isColliding(obstacle) {
    // Gunakan bounding box untuk deteksi collision kasar
    const playerBoundingBox = new THREE.Box3().setFromObject(this.mesh);
    const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);

    return playerBoundingBox.intersectsBox(obstacleBoundingBox);
  }
}

export class PlayerController {
  constructor(ThirdPersonCamera,positionObject) { // Add camera parameter here
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      rotatexLeft: false,
      rotatexRight: false
    };
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();
    this.ThirdPersonCamera = ThirdPersonCamera; // Store camera reference

    // Variables for rotation around a specific point
    this.center = positionObject; // Center of rotation, e.g., origin
    

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
    document.addEventListener("wheel", (e) => this.onMouseWheel(e), false); // Add this line
  }

  onMouseMove(event) {
    if (!this.mouseDown) return;

    this.center = this.ThirdPersonCamera.positionObject;
    console.log(this.center);

    const deltaX = (event.movementX || event.mozMovementX || event.webkitMovementX || 0) * 0.01; // Convert mouse position to angle
    const deltaY = (event.movementY || event.mozMovementY || event.webkitMovementY || 0) * 0.01; // Vertical rotation

    this.ThirdPersonCamera.theta += deltaX; // Update theta based on horizontal movement
    this.ThirdPersonCamera.phi += deltaY; // Update phi based on vertical movement
    // Ensure phi stays within the range of [-π/2, π/2] to avoid flipping the camera
    this.ThirdPersonCamera.phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.ThirdPersonCamera.phi));


    this.ThirdPersonCamera.updateCameraPosition();
    // this.ThirdPersonCamera.camera.lookAt(this.center);

  }
  onMouseWheel(event) {
    if (event.deltaY < 0) {
      this.ThirdPersonCamera.zoom(-2);
    } else if (event.deltaY > 0) {
      this.ThirdPersonCamera.zoom(2);
    }
    this.ThirdPersonCamera.updateCameraPosition();
  }
  onKeyDown(event){
    switch(event.keyCode){
        case "I".charCodeAt(0):
        case "i".charCodeAt(0):
            this.keys['forward'] = true;
            break;
        case "K".charCodeAt(0):
        case "k".charCodeAt(0):
            this.keys['backward'] = true;
            break;
        case "J".charCodeAt(0):
        case "j".charCodeAt(0):
            this.keys['left'] = true;
            break;
        case "L".charCodeAt(0):
        case "l".charCodeAt(0):
            this.keys['right'] = true;
            break;
    }
}
onKeyUp(event){
    switch(event.keyCode){
        case "I".charCodeAt(0):
        case "i".charCodeAt(0):
            this.keys['forward'] = false;
            break;
        case "K".charCodeAt(0):
        case "k".charCodeAt(0):
            this.keys['backward'] = false;
            break;
        case "J".charCodeAt(0):
        case "j".charCodeAt(0):
            this.keys['left'] = false;
            break;
        case "L".charCodeAt(0):
        case "l".charCodeAt(0):
            this.keys['right'] = false;
            break;
    }    
}

}

export class ThirdPersonCamera1 {
  constructor(camera, positionOffSet, targetOffSet) {
    this.camera = camera;
    this.positionOffSet = positionOffSet;
    this.targetOffSet = targetOffSet;
    this.zoomLevel = 1; // Default zoom level

    this.camera.rotation.order = 'YXZ'; // Set rotation order if needed
    this.doOnce = false;
    this.radius = 1 ; // Radius from center to camera position
    this.positionObject = 0;
    this.theta = 0;
    this.phi = 0;
  }
  // setup(target, angle) {
  //   var temp = new THREE.Vector3(0, 0, 0);
  //   temp.copy(this.positionOffSet);
  //   temp.multiplyScalar(this.zoomLevel); // Apply zoom level

  //   // Apply rotations (roll, pitch, yaw)
  //   var roll = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), angle.x);
  //   var pitch = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle.y);
  //   var yaw = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.z);
    
  //   temp.applyAxisAngle(roll, angle.x);
  //   temp.applyAxisAngle(pitch, angle.y);
  //   temp.applyAxisAngle(yaw, angle.z);

  //   temp.add(target);

  //   this.camera.position.copy(temp);

  //   var newTarget = new THREE.Vector3(0, 0, 0);
  //   newTarget.copy(this.targetOffSet);
  //   newTarget.add(target);

  //   this.camera.lookAt(newTarget);
  // }
  // Function to update camera position based on rotation
  updateCameraPosition() {
    const x = this.positionObject.x -1 + this.zoomLevel;
    const y = this.positionObject.y + 14 + this.zoomLevel;
    const z = this.positionObject.z -1+ this.zoomLevel;
    this.camera.position.set(x, y, z);
  }
  setup(positionObject) {
    if(!this.doOnce){
      this.doOnce = true;
      // this.camera.lookAt(positionObject);
      
    }
    this.positionObject = positionObject;
    this.updateCameraPosition();
  }
  zoom(deltaZoom) {
    this.zoomLevel += deltaZoom * 0.01;
    this.zoomLevel = Math.max(0.1, Math.min(this.zoomLevel, 2)); // Clamp zoom level between 0.5 and 2
  }
}

