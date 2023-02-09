initRate();

function initRate() {
    // Global variables
    const rate = document.querySelector('.rate');
    const eyeLeft = rate.querySelector('.eye--left');
    const eyeRight = rate.querySelector('.eye--right');
    const month = rate.querySelector('.month');
    const handLeft = rate.querySelector('.hand--left');
    const handRight = rate.querySelector('.hand--right');
    const eyebrowLeft = rate.querySelector('.eyebrow--left');
    const eyebrowRight = rate.querySelector('.eyebrow--right');
    const eyebrowCopies = rate.querySelectorAll('.eyebrow--second');

    const rateCards = Array.from(rate.querySelectorAll('.card'));
    let currentRate;

    // Prepare graphics
    gsap.set(handRight, {
        svgOrigin: '570 370'
    });
    gsap.set(handLeft, {
        svgOrigin: '380 370'
    });
    gsap.set(eyebrowLeft, {
        svgOrigin: '442 262'
    });
    gsap.set(eyebrowRight, {
        svgOrigin: '515 250'
    });

    rateCards.forEach((card, cardIdx) => {
        card.addEventListener("click", () => changeRate(cardIdx));
        card.addEventListener("mouseenter", () => changeRate(cardIdx));
    });

    //--------------------------------------------------------------
    // update buttons and animate the character

    function changeRate(newRate) {
        if (currentRate !== newRate) {
            rateCards.forEach(function (card, idx) {
                if (idx > newRate) {
                    card.classList.remove('card--selected');
                } else {
                    card.classList.add('card--selected');
                }
            });
            currentRate = newRate;
            animateAvatar(newRate, 0.5);
        }
    }

    //--------------------------------------------------------------
    // animate the character

    function animateAvatar(rate, dur) {
        const states = [ {
            leftEye: 'M433.9,244c5.3,0.6,9,8.1,8.2,16.8c-0.8,8.7-5.8,15.4-11.1,14.8c-5.3-0.6-9-8.1-8.2-16.8 C423.6,250.1,428.6,243.5,433.9,244z',
            rightEye: 'M508.3,270.5c-5,0.2-9.3-6.2-9.6-14c-0.3-7.9,3.5-14.4,8.5-14.5c5-0.1,9.3,6.2,9.6,14 C517.1,263.9,513.3,270.4,508.3,270.5z',
            month: 'M483.8,292.3c11.1,7,18.9,16.9,15,27.4s-16.3,11.1-29.4,10.6c-16.7-0.7-18.9-16.9-15-27.4 C458.4,292.3,470.1,283.7,483.8,292.3z',
            leftHand: {
                x: '0',
                y: '0',
                rotation: '0',
                scale: 1
            },
            rightHand: {
                x: '0',
                y: '0',
                rotation: '0',
                scale: 1
            }
        }, {
            leftEye: 'M418.5,260.6c-1.8,5.1-5.6,8.4-8.5,7.4c-2.9-1-3.7-6-1.9-11.1c1.8-5.1,5.6-8.4,8.5-7.4 C419.5,250.5,420.3,255.5,418.5,260.6z',
            rightEye: 'M543.6,256.7c2.1,5.9,1.1,11.6-2.2,12.8c-3.3,1.2-7.6-2.7-9.7-8.6c-2.1-5.9-1.1-11.6,2.2-12.8 C537.2,247,541.6,250.8,543.6,256.7z',
            month: 'M434.4,319.2c-0.5,0-0.9-0.1-1.3-0.4c-1.2-0.7-1.5-2.3-0.8-3.4c2.3-3.5,8.7-9.2,16.8-5.5   c8.3,3.8,12.2,2.4,13.2,1.8c2.8-1.5,15.3-3.7,20.3,0.2c2.8,2.2,3.2,2.2,7.6-0.2c5.3-2.9,15.7-2.4,19,0.2c1.1,0.8,1.3,2.4,0.5,3.5   s-2.4,1.3-3.5,0.5c-1.4-1.1-9.7-2-13.6,0.2c-5.2,2.9-8,3.7-13.1-0.2c-2.9-2.2-13-0.8-14.9,0.2c-2.4,1.3-7.9,2.8-17.7-1.7   c-6.1-2.8-10.1,2.9-10.5,3.6C436,318.8,435.2,319.2,434.4,319.2z',
            leftHand: {
                x: '0',
                y: '-8',
                rotation: '-3',
                scale: 1
            },
            rightHand: {
                x: '18',
                y: '12',
                rotation: '-20',
                scale: 1
            }
        }, {
            leftEye: 'M418.6,259.4c-0.5,8-4.5,14.3-9,14.1c-4.5-0.3-7.8-7-7.3-15c0.5-8,4.5-14.3,9-14.1 C415.8,244.6,419,251.4,418.6,259.4z',
            rightEye: 'M542.5,259c2,7.8,0.1,15-4.2,16.1c-4.4,1.1-9.5-4.3-11.5-12c-2-7.8-0.1-15,4.2-16.1 C535.3,245.8,540.5,251.2,542.5,259z',
            month: 'M466,317c-10.2,0.9-14,5-19,5c-0.7,0-2.7-1.2-3-3c-0.4-2.1,1-4.2,2-5c9.6-8.1,37-9,50-1c1.6,1,2,3,2,3   c-0.2,2.2-1.1,4.7-4,4C485,318,477.2,316.1,466,317z',
            leftHand: {
                x: '5',
                y: '3',
                rotation: '-160',
                scale: 1
            },
            rightHand: {
                x: '3',
                y: '-5',
                rotation: '143',
                scale: 1
            }
        }, {
            leftEye: 'M415.7,278.1c-0.5,8-4.5,14.3-9,14.1c-4.5-0.3-7.8-7-7.3-15c0.5-8,4.5-14.3,9-14.1 C413,263.3,416.2,270.1,415.7,278.1z',
            rightEye: 'M517.1,280.4c-0.5,8-4.5,14.3-9,14.1c-4.5-0.3-7.7-7-7.3-15c0.5-8,4.5-14.3,9-14.1 C514.3,265.6,517.6,272.3,517.1,280.4z',
            month: 'M462,315c-6-0.4-13,2-19,2c-0.5,0-1.9-0.9-2-2c-0.2-1.4,0-2.7,1-3c6-2,15.6-3.2,20-3c15,1,19,2,26,2   c2.1,0,11,0,12,1c0.2,0.2,1.4,1.6,1,3c-0.3,1.2-1.5,1.9-2,2C493,318,478,316,462,315z',
            leftHand: {
                x: '-2',
                y: '12',
                rotation: '-163',
                scale: 1
            },
            rightHand: {
                x: '1',
                y: '-2',
                rotation: '155',
                scale: 1
            }
        }, {
            leftEye: 'M406,257.6c0,8.2-3.7,14.9-8.3,14.9c-4.6,0-8.4-6.6-8.4-14.9c0-8.2,3.7-14.9,8.3-14.9 C402.2,242.8,405.9,249.4,406,257.6z',
            rightEye: 'M550,257.2c0,8.2-3.7,14.9-8.3,14.9c-4.6,0-8.3-6.6-8.4-14.8c0-8.2,3.7-14.9,8.3-14.9 C546.2,242.3,550,249,550,257.2z',
            month: 'M469.7,323.6c-6.7-0.1-13.2-0.9-18.7-2.4c-2.1-0.5-3.3-2.7-2.8-4.8s2.7-3.3,4.8-2.8 c13.1,3.4,33.6,3.1,43.9-3.5c1.8-1.2,4.2-0.6,5.4,1.2c1.2,1.8,0.6,4.2-1.2,5.4C493.3,321.7,481.3,323.8,469.7,323.6z',
            leftHand: {
                x: '-2',
                y: '25',
                rotation: '-180',
                scale: 1
            },
            rightHand: {
                x: '10',
                y: '5',
                rotation: '155',
                scale: 1
            }
        }, {
            leftEye: 'M414,252.2c-0.7,11.5-6.4,20.5-12.8,20.1c-6.4-0.4-11.1-10-10.4-21.4c0.7-11.4,6.4-20.4,12.8-20 C410.1,231.1,414.7,240.7,414,252.2z',
            rightEye: 'M554.9,260.5c-0.7,11.7-6.5,20.8-13,20.4c-6.5-0.4-11.2-10.1-10.5-21.8c0.7-11.6,6.5-20.8,13-20.4 C550.9,239.1,555.6,248.8,554.9,260.5z',
            month: 'M468.9,319.9c-6.5-0.5-12.8-1.7-18.1-3.4c-1.8-0.6-2.8-2.5-2.2-4.3c0.6-1.8,2.5-2.8,4.3-2.2 c12.6,4.2,32.8,5.1,43.4-0.8c1.7-0.9,3.7-0.3,4.7,1.3c0.9,1.7,0.3,3.7-1.3,4.7C491.8,319.5,480.1,320.7,468.9,319.9z',
            leftHand: {
                x: '-8',
                y: '12',
                rotation: '-108',
                scale: 1
            },
            rightHand: {
                x: '-2',
                y: '5',
                rotation: '110',
                scale: 1
            }
        }, {
            leftEye: 'M414.5,250.4c-0.7,11.9-6.7,21.2-13.3,20.8c-6.7-0.4-11.5-10.4-10.8-22.2c0.7-11.9,6.7-21.2,13.3-20.8 C410.3,228.6,415.1,238.6,414.5,250.4z',
            rightEye: 'M545.1,250.3c0.5,11.1-4.2,20.2-10.4,20.5c-6.2,0.3-11.6-8.5-12-19.6c-0.4-11.1,4.2-20.2,10.4-20.5 C539.3,230.5,544.7,239.2,545.1,250.3z',
            month: 'M473.2,321.6c-8-0.6-19.4-9.9-25.8-12c-2.2-0.7-3.4-3.1-2.7-5.3c0.7-2.2,3.1-3.4,5.3-2.7 c15.5,5.1,40.2,6.2,53.2-1c2-1.1,4.6-0.4,5.7,1.7c1.1,2,0.4,4.6-1.7,5.7C497.7,313.3,486.9,322.7,473.2,321.6z',
            leftHand: {
                x: '-18',
                y: '-2',
                rotation: '-55',
                scale: 1
            },
            rightHand: {
                x: '-4',
                y: '7',
                rotation: '82',
                scale: 1
            }
        }, {
            leftEye: 'M424.9,245.8c-0.6,10.5-6.8,18.7-13.9,18.3c-7-0.4-12.3-9.3-11.6-19.8c0.7-10.5,6.9-18.7,13.9-18.3 C420.3,226.4,425.5,235.3,424.9,245.8z',
            rightEye: 'M547.9,248.8c0.8,10.9-3.5,20-9.6,20.5c-6.1,0.5-11.6-8-12.4-18.8c-0.8-10.9,3.5-20,9.6-20.5 C541.6,229.5,547.2,237.9,547.9,248.8z',
            month: 'M474.7,326c-10-0.8-26.8-7.7-36-14.3c-2.3-1.7-3.2-6.5-2.2-9.2c0.9-2.8,3.9-4.2,6.6-3.3 c19.4,6.4,50.3,7.7,66.4-1.2c2.5-1.4,5.7-0.5,7.1,2.1c1.4,2.5-0.1,5-2.1,7.1C503.4,319.9,491.9,327.3,474.7,326z',
            leftHand: {
                x: '-18',
                y: '-20',
                rotation: '-65',
                scale: 1.45
            },
            rightHand: {
                x: '-5',
                y: '-9',
                rotation: '82',
                scale: 1.43
            }
        }, {
            leftEye: 'M430.8,231.1c2.8,5.1-2.7,13.7-12.4,19.3c-9.7,5.6-19.9,6.1-22.7,1c-2.8-5.1,2.8-13.7,12.4-19.3 C417.8,226.6,427.9,226.1,430.8,231.1z',
            rightEye: 'M529.5,233.7c7.5,3,12.1,8.9,10.4,13.1c-1.7,4.2-9.1,5.1-16.6,2c-7.4-3.1-12.1-8.9-10.4-13.1 C514.7,231.6,522.1,230.7,529.5,233.7z',
            month: 'M463.8,317.7c-16.7-1.3-38-15.6-53.6-25c-4-2.4-14.9-9.8-11-8.5c11,3.6,16.3,4.8,20.9,6.1 c32.6,9.3,74.8,7,101.7-5c4.2-1.9,11.8-2.8,11.8-2.8s-8.9,12-14.5,15.6C497.7,311.8,492.6,319.8,463.8,317.7z',
            leftHand: {
                x: '-8',
                y: '0',
                rotation: '-65',
                scale: 1.1
            },
            rightHand: {
                x: '-5',
                y: '-9',
                rotation: '46',
                scale: 1.1
            }
        }, {
            leftEye: 'M407.5,236.2c-7.2,3.6-9.1,12.8-11.1,8.8c-2-4,2.1-10.2,9.3-13.9c7.2-3.6,14.6-3.3,16.7,0.7 C424.3,235.9,414.6,232.6,407.5,236.2z',
            rightEye: 'M536.2,234.2c7,3.9,10.9,10.3,8.7,14.2c-2.2,3.9-5.7-4.2-12.8-8.1c-7-3.9-14.9-2.2-12.7-6.1 C521.7,230.2,529.2,230.2,536.2,234.2z',
            month: 'M461.6,324.4c-40.2-6.2-45.6-17.9-63.4-31.3c-4.5-3.4-15.1-17.7-10.7-16c12.7,5,18.7,6.6,24.1,8.4 c37.5,12.7,84.2,3.9,117.9-9.5c7-2.8,19.4-6.2,19.4-6.2s-10.3,22-17.7,28.4C506.7,319.4,494.9,326.9,461.6,324.4z',
            leftHand: {
                x: '-14',
                y: '-20',
                rotation: '-60',
                scale: 0.95
            },
            rightHand: {
                x: '5',
                y: '-25',
                rotation: '45',
                scale: 0.95
            }
        }];

        gsap.to(eyeLeft, {
            duration: dur,
            morphSVG: states[rate].leftEye
        });
        gsap.to(eyeRight, {
            duration: dur,
            morphSVG: states[rate].rightEye
        });
        gsap.to(month, {
            duration: dur,
            morphSVG: states[rate].month
        });
        gsap.to(handLeft, {
            duration: dur,
            x: states[rate].leftHand.x,
            y: states[rate].leftHand.y,
            rotation: states[rate].leftHand.rotation,
            scale: states[rate].leftHand.scale,
        });
        gsap.to(handRight, {
            duration: dur,
            x: states[rate].rightHand.x,
            y: states[rate].rightHand.y,
            rotation: states[rate].rightHand.rotation,
            scale: states[rate].rightHand.scale,
        });
        gsap.to(eyebrowCopies, {
            duration: dur,
            opacity: rate > 1 ? 0 : 0.7
        });

        if (rate === 1) {
            gsap.to([eyebrowLeft, eyebrowRight], {
                duration: dur,
                scale: 1,
                rotation: 1,
                opacity: 0.7
            });
        } else if (rate === 2) {
            gsap.to(eyebrowLeft, {
                duration: dur,
                scale: 0.7,
                rotation: 40,
                opacity: 1
            });
            gsap.to(eyebrowRight, {
                duration: dur,
                scale: 0.75,
                rotation: -50,
                opacity: 1
            });
        } else {
            gsap.to([eyebrowLeft, eyebrowRight], {
                duration: dur,
                opacity: 0
            });
        }
    }

    gsap.timeline({
        scrollTrigger: {
            trigger: rate,
            start: '0% 50%',
            end: '100% 50%',
            onEnter: () => {
                changeRate(7)
            },
            onEnterBack: () => {
                changeRate(2)
            }
        }
    });
}