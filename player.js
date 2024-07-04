import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class Player {

    constructor(camera, controller, scene, speed, obstacles) {
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.speed = speed;
        this.state = "idle";
        this.rotationVector = new THREE.Vector3(0, 0, 0);
        this.animations = {};
        this.lastRotation = 0;
        this.obstacles = obstacles; // Array untuk menyimpan objek-objek yang menjadi rintangan

        this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);

        this.loadModel();
    }

    loadModel() {
        var loader = new FBXLoader();
        loader.setPath('./resources/Knight/');
        loader.load('Dwarf Idle.fbx', (fbx) => {
            fbx.scale.setScalar(0.05);
            fbx.position.set(0, 0.2, -100);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            this.mesh = fbx;
            this.scene.add(this.mesh);
            this.mesh.rotation.y += Math.PI / 2;
            this.mixer = new THREE.AnimationMixer(this.mesh);

            var onLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this.mixer.clipAction(clip);

                this.animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };

            const loader = new FBXLoader();
            loader.setPath('./resources/Knight/');
            loader.load('Dwarf Idle.fbx', (fbx) => { onLoad('idle', fbx) });
            loader.load('Sword And Shield Run.fbx', (fbx) => { onLoad('run', fbx) });
        });
    }

    update(dt) {
        if (this.mesh && this.animations) {
            this.lastRotation = this.mesh.rotation.y;
            var direction = new THREE.Vector3(0, 0, 0);

            if (this.controller.keys['forward']) {
                direction.x = 1;
                this.mesh.rotation.y = Math.PI / 2;
            }
            if (this.controller.keys['backward']) {
                direction.x = -1;
                this.mesh.rotation.y = -Math.PI / 2;
            }
            if (this.controller.keys['left']) {
                direction.z = -1;
                this.mesh.rotation.y = Math.PI;
            }
            if (this.controller.keys['right']) {
                direction.z = 1;
                this.mesh.rotation.y = 0;
            }
            this.lastRotation = this.mesh.rotation.y;

            if (direction.length() == 0) {
                if (this.animations['idle']) {
                    if (this.state != "idle") {
                        this.mixer.stopAllAction();
                        this.state = "idle";
                    }
                    this.mixer.clipAction(this.animations['idle'].clip).play();
                }
            } else {
                if (this.animations['run']) {
                    if (this.state != "run") {
                        this.mixer.stopAllAction();
                        this.state = "run";
                    }
                    this.mixer.clipAction(this.animations['run'].clip).play();
                }
            }

            if (this.controller.mouseDown) {
                var dtMouse = this.controller.deltaMousePos;
                dtMouse.x = dtMouse.x / Math.PI;
                dtMouse.y = dtMouse.y / Math.PI;

                this.rotationVector.y += dtMouse.x * dt * 10;
                this.rotationVector.z += dtMouse.y * dt * 10;
            }

            this.mesh.rotation.y += this.rotationVector.y;

            var forwardVector = new THREE.Vector3(1, 0, 0);
            var rightVector = new THREE.Vector3(0, 0, 1);
            forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
            rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);

            // Simpan posisi sebelumnya untuk deteksi collision
            var previousPosition = this.mesh.position.clone();

            // Update posisi objek berdasarkan arah dan kecepatan
            this.mesh.position.add(forwardVector.multiplyScalar(dt * this.speed * direction.x));
            this.mesh.position.add(rightVector.multiplyScalar(dt * this.speed * direction.z));

            // Deteksi collision dengan rintangan
            if (this.obstacles) {
                for (let obstacle of this.obstacles) {
                    if (this.isColliding(obstacle)) {
                        // Jika terjadi collision, kembalikan posisi ke posisi sebelumnya
                        this.mesh.position.copy(previousPosition);
                        break; // Hentikan loop setelah collision terdeteksi
                    }
                }
            }

            this.camera.setup(this.mesh.position, this.rotationVector);

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

    constructor() {
        this.keys = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false
        }
        this.mousePos = new THREE.Vector2();
        this.mouseDown = false;
        this.deltaMousePos = new THREE.Vector2();
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        document.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
    }
    onMouseDown(event) {
        this.mouseDown = true;
    }
    onMouseUp(event) {
        this.mouseDown = false;
    }
    onMouseMove(event) {
        var currentMousePos = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        this.deltaMousePos.addVectors(currentMousePos, this.mousePos.multiplyScalar(-1));
        this.mousePos.copy(currentMousePos);
    }
    onKeyDown(event) {
        switch (event.keyCode) {
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
    onKeyUp(event) {
        switch (event.keyCode) {
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

export class ThirdPersonCamera {
    constructor(camera, positionOffSet, targetOffSet) {
        this.camera = camera;
        this.positionOffSet = positionOffSet;
        this.targetOffSet = targetOffSet;
    }
    setup(target, angle) {
        var temp = new THREE.Vector3(0, 0, 0);
        temp.copy(this.positionOffSet);
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.y);
        temp.addVectors(target, temp);
        this.camera.position.copy(temp);
        temp = new THREE.Vector3(0, 0, 0);
        temp.addVectors(target, this.targetOffSet);
        this.camera.lookAt(temp);
    }
}
