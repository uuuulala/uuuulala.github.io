initConfetti();

function initConfetti() {

    // global variables
    const confetti = document.getElementById('confetti');
    const confettiCtx = confetti.getContext('2d');
    let container, confettiElements = [], clickPosition;

    // helper
    rand = (min, max) => Math.random() * (max - min) + min;

    // params to play with
    const confettiParams = {
        // number of confetti per "explosion"
        number: 70,
        // min and max size for each rectangle
        size: { x: [5, 20], y: [10, 18] },
        // power of explosion
        initSpeed: 25,
        // defines how fast particles go down after blast-off
        gravity: 0.65,
        // how wide is explosion
        drag: 0.08,
        // how slow particles are falling
        terminalVelocity: 6,
        // how fast particles are rotating around themselves
        flipSpeed: 0.017,
    };
    const colors = [
        { front : '#3B870A', back: '#235106' },
        { front : '#B96300', back: '#6f3b00' },
        { front : '#E23D34', back: '#88251f' },
        { front : '#CD3168', back: '#7b1d3e' },
        { front : '#664E8B', back: '#3d2f53' },
        { front : '#394F78', back: '#222f48' },
        { front : '#008A8A', back: '#005353' },
    ];

    setupCanvas();

    confetti.addEventListener('click', addConfetti);
    window.addEventListener('resize', () => {
        confettiElements = [];
        setupCanvas();
    });

    // Confetti constructor
    function Conf() {
        this.randomModifier = rand(-1, 1);
        this.colorPair = colors[Math.floor(rand(0, colors.length))];
        this.dimensions = {
            x: rand(confettiParams.size.x[0], confettiParams.size.x[1]),
            y: rand(confettiParams.size.y[0], confettiParams.size.y[1]),
        };
        this.position = {
            x: clickPosition[0],
            y: clickPosition[1]
        };
        this.rotation = rand(0, 2 * Math.PI);
        this.scale = { x: 1, y: 1 };
        this.velocity = {
            x: rand(-confettiParams.initSpeed, confettiParams.initSpeed) * 0.4,
            y: rand(-confettiParams.initSpeed, confettiParams.initSpeed)
        };
        this.flipSpeed = rand(0.2, 1.5) * confettiParams.flipSpeed;

        if (this.position.y <= container.h) {
            this.velocity.y = -Math.abs(this.velocity.y);
        }

        this.terminalVelocity = rand(1, 1.5) * confettiParams.terminalVelocity;

        this.update = function () {
            this.velocity.x *= 0.98;
            this.position.x += this.velocity.x;

            this.velocity.y += (this.randomModifier * confettiParams.drag);
            this.velocity.y += confettiParams.gravity;
            this.velocity.y = Math.min(this.velocity.y, this.terminalVelocity);
            this.position.y += this.velocity.y;

            this.scale.y = Math.cos((this.position.y + this.randomModifier) * this.flipSpeed);
            this.color = this.scale.y > 0 ? this.colorPair.front : this.colorPair.back;
        }
    }

    function updateConfetti() {

        if (isVisible) {
            confettiCtx.clearRect(0, 0, container.w, container.h);

            confettiElements.forEach((c) => {
                c.update();
                confettiCtx.translate(c.position.x, c.position.y);
                confettiCtx.rotate(c.rotation);
                const width = (c.dimensions.x * c.scale.x);
                const height = (c.dimensions.y * c.scale.y);
                confettiCtx.fillStyle = c.color;
                confettiCtx.fillRect(-0.5 * width, -0.5 * height, width, height);
                confettiCtx.setTransform(1, 0, 0, 1, 0, 0)
            });

            confettiElements.forEach((c, idx) => {
                if (c.position.y > container.h ||
                    c.position.x < -0.5 * container.x ||
                    c.position.x > 1.5 * container.x) {
                    confettiElements.splice(idx, 1)
                }
            });
            window.requestAnimationFrame(updateConfetti);
        } else {
            confettiElements = [];
        }
    }

    function setupCanvas() {
        container = {
            w: confetti.clientWidth,
            h: confetti.clientHeight
        };
        confetti.width = container.w;
        confetti.height = container.h;
    }

    function addConfetti(e) {
        const canvasBox = confetti.getBoundingClientRect();
        if (e) {
            clickPosition = [
                e.clientX - canvasBox.left,
                e.clientY - canvasBox.top
            ];
        } else {
            clickPosition = [
                canvasBox.width * Math.random(),
                canvasBox.height * Math.random()
            ];
        }
        for (let i = 0; i < confettiParams.number; i++) {
            confettiElements.push(new Conf())
        }
    }

    let isVisible = elementIsInViewport(confetti);

    function confettyRandomBoom() {
        if (isVisible) {
            addConfetti();
            // setTimeout(confettyRandomBoom, 2000 + Math.random() * 2000);
        }
    }
    gsap.timeline({
        scrollTrigger: {
            trigger: confetti,
            onEnter: () => {
                isVisible = true;
                updateConfetti();
                confettyRandomBoom();
            },
            onLeave: () => {
                isVisible = false;
            },
            onEnterBack: () => {
                isVisible = true;
                updateConfetti();
                confettyRandomBoom();
            },
            onLeaveBack: () => {
                isVisible = false;
            }
        }
    });
}
