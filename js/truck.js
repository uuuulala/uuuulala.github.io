let tlTruck;

// -----------------------------------------------------------------------------

function truckSetUp() {
    tlTruck = new TimelineMax({ repeat: -1 });
    tlTruck.timeScale(speed);
    tlTruck.pause();

    tlTruck.addLabel('start', 0);
    tlTruck.addLabel('turn', 2);
    tlTruck.addLabel('dump', 2.2);
    tlTruck.addLabel('turn-back', 2.7);
    tlTruck.addLabel('return', 3.4);
    tlTruck.addLabel('loop', 5.6);

    const bottles = Array.from(document.querySelectorAll('.trash--bottle'));
    const trash = Array.from(document.querySelectorAll('.trash')).reverse();

    tlTruck.to('.truck', 2, {
        x: -25,
        ease: Power2.easeOut
    }, 'start');
    tlTruck.to('.wheel', 2, {
        rotation: 700,
        transformOrigin: 'center center',
        ease: Power2.easeOut
    }, 'start');

    tlTruck.to('.truck-body', 0.5, {
        y: 37,
        rotation: 30,
        transformOrigin: 'bottom right'
    }, 'turn');
    tlTruck.from('.truck-pump', 0.5, {
        y: 83
    }, 'turn');
    tlTruck.from('.truck-pump-bottom', 0.5, {
        height: 83
    }, 'turn');

    tlTruck.to('.truck-body', 0.55, {
        y: 0,
        x: 0,
        rotation: 0,
        transformOrigin: 'bottom right'
    }, 'turn-back');
    tlTruck.from('.truck-pump', 0.55, {
        y: 0
    }, 'turn-back');
    tlTruck.from('.truck-pump-bottom', 0.55, {
        height: 128
    }, 'turn-back');


    tlTruck.set(bottles, {
        clearProps: 'all'
    }, 'dump-=0.1');
    trash.forEach(function (t, idx) {
        tlTruck.set(t, {
            attr: { opacity: 1 },
        }, 'dump');
        tlTruck.from(t, 0.4, {
            attr: { cx: 1160, cy: 740 },
            ease: Power1.easeIn
        }, idx % 2 ? 'dump-=0.05' : 'dump');
    });

    tlTruck.set(bottles, {
        attr: { opacity: 1 },
    }, 'dump+=0.1');
    tlTruck.from(bottles[0], 0.4, {
        x: -240,
        y: -50,
        ease: Power1.easeIn
    }, 'dump+=0.1');
    tlTruck.from(bottles[1], 0.45, {
        x: -500,
        y: -70,
        rotation: -90
    }, 'dump+=0.1');


    tlTruck.to('.truck', 1.3, {
        x: -1700,
        ease: Power2.easeIn
    }, 'return');
    tlTruck.to('.wheel', 1.3, {
        rotation: 0,
        transformOrigin: 'center center',
        ease: Power2.easeIn
    }, 'return');

    tlTruck.set('.wheel', { }, 'loop');
}


// -----------------------------------------------------------------------------

function startTruck() {
    tlTruck.play();
}

// -----------------------------------------------------------------------------

function stopTruck(duration) {
    TweenMax.to('.truck', duration, {
        attr: { opacity: 0 },
        onComplete: function () {
            tlTruck.progress(0).pause();
            TweenMax.to('.truck', duration * 2, {
                attr: { opacity: 1 },
                delay: duration
            });
        }
    });

    TweenMax.to('.trash', duration, {
        attr: { opacity: 0 }
    });
}
