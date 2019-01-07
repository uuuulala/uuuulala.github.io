let tlBacteria;

// -----------------------------------------------------------------------------

function bacteriaSetUp() {
    tlBacteria = new TimelineMax({ repeat: -1 });
    tlBacteria.timeScale(speed);
    tlBacteria.pause();

    tlBacteria.addLabel('open', 0.3);
    tlBacteria.addLabel('come', 0.3);
    tlBacteria.addLabel('eat', 2.1);
    tlBacteria.addLabel('back', 2.6);
    tlBacteria.addLabel('fart', 3.7);
    tlBacteria.addLabel('loop', 5.6);

    const headStates = {
        open: 'M2063 688l-135 40 0 -103c0,-37 30,-68 67,-68 38,0 68,31 68,68l0 63z',
        close: 'M2063 732l-135 0 0 -107c0,-37 30,-68 67,-68 38,0 68,31 68,68l0 107z'
    };
    const jawStates = {
        open: ' M 2063 688 l 0 176 a 67 67 0 0 1 -134, 0 l 0 0 l 48 0 q 61.2, -6.9, 61.2, -67.5 l 0 -101 z',
        close: ' M 2063 728 l 0 136 a 67 67 0 0 1 -134, 0 l -18 -154 48 5 q 106.3, 8.5, 106.3, 8.5 l 0 0z',
        fart: ' M 2063 715 l 0 149 a 67 67 0 0 1 -134, 0 l -14 -132 l 49 -6 q 52.7, -5.9, 52.7, -5.9 l 0 0z'
    };

    const legs = Array.from(document.querySelectorAll('.leg'));
    const trash = Array.from(document.querySelectorAll('.trash'));
    const bottles = Array.from(document.querySelectorAll('.trash--bottle'));

    let walkingFlag = false;

    tlBacteria.to('.dude', 1.5, {
        x: -680,
        y: 20,
        ease: Linear.easeNone,
        onComplete: function () {
            walkingFlag = false;
        },
        onStart: function () {
            walkingFlag = true;
            legsMove();
        }
    }, 'come');

    function legsMove () {
        const stepTime = 0.07;
        TweenMax.to(legs[0], stepTime, {
            rotation: 9,
            transformOrigin: 'top center'
        });
        TweenMax.to(legs[0], stepTime, {
            rotation: -9,
            transformOrigin: 'top center',
            delay: stepTime
        });
        TweenMax.to(legs[1], stepTime, {
            rotation: -9,
            transformOrigin: 'top center'
        });
        TweenMax.to(legs[1], stepTime, {
            rotation: 9,
            transformOrigin: 'top center',
            delay: stepTime,
            onComplete: function() {
                if(walkingFlag && !animationPause) legsMove();
            }
        });
    }



    tlBacteria.to(trash[4], 0.3, {
        attr: { cx: 1983, cy: 804, r: 60 }
    }, 'come');
    tlBacteria.to(trash[4], 1.2, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=0.3');

    tlBacteria.to(trash[5], 0.3, {
        attr: { cx: 1963, cy: 804, r: 60 }
    }, 'come+=0.1');
    tlBacteria.to(trash[5], 1.1, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=0.4');

    tlBacteria.to(bottles[1], 0.4, {
        y: -150,
        x: -100,
        scale: 0.5,
        attr: {opacity: 0 },
        transformOrigin: 'center center'
    }, 'come+=0.4');

    tlBacteria.to(trash[3], 0.3, {
        attr: { cx: 1903, cy: 804, r: 60 }
    }, 'come+=0.2');
    tlBacteria.to(trash[3], 0.95, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=0.6');

    tlBacteria.to(trash[5], 0.3, {
        attr: { cx: 1903, cy: 794, r: 60 }
    }, 'come+=0.3');
    tlBacteria.to(trash[5], 0.8, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=0.7');

    tlBacteria.to(trash[6], 0.3, {
        attr: { cx: 1803, cy: 814, r: 60 }
    }, 'come+=0.4');
    tlBacteria.to(trash[6], 0.65, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=0.8');

    tlBacteria.to(trash[2], 0.3, {
        attr: { cx: 1803, cy: 814, r: 70 }
    }, 'come+=0.5');
    tlBacteria.to(trash[2], 0.65, {
        attr: { cx: 1473 },
        ease: Linear.easeNone
    }, 'come+=0.8');

    tlBacteria.to([trash[9], trash[11]], 0.3, {
        attr: { cx: 1713, cy: 824, r: 60 }
    }, 'come+=0.7');
    tlBacteria.to([trash[9], trash[11]], 0.55, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=1');

    tlBacteria.to([trash[1], trash[8]], 0.3, {
        attr: { cx: 1653, cy: 824, r: 60 }
    }, 'come+=0.9');
    tlBacteria.to([trash[1], trash[8]], 0.3, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=1.2');

    tlBacteria.to(trash[0], 0.3, {
        attr: { cx: 1553, cy: 824, r: 60 }
    }, 'come+=1');
    tlBacteria.to(trash[0], 0.2, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=1.3');

    tlBacteria.to(trash[7], 0.3, {
        attr: { cx: 1433, cy: 814, r: 70 }
    }, 'come+=1.2');
    tlBacteria.to(trash[7], 0.1, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=1.5');

    tlBacteria.to(trash[10], 0.3, {
        attr: { cx: 1433, cy: 814, r: 40 }
    }, 'come+=1.3');
    tlBacteria.to(trash[10], 0.05, {
        attr: { cx: 1463 },
        ease: Linear.easeNone
    }, 'come+=1.6');

    tlBacteria.set([trash, bottles], {
        attr: {opacity: 0 }
    }, 'come+=1.8');

    tlBacteria.to('.dude', 1, {
        x: 0,
        y: 20,
        ease: Power0.easeIn,
        onComplete: function () {
            walkingFlag = false;
        },
        onStart: function () {
            walkingFlag = true;
            legsMove();
        }
    }, 'back');


    tlBacteria.to('.jaw', 0.4, {
        attr: { d: jawStates.open },
        ease: Linear.easeNone
    }, 'open');
    tlBacteria.to('.head', 0.4, {
        attr: { d: headStates.open },
        ease: Linear.easeNone
    }, 'open');


    tlBacteria.to('.head', 0.5, {
        attr: { d: headStates.close },
        ease: Linear.easeNone
    }, 'eat-=0.4');
    tlBacteria.to('.jaw', 0.5, {
        attr: { d: jawStates.close },
        ease: Linear.easeNone
    }, 'eat-=0.4');

    tlBacteria.to('.eyelid-top', 0.3, {
        y: -17,
        ease: Linear.easeNone
    }, 'eat-=0.1');
    tlBacteria.to('.eyelid-bottom', 0.3, {
        y: -19,
        ease: Linear.easeNone,
    }, 'eat-=0.1');

    tlBacteria.to('.jaw', 0.6, {
        attr: { d: jawStates.fart }
    }, 'fart');
    tlBacteria.to('.eyelid-top', 0.6, {
        y: -15
    }, 'fart');
    tlBacteria.to('.eyelid-bottom', 0.6, {
        y: -38
    }, 'fart');
    tlBacteria.to('.pupil', 0.5, {
        y: -15,
        ease: Linear.easeNone
    }, 'fart+=0.1');

    tlBacteria.to('.jaw', 0.4, {
        attr: { d: jawStates.close },
        ease: Linear.easeNone
    }, 'loop-=0.6');
    tlBacteria.to('.head', 0.4, {
        attr: { d: headStates.close },
        ease: Linear.easeNone
    }, 'loop-=0.6');

    tlBacteria.to('.eyelid-top', 0.3, {
        y: 0,
        ease: Linear.easeNone
    }, 'loop-=0.5');
    tlBacteria.to('.eyelid-bottom', 0.3, {
        y: 0,
        ease: Linear.easeNone
    }, 'loop-=0.5');
    tlBacteria.to('.pupil', 0.5, {
        y: 0,
        ease: Linear.easeNone
    }, 'loop-=0.5');
}

// -----------------------------------------------------------------------------

function startBacteria() {
    tlBacteria.play();
}

// -----------------------------------------------------------------------------

function stopBacteria(duration) {
    TweenMax.to('.dude', duration, {
        attr: { opacity: 0 },
        onComplete: function () {
            tlBacteria.progress(0).pause();
            TweenMax.to('.dude', duration * 2, {
                attr: { opacity: 1 },
                delay: duration
            });
        }
    });

    TweenMax.to(['.trash', '.trash--bottle'], duration, {
        attr: { opacity: 0 }
    });
}
