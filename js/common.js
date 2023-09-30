gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(MorphSVGPlugin);

function elementIsInViewport(el) {
    const top = el.offsetTop;
    const left = el.offsetLeft;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
}


window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
});