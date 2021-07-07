let gooeyPointer, gooeySurface;
const gooeyContainer = document.querySelector('.gooey .animation-wrapper');

document.addEventListener('DOMContentLoaded', () => {
    gooeyPointer = new Pointer();
    gooeySurface = new Surface(gooeyContainer.clientWidth, gooeyContainer.clientHeight);
    gooeySurface.updateSize(gooeyContainer.clientWidth, gooeyContainer.clientHeight);
    window.addEventListener('resize', () => {
        gooeySurface.updateSize(gooeyContainer.clientWidth, gooeyContainer.clientHeight);
    });
    gooeySurface.loop();

    window.addEventListener("mousemove", (e) => gooeyPointer.onMouseMove(e));
    window.addEventListener("touchmove", (e) => gooeyPointer.onTouchMove(e));

});

class Pointer {
    constructor() {
        this.x = -0.5;
        this.y = -0.5;
        this.tx = -0.5;
        this.ty = -0.5;
    }
    onMouseMove(e) {
        this.x = (e.pageX - gooeyContainer.offsetLeft) / gooeyContainer.clientWidth;
        this.y = (e.pageY - gooeyContainer.offsetTop) / gooeyContainer.clientHeight;
    }
    onTouchMove(e) {
        this.tx = (e.targetTouches[0].pageX - gooeyContainer.offsetLeft) / gooeyContainer.clientWidth;
        this.ty = (e.targetTouches[0].pageY - gooeyContainer.offsetTop) / gooeyContainer.clientHeight;
        this.x += (this.tx - this.x) * .3;
        this.y += (this.ty - this.y) * .3;
    }
}
class Surface {

    constructor(w, h) {
        this.renderer = new THREE.WebGLRenderer({});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container = gooeyContainer;
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.createPlane(w, h);
        this.render();
    }

    createPlane(w, h) {
        this.material = new THREE.RawShaderMaterial({
            vertexShader: document.getElementById('gooey-vertexShader').textContent,
            fragmentShader: document.getElementById('gooey-fragmentShader').textContent,
            uniforms: {
                u_time: {type: 'f', value: 0},
                u_ratio: {type: "f", value: gooeyContainer.clientWidth / gooeyContainer.clientHeight },
                u_pointer: {type: "v2", value: new THREE.Vector2(gooeyPointer.x, 1. - gooeyPointer.y)},
            }
        });
        this.material.defines = { COL_NUMBER: gooeyContainer.clientWidth > gooeyContainer.clientHeight ? 20 : 10 };

        this.planeGeometry = new THREE.PlaneBufferGeometry(2, 2);
        this.plane = new THREE.Mesh(this.planeGeometry, this.material);
        this.scene.add(this.plane);
    }

    render() {
        this.plane.material.uniforms.u_time.value += .01;
        this.plane.material.uniforms.u_ratio.value = gooeyContainer.clientWidth / gooeyContainer.clientHeight;
        this.plane.material.uniforms.u_pointer.value = new THREE.Vector2(gooeyPointer.x, 1. - gooeyPointer.y);
        this.renderer.render(this.scene, this.camera);
    }

    loop() {
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    updateSize(w, h) {
        this.camera.aspect = gooeyContainer.clientWidth / gooeyContainer.clientHeight;
        this.renderer.setSize(w, h);
    }
}