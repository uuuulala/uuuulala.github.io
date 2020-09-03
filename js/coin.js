const coin = document.querySelector('.coin');
let coinTl;

initCoin();
playCoin();

function playCoin() {
    coinTl.play();
}
function pauseCoin() {
    coinTl.pause();
}
function initCoin() {
    const coinBody = coin.querySelector('.coin-body');
    const coinEdge = coin.querySelector('.coin-edge');
    const coinObserve = coin.querySelector('.coin-obverse');
    const coinReverse = coin.querySelector('.coin-reverse');

    coinTl = new gsap.timeline({
        repeat: -1,
        repeatRefresh: true,
    })
        // Coin falling
        .fromTo(coinBody, {
            y: 0
        }, {
            duration: 1.2,
            y: 200,
            ease: CustomEase.create('custom', 'M0,0,C0.272,0.096,0.354,0.963,0.362,1,0.37,0.985,0.45,0.686,0.532,0.696,0.622,0.707,0.679,0.981,0.686,0.998,0.704,0.884,0.766,0.87,0.79,0.87,0.838,0.87,0.856,0.985,0.87,0.998,0.881,0.994,0.908,0.938,0.936,0.938,0.972,0.938,1,1,1,1')
        })
        // Coin random rotation
        .fromTo(coinBody, {
            rotation: 0
        }, {
            duration: 0.12,
            rotation: 'random(-4, 4)'
        }, 0.12)
        .to(coinBody, {
            duration: 0.96,
            rotation: 0,
            ease: 'elastic.in(1, 1)'
        }, 0.24)
        // Coin flip
        .fromTo([coinObserve, coinReverse], {
            attr: { 'ry' : 63 }
        }, {
            duration: 0.84,
            attr: { 'ry' : 4 }
        }, 0.36)
        .fromTo(coinReverse, {
            attr: { 'cy' : 3871 }
        }, {
            duration: 0.84,
            attr: { 'cy' : 3891 }
        }, 0.36)
        .fromTo(coinEdge, {
            attr: { 'height' : 0 }
        }, {
            duration: 0.84,
            attr: { 'height' : 20 },
        }, 0.36)
        // Hide coin
        .fromTo(coinBody, {
            opacity: 1
        }, {
            duration: 0.5,
            opacity: 0
        }, 2.2)
}