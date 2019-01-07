// Place SVG image to HTML page, setup all animation if loaded successfully
loadSVG();

// Change this value to adjust the speed of whole animation
const speed = 1;

let animationPause = true;

// -----------------------------------------------------------------------------
// Start the whole animation
function start() {

    if (animationPause) {

        animationPause = false;

        startTruck();
        TweenMax.delayedCall((2.5) / speed, startBacteria);
        TweenMax.delayedCall((2.5 + 3.7) / speed, startBubbles);
        TweenMax.delayedCall((2.5 + 3.7 + 0.7) / speed, startBlower);
        TweenMax.delayedCall((2.5 + 3.7 + 2) / speed, startHeater);

        // startFlame() is called when first bubble reach the Flare.
        // See /js/bubbles.js -> bubblesSetUp()

        // startElectricity() is called when first bubble reach the Generator.
        // See /js/bubbles.js -> bubblesSetUp()
    }
}

// -----------------------------------------------------------------------------
// Stop all timelines and kill all delayed calls
function stop() {

    animationPause = true;

    // Here you can adjust the speed of fade out animations
    stopTruck(0.3);
    stopBacteria(0.3);
    stopBubbles(0.3);
    stopBlower(1);
    stopHeaterExchanger(1);
    stopElectricity();
    stopFlame(1);

    TweenMax.killAll(false, false, true);
}
