import * as THREE from 'three';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

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

// const light1 = new THREE.SpotLight()
// light1.position.set(2.5, 5, 5)
// light1.angle = Math.PI / 4
// light1.penumbra = 0.5
// light1.castShadow = true
// light1.shadow.mapSize.width = 1024
// light1.shadow.mapSize.height = 1024
// light1.shadow.camera.near = 0.5
// light1.shadow.camera.far = 20
// scene.add(light1)

// const light2 = new THREE.SpotLight()
// light2.position.set(-2.5, 5, 5)
// light2.angle = Math.PI / 4
// light2.penumbra = 0.5
// light2.castShadow = true
// light2.shadow.mapSize.width = 1024
// light2.shadow.mapSize.height = 1024
// light2.shadow.camera.near = 0.5
// light2.shadow.camera.far = 20
// scene.add(light2)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 10;
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
//renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const controls = new TrackballControls( camera, renderer.domElement );
controls.screenSpacePanning = true
controls.target.y = 1

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const normalMaterial = new THREE.MeshNormalMaterial()
const phongMaterial = new THREE.MeshPhongMaterial()

const planeGeometry = new THREE.PlaneGeometry(25, 25)
const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial)
planeMesh.rotateX(-Math.PI / 2)
planeMesh.receiveShadow = true
scene.add(planeMesh)
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

const diceMeshes = [];
const diceBodies = [];
let diceLoaded = false;

const loader = new GLTFLoader();
loader.load(
    './js/dice_v5.gltf',
    function (gltf) {
        let diceMesh = new THREE.Object3D();
        gltf.scene.traverse(function (child) {
            if (child.name === "Scene") {
                const m = child;
                m.receiveShadow = true;
                m.castShadow = true;
                m.material = normalMaterial;
                diceMesh = m;
            }
        })
        for (let i = 0; i < 2; i++) {
            const diceMeshClone = diceMesh.clone();
            diceMeshClone.position.x = Math.floor(Math.random() * 10) - 5
            diceMeshClone.position.z = Math.floor(Math.random() * 10) - 5
            diceMeshClone.position.y = 5 + i;
            diceMeshClone.scale.set(0.5, 0.5, 0.5);
            diceMeshClone.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random());
            scene.add(diceMeshClone);
            diceMeshes.push(diceMeshClone);

            const diceBody = new CANNON.Body({ mass: 1});
            const diceBodyShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
            diceBody.addShape(diceBodyShape);
            diceBody.position.x = diceMeshClone.position.x;
            diceBody.position.y = diceMeshClone.position.y;
            diceBody.position.z = diceMeshClone.position.z;
            diceBody.scale = diceMeshClone.scale;
            diceBody.rotation = diceMeshClone.rotation;

            const force = 3 + 5 * Math.random();
            diceBody.applyImpulse(
                new CANNON.Vec3(-force, force, 0),
                new CANNON.Vec3(0, 0, 2)
            );
            world.addBody(diceBody);
            diceBodies.push(diceBody)
        }
        diceLoaded = true;
    },
    function (xhr) {
        console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function (err) {
        console.log("An error occurred.");
    }
);

function render() {
    renderer.render(scene, camera)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

window.addEventListener('resize', onWindowResize, false)

const clock = new THREE.Clock()
let delta;

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)

    if (diceLoaded) {
        diceMeshes.forEach((m, i) => {
            m.position.set(
                diceBodies[i].position.x,
                diceBodies[i].position.y,
                diceBodies[i].position.z
            );
            m.quaternion.set(
                diceBodies[i].quaternion.x,
                diceBodies[i].quaternion.y,
                diceBodies[i].quaternion.z,
                diceBodies[i].quaternion.w,
            )
        })
    }

    // cannonDebugRenderer.update()

    render()

    //stats.update()
}

animate()