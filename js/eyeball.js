let eyeballViz, eyeballPointer, eyeballControls, eyeballAnimations;
const eyeballContainer = document.querySelector('.eyeball .animation-wrapper');


let eyeConfig = {
    zoomLevel: 525,
    zoomLevelBounds: [ 300, 1000 ],
    shrink: 0,
    fstBaseColor: '#03565c',
    scdBaseColor: '#42cf44',
    midColor: '#f2aa00',
    vignette: 0.65,
    brightness: 0.6,
    darkness: 0.5,
};


document.addEventListener('DOMContentLoaded', () => {
    eyeballControls = new EyeballControls();
    eyeballPointer = new EyeballPointer();
    eyeballViz = new EyeballViz();
    eyeballAnimations = new EyeballAnimations();

    eyeballPointer.updateCenter();
    eyeballViz.updateSize();

    eyeballControls.addShaderControls();
    eyeballControls.addSceneControls();

    window.addEventListener('resize', () => {
        eyeballPointer.updateCenter();
        eyeballViz.updateSize();
    });

    eyeballContainer.querySelector('canvas').addEventListener("click", (e) => eyeballPointer.onClick(e));
    document.addEventListener("mousedown", (e) => eyeballPointer.onMouseDown(e));
    document.addEventListener("mouseup", (e) => eyeballPointer.onMouseUp(e));
    document.addEventListener("mousemove", (e) => eyeballPointer.onMouseMove(e));
    document.addEventListener("touchmove", (e) => eyeballPointer.onTouchMove(e));
    document.addEventListener("touchend", (e) => eyeballPointer.onTouchEnd(e));
    document.addEventListener("touchstart", (e) => eyeballPointer.onTouchStart(e));

    gsap.timeline({
        scrollTrigger: {
            trigger: eyeballContainer,
            onEnter: () => {
                eyeballViz.isVisible = true;
                eyeballAnimations.eyeAppear.play(0);
                gsap.delayedCall(1.1, () => { eyeballAnimations.playShrink.play(0); });

                eyeballViz.loop();
            },
            onLeave: () => {
                eyeballViz.isVisible = false;
            },
            onEnterBack: () => {
                eyeballViz.isVisible = true;
                gsap.delayedCall(1.1, () => { eyeballAnimations.playShrink.play(0); });

                eyeballViz.loop();
            },
            onLeaveBack: () => {
                eyeballViz.isVisible = false;
            }
        }
    });
});



class EyeballPointer {
    constructor() {
        this.mouse = { x: 0, y: 0 };
        this.deltaMove = { x: 0, y: 0 };
        this.previousMousePosition = { x: 0, y: 0 };
        this.pressed = false;
        this.touchMode = false;
        this.dragging = false;
        this.deltaRotationQuaternion = new THREE.Quaternion();
    }
    updateCenter() {
        this.windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    onMouseDown() {
        this.pressed = true;
    }
    onMouseUp() {
        this.pressed = false;
        this.deltaRotationQuaternion
            .setFromEuler(new THREE.Euler(
                0,
                0,
                0,
                'XYZ'
            ));
    }
    onMouseMove(e) {
        this.mouse = {
            x: (e.clientX - this.windowHalf.x) / this.windowHalf.x,
            y: (e.clientY - this.windowHalf.y) / this.windowHalf.y
        };
        this.deltaMove = {
            x: e.offsetX - this.previousMousePosition.x,
            y: e.offsetY - this.previousMousePosition.y
        };
        this.previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
        if (this.pressed) {
            this.deltaRotationQuaternion
                .setFromEuler(new THREE.Euler(
                    this.deltaMove.y * (Math.PI / 180),
                    this.deltaMove.x * (Math.PI / 180),
                    0,
                    'XYZ'
                ));
            this.dragging = true;
        }
    }
    onTouchMove(e) {
        this.touchMode = true;
        setTimeout(() => this.dragging = true, 100);
        if (e.touches.length === 1) {
            this.deltaMove = {
                x: e.touches[0].pageX - this.previousMousePosition.x,
                y: e.touches[0].pageY - this.previousMousePosition.y
            };
            this.previousMousePosition = {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY
            };
            this.deltaRotationQuaternion
                .setFromEuler(new THREE.Euler(
                    this.deltaMove.y * (Math.PI / 180),
                    this.deltaMove.x * (Math.PI / 180),
                    0,
                    'XYZ'
                ));
        }
    }
    onTouchStart(e) {
        this.previousMousePosition = {
            x: e.touches[0].pageX,
            y: e.touches[0].pageY
        };
    }
    onTouchEnd() {
        this.deltaRotationQuaternion
            .setFromEuler(new THREE.Euler(
                0,
                0,
                0,
                'XYZ'
            ));
    }
    onClick() {
        if (!this.dragging) {
            eyeballAnimations.playShrink.play(0);
        }
        this.dragging = false;
    }
}

class EyeballControls {
    constructor() {
        this.zoomControl = document.querySelector('#zoom-range');

        this.mouseOverControls = false;
        this.gui = new dat.gui.GUI({ autoPlace: false });
        eyeballContainer.appendChild(this.gui.domElement);
        const eyeballControls = document.querySelector('.dg.main');
        let timeout;
        eyeballControls.addEventListener('mouseenter', () => {
            if (!eyeballPointer.touchMode) timeout = setTimeout(() => this.mouseOverControls = true, 400);
        }, false);
        eyeballControls.addEventListener('mouseleave', () => {
            clearTimeout(timeout);
            this.mouseOverControls = false;
        }, false);
    }
    addShaderControls() {
        this.shrinkContol = this.gui.add(eyeballViz.eyeShaderMaterial.uniforms.shrink, 'value', -0.9, 0.3, 0.05).name('shrink');
        this.gui.addColor({color: eyeConfig.fstBaseColor}, 'color').onChange((v) => {
            eyeballViz.eyeShaderMaterial.uniforms.base_color_1.value = new THREE.Color(v);
        }).name('base color #1');
        this.gui.addColor({color: eyeConfig.scdBaseColor}, 'color').onChange((v) => {
            eyeballViz.eyeShaderMaterial.uniforms.base_color_2.value = new THREE.Color(v);
        }).name('base color #2');
        this.gui.addColor({color: eyeConfig.midColor}, 'color').onChange((v) => {
            eyeballViz.eyeShaderMaterial.uniforms.mid_color.value = new THREE.Color(v);
        }).name('mid color');
        this.gui.add(eyeballViz.eyeShaderMaterial.uniforms.vignette, 'value', 0, 1, 0.05).name('vignette');
        this.gui.add(eyeballViz.eyeShaderMaterial.uniforms.brightness, 'value', 0.2, 0.65, 0.05).name('brightness');
        this.gui.add(eyeballViz.eyeShaderMaterial.uniforms.darkness, 'value', 0, 1, 0.05).name('darkness');
    }
    addSceneControls() {
        this.zoomControl.min = eyeConfig.zoomLevelBounds[0];
        this.zoomControl.max = eyeConfig.zoomLevelBounds[1];
        this.zoomControl.value = eyeConfig.zoomLevel;
        this.zoomControl.addEventListener('change', () => {
            eyeballViz.setCameraPosition(+this.zoomControl.value);
            this.mouseOverControls = false;
        }, false);
        this.zoomControl.addEventListener('input', () => {
            eyeballViz.setCameraPosition(+this.zoomControl.value);
            this.mouseOverControls = true;
        }, false);
    }
}

class EyeballAnimations {
    constructor() {
        this.playShrink = gsap.timeline({
            paused: true,
            onUpdate: () => {
                eyeballControls.shrinkContol.setValue(eyeballViz.eyeShaderMaterial.uniforms.shrink.value)
            }})
            .to(eyeballViz.eyeShaderMaterial.uniforms.shrink, {
                duration: 0.5,
                value: -0.9,
                ease: 'power2.out'
            })
            .to(eyeballViz.eyeShaderMaterial.uniforms.shrink, {
                duration: 0.7,
                value: 0,
                ease: 'power2.inOut'
            });

        this.eyeAppear = gsap.timeline({
            paused: true
        })
            .from(eyeballViz.eyeGroup.position, {
                duration: 2,
                y: 1000,
                ease: 'power4.out'
            })
            .from(eyeballViz.eyeGroup.rotation, {
                duration: 2,
                x: 25,
                z: 5,
                ease: 'power3.out'
            }, 0)
            .from(eyeballViz.shadowMesh.scale, {
                duration: 2,
                x: 2,
            }, 0)

    }

}

class EyeballViz {

    constructor() {
        this.setResponsiveValues();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        eyeballContainer.appendChild(this.renderer.domElement);
        this.width = eyeballContainer.clientWidth;
        this.scene = new THREE.Scene();
        this.eyeGroup = new THREE.Group();
        this.eyeRadius = 30;
        this.camera = new THREE.PerspectiveCamera(20, this.width / this.height, 1, 10000);

        this.isVisible = elementIsInViewport(eyeballContainer);

        this.setupScene();
        this.createEyeball();
        this.createShadow();
        this.render();
    }

    setResponsiveValues() {
        this.height = window.innerWidth > 800 ? 400 : 550;
        this.sceneVerticalOffset = window.innerWidth > 800 ? 0 : 25;
    }

    setupScene() {
        this.scene.background = new THREE.Color(0xf7f7f7);
        this.setCameraPosition(eyeConfig.zoomLevel);

        const ambientLight = new THREE.AmbientLight(0x999999, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(-1, 1, 1);
        this.scene.add(directionalLight);
    }

    setCameraPosition(cp) {
        this.camera.position.z = cp;
        this.camera.position.y = this.sceneVerticalOffset;
        eyeballControls.zoomControl.value = eyeConfig.zoomLevel;
        eyeConfig.zoomLevel = cp;
    }

    createEyeball() {
        const eyeBallTexture = new THREE.TextureLoader().load('./img/eyeball.png');
        const eyeAddonGeometry = new THREE.SphereGeometry(this.eyeRadius, 128, 128);
        const eyeAddonMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x220000,
            opacity: 0.25,
            shininess: 100,
            transparent: true,
            map: eyeBallTexture
        });
        const eyeAddon = new THREE.Mesh(eyeAddonGeometry, eyeAddonMaterial);
        this.eyeGroup.add(eyeAddon);

        const eyeGeometry = new THREE.SphereGeometry(this.eyeRadius - 0.3, 256, 256);
        this.eyeShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                shrink: {
                    type: "f",
                    value: eyeConfig.shrink
                },
                base_color_1: {
                    type: "v3",
                    value: new THREE.Color(eyeConfig.fstBaseColor),
                },
                base_color_2: {
                    type: "v3",
                    value: new THREE.Color(eyeConfig.scdBaseColor),
                },
                mid_color: {
                    type: "v3",
                    value: new THREE.Color(eyeConfig.midColor),
                },
                vignette: {
                    type: "f",
                    value: eyeConfig.vignette,
                },
                brightness: {
                    type: "f",
                    value: eyeConfig.brightness
                },
                darkness: {
                    type: "f",
                    value: eyeConfig.darkness
                },
            },
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent
        });
        const eye = new THREE.Mesh(eyeGeometry, this.eyeShaderMaterial);
        eye.rotation.y = -Math.PI / 2;
        this.eyeGroup.add(eye);

        this.scene.add(this.eyeGroup);
    }

    createShadow() {
        const canvas = document.createElement('canvas');
        const canvasSize = canvas.width = canvas.height = this.eyeRadius * 2.5;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(canvasSize * 0.5, canvasSize * 0.5, 0, canvasSize * 0.5, canvasSize * 0.5, canvasSize * 0.4);
        gradient.addColorStop(0.2, 'rgba(210,210,210,1)');
        gradient.addColorStop(1, 'rgba(247,247,247,1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        const shadowTexture = new THREE.CanvasTexture(canvas);
        const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture });
        const shadowGeo = new THREE.PlaneBufferGeometry(canvasSize, canvasSize, 1, 1);
        this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
        this.shadowMesh.position.y = - 2 * this.eyeRadius;
        this.shadowMesh.rotation.x = - Math.PI / 2.05;
        this.scene.add(this.shadowMesh);
    }

    render() {
        const rotationSpeed = 0.2;
        if (!eyeballControls.mouseOverControls) {
            if (!eyeballPointer.pressed && !eyeballPointer.touchMode) {
                this.eyeGroup.rotation.x += (eyeballPointer.mouse.y * 0.3 - this.eyeGroup.rotation.x) * rotationSpeed;
                this.eyeGroup.rotation.y += (eyeballPointer.mouse.x * 0.6 - this.eyeGroup.rotation.y) * rotationSpeed;
            } else {
                this.eyeGroup.quaternion.multiplyQuaternions(eyeballPointer.deltaRotationQuaternion, this.eyeGroup.quaternion);
            }
        } else {
            this.eyeGroup.rotation.x += (- this.eyeGroup.rotation.x) * rotationSpeed * 0.1;
            this.eyeGroup.rotation.y += (- this.eyeGroup.rotation.y) * rotationSpeed * 0.1;
        }
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
        this.camera.updateProjectionMatrix();
        this.camera.position.y = this.sceneVerticalOffset;
        this.renderer.setSize(this.width, this.height);
    }
}