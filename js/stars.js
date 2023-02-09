const stars = document.querySelector('.stars');

initStars();

function initStars() {
    // DOM selectors
    const canvas = stars.querySelector('canvas');
    const starsCtx = canvas.getContext('2d');
    const slider = stars.querySelector('.slider input');

    // global variables
    let container, starsElements, starsParams = { speed: 2, number: 300, extinction: 4 };

    setupStars();

    // handle slider
    slider.oninput = function () {
        starsParams.speed = this.value;
    };

    // update canvas on resize
    window.onresize = () => {
        setupStars();
    };

    // star constructor
    function Star() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * canvas.width;
        this.move = () => {
            this.z -= starsParams.speed;
            if (this.z <= 0) {
                this.z = canvas.width;
            }
        };
        this.show = () => {
            let x, y, rad, opacity;
            x = (this.x - container.c[0]) * (canvas.width / this.z);
            x = x + container.c[0];
            y = (this.y - container.c[1]) * (canvas.width / this.z);
            y = y + container.c[1];
            rad = canvas.width / this.z;
            opacity = (rad > starsParams.extinction) ? 1.5 * (2 - rad / starsParams.extinction) : 1;
            starsCtx.beginPath();
            starsCtx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
            starsCtx.arc(x, y, rad, 0, Math.PI * 2);
            starsCtx.fill();
        }
    }

    // setup <canvas>, create all the starts
    function setupStars() {
        container = {
            w: canvas.clientWidth,
            h: canvas.clientHeight,
            c: [ canvas.clientWidth * 0.5, canvas.clientHeight * 0.5 ]
        };
        canvas.width = container.w;
        canvas.height = container.h;
        starsElements = [];
        for (let i = 0; i < starsParams.number; i++) {
            starsElements[i] = new Star();
        }
    }

    // redraw the frame
    updateStars();
    function updateStars() {
        starsCtx.fillStyle = 'black';
        starsCtx.fillRect(0, 0, canvas.width, canvas.height);
        starsElements.forEach((s) => {
            s.show();
            s.move();
        });
        window.requestAnimationFrame(updateStars);
    }
}
