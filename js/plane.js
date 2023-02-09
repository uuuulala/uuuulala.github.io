const plane = document.querySelector('.plane');
let planeTl;

initPlane();
playPlane();

function playPlane() {
    planeTl.play();
}
function pausePlane() {
    planeTl.pause();
}
function initPlane() {
    const planeBody = plane.querySelector('.plane-body');
    const shadow = plane.querySelector('.shadow');
    const lines = Array.from(plane.querySelectorAll('.line'));

    planeTl = gsap.timeline({
        paused: true,
        repeat: -1
    })
        .to(planeBody, {
            duration: 1.5,
            y: 65,
            ease: 'none'
        })
        .to(shadow, {
            duration: 1.5,
            scale: 1.2,
            transformOrigin: 'center center',
            ease: 'none'
        }, 0)
        .to(planeBody, {
            duration: 2.5,
            y: 0,
            ease: 'power2.out'
        }, 1.5)
        .to(shadow, {
            duration: 2.5,
            scale: 1,
            transformOrigin: 'center center',
            ease: 'power2.out'
        }, 1.5);
    
    lines.forEach((l) => {
        planeTl.to(l, {
            duration: 4,
            attr: {'stroke-dashoffset': 0},
            ease: 'none'
        }, 0)
    });

    planeTl.timeScale(1.3)
}