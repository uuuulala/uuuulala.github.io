import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { SpinControls } from './SpinControlsModule.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/DRACOLoader.js';

let isDebugMode = true;

let settings = {
    ambientLightIntensity: 1,
    topLightIntensity: .3,
    bottomLightIntensity: .9,
    sceneRotation: .2,
    metalness: 0.2,
    roughness: 0.6
};



const pageContainer = document.querySelector('.page-container');
const canvasContainer = document.querySelector('.canvas-container');
// canvasContainer.style.height = canvasContainer.clientWidth + 'px';
canvasContainer.style.width = canvasContainer.clientHeight + 'px';
const canvas = pageContainer.querySelector('canvas');
const log = pageContainer.querySelector('.log');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x49CDEC, 100, 200);

let stats;
let spinControl, drone, globe, globeSpinWrapper, clouds;
let pointsOfInterest = [];
let pointsOfInterestMaterials = [];

const pointsOfInterestMaterialsColors = {
    active: 0xFF0000,
    inActive: 0xAAAAAA,
    clicked: 0xFF00FF
};

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./js/globe/js/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
    './js/globe/models/globe-comp.gltf',
    (gltf) => {
        scene.add(gltf.scene);

        gltf.scene.children.forEach((child) => {
            if (child.name === 'drone') {
                drone = child;
            } else if (child.name === 'globeWrapper') {
                globe = child;
                globeSpinWrapper = child.children[0];
                spinControl = new SpinControls(globeSpinWrapper, 50, camera, renderer.domElement);

                globe.children[0].children.forEach((globeChild) => {
                    if (globeChild.name.startsWith('point-of-interest-')) {
                        pointsOfInterest.push(globeChild);
                        const material = new THREE.MeshBasicMaterial({color: pointsOfInterestMaterialsColors.inActive});
                        pointsOfInterestMaterials.push(material);
                        globeChild.material = material;
                    }
                });

            } else if (child.name === 'clouds') {
                clouds = child;
            }
        });

        updateSceneMaterials();
    }
);


const glowMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    uniforms: {
        u_power: { type: 'f', value: 6.2 },
        u_size: { type: 'f', value: .2 },
        u_alpha: { type: 'f', value: 0.5 }
    },
    transparent: true,
});
// const testMaterial = new THREE.MeshBasicMaterial({
//     color: 0xFF0000
// });
const glowGeometry = new THREE.PlaneBufferGeometry(305, 305);
const glowGeometry2 = new THREE.PlaneBufferGeometry(280, 280);
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
const glow2 = new THREE.Mesh(glowGeometry2, glowMaterial);
glow2.position.z = -20;
scene.add(glow, glow2);


// const testSphere = new THREE.SphereGeometry(25, 32, 32);
// const glow = new THREE.Mesh(testSphere, glowMaterial);
// scene.add(glow);




function updateSceneMaterials() {
    scene.traverse((child) => {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && !child.name.startsWith('point-of-interest-')) {
            child.material.side = THREE.FrontSide;
            child.material.metalness = settings.metalness;
            child.material.roughness = settings.roughness;

            if (child.name !== 'lighthouse-cone') {
                child.material.transparent = false;
            } else {
                child.material.opacity = .5;
            }

            if (child.parent.name === 'clouds' || child.parent.name === 'ICEBERG') {
                child.material.metalness = 0.4;
            }

            if (child.parent.name === 'drone') {
                child.material.metalness = .1;
                child.castShadow = true;
            } else if (child.name === 'world-sphere' || child.name === 'world-continents') {
                child.receiveShadow = true;
            }

            if (child.parent.name === 'clouds') {
                child.castShadow = true;
            }
        }
    })
}


const ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientLightIntensity);
scene.add(ambientLight);

const pointLightBottom = new THREE.PointLight(0xffffff, settings.bottomLightIntensity);
pointLightBottom.position.set(-50, -50, 50);
scene.add(pointLightBottom);
pointLightBottom.castShadow = true;
pointLightBottom.shadow.camera.far = 100;
pointLightBottom.shadow.mapSize.set(512, 512);
if (isDebugMode) {
    const pointLightBottomHelper = new THREE.PointLightHelper(pointLightBottom, 10);
    scene.add(pointLightBottomHelper);
}


const pointLightTop = new THREE.PointLight(0xffffff, settings.topLightIntensity);
pointLightTop.position.set(50, 50, 50);
scene.add(pointLightTop);
pointLightTop.castShadow = true;
pointLightTop.shadow.camera.far = 100;
pointLightTop.shadow.mapSize.set(512, 512);
if (isDebugMode) {
    const pointLightTopHelper = new THREE.PointLightHelper(pointLightTop, 10);
    scene.add(pointLightTopHelper);
}




let sizes = {
    width: canvasContainer.clientWidth,
    height: canvasContainer.clientHeight
};
window.addEventListener('resize', () => {
    // canvasContainer.style.height = canvasContainer.clientWidth + 'px';
    canvasContainer.style.width = canvasContainer.clientHeight + 'px';
    sizes.width = canvasContainer.clientWidth;
    sizes.height = canvasContainer.clientHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 160);
camera.rotation.z = settings.sceneRotation;
scene.add(camera);

// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 1, 0)
// controls.enableDamping = true
// controls.update()


const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

// renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#1D3075');








if (isDebugMode) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);
}

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
        const intersects = raycaster.intersectObjects(pointsOfInterest);
        intersects[0].object.material.color.setHex(pointsOfInterestMaterialsColors.clicked);
        switch (currentIntersect) {
            case pointsOfInterest[0]:
                log.innerHTML = 'click on object 1';
                break;
            case pointsOfInterest[1]:
                log.innerHTML = 'click on object 2';
                break;
            case pointsOfInterest[2]:
                log.innerHTML = 'click on object 3';
                break;
            case pointsOfInterest[3]:
                log.innerHTML = 'click on object 4';
                break;
            case pointsOfInterest[4]:
                log.innerHTML = 'click on object 5';
                break;
            case pointsOfInterest[5]:
                log.innerHTML = 'click on object 6';
                break;
        }
    }
});


const clock = new THREE.Clock();
let previousTime = 0;

function checkIntersects() {
    if (raycaster && globe) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pointsOfInterest);

        if (intersects.length) {
            if (!currentIntersect) {
                intersects[0].object.material.color.setHex(pointsOfInterestMaterialsColors.active);
                document.body.style.cursor = 'pointer';
            }
            currentIntersect = intersects[0].object;
        } else {
            if (currentIntersect) {
                currentIntersect.material.color.setHex(pointsOfInterestMaterialsColors.inActive);
                document.body.style.cursor = 'auto';
            }
            currentIntersect = null;
        }
    }
}


if (isDebugMode) {
    const gui = new dat.gui.GUI;
    gui.close();
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
}

const tick = () => {
    if (isDebugMode && stats) {
        stats.begin();
    }

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    renderer.render(scene, camera);

    if (drone) {
        drone.rotation.y += deltaTime;
    }
    if (clouds) {
        clouds.rotation.y += deltaTime * .1;
    }
    if (globe) {
        globe.rotation.y += deltaTime * .2;
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