const balloonsContainer = document.querySelector('.balloons');
const balloons = Array.from(balloonsContainer.querySelectorAll('.balloon'));
let balloonsTravelTls = [], balloonsSwingTls = [];

// get mouse/touch coordinates we use to play with balloon
let repeller = {
    x: 0,
    y: 0
};
balloonsContainer.addEventListener('mousemove', function (e) {
    getCursorPos(e, false);
});
balloonsContainer.addEventListener('touchmove', function (e) {
    getCursorPos(e, true);
});
function getCursorPos(e, isTouch) {
    const balloonsContainerBox = balloonsContainer.getBoundingClientRect();
    e = (!e) ? window.event : e;
    const pointer = isTouch ? e.targetTouches[0] : e;
    repeller.x = pointer.clientX - balloonsContainerBox.left;
    repeller.y = pointer.clientY - balloonsContainerBox.top;
}

// select all the balloon objects
let balloonCanvas = {
    w: balloonsContainer.offsetWidth,
    h: balloonsContainer.offsetHeight
};

balloons.forEach(function (b, idx) {

    // we use wrapped objects to apply different motion
    let balloon = {
        travel: b,
        interact: b.querySelector('.balloon-interact'),
        swing: b.querySelector('.balloon-swing'),
        circle: b.querySelector('circle'),
        initPosition: {
            x: random(balloonCanvas.w * 0.05, balloonCanvas.w * 0.95),
            y: random(balloonCanvas.h * 0.15, balloonCanvas.h * 0.7)
        }
    };
    // set balloon's initial size, position and color
    gsap.set(balloon.travel, {
        scale: Math.max(idx / (balloons.length - 1), 0.5),
        transformOrigin: 'center center',
        x: balloon.initPosition.x,
        y: balloon.initPosition.y
    });
    gsap.set(balloon.swing, {
        transformOrigin: '55% 30%',
        attr: { "fill": getRandomColor() }
    });

    // balloon traveling animation
    balloonsTravelTls[idx] =
        gsap.timeline({
            repeat: -1,
            yoyo: true,
        })
            .to(balloon.travel, {
                duration: Math.random() * 70 + 30,
                motionPath: {
                    path: getRandomCoordinates(balloon),
                    curviness: 2
                },
                ease: 'none'
            });

    // balloon swing animation
    balloonsSwingTls[idx] =
        gsap.timeline({
            repeat: -1,
            yoyo: true,
            delay: Math.random()
        })
            .to(balloon.travel, {
                duration: 1.1,
                rotation: -5,
                ease: 'power1.inOut'
            })
            .to(balloon.travel, {
                duration: 1.1,
                rotation: 5,
                ease: 'power1.inOut'
            }, ">+0.15");

    // Swing & move balloon if we hit the sensitive area (circle around the balloon)
    balloon.circle.addEventListener('mouseenter', checkHit);
    balloon.circle.addEventListener('touchmove', checkHit);
    function checkHit() {
        // current position of balloon center
        const balloonPosition = {
            x: gsap.getProperty(balloon.travel, "x") + 0.5 * gsap.getProperty(balloon.travel, "width"),
            y: gsap.getProperty(balloon.travel, "y") + 0.5 * gsap.getProperty(balloon.travel, "height")
        };

        // check the direction we approached the balloon
        let dx = repeller.x - balloonPosition.x;
        let dy = repeller.y - balloonPosition.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        dx = Math.min(dx, 50 * Math.cos(angle));
        dy = Math.min(dy, 50 * Math.sin(angle));

        // stop previous move / swing (in case it's not finished yet)
        gsap.killTweensOf(balloon.interact);
        balloonsSwingTls[idx].pause();
        gsap.killTweensOf(balloon.swing);

        // change balloon's color
        gsap.to(balloon.swing, {
            duration: 0.5,
            attr: { "fill": getRandomColor() }
        });

        // move it
        gsap.timeline({})
            .to(balloon.interact, {
                duration: 0.5,
                x: -dx * (dist < 5 ? 5 : 1.5),
                y: -dy * (dist < 5 ? 5 : 1.5),
                ease: 'power2.out'
            })
            .to(balloon.interact, {
                duration: 2.5,
                x: 0,
                y: 0
            });

        // swing it with damped oscillations
        gsap.timeline({
            onComplete: () => {
                balloonsSwingTls[idx].play();
            }
        })
            .to(balloon.swing, {
                duration: 0.6,
                rotation: Math.cos(angle) * 12,
                ease: 'power1.inOut'
            })
            .to(balloon.swing, {
                duration: 0.6,
                rotation: -Math.cos(angle) * 8,
                ease: 'power1.inOut'
            })
            .to(balloon.swing, {
                duration: 0.8,
                rotation: Math.cos(angle) * 2,
                ease: 'power1.inOut'
            })
    }
});

// ------------------------------------------------------------------
// Helpers
function getRandomCoordinates(balloon) {
    return [
        balloon.initPosition,
        {
            x: random(-0.2 * balloonCanvas.w, balloonCanvas.w * 0.9),
            y: random(balloonCanvas.h * 0.1, balloonCanvas.h * 0.6),
        }, {
            x: random(-0.2 * balloonCanvas.w, balloonCanvas.w * 0.9),
            y: random(balloonCanvas.h * 0.1, balloonCanvas.h * 0.6),
        }, {
            x: random(-0.2 * balloonCanvas.w, balloonCanvas.w * 0.9),
            y: -balloonCanvas.h * 0.2
        }
    ]
}
function getRandomColor() {
    return "hsl(" + random(0, 360) + ',' +
        random(60, 80) + '%,' +
        '45%)'
}
function random(min, max) {
    return min + Math.floor( Math.random() * (max - min));
}