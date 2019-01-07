let tlBubbles;

// -----------------------------------------------------------------------------

function bubblesSetUp() {
    tlBubbles = new TimelineMax({ repeat: -1});
    tlBubbles.timeScale(speed);
    tlBubbles.pause();

    const bubblesFart = Array.from(document.querySelectorAll('.bubble--fart'));
    const bubblesTube = Array.from(document.querySelectorAll('.bubble--tube'));
    let randDuration = [];

    bubblesFart.forEach(function (bubble, idx) {
        randDuration[idx] = idx ? (Math.random() * 4.6 + 1) : 5.6;
        tlBubbles.to(bubble, randDuration[idx], {
            bezier: {
                type: 'soft',
                values: [{x: 0, y: 0}, {
                    x: (100 + Math.random() * 100),
                    y: Math.random() * 100
                }, {x: (150 + Math.random() * 150), y: -(1000 + Math.random() * 500)}, {x: 400, y: -1000}, {
                    x: 600,
                    y: -990
                }]
            },
            attr: { opacity: Math.random() / 2 },
            ease: Power1.easeIn,
            onComplete: function () {
                bubbleTravel(idx)
            }
        }, 0);

        tlBubbles.to(bubble, randDuration[idx] * 0.7, {
            attr: {'r': 100 + Math.random() * 100},
            ease: Power1.easeIn
        }, 0);

        tlBubbles.to(bubble, randDuration[idx] * 0.3, {
            attr: {
                'r': 50,
                opacity: 0.7
            },
            ease: Power1.easeOut
        }, randDuration[idx] * 0.7);
    });

    function bubbleTravel(idx) {
        const bubbles = [bubblesTube[idx], bubblesTube[bubblesTube.length / 2 + idx]];
        const duration = 3 / speed;
        if (bubbles[0].classList.contains('bubble--flame')) {
            bubbles.forEach(function (bubble, idx) {
                TweenMax.to(bubble, duration, {
                    bezier: {
                        curviness: 0,
                        values: [{x: 0, y: 0}, {x: 510, y: 0}, {x: 510, y: -1000}, {x: 3660, y: -1000}]
                    },
                    delay: 0.3 * idx,
                    ease: Power0.easeIn,
                    onComplete: function () {
                        if (!flameBurning  && !animationPause) startFlame()
                    }
                });
            });
        } else if (bubbles[0].classList.contains('bubble--water')) {
            bubbles.forEach(function (bubble, idx) {
                TweenMax.to(bubble, duration, {
                    bezier: {
                        curviness: 0,
                        values: [{x: 0, y: 0}, {x: 2870, y: 0}, {x: 2870, y: 1500}]
                    },
                    delay: 0.35 * idx,
                    ease: Power0.easeIn
                });
            });
            TweenMax.to(bubbles, 0.2, {
                attr: { opacity: 0 },
                delay: duration - 0.2
            });
        } else {
            bubbles.forEach(function (bubble, idx) {
                TweenMax.to(bubble, duration, {
                    x: 3570,
                    delay: 0.2 * idx,
                    ease: Power0.easeIn,
                    onComplete: function () {
                        if (!electricityGenerated && !animationPause) startElectricity()
                    }
                });
            });
        }
        TweenMax.set(bubbles, {
            x: 0,
            y: 0,
            attr: { opacity: 0.7 }
        });
    }
}

// -----------------------------------------------------------------------------

function startBubbles() {
    tlBubbles.play();
}

// -----------------------------------------------------------------------------

function stopBubbles(duration) {

    tlBubbles.progress(0).pause();
    TweenMax.killTweensOf('.bubble--tube');

    TweenMax.to('.bubble', duration, {
        attr: { opacity: 0 },
        onComplete: function () {
            TweenMax.set('.bubble--fart', {
                attr: {
                    r: 0,
                    opacity: 1
                },
                clearProps: 'all'
            });
            TweenMax.set('.bubble--tube', {
                attr: {
                    opacity: 0.7
                },
                clearProps: 'all'
            });
        }
    });
}
