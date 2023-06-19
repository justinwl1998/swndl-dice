/*
    todos:

    * figure out how to import gltf meshes into three.js
    * implement color changing function
    * implement the different pages as per the mockups
*/

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvasEl = document.querySelector('#canvas');
const darkMode = document.querySelector('#darkMode');

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
// initialize the geometry and materials to make the "dice"
let geometry = new THREE.BoxGeometry( 1, 1, 1 );
let material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
//let material2 = new THREE.MeshStandardMaterial( { color: 0x0000ff });
//let cube = new THREE.Mesh( geometry, material );
//let cube2 = new THREE.Mesh( geometry, material)

const diceModel1 = new THREE.Object3D();
const diceModel2 = new THREE.Object3D();

initScene();

window.addEventListener('resize', updateSceneSize);

var onKeyDown = function(event) {
    if (event.keyCode == 67) { // when 'c' is pressed
      cube.material.color.setHex(0xff00ff); // there is also setHSV and setRGB
      cube2.material.color.setHex(0xff00ff);
    }
  };
  document.addEventListener('keydown', onKeyDown, false);

function initScene() {
    scene = new THREE.Scene();

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
    
    controls = new TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 5;

    loader.load(
        './js/dice_v5.gltf',
        function ( gltf ) {
            //let model = gltf.scene;
            //let model2 = gltf.scene;
            //scene.add( model );
            //scene.add( model2 );
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

    /*
    scene.add(cube);
    scene.add(cube2);
    
    cube2.translateX(1.5);
    cube2.translateY(1);
    */
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

// window.addEventListener('resize', updateSceneSize);

// initScene();

// function initScene() {
//     renderer = new THREE.WebGLRenderer({
//         alpha: true,
//         antialias: true,
//         canvas: canvasEl
//     });

//     renderer.shadowMap.enabled = true
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//     scene = new THREE.Scene();

//     camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 300)
//     camera.position.set(0, .5, 4).multiplyScalar(7);

//     scene.add(cube);

//     render();
// }

// function updateSceneSize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function render() {
//     //physicsWorld.fixedStep();

//     // for (const dice of diceArray) {
//     //     dice.mesh.position.copy(dice.body.position)
//     //     dice.mesh.quaternion.copy(dice.body.quaternion)
//     // }

//     renderer.render(scene, camera);
//     requestAnimationFrame(render);
// }
