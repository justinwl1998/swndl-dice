/*
    todos:

    * figure out how to import gltf meshes into three.js
    * implement color changing function
    * implement the different pages as per the mockups
*/
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvasEl = document.querySelector('#canvas');
const darkMode = document.querySelector('#darkMode');
const rollMode = document.querySelector('#rollMode');
const previewMode = document.querySelector('#previewMode');

function toggleDarkMode() {
    console.log("toggleDarkMode")
    const element = document.body;
    element.classList.toggle("dark-mode");
}

darkMode.onclick = function() {
    toggleDarkMode();
}

const loader = new GLTFLoader();
let renderer, scene, camera, diceMesh, physicsWorld;
let controls;
// 0: Preview Mode
// 1: Roll Mode
let interactMode = 0;

let params = {
    numberOfDice: 2
};

const diceModel1 = new THREE.Object3D();
const diceModel2 = new THREE.Object3D();

function toggleRollMode() {
    rollMode.disabled = true;
    previewMode.disabled = false;
    interactMode = 1;

    scene.remove.apply(scene, scene.children);
    // Reset the scene and rebuild it with physics?
    initPhysics();
    initScene(interactMode);
}

rollMode.onclick = function() {
    toggleRollMode();
}

function togglePreviewMode() {
    previewMode.disabled = true;
    rollMode.disabled = false;
    interactMode = 0;
    scene.remove.apply(scene, scene.children);
    initScene(interactMode);
}

previewMode.onclick = function() {
    togglePreviewMode();
}

initScene(interactMode);

window.addEventListener('resize', updateSceneSize);

function initScene(initMode) {
    scene = new THREE.Scene();

    if (initMode == 1) {
        console.log("Hey guys, I just tried to do something very silly!");
        //return;
    }

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasEl
    });

    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.display = "inline";
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000)
    
    if (initMode == 0) {
        controls = new TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 5;
    }

    updateSceneSize();

    // todo: Make if statement for roll mode
    loader.load(
        './js/dice_v5.gltf',
        function ( gltf ) {
            gltf.scene.traverse(function (child) {
                console.log(child);
            })
            diceModel1.add(gltf.scene);
            diceModel2.add(gltf.scene.clone());

            gltf.animations;
            gltf.scene;
            gltf.scenes;
            gltf.cameras;
            gltf.asset;
        },
        function (xhr) {
            console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function (err) {
            console.log("An error occurred.");
        }
    );
    
    diceModel1.translateX(-1.5);
    diceModel1.translateY(0.77);

    diceModel1.rotateX(0.3523);
    diceModel1.rotateY(1.241);
    diceModel1.rotateZ(0.195);
    scene.add(diceModel1);

    diceModel2.translateX(1.2);
    diceModel2.translateY(-1.3);
    diceModel2.translateZ(-1.5);
    diceModel2.rotateX(1.53);
    diceModel2.rotateY(0.461);
    diceModel2.rotateZ(2.871);
    scene.add(diceModel2);

    camera.position.z = 3;
    camera.position.x = 3;
    camera.position.y = 2;
    
    // lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 8);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, 8);
    topLight.position.set(1, 1, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 5;
    topLight.shadow.camera.far = 400;
    scene.add(topLight);

    if (initMode == 1) {
        createFloor();
    }
}

function initPhysics() {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -50, 0)
    })
    physicsWorld.defaultContactMaterial.restitution = .3;
}

function createFloor() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.ShadowMaterial({
            opacity: .1,
        })
    )
    floor.receiveShadow = true;
    floor.position.y = -7;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
    scene.add(floor);

    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
        color: 0xff0000
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);
}

let animate = function() {
    requestAnimationFrame( animate );

    diceModel1.rotation.x += 0.01;
    diceModel1.rotation.y += 0.01;
    diceModel1.rotation.z += 0.01;

    diceModel2.rotation.x -= 0.01;
    diceModel2.rotation.y -= 0.01;
    diceModel2.rotation.z -= 0.01;

    controls.update();

	render();
};

let render = function() {
    renderer.render( scene, camera );
}

animate();

function updateSceneSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
