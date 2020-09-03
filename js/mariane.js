const mariane = document.querySelector('.mariane');
let marianeTl;

initMariane();
playMariane();

function playMariane() {
    marianeTl.play();
}
function pauseMariane() {
    marianeTl.pause();
}
function initMariane() {
    const lines = mariane.querySelectorAll('.mariane-animated-line');
    lines.forEach(function (line) {
        const offset = line.getTotalLength();
        line.setAttribute('stroke-dashoffset', offset);
        line.setAttribute('stroke-dasharray', offset);
    });
    let letterDuration = [0.8, 0.4, 0.4, 0.3, 0.3, 0.3, 0.3, 0.15];
    let letterDelay = [0.5, 0.2, 0, 0.03, 0, 0, 0, 0.2];
    marianeTl = gsap.timeline({
        repeat: -1,
        paused: true
    });
    lines.forEach(function (line, idx) {
        marianeTl
            .set(line, {
                attr: { 'opacity': 1 }
            })
            .to(line, {
                duration: letterDuration[idx],
                attr: { 'stroke-dashoffset': 0 },
                ease: 'none'
            }, ">+" + letterDelay[idx]);
    });
    marianeTl.to(lines, 0.3, {
        attr: { 'opacity': 0 }
    }, '>+0.5');
}