let electricityGenerated = false;
let tlSineWave;

// -----------------------------------------------------------------------------

function electricitySetUp() {
    tlSineWave = new TimelineMax({repeat: -1});
    tlSineWave.pause();

    tlSineWave.fromTo('.sine-waves', 3 / speed, {
        x: -5000
    }, {
        x: -1800,
        ease: Power0.easeNone
    });
}

// -----------------------------------------------------------------------------

function startElectricity() {
    electricityGenerated = true;

    tlSineWave.play();
}

// -----------------------------------------------------------------------------

function stopElectricity() {
    electricityGenerated = false;

    tlSineWave.pause();
}
