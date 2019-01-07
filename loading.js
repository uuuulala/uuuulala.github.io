function loadSVG() {

    let request = new XMLHttpRequest();
    request.open('GET', './svg/scene.svg', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {

            console.log('SVG file loaded');

            // SVG file loaded -> insert in to html page
            const container = document.querySelector('#scene-container');
            container.insertAdjacentHTML('beforeend', request.responseText);

            // setup all the animations keeping them paused
            blowerSetUp();
            electricitySetUp();
            flameSetUp();
            heaterSetUp();
            bubblesSetUp();
            bacteriaSetUp();
            truckSetUp();
        }
    };

    request.onerror = function() {
        console.log('SVG file loading problem')
    };

    request.send();
}