const wings = document.querySelector('.wings');
let wingsTl;

initWings();
playWings();

function playWings() {
    wingsTl.play();
}
function pauseWings() {
    wingsTl.pause();
}
function initWings() {
    // SVG shapes
    const rightWingFrames = [
        'M1005 1201c-8,-399 7,-538 217,-746 0,0 -9,53 -65,116 -10,7 -21,13 13,-7 -38,61 -67,127 -67,127 24,-42 31,-47 48,-69 -64,125 -69,145 -93,205 16,-21 9,-22 33,-49 -61,152 -51,137 -86,423z',
        'M1005 1202c306,-365 394,-363 549,-523 31,-45 -38,116 -102,137 -10,3 -23,0 28,12 -37,37 -89,46 -89,46 24,12 24,6 53,17 -106,50 -100,54 -188,83 4,16 -12,-4 22,12 -94,52 -136,69 -273,216z',
        'M1008 1200c-98,-290 418,-453 655,-419 0,0 -25,87 -159,82 -12,0 56,32 101,13 -76,71 -181,8 -181,8 0,0 6,37 108,54 -129,68 -263,-8 -263,-8 0,0 -6,21 51,42 -322,2 -312,228 -312,228z',
        'M1005 1199c-206,-226 201,-583 431,-647 0,0 12,89 -112,139 -11,5 64,7 98,-29 -41,96 -163,80 -163,80 0,0 20,31 121,6 -91,115 -244,99 -244,99 0,0 2,21 63,18 -294,131 -194,334 -194,334z'
    ];
    const leftWingFrames = [
        'M1009 1201c8,-399 -7,-538 -217,-746 0,0 10,53 66,116 9,7 20,13 -13,-7 37,61 67,127 67,127 -25,-42 -32,-47 -49,-69 64,125 69,145 93,205 -16,-21 -9,-22 -33,-49 61,152 51,137 86,423z',
        'M1009 1202c-306,-365 -393,-363 -548,-523 -32,-45 38,116 101,137 10,3 23,0 -28,12 37,37 89,46 89,46 -24,12 -24,6 -52,17 106,50 99,54 187,83 -4,16 12,-4 -21,12 93,52 136,69 272,216z',
        'M1006 1200c98,-290 -418,-453 -654,-419 0,0 24,87 158,82 12,0 -56,32 -101,13 76,71 181,8 181,8 0,0 -6,37 -108,54 129,68 263,-8 263,-8 0,0 7,21 -51,42 322,2 312,228 312,228z',
        'M996 1202c207,-226 -201,-583 -430,-647 0,0 -13,89 111,139 11,4 -63,6 -97,-29 41,96 163,80 163,80 0,0 -21,31 -121,6 90,114 244,99 244,99 0,0 -2,21 -64,18 295,131 194,334 194,334z'
    ];
    const numberOfFrames = 4;

    // animation speed parameter
    const frameTime = 0.13;

    // selectors
    const rightWing = wings.querySelector('.wing-right');
    const leftWing = wings.querySelector('.wing-left');

    // timeline
    wingsTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.5,
        paused: true
    });
    // 1st flap
    for (let i = 0; i < numberOfFrames; i++) {
        // make 1st frame longer and w/ ease
        let ease = (i === 0) ? 'power1.in' : 'none';
        let timeExt = (i === 0) ? 1.5 : 1;
        wingsTl
            .to(rightWing, {
                duration: frameTime * timeExt,
                attr: { d: rightWingFrames[i] },
                ease: ease
            })
            .to(leftWing, {
                duration: frameTime * timeExt,
                attr: { d: leftWingFrames[i] },
                ease: ease
            }, '-=' + (frameTime * timeExt));
    }
    // 2nd flap
    for (let i = 0; i < numberOfFrames; i++) {
        // make last frame longer and w/ ease
        let ease = (i === (numberOfFrames - 1)) ? 'power1.out' : 'none';
        let timeExt = (i === (numberOfFrames - 1)) ? 2 : 1;
        wingsTl
            .to(rightWing, {
                duration: frameTime * timeExt,
                attr: { d: rightWingFrames[i] },
                ease: ease
            })
            .to(leftWing, {
                duration: frameTime * timeExt,
                attr: { d: leftWingFrames[i] },
                ease: ease
            }, '-=' + (frameTime * timeExt));
    }
}