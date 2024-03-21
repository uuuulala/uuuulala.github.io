const tipText = document.querySelector(".walking .tip > div");
const dudeWrapper = document.querySelector(".walking svg");
const dude = document.querySelector(".dude");
const head = dude.querySelector(".head");
const legs = Array.from(dude.querySelectorAll(".leg"));
const arms = Array.from(dude.querySelectorAll(".arm"));
const legBottoms = Array.from(dude.querySelectorAll(".leg-bottom"));
const armBottoms = Array.from(dude.querySelectorAll(".arm-bottom"));


gsap.set(arms, {
    svgOrigin: "180 58"
});
gsap.set(head, {
    svgOrigin: "180 45",
});
gsap.set(armBottoms, {
    svgOrigin: "178 118"
});
gsap.set(legs, {
    svgOrigin: "177 145",
});
gsap.set(legBottoms, {
    svgOrigin: "171 220"
});


const halfBodyTimeline = (leg, arm) => {
    const legBottom = leg.querySelector(".leg-bottom");
    const armBottom = arm.querySelector(".arm-bottom");

    return gsap.timeline({
        repeat: -1,
        paused: true
    })
        .fromTo(leg, {
            rotation: -25
        }, {
            duration: .5,
            rotation: 15,
            ease: "sine.inOut"
        }, 0)
        .to(leg, {
            duration: .25,
            rotation: -25,
            ease: "sine.in"
        }, ">")
        .to(legBottom, {
            duration: .25,
            rotation: 15,
            ease: "sine.inOut"
        }, .25)
        .to(legBottom, {
            duration: .25,
            rotation: 80,
            ease: "sine.in"
        }, ">")
        .to(legBottom, {
            duration: .25,
            rotation: 0,
            ease: "sine.out"
        }, ">")
        .fromTo(arm, {
            rotation: -12
        }, {
            duration: .5,
            rotation: 12,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1
        }, 0)
        .fromTo(armBottom, {
            rotation: -15
        }, {
            duration: .5,
            rotation: 10,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1
        }, 0)
}

const backCycle = halfBodyTimeline(legs[0], arms[1]);
const frontCycle = halfBodyTimeline(legs[1], arms[0]);


const bodyTimeline = gsap.timeline({
    paused: true,
})
    .to(dude, {
        duration: .25,
        y: "-=20",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    }, 0)
    .fromTo(head, {
        rotation: -25
    }, {
        duration: .25,
        rotation: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    }, 0)


const numberOfCycles = 5;
gsap.timeline({
    scrollTrigger: {
        trigger: ".animation.walking",
        scrub: true,
        start: "0% 100%",
        end: "100% 0%",
    }
})
    .fromTo(dudeWrapper, {
        x: 0
    }, {
        x: 300,
        ease: "none"
    }, 0)
    .fromTo(tipText, {
        x: 100
    }, {
        x: -500,
        ease: "none"
    }, 0)
    .fromTo(bodyTimeline, {
        time: .7
    }, {
        time: .75 + numberOfCycles,
        ease: "none"
    }, 0)
    .fromTo(backCycle, {
        time: .7
    }, {
        time: .75 + numberOfCycles,
        ease: "none"
    }, 0)
    .fromTo(frontCycle, {
        time: .2
    }, {
        time: .25 + numberOfCycles,
        ease: "none"
    }, 0)

