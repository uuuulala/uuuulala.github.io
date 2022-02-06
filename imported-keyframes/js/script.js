import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r126/three.module.min.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js'

const surfaceCanvas = document.querySelector('#surface');
const loaderIndicatior = document.querySelector('.loader');
const spaces = Array.from(document.querySelectorAll('.fake-space'));


const robotText = document.querySelector('.text--robot');
const treeText = document.querySelector('.text--tree');
const mapText = document.querySelector('.text--map');
const panelsText = document.querySelector('.text--panels');

const navbarPoints = Array.from(document.querySelectorAll('.navigation .highlight'));
const arrows = Array.from(document.querySelectorAll('.arrow'));


document.addEventListener('DOMContentLoaded', () => {
    let surface = new Surface();

    surface.createObjects();
    surface.loop();
    surface.setupScrollTrigger();

    window.addEventListener('resize', () => {
        surface.updateSize();
    }, false);
});


class Surface {

    constructor() {

        this.renderer = new THREE.WebGLRenderer({canvas: surfaceCanvas, antialias: true});
        this.renderer.setClearColor(0x20187D, 1);

        this.scene = new THREE.Scene();
        this.group = new THREE.Group();
        this.group.position.set(0, -0.12, 0);
        this.scene.add(this.group);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, .8);
        this.camera.lookAt(0, 0, 0);
        this.updateSize();
        this.mixer = null;
    }

    createObjects() {

        const boxGeometry = new THREE.BoxGeometry(.005, .005, .005);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const loader = new GLTFLoader();
        loader.load(
            './models/Part3 NotUseClone.gltf',
            (gltf) => {

                gsap.to(loaderIndicatior, {
                    duration: .2,
                    opacity: 0
                });
                gsap.to('.page', {
                    duration: .2,
                    opacity: 1
                });

                console.log('gltf', gltf);

                // this.group.scale.set(0, 0, 0);

                const model = gltf.scene;
                this.group.add(model);
                this.mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((a) => {
                    this.mixer.clipAction(a).play();
                });
                model.children.forEach((child) => {
                    if (child.type === 'Mesh') {
                        child.scale.set(1, 1, 1);
                        child.material = material;
                        child.geometry.dispose();
                        child.geometry = boxGeometry.clone();
                    }
                });
                this.updateSize();
            },
            (xhr) => {
                console.log('xhr', xhr);
                loaderIndicatior.innerHTML = (xhr.loaded / xhr.total * 100).toFixed(0) + '% loaded';
            },
            (error) => {
                console.log('error', error);
            });
    }

    loop() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.loop.bind(this));
    }

    setupScrollTrigger() {

        this.group.scale.set(0.32, 0.32, 0.32);

        const rotationTween = gsap.fromTo(this.group.rotation, {
            x: 0,
            y: -Math.PI,
        }, {
            duration: 20,
            x: 0,
            y: Math.PI,
            ease: 'none',
            repeat: -1
        }, 0);

        gsap.fromTo(rotationTween, {
            timeScale: 0
        }, {
            duration: .6,
            timeScale: 1,
            ease: 'power4.in'
        });


        let keyframesProgress = { v: 0 };
        const markers = false;
        const scrub = true;
        const snap = false;

        // Man to robot
        gsap.timeline({
            scrollTrigger: {
                trigger: spaces[0],
                start: "0% 50%",
                end: "100% 50%",
                scrub: scrub,
                markers: markers,
                snap: snap,
                onEnter: () => {
                    navbarOnEnter(0);
                },
                onEnterBack: () => {
                    navbarOnEnterBack(0);
                },
                onLeave: () => {
                    navbarOnLeave(0);
                },
                onLeaveBack: () => {
                    navbarOnLeaveBack(0);
                }
            },
            defaults: {
                ease: 'none'
            }
        })
            .to(robotText, {
                duration: .2,
                opacity: 1
            }, 0)
            .fromTo(keyframesProgress, {
                v: 3
            }, {
                duration: 1,
                v: 10.9,
                onUpdate: () => {
                    if (this.mixer) {
                        this.mixer.setTime(keyframesProgress.v)
                    }
                }
            }, 0);


        // Robot to tree
        gsap.timeline({
            scrollTrigger: {
                trigger: spaces[1],
                start: "0% 50%",
                end: "100% 50%",
                scrub: scrub,
                markers: markers,
                snap: snap,
                onEnter: () => {
                    navbarOnEnter(1);
                },
                onEnterBack: () => {
                    navbarOnEnterBack(1);
                },
                onLeave: () => {
                    navbarOnLeave(1);
                },
                onLeaveBack: () => {
                    navbarOnLeaveBack(1);
                }
            },
            defaults: {
                ease: 'none'
            }
        })
            .to(robotText, {
                duration: .2,
                opacity: 0
            }, 0)
            .to(treeText, {
                duration: .2,
                opacity: 1
            }, .3)
            .fromTo(keyframesProgress, {
                v: 13
            }, {
                duration: 1,
                v: 17,
                onUpdate: () => {
                    if (this.mixer) {
                        this.mixer.setTime(keyframesProgress.v)
                    }
                },
            }, 0);



        // Tree to map
        gsap.timeline({
            scrollTrigger: {
                trigger: spaces[2],
                start: "0% 50%",
                end: "100% 50%",
                scrub: scrub,
                markers: markers,
                snap: snap,
                onEnter: () => {
                    navbarOnEnter(2);
                },
                onEnterBack: () => {
                    navbarOnEnterBack(2);
                },
                onLeave: () => {
                    navbarOnLeave(2);
                },
                onLeaveBack: () => {
                    navbarOnLeaveBack(2);
                }
            },
            defaults: {
                ease: 'none'
            }
        })
            .to(treeText, {
                duration: .2,
                opacity: 0
            }, 0)
            .to(mapText, {
                duration: .2,
                opacity: 1
            }, .3)
            .to(rotationTween, {
                duration: .3,
                progress: .45,
                ease: 'none'
            }, 0.3)
            .fromTo(rotationTween, {
                timeScale: 1
            }, {
                duration: 1,
                timeScale: .1,
                ease: 'power1.inOut'
            }, 0)
            .fromTo(keyframesProgress, {
                v: 20.5
            }, {
                duration: 1,
                v: 24.3,
                onUpdate: () => {
                    if (this.mixer) {
                        this.mixer.setTime(keyframesProgress.v)
                    }
                },
            }, 0);



        // Map to panels
        gsap.timeline({
            scrollTrigger: {
                trigger: spaces[3],
                start: "0% 50%",
                end: "100% 50%",
                scrub: scrub,
                markers: markers,
                snap: snap,
                onEnter: () => {
                    arrows[0].classList.remove('inactive');
                    arrows[1].classList.add('inactive');
                    navbarOnEnter(3);
                },
                onEnterBack: () => {
                    navbarOnEnterBack(3);
                },
                onLeave: () => {
                    navbarOnLeave(3);
                },
                onLeaveBack: () => {
                    arrows[0].classList.add('inactive');
                    arrows[1].classList.remove('inactive');
                    navbarOnLeaveBack(3);
                }
            },
            defaults: {
                ease: 'none'
            }
        })
            .to(mapText, {
                duration: .2,
                opacity: 0
            }, 0)
            .to(panelsText, {
                duration: .2,
                opacity: 1
            }, .3)
            .to(rotationTween, {
                duration: 1,
                timeScale: 0,
                ease: 'none'
            }, 0)
            .to(rotationTween, {
                duration: .5,
                progress: .5,
                ease: 'power1.in'
            }, .4)
            .fromTo(keyframesProgress, {
                v: 27.5
            }, {
                duration: 1,
                v: 31.2,
                onUpdate: () => {
                    if (this.mixer) {
                        this.mixer.setTime(keyframesProgress.v)
                    }
                },
            }, 0);


        // Navbar
        function navbarOnEnter(idx) {
            navbarPoints[idx].classList.remove('active');
            navbarPoints[idx + 1].classList.add('active');
        }
        function navbarOnEnterBack(idx) {
        }
        function navbarOnLeave(idx) {
        }
        function navbarOnLeaveBack(idx) {
            navbarPoints[idx].classList.add('active');
            navbarPoints[idx + 1].classList.remove('active');
        }

        navbarPoints.forEach((p, pIdx) => {
            p.onclick = function () {
                if (pIdx) {
                    gsap.to(window, {
                        duration: .5,
                        scrollTo: { y: spaces[pIdx - 1] }
                    });
                } else {
                    gsap.to(window, {
                        duration: .5,
                        scrollTo: { y: spaces[0] - 100 }
                    });
                }
            }
        });

    }

    updateSize() {
        surfaceCanvas.style.width = window.innerWidth + 'px';
        surfaceCanvas.style.height = window.innerHeight + 'px';
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}