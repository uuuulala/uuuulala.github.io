var l = document.querySelector(".banner-back");
l.width = l.clientWidth, l.height = l.clientHeight;
var config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 256,
    DENSITY_DISSIPATION: .99,
    VELOCITY_DISSIPATION: .8,
    PRESSURE_DISSIPATION: .5,
    PRESSURE_ITERATIONS: 40,
    CURL: 0,
    SPLAT_RADIUS: 2,
    SHADING: 0,
    COLORFUL: 1,
    PAUSED: !1,
    TRANSPARENT: 0,
    BLOOM: 0,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 64,
    BLOOM_INTENSITY: .8,
    BLOOM_THRESHOLD: .6,
    BLOOM_SOFT_KNEE: .7
};
const OUTER_COLOR = [0.5, 0.1, .2];
const BACK_COLOR = [1, 1, 1];


var d = [], c = [];

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


















var b = function (e, n) {
    if (this.uniforms = {}, this.program = gl.createProgram(), gl.attachShader(this.program, e), gl.attachShader(this.program, n), gl.linkProgram(this.program), !gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw gl.getProgramInfoLog(this.program);
    for (var r = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS), t = 0; t < r; t++) {
        var i = gl.getActiveUniform(this.program, t).name;
        this.uniforms[i] = gl.getUniformLocation(this.program, i)
    }
};

function compileShader(e, n) {
    var r = gl.createShader(e);
    if (gl.shaderSource(r, n), gl.compileShader(r), !gl.getShaderParameter(r, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(r);
    return r
}

b.prototype.bind = function () {
    gl.useProgram(this.program)
};

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
    precision mediump float;
    precision mediump sampler2D;

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

const colorShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
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
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`
);

const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

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
const curlShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`);

const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

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
    precision mediump float;
    precision mediump sampler2D;

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

var x, k, w, E, T, L, A, S, C, O,
    j = compileShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n\n    void main () {\n        vec3 C = texture2D(uTexture, vUv).rgb;\n        float a = max(C.r, max(C.g, C.b));\n        gl_FragColor = vec4(C, a);\n    }\n"),
    N = compileShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTarget;\n    uniform float aspectRatio;\n    uniform vec3 color;\n    uniform vec2 point;\n    uniform float radius;\n\n    void main () {\n        vec2 p = vUv - point.xy;\n        p.x *= aspectRatio;\n        vec3 splat = exp(-dot(p, p) / radius) * color;\n        vec3 base = texture2D(uTarget, vUv).xyz;\n        gl_FragColor = vec4(base + splat, 1.0);\n    }\n"),
    q = compileShader(gl.FRAGMENT_SHADER, "\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform vec2 dyeTexelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {\n        vec2 st = uv / tsize - 0.5;\n\n        vec2 iuv = floor(st);\n        vec2 fuv = fract(st);\n\n        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);\n        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);\n        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);\n        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);\n\n        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\n    }\n\n    void main () {\n        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;\n        gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);\n        gl_FragColor.a = 1.0;\n    }\n"),

    blit = (gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()), gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW), gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()), gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW), gl.vertexAttribPointer(0, 2, gl.FLOAT, !1, 0, 0), gl.enableVertexAttribArray(0), function (e) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, e), gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    })


    ,

    Z = new b(baseVertexShader, blurShader),
    tt = new b(baseVertexShader, colorShader),
    it = new b(baseVertexShader, j),
    lt = new b(baseVertexShader, N),
    pt = new b(baseVertexShader, advectionShader),
    ut = new b(baseVertexShader, divergenceShader),
    dt = new b(baseVertexShader, curlShader),
    ct = new b(baseVertexShader, vorticityShader),
    vt = new b(baseVertexShader, pressureShader),
    ft = new b(baseVertexShader, gradientSubtractShader);

function gt() {
    var e = getResolution(config.SIM_RESOLUTION), n = getResolution(config.DYE_RESOLUTION);
    x = e.width, k = e.height, w = n.width, E = n.height;
    var r = ext.halfFloatTexType, t = ext.formatRGBA, i = ext.formatRG, o = ext.formatR,
        a = gl.NEAREST;
    T = null == T ? yt(w, E, t.internalFormat, t.format, r, a) : bt(T, w, E, t.internalFormat, t.format, r, a), L = null == L ? yt(x, k, i.internalFormat, i.format, r, a) : bt(L, x, k, i.internalFormat, i.format, r, a), A = mt(x, k, o.internalFormat, o.format, r, gl.NEAREST), S = mt(x, k, o.internalFormat, o.format, r, gl.NEAREST), C = yt(x, k, o.internalFormat, o.format, r, gl.NEAREST), function () {
        var e = getResolution(config.BLOOM_RESOLUTION), n = ext.halfFloatTexType, r = ext.formatRGBA,
            t = gl.NEAREST;
        O = mt(e.width, e.height, r.internalFormat, r.format, n, t);
        for (var i = c.length = 0; i < config.BLOOM_ITERATIONS; i++) {
            var o = e.width >> i + 1, a = e.height >> i + 1;
            if (o < 2 || a < 2) break;
            var v = mt(o, a, r.internalFormat, r.format, n, t);
            c.push(v)
        }
    }()
}

function mt(e, n, r, t, i, o) {
    gl.activeTexture(gl.TEXTURE0);
    var a = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, a), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, o), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, o), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.texImage2D(gl.TEXTURE_2D, 0, r, e, n, 0, t, i, null);
    var u = gl.createFramebuffer();
    return gl.bindFramebuffer(gl.FRAMEBUFFER, u), gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, a, 0), gl.viewport(0, 0, e, n), gl.clear(gl.COLOR_BUFFER_BIT), {
        texture: a,
        fbo: u,
        width: e,
        height: n,
        attach: function (e) {
            return gl.activeTexture(gl.TEXTURE0 + e), gl.bindTexture(gl.TEXTURE_2D, a), e
        }
    }
}

function yt(e, n, r, t, i, o) {
    var a = mt(e, n, r, t, i, o), u = mt(e, n, r, t, i, o);
    return {
        get read() {
            return a
        }, set read(e) {
            a = e
        }, get write() {
            return u
        }, set write(e) {
            u = e
        }, swap: function () {
            var e = a;
            a = u, u = e
        }
    }
}

function bt(e, n, r, t, i, o, a) {
    var u, v;
    return e.read = (u = e.read, v = mt(n, r, t, i, o, a), Z.bind(), gl.uniform1i(Z.uniforms.uTexture, u.attach(0)), gl.uniform1f(Z.uniforms.value, 1), blit(v.fbo), v), e.write = mt(n, r, t, i, o, a), e
}

gt();









function drawDash(e, n, r, t, color) {
    gl.viewport(0, 0, x, k);
    lt.bind();
    gl.uniform1i(lt.uniforms.uTarget, L.read.attach(0));
    gl.uniform1f(lt.uniforms.aspectRatio, l.width / l.height);
    gl.uniform2f(lt.uniforms.point, e / l.width, 1 - n / l.height);
    gl.uniform3f(lt.uniforms.color, r, -t, 1);
    gl.uniform1f(lt.uniforms.radius, config.SPLAT_RADIUS / 100);
    blit(L.write.fbo);
    L.swap();
    gl.viewport(0, 0, w, E);
    gl.uniform1i(lt.uniforms.uTarget, T.read.attach(0));
    gl.uniform3f(lt.uniforms.color, color[0], color[1], color[2]),
    blit(T.write.fbo);
    T.swap();
}

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

updateBackground();
function updateBackground() {

    for (let i = 0; i < pointers.length; i++) {
        let n = pointers[i];
        n.moved && (drawDash(n.x, n.y, n.dx, n.dy, n.color), n.moved = false)
    }

    gl.disable(gl.BLEND);
    gl.viewport(0, 0, x, k);
    dt.bind();

    gl.uniform2f(dt.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform1i(dt.uniforms.uVelocity, L.read.attach(0));
    blit(S.fbo);
    ct.bind();

    gl.uniform2f(ct.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform1i(ct.uniforms.uVelocity, L.read.attach(0));
    blit(L.write.fbo);
    L.swap();
    ut.bind();

    gl.uniform2f(ut.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform1i(ut.uniforms.uVelocity, L.read.attach(0));
    blit(A.fbo);
    Z.bind();

    gl.uniform1i(Z.uniforms.uTexture, C.read.attach(0));
    gl.uniform1f(Z.uniforms.value, config.PRESSURE_DISSIPATION);
    blit(C.write.fbo);
    C.swap();
    vt.bind();

    gl.uniform2f(vt.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform1i(vt.uniforms.uDivergence, A.attach(0));

    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(vt.uniforms.uPressure, C.read.attach(1));
        blit(C.write.fbo);
        C.swap();
    }
    ft.bind();

    gl.uniform2f(ft.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform1i(ft.uniforms.uPressure, C.read.attach(0));
    gl.uniform1i(ft.uniforms.uVelocity, L.read.attach(1));
    blit(L.write.fbo);
    L.swap();
    pt.bind();

    gl.uniform2f(pt.uniforms.texelSize, 1 / x, 1 / k);
    gl.uniform2f(pt.uniforms.dyeTexelSize, 1 / x, 1 / k);

    const n = L.read.attach(0);
    gl.uniform1i(pt.uniforms.uVelocity, n);
    gl.uniform1i(pt.uniforms.uSource, n);
    gl.uniform1f(pt.uniforms.dt, .016);
    gl.uniform1f(pt.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(L.write.fbo);
    L.swap();

    gl.viewport(0, 0, w, E);
    gl.uniform2f(pt.uniforms.dyeTexelSize, 1 / w, 1 / E);
    gl.uniform1i(pt.uniforms.uVelocity, L.read.attach(0));
    gl.uniform1i(pt.uniforms.uSource, T.read.attach(1));
    gl.uniform1f(pt.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(T.write.fbo);
    T.swap();

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    tt.bind();
    gl.uniform4f(tt.uniforms.color, BACK_COLOR[0], BACK_COLOR[1], BACK_COLOR[2], 1);
    blit();

    it.bind();
    gl.uniform1i(it.uniforms.uTexture, T.read.attach(0));
    blit();

    requestAnimationFrame(updateBackground)
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