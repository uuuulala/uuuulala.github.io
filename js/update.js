const whatIdoLink = document.querySelector('.what-I-do-link');
const whoIamLink = document.querySelector('.who-I-am-link');
const whatIdo = document.querySelector('.what-I-do');
const whoIam = document.querySelector('.who-I-am');

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
        duration: 0.4,
        scrollTo: whoIam
    })
} else if (hash === "#who-I-am") {
    //select tab 3 etc
}

const heroAnimation = document.querySelector('.banner-back');
initHeroAnimation(heroAnimation);