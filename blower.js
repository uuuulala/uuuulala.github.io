let tlBlower;

// -----------------------------------------------------------------------------

function blowerSetUp() {
    tlBlower = new TimelineMax({ repeat: -1 });
    tlBlower.pause();

    tlBlower.to('.blower--pins', 8 / speed, {
        rotation: '+=1440',
        transformOrigin: 'center center',
        ease: Linear.easeNone
    });
}

// -----------------------------------------------------------------------------

function startBlower() {
    TweenMax.to('.blower--pins', 1 / speed, {
        rotation: '+=60',
        transformOrigin: 'center center',
        ease: Power1.easeIn,
        onComplete: function () {
            tlBlower.play();
        }
    });
}

// -----------------------------------------------------------------------------

function stopBlower(duration) {
    tlBlower.pause();
    TweenMax.to('.blower--pins', duration, {
        rotation: '+=60',
        transformOrigin: 'center center',
        ease: Power1.easeOut
    });
}