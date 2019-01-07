let flameBurning = false;
let tlFlame = [];

// -----------------------------------------------------------------------------

function flameSetUp() {

    // set flame initial state
    TweenMax.set('.flame', {
        scale: 0,
        transformOrigin: 'center bottom'
    });

    // setup looped animations for all small sparks
    const sparks = Array.from(document.querySelectorAll('.flame--spark'));
    sparks.forEach(function (spark, idx) {
        tlFlame[idx] = new TimelineMax({
            repeat: -1,
            onRepeat: function(){
                this.duration(Math.random() + 0.1)
            }
        })
            .fromTo(spark, 0.2, {
                scale: 2,
                y: 40,
                transformOrigin: '50% 100%'
            }, {
                scale: 0,
                y: -60
            });
    });

    // setup looped animations for big parts of flame
    tlFlame[sparks.length] = new TimelineMax({
        repeat: -1,
        onRepeat: function(){
            this.duration(Math.random() * 0.5 + 0.1)
        }
    }).to('.flame--back', 0.2, {
            scaleY: 1.1,
            scaleX: 0.8,
            transformOrigin: '50% 100%',
            repeat: 1,
            yoyo: true
        });

    tlFlame[sparks.length + 1] = new TimelineMax({
        repeat: -1,
        onRepeat: function(){
            this.duration(Math.random() * 0.5 + 0.1)
        }
    }).to('.flame--left', 0.2, {
            scaleY: 1.2,
            transformOrigin: '50% 100%',
            repeat: 1,
            yoyo: true
        });

    tlFlame[sparks.length + 2] = new TimelineMax({
        repeat: -1,
        onRepeat: function(){
            this.duration(Math.random() * 0.5 + 0.1)
        }
    }).to('.flame--middle', 0.2, {
            scaleY: 1.4,
            transformOrigin: '50% 100%',
            repeat: 1,
            yoyo: true
        });

    tlFlame[sparks.length + 3] = new TimelineMax({
        repeat: -1,
        onRepeat: function(){
            this.duration(Math.random() * 0.5 + 0.1)
        }
    }).to('.flame--right', 0.2, {
            scaleY: 1.2,
            transformOrigin: '50% 100%',
            repeat: 1,
            yoyo: true
        });

    // pause all sparks animations (we'll play them as fire 'grow up')
    tlFlame.forEach(function (tl) {
        tl.timeScale(speed);
        tl.pause();
    });
}

// -----------------------------------------------------------------------------
// Scale the flame to original size, start sparkles animations
function startFlame() {
    flameBurning = true;

    const flame = document.querySelector('.flame');
    TweenMax.set(flame, {
        attr: {opacity: 1 }
    });
    TweenMax.to(flame, 1 / speed, {
        scale: 1
    });

    tlFlame.forEach(function (tl) {
        tl.play();
    });
}

// -----------------------------------------------------------------------------
// Scale the flame to zero-size, start sparkles animations
function stopFlame(duration) {
    flameBurning = false;

    const flame = document.querySelector('.flame');
    TweenMax.to(flame, duration, {
        scale: 0,
        onComplete: function () {
            tlFlame.forEach(function (tl) {
                tl.pause();
            });
        }
    });
}
