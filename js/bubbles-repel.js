const canvasEl = document.querySelector("#bubbles-repel");
const containerEl = canvasEl.parentNode;
const ctx = canvasEl.getContext("2d");

let params = {
    maxSize: 0,
    riseSpeed: .003,
    scaleSpeed: .003,
    curviness: 6,
    mouseThreshold: .3,
    mouseMagnet: 80,
    ballsNumber: 0
};

let mouse = {
    x: window.innerWidth * .5,
    y: -1000000
};


let screen;
resizeCanvas();

let bubblesData;
initBubblesArray();

containerEl.onmousemove = function (e) {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}
containerEl.ontouchmove = function (e) {
    const rect = e.target.getBoundingClientRect();
    mouse.x = e.targetTouches[0].pageX - rect.left;
    mouse.y = e.targetTouches[0].pageY - rect.top;
}


window.onresize = function () {
    resizeCanvas();
    initBubblesArray();
};

updateCanvas();

// -----------------------------------------

function initBubblesArray() {
    bubblesData = [];
    for (let i = 0; i < params.ballsNumber; i++) {
        const d = {
            progress: Math.random(),
            amplitudeX: 20 + 50 * Math.random(),
            initX: screen.w * Math.random(),
            size: (.2 + .8 * Math.random()) * params.maxSize
        }
        d.position = {
            baseX: 0,
            baseY: 0,
            x: d.initX,
            y: screen.h,
            targetX: d.initX,
            targetY: screen.h,
        };
        d.scale = 1 - d.progress;
        bubblesData[i] = d;
    }
}

function updateCanvas() {
    ctx.clearRect(0, 0, screen.w, screen.h);
    bubblesData.forEach((b) => {

        b.progress -= params.riseSpeed;

        // calculate base trajectory (move upwards with little wave applied)
        b.position.baseX = b.initX + Math.sin(b.progress * params.curviness) * b.amplitudeX;
        b.position.baseY = (.4 + .7 * Math.pow(b.progress, 2)) * screen.h;

        // mouse interaction
        const dX = mouse.x - b.position.targetX;
        const dY = mouse.y - b.position.targetY;
        const sqDist = Math.sqrt((dX * dX) + (dY * dY));
        b.position.targetX = b.position.baseX - params.mouseMagnet * dX / sqDist;
        b.position.targetY = b.position.baseY - params.mouseMagnet * dY / sqDist;

        // add delay to the cursor response
        b.position.x += (b.position.targetX - b.position.x) * params.mouseThreshold;
        b.position.y += (b.position.targetY - b.position.y) * params.mouseThreshold;

        // scale it up
        b.scale += params.scaleSpeed;

        // move bubble to the bottom of the screen instantly (without mouseThreshold)
        if (b.progress > .99) {
            b.position.y = b.position.targetY;
        }

        // burst the bubble
        if (b.scale > 1) {
            b.scale = 0;
            b.progress = 1;
        }

        // draw the ball
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, b.size * b.scale, 0, 2 * Math.PI);
        ctx.stroke();
    });
    window.requestAnimationFrame(updateCanvas);
}

function resizeCanvas() {
    screen = {
        w: containerEl.clientWidth,
        h: containerEl.clientHeight,
    };
    params.ballsNumber = screen.w;
    params.maxSize = 16;
    canvasEl.width = screen.w;
    canvasEl.height = screen.h;
}