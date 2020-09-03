const wave = document.querySelector('.wave');
let waveTl;

initWave();
playWave();

function playWave() {
    waveTl.play();
}
function pauseWave() {
    waveTl.pause();
}
function initWave() {
    const svg = wave.querySelector('svg');
    const line = wave.querySelector('.line');
    const svgSize = { w: svg.viewBox.baseVal.width, h: svg.viewBox.baseVal.height };

    gsap.set(line, {
        attr: {
            'points': generatePoints(),
            'stroke': getRandomColor()
        }
    });
    animationLoop();
    function animationLoop() {
        waveTl = gsap.to(line, {
            duration: 0.8,
            attr: {
                'points': generatePoints(),
                'stroke': getRandomColor()
            },
            ease: 'none',
            onComplete: animationLoop
        });
    }

    function generatePoints() {
        let segments = [];
        const freq = random(0.05, 0.15);
        const amplitude = random(0.1, 0.55) * svgSize.h * 0.9;
        let p = {x: 0, y: 0};
        for (let i = 0; i < svgSize.w; i++) {
            p.x = i;
            p.y = Math.floor(amplitude * Math.sin(p.x * freq) + svgSize.h / 2);
            segments.push(p.x + ',' + p.y);
        }
        return segments.join(' ');
    }
    function getRandomColor() {
        return 'rgb(' +
            Math.floor(random(100, 255)) + ', ' +
            Math.floor(random(100, 255)) + ',' +
            Math.floor(random(100, 255)) + ')';
    }
    function random(min, max) {
        return min + Math.random() * (max - min);
    }
}