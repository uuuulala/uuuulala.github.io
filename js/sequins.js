const sequinsContainer = document.querySelector('.sequins .animation-wrapper');

import * as THREE from 'https://unpkg.com/three@0.119.0/build/three.module.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js';
import { MeshSurfaceSampler } from 'https://unpkg.com/three@0.119.0/examples/jsm/math/MeshSurfaceSampler.js';

let sequinsSize = {
    w: sequinsContainer.clientWidth,
    h: sequinsContainer.clientHeight
};

let sequinsSettings = {
    sequinsNumber: 10000,
};

document.addEventListener('DOMContentLoaded', () => {
    let surface = new sequinsSurface();
    surface.updateSize(sequinsSize.w, sequinsSize.h);
    window.addEventListener('resize', () => {
        surface.updateSize(sequinsSize.w, sequinsSize.h);
    }, false);

    surface.loop();
});


class sequinsSurface {

    constructor() {
        this.renderer = new THREE.WebGLRenderer({});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container = sequinsContainer;
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf7f7f7);

        this.camera = new THREE.PerspectiveCamera(60, sequinsSize.w / sequinsSize.h, 0.1, 100);
        this.camera.position.set(25, 25, 25);
        this.camera.lookAt(0, 0, 0);

        const pointLight = new THREE.PointLight(0xAA8899, 0.75);
        pointLight.position.set(50, -25, 75);
        this.scene.add(pointLight);
        this.scene.add(new THREE.HemisphereLight());
        this.createShape();
        this.resampleSequins();
        this.render();
    }

    createShape() {
        const shapeMaterial = new THREE.MeshLambertMaterial({
            color: 0x111111
        });
        const shapeGeometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16).toNonIndexed();
        const shapeGeometryToShow = new THREE.TorusKnotBufferGeometry(10, 2.9, 100, 16).toNonIndexed();

        this.shapeMesh = new THREE.Mesh(shapeGeometry, null);
        const shapeMeshToShow = new THREE.Mesh(shapeGeometryToShow, shapeMaterial);


        const matcapTexture = new THREE.TextureLoader().load('./img/matcap-crystal.png');
        const sequiMaterial = new THREE.MeshMatcapMaterial();
        sequiMaterial.matcap = matcapTexture;


        this.dummyObject = new THREE.Object3D();
        this.sampler = null;

        this.clock = new THREE.Clock();
        this.previousTime = 0;

        this.sequinPosition = new THREE.Vector3();
        this.sequinNormal = new THREE.Vector3();

        this.sequinMesh = new THREE.InstancedMesh(
            new THREE.PlaneBufferGeometry(.3, .3, 1, 1),
            sequiMaterial, sequinsSettings.sequinsNumber);

        this.scene.add(shapeMeshToShow, this.sequinMesh);

    }

    resampleSequins() {
        this.sampler = new MeshSurfaceSampler(this.shapeMesh)
            .build();
        for (let i = 0; i < sequinsSettings.sequinsNumber; i++) {
            this.sampler.sample(this.sequinPosition, this.sequinNormal);
            this.sequinNormal.add(this.sequinPosition);

            this.dummyObject.position.copy(this.sequinPosition);
            this.dummyObject.lookAt(this.sequinNormal);
            this.dummyObject.updateMatrix();

            this.sequinMesh.setMatrixAt(i, this.dummyObject.matrix);
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    loop() {
        const elapsedTime = this.clock.getElapsedTime();
        const deltaTime = elapsedTime - this.previousTime;
        if (this.sequinMesh) {
            this.scene.rotation.x = deltaTime * .1;
            this.scene.rotation.y = deltaTime * .5;
            this.sequinMesh.instanceMatrix.needsUpdate = true;
        }
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    updateSize(w, h) {
        sequinsSize = {
            w: sequinsContainer.clientWidth,
            h: sequinsContainer.clientHeight
        };
        this.camera.aspect = sequinsSize.w / sequinsSize.h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}