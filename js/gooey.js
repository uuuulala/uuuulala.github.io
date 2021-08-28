let gooeyPointer, gooeySurface;
const gooeyContainer = document.querySelector('.gooey .animation-wrapper');

document.addEventListener('DOMContentLoaded', () => {
    gooeyPointer = new Pointer();
    gooeySurface = new Surface(gooeyContainer.clientWidth, gooeyContainer.clientHeight);
    gooeySurface.updateSize(gooeyContainer.clientWidth, gooeyContainer.clientHeight);
    window.addEventListener('resize', () => {
        gooeySurface.updateSize(gooeyContainer.clientWidth, gooeyContainer.clientHeight);
    });
    window.addEventListener("mousemove", (e) => gooeyPointer.onMouseMove(e));
    // window.addEventListener("touchmove", (e) => gooeyPointer.onTouchMove(e));

    gsap.timeline({
        scrollTrigger: {
            trigger: gooeyContainer,
            onEnter: () => {
                gooeySurface.isVisible = true;
                gooeySurface.loop();
            },
            onLeave: () => {
                gooeySurface.isVisible = false;
            },
            onEnterBack: () => {
                gooeySurface.isVisible = true;
                gooeySurface.loop();
            },
            onLeaveBack: () => {
                gooeySurface.isVisible = false;
            }
        }
    });

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
        this.setResponsiveValues();
        this.renderer = new THREE.WebGLRenderer({});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container = gooeyContainer;
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.isVisible = elementIsInViewport(gooeyContainer);
        this.createPlane(w, h);
        this.render();
    }

    setResponsiveValues() {
        this.height = window.innerWidth > 800 ? 400 : 550;
    }

    createPlane() {
        this.material = new THREE.RawShaderMaterial({
            vertexShader: document.getElementById('gooey-vertexShader').textContent,
            fragmentShader: document.getElementById('gooey-fragmentShader').textContent,
            uniforms: {
                u_time: {type: 'f', value: 0},
                u_ratio: {type: "f", value: gooeyContainer.clientWidth / gooeyContainer.clientHeight },
                u_mouse: {type: "v2", value: new THREE.Vector2(gooeyPointer.x, 1. - gooeyPointer.y)},
            }
        });
        this.material.defines = { COL_NUMBER: window.innerWidth > 700 ? 17 : 9 };

        this.planeGeometry = new THREE.PlaneBufferGeometry(2, 2);
        this.plane = new THREE.Mesh(this.planeGeometry, this.material);
        this.scene.add(this.plane);
    }

    render() {
        this.plane.material.uniforms.u_time.value += .01;
        this.plane.material.uniforms.u_ratio.value = gooeyContainer.clientWidth / gooeyContainer.clientHeight;
        this.plane.material.uniforms.u_mouse.value = new THREE.Vector2(gooeyPointer.x, 1. - gooeyPointer.y);
        this.renderer.render(this.scene, this.camera);
    }

    loop() {
        if (this.isVisible) {
            this.render();
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    updateSize() {
        this.setResponsiveValues();
        this.width = eyeballContainer.clientWidth;
        this.camera.aspect = this.width / this.height;
        this.renderer.setSize(this.width, this.height);
    }
}