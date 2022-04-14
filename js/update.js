const whatIdoLink = document.querySelector('.what-I-do-link');
const whoIamLink = document.querySelector('.who-I-am-link');
const whatIdo = document.querySelector('.what-I-do');
const whoIam = document.querySelector('.who-I-am');
const svgAnchor = document.querySelector('.svg-anchor');
const d3anchor = document.querySelector('.d3-anchor');
const canvasAnchor = document.querySelector('.canvas-anchor');
const webglAnchor = document.querySelector('.webgl-anchor');

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
 else if (hash === "#webgl") {
    gsap.to(window, {
        duration: 0.5,
        scrollTo: webglAnchor
    })
}

const heroContent = document.querySelector('.banner-content');
gsap.set(heroContent, {
    height: window.innerHeight
});
let oldWindowHeight = 0;
window.addEventListener('resize', () => {
    if (Math.abs(oldWindowHeight - window.innerHeight) > 150) {
        oldWindowHeight = window.innerHeight;
        gsap.set(heroContent, {
            height: window.innerHeight
        })
    }
});

const heroAnimation = document.querySelector('.banner-back');
initHeroAnimation(heroAnimation);

window.addEventListener('touchstart', () => {
    whatIdo.classList.add('mobile');
});

// ---------------------------------

const gifOverlays = Array.from(document.querySelectorAll('.gif-overlay'));
gifOverlays.forEach((overlay) => {
    overlay.onmouseover = function () {
        gsap.to(overlay, {
            duration: .2,
            opacity: 1
        })
    };
    overlay.onmouseleave = function () {
        gsap.to(overlay, {
            duration: .2,
            opacity: 0
        })
    };
    overlay.onclick = function () {
        if (this.getAttribute('data-gif-name') === 'globe') {
            window.open('https://codepen.io/ksenia-k/full/QWadgoY','_blank');
        } else if (this.getAttribute('data-gif-name') === 'disco') {
            window.open('https://codepen.io/ksenia-k/pen/VwMNgZO','_blank');
        } else if (this.getAttribute('data-gif-name') === 'gooey') {
            window.open('https://codepen.io/ksenia-k/pen/oNpwwrN','_blank');
        }
    };
});