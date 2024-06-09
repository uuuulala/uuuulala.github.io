
function setupCurlyCursorAnimation() {
    const curlyCursorCanvasEl = document.querySelector("#curly-cursor");
    const ctx = curlyCursorCanvasEl.getContext('2d');

    // for intro motion
    let mouseMoved = false;

    let canvasBox = curlyCursorCanvasEl.getBoundingClientRect();
    let mouse = {
        x: canvasBox.width,
        y: canvasBox.height,
        tX: 0,
        tY: 0
    }
    let params = {
        pointsNumber: 25,
        widthFactor: .4,
        mouseThreshold: .9,
        spring: .4,
        friction: .5
    };

    const touchTrail = new Array(params.pointsNumber);
    for (let i = 0; i < params.pointsNumber; i++) {
        touchTrail[i] = {
            x: mouse.x,
            y: mouse.y,
            vx: 0,
            vy: 0,
        }
    }

    window.addEventListener("click", e => {
        updateMousePosition(e.clientX, e.clientY);
    });
    window.addEventListener("mousemove", e => {
        mouseMoved = true;
        updateMousePosition(e.clientX, e.clientY);
    });
    window.addEventListener("touchmove", e => {
        mouseMoved = true;
        updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    });

    function updateMousePosition(eX, eY) {
        canvasBox = curlyCursorCanvasEl.getBoundingClientRect();
        mouse.tX = 2 * (eX - canvasBox.left);
        mouse.tY = 2 * (eY - canvasBox.top);
    }

    setupCanvas();
    updateCurve(0);
    window.addEventListener('resize', () => {
        setupCanvas();
    });


    function updateCurve(t) {

        // for intro motion
        if (!mouseMoved) {
            mouse.tX = (.5 + .3 * Math.cos(.002 * t) * (Math.sin(.005 * t))) * canvasBox.width;
            mouse.tY = (.5 + .2 * (Math.cos(.005 * t)) + .1 * Math.cos(.01 * t)) * canvasBox.height;
        }

        ctx.clearRect(0, 0, curlyCursorCanvasEl.width, curlyCursorCanvasEl.height);
        ctx.lineCap = "round";
        ctx.beginPath();

        touchTrail.forEach((p, pIdx) => {
            if (pIdx === 0) {
                p.x = mouse.x;
                p.y = mouse.y;
                ctx.moveTo(p.x, p.y);
            } else {
                p.vx += (touchTrail[pIdx - 1].x - p.x) * params.spring;
                p.vy += (touchTrail[pIdx - 1].y - p.y) * params.spring;
                p.vx *= params.friction;
                p.vy *= params.friction;

                p.x += p.vx;
                p.y += p.vy;
            }
        });

        for (let i = 1; i < touchTrail.length - 1; i++) {
            const xc = .5 * (touchTrail[i].x + touchTrail[i + 1].x);
            const yc = .5 * (touchTrail[i].y + touchTrail[i + 1].y);
            ctx.quadraticCurveTo(touchTrail[i].x, touchTrail[i].y, xc, yc);
            ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
            ctx.stroke();
        }
        ctx.lineTo(touchTrail[touchTrail.length - 1].x, touchTrail[touchTrail.length - 1].y);
        ctx.stroke();

        mouse.x += (mouse.tX - mouse.x) * params.mouseThreshold;
        mouse.y += (mouse.tY - mouse.y) * params.mouseThreshold;

        window.requestAnimationFrame(updateCurve);
    }

    function setupCanvas() {
        canvasBox = curlyCursorCanvasEl.getBoundingClientRect();
        curlyCursorCanvasEl.width = 2 * canvasBox.width;
        curlyCursorCanvasEl.height = 2 * canvasBox.height;
    }

    gsap.timeline({
        scrollTrigger: {
            trigger: curlyCursorCanvasEl,
            start: '0% 0%',
            end: '100% 100%',
            // markers: true,
            onEnter: () => {
                mouseMoved = false;
            },
            onEnterBack: () => {
                mouseMoved = false;
            }
        }
    });
}