function initHeroAnimation(canvas, isFullScreen) {
    resizeCanvas();

    let config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 512,
        DENSITY_DISSIPATION: .99,
        VELOCITY_DISSIPATION: 0.8,
        PRESSURE: 0.5,
        PRESSURE_ITERATIONS: 40,
        SPLAT_RADIUS: isFullScreen ? .01 : (.025 * window.innerHeight / 150),
    };

    let drawingColor = () => {
        if (Math.random() > 0.1) {
            return Math.random() > 0.5 ? hexToRGB('FEAC5E') : hexToRGB('FE005E');
        } else {
            return Math.random() > 0.2 ? hexToRGB('C779D0') : hexToRGB('C700D0');
        }
    };
    const backgroundColor = hexToRGB('4BC0C8');


    function hexToRGB(hex) {
        return {
            r: parseInt(hex.substring(0,2), 16) / 255,
            g: parseInt(hex.substring(2,4), 16) / 255,
            b: parseInt(hex.substring(4,6), 16) / 255,
        }
    }

    let pointers = [{
        id: -1,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        moved: false,
        down: true
    }];

    const {gl, ext} = getWebGLContext(canvas);

    function getWebGLContext(canvas) {
        const params = {alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false};

        let gl = canvas.getContext('webgl', params);

        let halfFloat;
        let supportLinearFiltering;
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        const halfFloatTexType = halfFloat.HALF_FLOAT_OES;

        let formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        let formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        let formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);

        return {
            gl,
            ext: {
                formatRGBA,
                formatRG,
                formatR,
                halfFloatTexType,
                supportLinearFiltering
            }
        };
    }

    function getSupportedFormat(gl, internalFormat, format, type) {
        if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
            switch (internalFormat) {
                case gl.R16F:
                    return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                case gl.RG16F:
                    return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                default:
                    return null;
            }
        }

        return {
            internalFormat,
            format
        }
    }

    function supportRenderTextureFormat(gl, internalFormat, format, type) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        return status === gl.FRAMEBUFFER_COMPLETE;
    }


    class Program {
        constructor(vertexShader, fragmentShader) {
            this.uniforms = {};
            this.program = createProgram(vertexShader, fragmentShader);
            this.uniforms = getUniforms(this.program);
        }

        bind() {
            gl.useProgram(this.program);
        }
    }

    function createProgram(vertexShader, fragmentShader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            console.trace(gl.getProgramInfoLog(program));

        return program;
    }

    function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            console.trace(gl.getShaderInfoLog(shader));

        return shader;
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
        precision highp float;
    
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;
    
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `);


    const blurShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        uniform sampler2D uTexture;
    
        void main () {
            vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
            sum += texture2D(uTexture, vL) * 0.35294117;
            sum += texture2D(uTexture, vR) * 0.35294117;
            gl_FragColor = sum;
        }
    `);

    const copyShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
    
        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
    `);

    const colorShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
    
        uniform vec4 color;
    
        void main () {
            gl_FragColor = color;
        }
    `);

    const sunraysMaskShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying vec2 vUv;
        uniform sampler2D uTexture;
    
        void main () {
            vec3 C = texture2D(uTexture, vUv).rgb;
            float a = max(C.r, max(C.g, C.b));
            gl_FragColor = vec4(C, a);
        }
    `);

    const splatShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
    
        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
    `);

    const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
        
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        
        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
        
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);
        
            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        
            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }
        
        void main () {
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
            gl_FragColor.a = 1.0;
        }`
    );

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
    
        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;
    
            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
    
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
    `);

    const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
    
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
    `);

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
    
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
    
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
    `);

    function blit(target) {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            -1, 1,
            1, 1,
            1, -1
        ]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        if (target == null) {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
            gl.viewport(0, 0, target.width, target.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    let dye, velocity, divergence, pressure;

    const copyProgram = new Program(baseVertexShader, copyShader);
    const blurProgram = new Program(baseVertexShader, blurShader);
    const colorProgram = new Program(baseVertexShader, colorShader);
    const sunraysMaskProgram = new Program(baseVertexShader, sunraysMaskShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);


    function initFramebuffers() {
        let simRes = getResolution(config.SIM_RESOLUTION);
        let dyeRes = getResolution(config.DYE_RESOLUTION);

        const texType = ext.halfFloatTexType;
        const rgba = ext.formatRGBA;
        const rg = ext.formatRG;
        const r = ext.formatR;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

        gl.disable(gl.BLEND);

        if (dye == null)
            dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
        else
            dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

        if (velocity == null)
            velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
        else
            velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

        divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
        pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    }

    function getResolution(resolution) {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1)
            aspectRatio = 1.0 / aspectRatio;

        let min = Math.round(resolution);
        let max = Math.round(resolution * aspectRatio);

        if (gl.drawingBufferWidth > gl.drawingBufferHeight)
            return {width: max, height: min};
        else
            return {width: min, height: max};
    }

    function createFBO(w, h, internalFormat, format, type, param) {
        gl.activeTexture(gl.TEXTURE0);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let texelSizeX = 1.0 / w;
        let texelSizeY = 1.0 / h;

        return {
            texture,
            fbo,
            width: w,
            height: h,
            texelSizeX,
            texelSizeY,
            attach(id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    function createDoubleFBO(w, h, internalFormat, format, type, param) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);

        return {
            width: w,
            height: h,
            texelSizeX: fbo1.texelSizeX,
            texelSizeY: fbo1.texelSizeY,
            get read() {
                return fbo1;
            },
            set read(value) {
                fbo1 = value;
            },
            get write() {
                return fbo2;
            },
            set write(value) {
                fbo2 = value;
            },
            swap() {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        }
    }

    function resizeFBO(target, w, h, internalFormat, format, type, param) {
        let newFBO = createFBO(w, h, internalFormat, format, type, param);
        copyProgram.bind();
        gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
        blit(newFBO);
        return newFBO;
    }

    function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
        if (target.width == w && target.height == h)
            return target;
        target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
        target.write = createFBO(w, h, internalFormat, format, type, param);
        target.width = w;
        target.height = h;
        target.texelSizeX = 1.0 / w;
        target.texelSizeY = 1.0 / h;
        return target;
    }

    initFramebuffers();

    update();

    function update() {
        if (resizeCanvas()) initFramebuffers();
        step();
        requestAnimationFrame(update);
    }

    function resizeCanvas() {
        let newWidth = window.innerWidth;
        let newHeight = isFullScreen ? window.innerHeight : 150;
        if (Math.abs(canvas.width - newWidth) > 1 || Math.abs(canvas.height - newHeight) > 150) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            return true;
        }
        return false;
    }

    function step() {
        pointers.forEach(p => {
            if (p.moved) {
                p.moved = false;
                splat(p.x, p.y, p.dx, p.dy, drawingColor());
            }
        });

        gl.disable(gl.BLEND);

        divergenceProgram.bind();
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence);

        blurProgram.bind();
        gl.uniform1i(blurProgram.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(blurProgram.uniforms.value, config.PRESSURE_DISSIPATION);
        blit(pressure.write.fbo);
        pressure.swap();

        pressureProgram.bind();
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write);
            pressure.swap();
        }

        gradienSubtractProgram.bind();
        gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        advectionProgram.bind();
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);

        let velocityId = velocity.read.attach(0);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
        gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
        gl.uniform1f(advectionProgram.uniforms.dt, .016);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        colorProgram.bind();
        gl.uniform4f(colorProgram.uniforms.color, backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);
        blit();

        sunraysMaskProgram.bind();
        gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, dye.read.attach(0));
        blit();
    }


    function splat(x, y, dx, dy, color) {
        splatProgram.bind();
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1 - y / canvas.height);
        gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1);
        gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS);
        blit(velocity.write);
        velocity.swap();

        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
        blit(dye.write);
        dye.swap();
    }

    gsap.set('.banner-color', {
        display: 'none'
    });
    createSplats(6);

    function createSplats(number) {
        for (let i = 0; i < number; i++) {
            const color = drawingColor();
            splat(
                (0.25 + 0.5 * Math.random()) * canvas.width,
                (0.25 + 0.5 * Math.random()) * canvas.height,
                1000 * (Math.random() - 0.5),
                1000 * (Math.random() - 0.5),
                {r: color.r * 10, g: color.g * 10, b: color.b * 10}
            )
        }
    }


    const container = document.querySelector('.banner');

    container.addEventListener("click", function (e) {
        pointers[0].dx = 5;
        pointers[0].dy = 5;
        pointers[0].x = e.pageX;
        pointers[0].y = e.pageY;
        pointers[0].moved = true;
    });

    container.addEventListener("mousemove", function (e) {
        pointers[0].moved = pointers[0].down;
        pointers[0].dx = 5 * (e.pageX - pointers[0].x);
        pointers[0].dy = 5 * (e.pageY - pointers[0].y);
        pointers[0].x = e.pageX;
        pointers[0].y = e.pageY;
        pointers[0].moved = Math.abs(pointers[0].dx) > 0 || Math.abs(pointers[0].dy) > 0;
    });

    container.addEventListener("touchmove", function (e) {
        for (let n = e.targetTouches, r = 0; r < n.length; r++) {
            let t = pointers[r];
            t.moved = t.down;
            t.dx = 8 * (n[r].pageX - t.x);
            t.dy = 8 * (n[r].pageY - t.y);
            t.x = n[r].pageX;
            t.y = n[r].pageY;
        }
    }, false);

    container.addEventListener("touchstart", function (e) {
        for (let n = e.targetTouches, r = 0; r < n.length; r++) {
            pointers[r].id = n[r].identifier;
            pointers[r].down = true;
            pointers[r].x = n[r].pageX;
            pointers[r].y = n[r].pageY;
        }
    });

    container.addEventListener("touchend", function (e) {
        for (let n = e.changedTouches, r = 0; r < n.length; r++) {
            for (let t = 0; t < pointers.length; t++) {
                n[r].identifier === pointers[t].id && (pointers[t].down = false);
            }
        }
    });

    gsap.timeline({
        scrollTrigger: {
            trigger: canvas,
            start: '0% 0%',
            end: '100% 0%',
            onEnterBack: () => {
                createSplats(3);
            }
        }
    });

    if (!isFullScreen) {
        splatsLoop();
        function splatsLoop() {
            createSplats(1)
            setTimeout(splatsLoop, 2000 + Math.random() * 3000);
        }
    }
}