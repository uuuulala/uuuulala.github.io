import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { SpinControls } from './SpinControlsModule.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/DRACOLoader.js';



// ==========================================================


// Change to switch off controls, statistic, etc
let isDebugMode = false;


// To change with GUI
let settings = {
    ambientLightIntensity: 1.8,
    bottomLightIntensity: 1.1,
    sceneRotation: .3,
    metalness: 0.5,
    roughness: 0.9,
    globeRotationSpeed: 1,
    droneRotationSpeed: 1,
    test: 1
};

// Location names to action
let URL, titleText;
let nameToData = (name) => {
    switch (name) {
        case 'location-pin--drone':
            titleText = 'Request delivery';
            URL = 'https://wpdsun.com.au/node/7';
            break;
        case 'location-pin-buildings':
            titleText = 'Library';
            URL = 'https://wpdsun.com.au/node/4';
            break;
        case 'location-pin-factory':
            titleText = 'Event toolkit';
            URL = 'https://wpdsun.com.au/node/6';
            break;
        case 'location-pin-lighthouse':
            titleText = 'How to guides';
            URL = 'https://wpdsun.com.au/node/5';
            break;
        case 'location-pin-postbox':
            titleText = 'Contact us';
            URL = 'https://wpdsun.com.au/node/9';
            break;
        case 'location-pin-TV':
            titleText = 'Specialist videos';
            URL = 'https://wpdsun.com.au/node/8';
            break;
    }
};

// Selectors
const pageContainer = document.querySelector('.page-container');
const canvasContainer = document.querySelector('.canvas-container');
const canvas = pageContainer.querySelector('canvas');
const title = pageContainer.querySelector('.title');

// Globals
let stats, spinControl, drone, globe, globeSpinWrapper, clouds, cloud, lighthouse, duck, ship, test;
let clock = new THREE.Clock();

// For spheres to be replaced with "real" objects
let locationPin = [];
let locationPinMaterials = [];
const locationPinMaterialsColors = {
    active: 0xffffff,
    inActive: 0xfaa324,
    clicked: 0xFF0000
};

// Canvas size
let sizes = {
    width: canvasContainer.clientWidth,
    height: canvasContainer.clientHeight
};

// Create scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xFFFFFF, 100, 250);



// ==========================================================

// Load the model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./js/globe/js/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
    './js/globe/models/globe-comp.glb',
    (gltf) => {
        scene.add(gltf.scene);

        gltf.scene.children.forEach((child) => {
            if (child.name === 'drone') {
                drone = child;
                drone.children[0].children.forEach((droneChild) => {
                    if (droneChild.name.startsWith('location-pin-')) {
                        locationPin.push(droneChild);
                    }
                });
            } else if (child.name === 'globeWrapper') {
                globe = child;
                globeSpinWrapper = child.children[0];
                spinControl = new SpinControls(globeSpinWrapper, 50, camera, renderer.domElement);

                globe.children[0].children.forEach((globeChild) => {
                    if (globeChild.name.startsWith('location-pin-')) {
                        locationPin.push(globeChild);
                    } else if (globeChild.name === 'OCEAN') {
                        globeChild.scale.set(1.01, 1.01, 1.01);
                    } else if (globeChild.name === 'ICEBERG') {
                        globeChild.scale.set(.97, .97, .97);
                    } else if (globeChild.name === 'DUCK') {
                        duck = globeChild;
                    } else if (globeChild.name === 'SHIP') {
                        ship = globeChild;
                    } else if (globeChild.name === 'LIGHTHOUSE') {
                        globeChild.children.forEach((globeChildChild) => {
                            if (globeChildChild.name === 'lighthouse-cone') {
                                lighthouse = globeChildChild;
                            }
                        });
                    }
                });
            } else if (child.name === 'clouds') {
                clouds = child;
                cloud = child.children[0];
            }
        });

        addInstancedObjects();
        updateSceneMaterials();
        canvasContainer.style.opacity = '1';
    }
);

function addInstancedObjects() {
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: .85,
    });
    let inst = new THREE.InstancedMesh(
        cloud.geometry,
        cloudMaterial, 22);
    clouds.add(inst);


    let dummyObject = new THREE.Object3D();
    let dummyPosition = new THREE.Vector3();

    for (let i = 0; i < 22; i++) {
        dummyObject.position.copy(dummyPosition);
        dummyObject.rotation.x = Math.random() * 2 * Math.PI;
        dummyObject.rotation.y = Math.random() * 2 * Math.PI;
        dummyObject.rotation.z = Math.random() * 2 * Math.PI;
        dummyObject.scale.set(.85 + .3 * Math.random(), .85 + .3 * Math.random(), .85 + .3 * Math.random());
        dummyObject.updateMatrix();
        inst.setMatrixAt(i, dummyObject.matrix);
    }
}

function updateSceneMaterials() {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && !child.name.startsWith('location-pin-') && child.parent.name !== 'clouds') {
            child.material.side = THREE.FrontSide;
            child.material.metalness = settings.metalness;
            child.material.roughness = settings.roughness;

            if (child.name !== 'lighthouse-cone') {
                child.material.transparent = false;
            } else {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = .7;
            }

            if (child.name === 'ICEBERG') {
                child.material.flatShading = true;
                child.material.metalness = .6;
            }
            if (child.name === 'drone-cube' || child.name === 'drone-box' || child.name === 'drone-blade' || child.name === 'ship-base' || child.parent.name === 'DUCK') {
                child.castShadow = true;
            } else if (child.name === 'OCEAN' || child.parent.name === 'CONTINENTS') {
                child.receiveShadow = true;
            }
        }
    });

    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: .85,
    });


    locationPin.forEach((p) => {
        const material = new THREE.MeshBasicMaterial({
            color: locationPinMaterialsColors.inActive,
        });
        locationPinMaterials.push(material);
        p.material = material;
    })
}


// Add glow to the globe
const glowMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    uniforms: {
        u_power: { type: 'f', value: 9 },
        u_size: { type: 'f', value: .2 },
        u_alpha: { type: 'f', value: 0.5 }
    },
    transparent: true,
});
const glowGeometry = new THREE.PlaneBufferGeometry(300, 300);
const glowBack = new THREE.Mesh(glowGeometry, glowMaterial);
glowBack.position.x = 3;
glowBack.position.y = 5;
glowBack.position.z = -30;
scene.add(glowBack);


// ==========================================================

// Add lights

const ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientLightIntensity);
scene.add(ambientLight);


const pointLight = new THREE.PointLight(0xffffff, settings.topLightIntensity);
pointLight.position.set(30, 30, 55);
scene.add(pointLight);
pointLight.castShadow = true;
if (isDebugMode) {
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
    scene.add(pointLightHelper);
}


// Add camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 135);
camera.rotation.z = settings.sceneRotation;
scene.add(camera);



// ==========================================================

// Setup renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#1D3075');

console.log(renderer.info);

// ==========================================================

// Setup raycaster

const raycaster = new THREE.Raycaster();
let currentIntersect = null;

const mouse = new THREE.Vector2();
canvasContainer.addEventListener('mousemove', (e) => {
    const x = e.pageX - canvasContainer.offsetLeft;
    const y = e.pageY - canvasContainer.offsetTop;
    mouse.x = x / sizes.width * 2 - 1;
    mouse.y = - (y / sizes.height) * 2 + 1;
});
canvasContainer.addEventListener('touchmove', (e) => {
    const x = e.targetTouches[0].pageX - canvasContainer.offsetLeft;
    const y = e.targetTouches[0].pageY - canvasContainer.offsetTop;
    mouse.x = x / sizes.width * 2 - 1;
    mouse.y = - (y / sizes.height) * 2 + 1;
});

window.addEventListener('click', () => {
    if (currentIntersect) {
        const intersects = raycaster.intersectObjects(locationPin);
        intersects[0].object.material.color.setHex(locationPinMaterialsColors.clicked);
        if (URL) {
            clock = null;
            window.location.assign(URL);
        }
    }
});

function checkIntersects() {
    if (raycaster && globe) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(locationPin);

        if (intersects.length) {
            if (!currentIntersect) {
                intersects[0].object.material.color.setHex(locationPinMaterialsColors.active);
                document.body.style.cursor = 'pointer';
            }
            currentIntersect = intersects[0].object;
            nameToData(currentIntersect.name);
            title.innerHTML = titleText;
        } else {
            if (currentIntersect) {
                currentIntersect.material.color.setHex(locationPinMaterialsColors.inActive);
                currentIntersect = null;
                document.body.style.cursor = 'auto';
                URL = null;
                title.innerHTML = '';
            }
        }
    }
}



// ==========================================================

// FPS statistics and 3 axises

stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

if (isDebugMode) {
    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);
}




// ==========================================================

// To play with settings in debug mode

if (isDebugMode) {
    const gui = new dat.gui.GUI;
    gui.add(settings, 'test', -100, 100, 0.1).name('test').onChange((v) => {
        pointLightBottom.shadow.camera.right = v;
    });
    gui.add(settings, 'ambientLightIntensity', 0.01, 3, 0.001).name('ambient light intensity').onChange((v) => {
        ambientLight.intensity = v;
    });
    gui.add(settings, 'bottomLightIntensity', 0.01, 3, 0.001).name('bottom light intensity').onChange((v) => {
        pointLightBottom.intensity = v;
    });
    gui.add(settings, 'sceneRotation', 0.01, 1, 0.001).name('scene rotation').onChange((v) => {
        camera.rotation.z = v;
    });
    gui.add(settings, 'metalness', 0.01, 1, 0.001).name('metalness').onChange(updateSceneMaterials);
    gui.add(settings, 'roughness', 0.01, 1, 0.001).name('roughness').onChange(updateSceneMaterials);
    gui.add(settings, 'globeRotationSpeed', 0.1, 10, 0.001).name('globe speed');
    gui.add(settings, 'droneRotationSpeed', 0.1, 10, 0.001).name('drone speed');
}





// ==========================================================

// Update on resize


window.addEventListener('resize', () => {
    sizes.width = canvasContainer.clientWidth;
    sizes.height = canvasContainer.clientHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});




// ==========================================================

// Animations

const lighthouseAxis = new THREE.Vector3(-40.933799743652344, -10.520000457763672, 30.112199783325195).normalize();
const duckAxis = new THREE.Vector3(-23, 10, 70).normalize();
const shipAxis = new THREE.Vector3(14, 20, 38).normalize();
let previousTime = 0;
const tick = () => {
    if (isDebugMode && stats) {
        // if (stats) {
        stats.begin();
    }

    const elapsedTime = clock.getElapsedTime();
    let deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    renderer.render(scene, camera);

    if (drone) {
        drone.rotation.y += deltaTime * settings.droneRotationSpeed;
    }
    if (clouds) {
        clouds.rotation.y += deltaTime * .03 * settings.globeRotationSpeed;
    }
    if (globe) {
        globe.rotation.y += deltaTime * .07 * settings.globeRotationSpeed;
    }
    if (lighthouse) {
        lighthouse.rotateOnAxis(lighthouseAxis, deltaTime);
    }
    if (duck) {
        duck.rotateOnAxis(duckAxis, deltaTime * .5);
    }
    if (ship) {
        ship.rotateOnAxis(shipAxis, -deltaTime * .2);
    }
    if (locationPin.length) {
        locationPin.forEach((p, pIdx) => {
            if (pIdx) {
                const s = Math.sin(elapsedTime * 1.8) * .03 + .025;
                p.scale.set(1 + s, 1 + s, 1 + s);
            }
        })
    }

    if (spinControl) {
        spinControl.update();
    }

    checkIntersects();

    if (isDebugMode && stats) {
        // if (stats) {
        stats.end();
    }

    window.requestAnimationFrame(tick)
};

tick();