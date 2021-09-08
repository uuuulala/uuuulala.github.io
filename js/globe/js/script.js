import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import {SpinControls} from './SpinControlsModule.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'https://unpkg.com/three@0.124.0/examples/jsm/loaders/DRACOLoader.js';

const canvas = document.querySelector('canvas.webgl');
const log = document.querySelector('.log');

const scene = new THREE.Scene();

let spinControl;

let drone, globe, globeSpinWrapper, clouds;

let pointsOfInterest = [];
let pointsOfInterestMaterials = [];
const pointsOfInterestMaterialsColors = {
    active: 0xFF0000,
    inActive: 0xAAAAAA,
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

        scene.traverse((child) => {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && !child.name.startsWith('point-of-interest-')) {
                child.material.side = THREE.FrontSide;
                child.material.metalness = 0.2;
                child.material.roughness = 0.6;

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
);


const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const pointLightBottom = new THREE.PointLight(0xffffff, .9);
pointLightBottom.position.set(-50, -50, 50);
scene.add(pointLightBottom);
pointLightBottom.castShadow = true;
pointLightBottom.shadow.camera.far = 100;
pointLightBottom.shadow.mapSize.set(512, 512);
const pointLightBottomHelper = new THREE.PointLightHelper(pointLightBottom, 10);
scene.add(pointLightBottomHelper);


const pointLightTop = new THREE.PointLight(0xffffff, .3);
pointLightTop.position.set(50, 50, 50);
scene.add(pointLightTop);
pointLightTop.castShadow = true;
pointLightTop.shadow.camera.far = 100;
pointLightTop.shadow.mapSize.set(512, 512);
const pointLightTopHelper = new THREE.PointLightHelper(pointLightTop, 10);
scene.add(pointLightTopHelper);


let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 120);
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


// const axesHelper = new THREE.AxesHelper( 500 );
// scene.add( axesHelper );


const raycaster = new THREE.Raycaster();
let currentIntersect = null;

const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;
});
window.addEventListener('click', () => {
    if (currentIntersect) {
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
                log.innerHTML = 'click on object 3';
                break;
            case pointsOfInterest[4]:
                log.innerHTML = 'click on object 3';
                break;
            case pointsOfInterest[5]:
                log.innerHTML = 'click on object 3';
                break;
        }
    }
});


const clock = new THREE.Clock();
let previousTime = 0;


const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    renderer.render(scene, camera);

    if (drone) {
        drone.rotation.y += deltaTime;
        // drone.rotation.x += deltaTime;
    }
    if (clouds) {
        clouds.rotation.y += deltaTime * .1;
        clouds.rotation.z += deltaTime * .005;
    }
    if (globe) {
        globe.rotation.y += deltaTime * .2;
        globe.rotation.z += deltaTime * .01;
    }

    if (spinControl) {
        spinControl.update();
    }

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
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
};

tick();