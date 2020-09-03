const fire = document.querySelector('.fire');
let fireTls = [];

initFire();
playFire();

function playFire() {
    fireTls.forEach((tl) => {
        tl.play();
    });
}
function pauseFire() {
    fireTls.forEach((tl) => {
        tl.pause();
    });
}
function initFire() {
    const sparks = Array.from(fire.querySelectorAll('.spark'));
    sparks.forEach((s) => {
        let tl = new gsap.timeline({
            repeat: -1,
            paused: true,
            onRepeat: () => {
                tl.duration(Math.random() + 0.2)
            }
        })
            .fromTo(s, {
                duration: 0.2,
                scale: 2,
                y: 40,
                transformOrigin: 'center bottom'
            }, {
                scale: 0,
                y: -60
            });
        fireTls.push(tl);
    });
    const flames = Array.from(fire.querySelectorAll('.flame'));
    flames.forEach((f, idx) => {
        let tl = new gsap.timeline({
            repeat: -1,
            paused: true,
            onRepeat: () => {
                tl.duration(Math.random() * 0.4 + 0.2)
            }
        })
            .to(f, 0.2, {
                scaleY: 1.1 + (idx ? 0.2 : 0),
                scaleX: idx ? 1 : 0.8,
                transformOrigin: 'center bottom',
                repeat: 1,
                yoyo: true
            });
        fireTls.push(tl);
    });
}