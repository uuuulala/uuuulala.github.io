const whatIdoLink = document.querySelector('.what-I-do-link');
const whoIamLink = document.querySelector('.who-I-am-link');
const whatIdo = document.querySelector('.what-I-do');
const whoIam = document.querySelector('.who-I-am');
const svgAnchor = document.querySelector('.svg-anchor');
const d3anchor = document.querySelector('.d3-anchor');
const canvasAnchor = document.querySelector('.canvas-anchor');

whatIdoLink.addEventListener('click', () => {
    gsap.to(window, {
        duration: 0.4,
        scrollTo: whatIdo
    })
});
whoIamLink.addEventListener('click', () => {
    gsap.to(window, {
        duration: 1.3,
        scrollTo: whoIam
    })
});

const hash = window.location.hash;
if (hash === "#who-I-am") {
    gsap.to(window, {
        duration: 0.5,
        scrollTo: whoIam
    })
} else if (hash === "#svg") {
    gsap.to(window, {
        duration: 0.5,
        scrollTo: svgAnchor
    })
} else if (hash === "#d3") {
    gsap.to(window, {
        duration: 0.5,
        scrollTo: d3anchor
    })
} else if (hash === "#canvas") {
    gsap.to(window, {
        duration: 0.5,
        scrollTo: canvasAnchor
    })
}

const heroAnimation = document.querySelector('.banner-back');
initHeroAnimation(heroAnimation);