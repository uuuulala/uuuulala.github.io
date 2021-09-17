import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { SpinControls } from './SpinControlsModule.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/DRACOLoader.js';



// ==========================================================


// Change to switch off controls, statistic, etc
let isDebugMode = false;
let useOrbitControls = false;


// To change with GUI
let settings = {
    ambientLightIntensity: 1.85,
    topLightIntensity: .3,
    bottomLightIntensity: .6,
    sceneRotation: .25,
    metalness: 0.5,
    roughness: 0.9,
    globeRotationSpeed: 1,
    droneRotationSpeed: 1,
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
let stats, spinControl, drone, globe, globeSpinWrapper, clouds, lighthouse;
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
scene.fog = new THREE.Fog(0x163d47, 100, 150);



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
                        const material = new THREE.MeshBasicMaterial({color: locationPinMaterialsColors.inActive});
                        locationPinMaterials.push(material);
                        droneChild.material = material;
                    }
                });
            } else if (child.name === 'globeWrapper') {
                globe = child;
                globeSpinWrapper = child.children[0];
                spinControl = new SpinControls(globeSpinWrapper, 50, camera, renderer.domElement);

                globe.children[0].children.forEach((globeChild) => {
                    if (globeChild.name.startsWith('location-pin-')) {
                        locationPin.push(globeChild);
                        const material = new THREE.MeshBasicMaterial({color: locationPinMaterialsColors.inActive});
                        locationPinMaterials.push(material);
                        globeChild.material = material;
                    } else if (globeChild.name === 'OCEAN') {
                        globeChild.scale.set(1.01, 1.01, 1.01);
                    } else if (globeChild.name === 'ICEBERG') {
                        globeChild.scale.set(.97, .97, .97);
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
            }
        });
        updateSceneMaterials();
    }
);

function updateSceneMaterials() {
    scene.traverse((child) => {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && !child.name.startsWith('point-of-interest-')) {
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
            if (child.parent.name === 'droneWrapper') {
                child.material.metalness = .35;
                child.castShadow = true;
            } else if (child.name === 'OCEAN') {
                child.receiveShadow = true;
            } else if (child.name === 'CONTINENTS') {
                child.children[0].children.forEach((continent) => {
                    continent.receiveShadow = true;
                });
            }

            if (child.parent.name === 'clouds') {
                child.material = child.material.clone();
                child.castShadow = true;
                child.material.transparent = true;
                child.material.opacity = .9;
            }
        }
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

const pointLightBottom = new THREE.PointLight(0xffffff, settings.bottomLightIntensity);
pointLightBottom.position.set(-35, -35, 35);
scene.add(pointLightBottom);
pointLightBottom.castShadow = true;
pointLightBottom.shadow.camera.far = 100;
pointLightBottom.shadow.mapSize.set(512, 512);
if (isDebugMode) {
    const pointLightBottomHelper = new THREE.PointLightHelper(pointLightBottom, 10);
    scene.add(pointLightBottomHelper);
}

const pointLightTop = new THREE.PointLight(0xffffff, settings.topLightIntensity);
pointLightTop.position.set(35, 35, 35);
scene.add(pointLightTop);
pointLightTop.castShadow = true;
pointLightTop.shadow.camera.far = 100;
pointLightTop.shadow.mapSize.set(512, 512);
if (isDebugMode) {
    const pointLightTopHelper = new THREE.PointLightHelper(pointLightTop, 10);
    scene.add(pointLightTopHelper);
}


// Add camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 130);
camera.rotation.z = settings.sceneRotation;
scene.add(camera);


// Add controls for debug purposes

if (useOrbitControls) {
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.update();
}



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

if (isDebugMode) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);
}




// ==========================================================

// To play with settings in debug mode

if (isDebugMode) {
    const gui = new dat.gui.GUI;
    gui.add(settings, 'ambientLightIntensity', 0.01, 3, 0.001).name('ambient light intensity').onChange((v) => {
        ambientLight.intensity = v;
    });
    gui.add(settings, 'topLightIntensity', 0.01, 3, 0.001).name('top light intensity').onChange((v) => {
        pointLightTop.intensity = v;
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
let previousTime = 0;
const tick = () => {
    if (isDebugMode && stats) {
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
        lighthouse.rotateOnAxis(lighthouseAxis, deltaTime);
    }

    if (spinControl) {
        spinControl.update();
    }

    checkIntersects();

    if (isDebugMode && stats) {
        stats.end();
    }

    window.requestAnimationFrame(tick)
};

tick();