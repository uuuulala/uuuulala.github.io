TweenLite.to(".back-shape", 13, {
    rotation: 360,
    svgOrigin: "50 50",
    repeat: -1,
    ease: Linear.easeNone
});
TweenLite.to(".front-shape", 9, {
    rotation: 360,
    svgOrigin: "50 50",
    repeat: -1,
    ease: Linear.easeNone
});
TweenLite.fromTo(".front-shape", 2.5, {
    scale: 0.8,
}, {
    scale: 1.2,
    repeat: -1,
    yoyo: true,
    ease: Power2.easeInOut
});
TweenLite.from(".back-shape", 4.5, {
    scale: 0.8,
    repeat: -1,
    yoyo: true,
    ease: Power2.easeInOut
});
