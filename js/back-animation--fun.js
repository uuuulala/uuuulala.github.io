const l = document.querySelector(".banner-back");

l.width = l.clientWidth;
l.height = l.clientHeight;

const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 256,
    DENSITY_DISSIPATION: .99,
    VELOCITY_DISSIPATION: .8,
    PRESSURE_DISSIPATION: .5,
    SPLAT_RADIUS: 0.02,
    BACK_COLOR: {r: 137, g: 138, b: 222},
};
const OUTER_COLOR = [0.5, 0.1, .2];
const BACK_COLOR = [0.2, 0.4, 0];

let pointers = [];
pointers.push({
    id: -1,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    down: false,
    moved: false,
});

function getWebGLContext(l) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

    let gl = l.getContext("webgl", params);
    let halfFloat = gl.getExtension("OES_texture_half_float");
    let supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
    gl.clearColor(0, 0, 0, 1);
    const halfFloatTexType = halfFloat.HALF_FLOAT_OES;

    let formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    let formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    let formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);

    return {
        gl: gl,
        ext: {
            formatRGBA,
            formatRG,
            formatR,
            halfFloatTexType,
            supportLinearFiltering
        }
    }
}

function getSupportedFormat (gl, internalFormat, format, type) {
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

function supportRenderTextureFormat (gl, internalFormat, format, type) {
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

const set = getWebGLContext(l);
let gl = set.gl;
let ext = set.ext;


let b = function (eeeee, n) {
    this.uniforms = {};
    this.program = gl.createProgram();
    gl.attachShader(this.program, eeeee);
    gl.attachShader(this.program, n);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        throw gl.getProgramInfoLog(this.program);

    for (let t = 0; t < gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS); t++) {
        let i = gl.getActiveUniform(this.program, t).name;
        this.uniforms[i] = gl.getUniformLocation(this.program, i)
    }
};


function createShader(e, n) {
    let r = gl.createShader(e);
    gl.shaderSource(r, n);
    gl.compileShader(r);
    if (!gl.getShaderParameter(r, gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(r);
    return r
}

b.prototype.bind = function () {
    gl.useProgram(this.program)
};


let x, k, w, E, T, L, A, S, C;
const I = createShader(gl.VERTEX_SHADER, "\n    precision highp float;\n\n    attribute vec2 aPosition;\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform vec2 texelSize;\n\n    void main () {\n        vUv = aPosition * 0.5 + 0.5;\n        vL = vUv - vec2(texelSize.x, 0.0);\n        vR = vUv + vec2(texelSize.x, 0.0);\n        vT = vUv + vec2(0.0, texelSize.y);\n        vB = vUv - vec2(0.0, texelSize.y);\n        gl_Position = vec4(aPosition, 0.0, 1.0);\n    }\n");
P = createShader(gl.FRAGMENT_SHADER, "\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform float value;\n\n    void main () {\n        gl_FragColor = value * texture2D(uTexture, vUv);\n    }\n"),
    z = createShader(gl.FRAGMENT_SHADER, "\n    precision mediump float;\n\n    uniform vec4 color;\n\n    void main () {\n        gl_FragColor = color;\n    }\n"),
    blurShader = createShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform sampler2D uBloom;\n    uniform sampler2D uDithering;\n    uniform vec2 ditherScale;\n\n    void main () {\n        vec3 C = texture2D(uTexture, vUv).rgb;\n        vec3 bloom = texture2D(uBloom, vUv).rgb;\n        vec3 noise = texture2D(uDithering, vUv * ditherScale).rgb;\n        noise = noise * 2.0 - 1.0;\n        bloom += noise / 800.0;\n        bloom = pow(bloom.rgb, vec3(1.0 / 2.2));\n        C += bloom;\n        float a = max(C.r, max(C.g, C.b));\n        gl_FragColor = vec4(C, a);\n    }\n"),
    splatShader = createShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTarget;\n    uniform float aspectRatio;\n    uniform vec3 color;\n    uniform vec2 point;\n    uniform float radius;\n\n    void main () {\n        vec2 p = vUv - point.xy;\n        p.x *= aspectRatio;\n        vec3 splat = exp(-dot(p, p) / radius) * color;\n        vec3 base = texture2D(uTarget, vUv).xyz;\n        gl_FragColor = vec4(base + splat, 1.0);\n    }\n"),
    q = createShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform vec2 dyeTexelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {\n        vec2 st = uv / tsize - 0.5;\n\n        vec2 iuv = floor(st);\n        vec2 fuv = fract(st);\n\n        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);\n        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);\n        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);\n        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);\n\n        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\n    }\n\n    void main () {\n        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;\n        gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);\n        gl_FragColor.a = 1.0;\n    }\n"),
    V = createShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    void main () {\n        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;\n        gl_FragColor = dissipation * texture2D(uSource, coord);\n        gl_FragColor.a = 1.0;\n    }\n"),
    X = createShader(gl.FRAGMENT_SHADER, "\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    varying highp vec2 vL;\n    varying highp vec2 vR;\n    varying highp vec2 vT;\n    varying highp vec2 vB;\n    uniform sampler2D uVelocity;\n\n    void main () {\n        float L = texture2D(uVelocity, vL).x;\n        float R = texture2D(uVelocity, vR).x;\n        float T = texture2D(uVelocity, vT).y;\n        float B = texture2D(uVelocity, vB).y;\n\n        vec2 C = texture2D(uVelocity, vUv).xy;\n        if (vL.x < 0.0) { L = -C.x; }\n        if (vR.x > 1.0) { R = -C.x; }\n        if (vT.y > 1.0) { T = -C.y; }\n        if (vB.y < 0.0) { B = -C.y; }\n\n        float div = 0.5 * (R - L + T - B);\n        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);\n    }\n");

function blit(target) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

Z = new b(I, P),
    tt = new b(I, z),
    blurProgram = new b(I, blurShader),
    lt = new b(I, splatShader),
    pt = new b(I, ext.supportLinearFiltering ? V : q),
    ut = new b(I, X);


initFramebuffers();

// first spots
for (let n = 0; n < 5; n++) {
    let color = OUTER_COLOR.map(c => c * 10);
    drawDash(
        (0.25 + 0.5 * Math.random()) * l.width,
        (0.25 + 0.5 * Math.random()) * l.height,
        1000 * (Math.random() - 0.5),
        1000 * (Math.random() - 0.5),
        color
    )
}

updateBackground();


function initFramebuffers() {
    let e = getResolution(config.SIM_RESOLUTION),
        n = getResolution(config.DYE_RESOLUTION);

    x = e.width;
    k = e.height;
    w = n.width;
    E = n.height;

    let r = ext.halfFloatTexType,
        t = ext.formatRGBA,
        i = ext.formatRG,
        o = ext.formatR,
        a = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    T = null == T ? createDoubleFBO(w, E, t.internalFormat, t.format, r, a) : bt(T, w, E, t.internalFormat, t.format, r, a);
    L = null == L ? createDoubleFBO(x, k, i.internalFormat, i.format, r, a) : bt(L, x, k, i.internalFormat, i.format, r, a);
    A = createFBO(x, k, o.internalFormat, o.format, r, gl.NEAREST);
    S = createFBO(x, k, o.internalFormat, o.format, r, gl.NEAREST);
    C = createDoubleFBO(x, k, o.internalFormat, o.format, r, gl.NEAREST);
}


function createFBO(e, n, r, t, i, o) {

    gl.activeTexture(gl.TEXTURE0);

    let a = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, a);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, o);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, o);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, r, e, n, 0, t, i, null);

    let u = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, u);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, a, 0);
    gl.viewport(0, 0, e, n);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
        texture: a,
        fbo: u,
        width: e,
        height: n,
        attach: function (e) {
            gl.activeTexture(gl.TEXTURE0 + e);
            gl.bindTexture(gl.TEXTURE_2D, a);
            return e;
        }
    }
}


function createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param),
        fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
        get read () {
            return fbo1;
        },
        set read (value) {
            fbo1 = value;
        }, get write() {
            return fbo2;
        }, set write(value) {
            fbo2 = value;
        }, swap: function () {
            let temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        }
    }
}

function bt(e, n, r, t, i, o, a) {

    let u, v;
    return e.read = (
        u = e.read,
            v = createFBO(n, r, t, i, o, a),
            Z.bind(),
            gl.uniform1i(Z.uniforms.uTexture, u.attach(0)),
            gl.uniform1f(Z.uniforms.value, 1),
            blit(v.fbo),
            v
    ),
        e.write = createFBO(n, r, t, i, o, a),
        e
}



function drawDash(x, y, dx, dy, color) {
    gl.viewport(0, 0, x, k);
    lt.bind(),
        gl.uniform1i(lt.uniforms.uTarget, L.read.attach(0)),
        gl.uniform1f(lt.uniforms.aspectRatio, l.width / l.height),
        gl.uniform2f(lt.uniforms.point, x / l.width, 1 - y / l.height),
        gl.uniform3f(lt.uniforms.color, dx, -dy, 1),
        gl.uniform1f(lt.uniforms.radius, config.SPLAT_RADIUS),
        blit(L.write.fbo),
        L.swap(),
        gl.viewport(0, 0, w, E),
        gl.uniform1i(lt.uniforms.uTarget, T.read.attach(0)),
        gl.uniform3f(lt.uniforms.color, color[0], color[1], color[2]),
        blit(T.write.fbo),
        T.swap()
}

function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1)
        aspectRatio = 1.0 / aspectRatio;
    let min = Math.round(resolution);
    let max = Math.round(resolution * aspectRatio);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
        return { width: max, height: min };
    else
        return { width: min, height: max };
}

function updateBackground() {
    for (let i = 0; i < pointers.length; i++) {
        let n = pointers[i];
        n.moved && (drawDash(n.x, n.y, n.dx, n.dy, n.color), n.moved = false)
    }

    gl.viewport(0, 0, x, k);

    ut.bind();
    gl.uniform2f(ut.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform1i(ut.uniforms.uVelocity, L.read.attach(0));
    blit(A.fbo);

    pt.bind();
    gl.uniform2f(pt.uniforms.texelSize, 1 / x, 1 / k);

    gl.viewport(0, 0, w, E);

    ext.supportLinearFiltering || gl.uniform2f(pt.uniforms.dyeTexelSize, 1 / w, 1 / E);
    // gl.uniform1i(pt.uniforms.uVelocity, L.read.attach(0));
    // gl.uniform1i(pt.uniforms.uSource, T.read.attach(1));
    gl.uniform1f(pt.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(T.write.fbo);
    T.swap();


    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // draw background color
    tt.bind();
    gl.uniform4f(tt.uniforms.color, BACK_COLOR[0], BACK_COLOR[1], BACK_COLOR[2], 1);
    blit();

    blurProgram.bind();
    gl.uniform1i(blurProgram.uniforms.uTexture, T.read.attach(0));
    blit();

    requestAnimationFrame(updateBackground);
}

window.addEventListener("mousemove", function (e) {
    pointers[0].moved = pointers[0].down;
    pointers[0].dx = 5 * (e.pageX - pointers[0].x);
    pointers[0].dy = 5 * (e.pageY - pointers[0].y);
    pointers[0].x = e.pageX;
    pointers[0].y = e.pageY;
});

window.addEventListener("touchmove", function (e) {
    for (let n = e.targetTouches, r = 0; r < n.length; r++) {
        let t = pointers[r];
        t.moved = t.down;
        t.dx = 8 * (n[r].pageX - t.x);
        t.dy = 8 * (n[r].pageY - t.y);
        t.x = n[r].pageX;
        t.y = n[r].pageY;
    }
}, false);

window.addEventListener("touchstart", function (e) {
    for (let n = e.targetTouches, r = 0; r < n.length; r++) {
        pointers[r].id = n[r].identifier;
        pointers[r].down = true;
        pointers[r].x = n[r].pageX;
        pointers[r].y = n[r].pageY;
        pointers[r].color = OUTER_COLOR;
    }
});

window.addEventListener("click", function (e) {
    pointers[0].moved = pointers[0].down;
    pointers[0].dx = 5 * (e.pageX - pointers[0].x);
    pointers[0].dy = 5 * (e.pageY - pointers[0].y);
    pointers[0].x = e.pageX;
    pointers[0].y = e.pageY;
});

window.addEventListener("touchend", function (e) {
    for (let n = e.changedTouches, r = 0; r < n.length; r++) {
        for (let t = 0; t < pointers.length; t++) {
            n[r].identifier === pointers[t].id && (pointers[t].down = false);
        }
    }
});

window.addEventListener("load", function () {
    pointers[0].down = true;
    pointers[0].color = OUTER_COLOR;
});

window.addEventListener("resize", function () {
    l.width = l.clientWidth;
    l.height = l.clientHeight;
});