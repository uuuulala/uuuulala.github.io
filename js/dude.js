const dude = document.querySelector('.dude');
let dudeTl;

initDude();
playDude();

function playDude() {
    dudeTl.play();
}
function pauseDude() {
    dudeTl.pause();
}
function initDude() {

    // selectors
    const truck = dude.querySelector('.truck');
    const truckWheel = dude.querySelectorAll('.wheel');
    const truckBody = dude.querySelector('.truck-body');
    const truckPump = dude.querySelector('.truck-pump');
    const truckPumpBottom = dude.querySelector('.truck-pump__bottom');
    const farts = Array.from(dude.querySelectorAll('.fart'));
    const legs = Array.from(dude.querySelectorAll('.leg'));
    const trash = Array.from(dude.querySelectorAll('.trash'));
    const trashSorted = Array.from(dude.querySelectorAll('.trash'))
        .sort((a, b) => (b.getAttribute('cx') - a.getAttribute('cx')));
    const bottles = Array.from(dude.querySelectorAll('.trash__bottle'));
    const dudeBody = dude.querySelector('.dude-body');
    const jaw = dude.querySelector('.jaw');
    const head = dude.querySelector('.head');
    const pupil = dude.querySelector('.pupil');
    const eyelid = {
        top: dude.querySelector('.eyelid-top'),
        bottom: dude.querySelector('.eyelid-bottom'),
    };
    let walkingFlag = false;

    dudeTl = new gsap.timeline({
        repeat: -1,
        paused: true
    })
        .addLabel('truck-turn', 2)
        .addLabel('trash-dump', 2.2)
        .addLabel('truck-turn-back', 2.7)
        .addLabel('truck-leave-scene', 3.4)
        .addLabel('dude-mouth-open', 2.5)
        .addLabel('dude-goes-left', 2.8)
        .addLabel('dude-mouth-close', 4.35)
        .addLabel('dude-goes-right', 5.2)
        .addLabel('fart', 6.7)
        .addLabel('loop', 8.8)

        // TRUCK related animations
        // (come, unload, go back)
        .to(truck, {
            duration: 2,
            x: 20,
            ease: 'power2.out'
        }, 0)
        .to(truckWheel, {
            duration: 2,
            rotation: 700,
            transformOrigin: 'center center',
            ease: 'power2.out'
        }, 0)
        .to(truckBody, {
            duration: 0.5,
            y: 37,
            rotation: 30,
            transformOrigin: 'bottom right'
        }, 'truck-turn')
        .from(truckPump, {
            duration: 0.5,
            y: 83
        }, 'truck-turn')
        .from(truckPumpBottom, {
            duration: 0.5,
            height: 83
        }, 'truck-turn')
        .to(truckBody, {
            duration: 0.55,
            y: 0,
            x: 0,
            rotation: 0,
            transformOrigin: 'bottom right'
        }, 'truck-turn-back')
        .from(truckPump, {
            duration: 0.55,
            y: 0
        }, 'truck-turn-back')
        .from(truckPumpBottom, {
            duration: 0.55,
            height: 128
        }, 'truck-turn-back')
        .to(truck, {
            duration: 1.5,
            x: -1500,
            ease: 'power2.in'
        }, 'truck-leave-scene')
        .to(truckWheel, {
            duration: 1.5,
            rotation: 0,
            ease: 'power2.in'
        }, 'truck-leave-scene')


        // TRASH related animations
        // (dump, then been eaten)
        .set(trash, {
            attr: { 'opacity': 1 }
        }, 'trash-dump')
        .from(trash.slice(Math.ceil(trash.length / 2), trash.length), {
            duration: 0.5,
            attr: { 'cx': 1158, 'cy': 740 },
            ease: 'power1.in'
        }, 'trash-dump-=0.15')
        .from(trash.slice(0, Math.floor(trash.length / 2)), {
            duration: 0.5,
            attr: { 'cx': 1158, 'cy': 740 },
            ease: 'power1.in'
        }, 'trash-dump')
        .set([trash, bottles], {
            attr: { 'opacity': 1 }
        }, 'trash-dump+=0.1')
        .from(bottles[0], {
            duration: 0.6,
            x: -140,
            y: -50
        }, 'trash-dump+=0.1')
        .from(bottles[1], {
            duration: 0.4,
            x: -500,
            y: -70,
            rotation: -90
        }, 'trash-dump+=0.1')
        .to(bottles[1], {
            duration: 0.4,
            x: -100,
            y: -150,
            scale: 0.5,
            attr: { 'opacity' : 0 },
            transformOrigin: 'center center'
        }, 'dude-goes-left+=0.3')
        .to(bottles[0], {
            duration: 0.4,
            x: 100,
            scale: 0.5,
            attr: { 'opacity' : 0 },
            transformOrigin: 'center center'
        }, 'dude-goes-left+=0.95');

    trashSorted.forEach(function (t, idx) {
        dudeTl
            .to(t, 0.3, {
                attr: {'r': 65, 'cy': 827}
            }, 'dude-goes-left+=' + idx * (idx < trashSorted.length - 3 ? 0.1 : 0.11))
            .to(t, 0.1, {
                attr: {'r': 50, 'cy': (870 - idx * 3)}
            }, 'dude-goes-left+=' + (idx * 0.11 + 0.45))
            .to(t, 0.05, {
                attr: {'opacity': 0}
            }, 'dude-goes-left+=' + (idx * 0.11 + 0.5))
    });


    // DUDE related animations
    // (walking, eating)
    const legsAnimation = gsap.timeline({
        paused: true,
        onComplete: () => {
            if (walkingFlag) legsAnimation.play(0);
        }
    });
    legs.forEach(function (l, idx) {
        legsAnimation
            .to(l, {
                duration: 0.1,
                rotation: idx ? -9 : 9
            }, 0)
            .to(l, {
                duration: 0.1,
                rotation: idx ? 9 : -9
            }, 0.1);
    });

    dudeTl
        .to(dudeBody, {
            duration: 1.7,
            x: -745,
            ease: 'none',
            onStart: function () {
                legsAnimation.play(0);
                walkingFlag = true;
            },
            onComplete: function () {
                walkingFlag = false;
            }
        }, 'dude-goes-left')
        .to(dudeBody, 1, {
            x: 0,
            ease: 'none',
            onStart: function () {
                legsAnimation.play(0);
                walkingFlag = true;
            },
            onComplete: function () {
                walkingFlag = false;
            }
        }, 'dude-goes-right');

    const headStates = {
        open: 'M2063 688l-135 40 0 -103c0,-37 30,-68 67,-68 38,0 68,31 68,68l0 63z',
        close: 'M2063 732l-135 0 0 -107c0,-37 30,-68 67,-68 38,0 68,31 68,68l0 107z'
    };
    const jawStates = {
        open: ' M 2063 688 l 0 176 a 67 67 0 0 1 -134, 0 l 0 0 l 48 0 q 61.2, -6.9, 61.2, -67.5 l 0 -101 z',
        close: ' M 2063 728 l 0 136 a 67 67 0 0 1 -134, 0 l -18 -154 48 5 q 106.3, 8.5, 106.3, 8.5 l 0 0z',
        fart: ' M 2063 715 l 0 149 a 67 67 0 0 1 -134, 0 l -14 -132 l 49 -6 q 52.7, -5.9, 52.7, -5.9 l 0 0z'
    };
    dudeTl
        .to(jaw, {
            duration: 0.4,
            attr: { 'd' : jawStates.open },
            ease: 'none'
        }, 'dude-mouth-open')
        .to(head, {
            duration: 0.4,
            attr: { 'd' : headStates.open },
            ease: 'none'
        }, 'dude-mouth-open')
        .to(head, {
            duration: 0.35,
            attr: { 'd' : headStates.close },
            ease: 'none'
        }, 'dude-mouth-close')
        .to(jaw, {
            duration: 0.35,
            attr: { 'd' : jawStates.close },
            ease: 'none'
        }, 'dude-mouth-close')
        .to(jaw, {
            duration: 0.5,
            scaleX: 1.2,
            transformOrigin: '100% 50%',
            ease: 'none'
        }, 'dude-mouth-close-=0.3')
        .to(jaw, {
            duration: 0.15,
            scaleX: 1,
            ease: 'none'
        }, 'dude-mouth-close+=0.2')
        .to(eyelid.top, {
            duration: 0.2,
            y: -17,
            ease: 'none'
        }, 'dude-mouth-close+=0.15')
        .to(eyelid.bottom, {
            duration: 0.2,
            y: -19,
            ease: 'none'
        }, 'dude-mouth-close+=0.25')
        .to(jaw, {
            duration: 0.6,
            attr: { 'd' : jawStates.fart }
        }, 'fart+=0.1')
        .to(eyelid.top, {
            duration: 0.6,
            y: -15
        }, 'fart+=0.1')
        .to(eyelid.bottom, {
            duration: 0.6,
            y: -38
        }, 'fart+=0.1')
        .to(pupil, {
            duration: 0.5,
            y: -15,
            ease: 'none'
        }, 'fart+=0.2')
        .to(jaw, {
            duration: 0.4,
            attr: { 'd' : jawStates.close },
            ease: 'none'
        }, 'loop')
        .to(head, {
            duration: 0.4,
            attr: { 'd' : headStates.close },
            ease: 'none'
        }, 'loop')
        .to([eyelid.top, eyelid.bottom, pupil], {
            duration: 0.3,
            y: 0,
            ease: 'none'
        }, 'loop+=0.1');

    // FART (as simple as is it)
    farts.forEach(function (f) {
        const randStart = 0.5 + Math.random();
        const randDur = Math.random() + 3;
        dudeTl
            .set(f, {
                attr: { 'opacity' : Math.random() * 0.5 }
            }, 'fart+=' + randStart)
            .to(f, {
                duration: randDur,
                motionPath: {
                    path: [{
                        x: 0, y: 0
                    }, {
                        x: 80, y: -50
                    }, {
                        x: 120 + Math.random() * 300,
                        y: -50 - Math.random() * 200
                    }, {
                        x: 120 + Math.random() * 600,
                        y: -700 - Math.random() * 200
                    }]
                }
            }, 'fart+=' + randStart)
            .to(f, {
                duration: randDur * 0.3,
                attr: {
                    'r' : 50 + Math.random() * 30
                }
            }, 'fart+=' + randStart)
            .to(f, {
                duration: randDur * 0.7,
                attr: {
                    'r' : 0,
                    'opacity' : 0
                }
            }, '>')
        });
}