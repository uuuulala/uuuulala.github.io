let tlHeaterExchanger;

// -----------------------------------------------------------------------------

function heaterSetUp() {
    tlHeaterExchanger = new TimelineMax({ repeat: -1, yoyo: true });
    tlHeaterExchanger.pause();

    tlHeaterExchanger.to('#heater-gradient-left', 1, {
        attr: { 'offset': '0.5' }
    });
}

// -----------------------------------------------------------------------------

function startHeater() {
    TweenMax.to('#heater-gradient-left', 2, {
        attr: { 'stop-color': '#b00' }
    });
    TweenMax.to('#heater-gradient-left', 2, {
        attr: { 'offset': '0.7' },
        onComplete: function () {
            tlHeaterExchanger.play();
        }
    });
}

// -----------------------------------------------------------------------------

function stopHeaterExchanger(duration) {
    tlHeaterExchanger.pause();
    TweenMax.to('#heater-gradient-left', duration, {
        attr: { 'stop-color': '#00b' }
    });
    TweenMax.to('#heater-gradient-left', duration, {
        attr: { 'offset': '0' }
    });
}
