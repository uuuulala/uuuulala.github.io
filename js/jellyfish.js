gsap.registerPlugin(InertiaPlugin);

// params
const spring = 0.09, gravity = 2, friction = 0.5;
const tentaclesPos = [
    { x: 10, y: 80 },
    { x: 24, y: 84 },
    { x: 37, y: 80 },
    { x: 51, y: 80 },
    { x: 63, y: 80 },
    { x: 74, y: 86 },
    { x: 90, y: 80 },
];
const curvesParams = [
    [ { x: 0, y: 0 }, { x: 2, y: 3 }, { x: -3, y: -1 } ],
    [ { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 5 } ],
    [ { x: 0, y: 0 }, { x: 0, y: 5 }, { x: 0, y: 3 } ],
    [ { x: 0, y: 0 }, { x: -1, y: 4 }, { x: 1, y: 0 } ],
    [ { x: 0, y: 0 }, { x: -1, y: 7 }, { x: 0, y: 0 } ],
    [ { x: 0, y: 0 }, { x: 0, y: 0 }, { x: -0.5, y: 0 } ],
    [ { x: 0, y: 0 }, { x: -2, y: 2 }, { x: 3, y: 3 } ],
];

// selectors
const jellyfish = document.querySelector('.jellyfish svg');
const jellyfishEl = document.querySelector('.jellyfish-el');
const jellyfishBody = jellyfishEl.querySelector('.jellyfish-body');
const tentacles = Array.from(jellyfishEl.querySelectorAll('.tentacle'));


let tentaclesData = [];
tentacles.forEach((t, tIdx) => {
    let tentacleAnchors = [];
    for (let i = 0; i < 3; i++) {
        let t1, t2;
        if (i === 0) {
            t1 = tentaclesPos[tIdx].x;
            t2 = tentaclesPos[tIdx].y;
        } else if (i === 1) {
            t1 = tentaclesPos[tIdx].x + curvesParams[tIdx][i - 1].x;
            t2 = tentaclesPos[tIdx].y + curvesParams[tIdx][i - 1].y;
        } else {
            t1 = tentaclesPos[tIdx].x + curvesParams[tIdx][i - 2].x + curvesParams[tIdx][i - 1].x;
            t2 = tentaclesPos[tIdx].y + curvesParams[tIdx][i - 2].y + curvesParams[tIdx][i - 1].y;
        }
        tentacleAnchors.push({
            x: t1,
            y: t2,
            vx: 0,
            vy: 0,
        });
    }
    tentaclesData.push({
        lineEl: t,
        anchors: tentacleAnchors,
    });
});

for (let ss = 0; ss < 20; ss++) {
    tentaclesAnimationStep();
}

tentaclesData.forEach((tentacle) => {
    setTentaclePosition(tentacle);
});

Draggable.create(jellyfishBody, {
    type: "x,y",
    edgeResistance: 0.2,
    bounds: jellyfish,
    inertia: true,
    // onDragStart: () => {
    //     tl.paused()
    // },
    onDrag: () => {
        adjustTentacles();
    },
    onThrowUpdate: () => {
        adjustTentacles();
    }
});

let tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    onUpdate: () => {
        adjustTentacles();
    }
})
    .to(jellyfishBody, {
        x: 0, y: 500,
        duration: 4,
        ease: 'power1.inOut'
    })


function adjustTentacles() {
    tentaclesAnimationStep();
    tentaclesData.forEach((td) => {
        setTentaclePosition(td);
    });
}


function setTentaclePosition(tentacleData) {
    gsap.set(tentacleData.lineEl, {
        attr: {
            'd': 'M' +
            tentacleData.anchors[0].x + ', ' +
            tentacleData.anchors[0].y + ' Q' +
            tentacleData.anchors[1].x + ', ' +
            tentacleData.anchors[1].y + ' ' +
            tentacleData.anchors[2].x + ', ' +
            tentacleData.anchors[2].y
        }
    });
}

function tentaclesAnimationStep() {
    tentaclesData.forEach((td, tdIdx) => {
        for (let idx = 0; idx < 3; idx++) {
            if (idx > 0) {
                td.anchors[idx].vx += (td.anchors[idx - 1].x - td.anchors[idx].x) * spring;
                td.anchors[idx].vx *= friction;

                td.anchors[idx].vy += (td.anchors[idx - 1].y - td.anchors[idx].y) * spring;
                td.anchors[idx].vy += gravity;
                td.anchors[idx].vy *= friction;

                td.anchors[idx].x += (td.anchors[idx].vx + curvesParams[tdIdx][idx].x);
                td.anchors[idx].y += (td.anchors[idx].vy + curvesParams[tdIdx][idx].y);
            } else {
                td.anchors[idx].x = gsap.getProperty(jellyfishBody, "x") + tentaclesPos[tdIdx].x;
                td.anchors[idx].y = gsap.getProperty(jellyfishBody, "y") + tentaclesPos[tdIdx].y;
            }
        }
    });
}