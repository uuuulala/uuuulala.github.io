function setupNeuroAnimation() {
    const canvasEl = document.querySelector("canvas#neuro");
    const devicePixelRatio = Math.min(window.devicePixelRatio, 2);

    let uniforms;
    const gl = initShader();
    
    resizeCanvas();
    // window.addEventListener("resize", resizeCanvas);

    render();

    function initShader() {
        const vsSource = '' +
            '    precision mediump float;\n' +
            '\n' +
            '    varying vec2 vUv;\n' +
            '    attribute vec2 a_position;\n' +
            '\n' +
            '    void main() {\n' +
            '        vUv = .5 * (a_position + 1.);\n' +
            '        gl_Position = vec4(a_position, 0.0, 1.0);\n' +
            '    }';
        
        const fsSource = '' +
            '    precision mediump float;\n' +
            '\n' +
            '    varying vec2 vUv;\n' +
            '    uniform float u_time;\n' +
            '    uniform float u_ratio;\n' +
            '    uniform vec2 u_pointer_position;\n' +
            '    uniform float u_scroll_progress;\n' +
            '\n' +
            '    vec2 rotate(vec2 uv, float th) {\n' +
            '        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;\n' +
            '    }\n' +
            '\n' +
            '    float neuro_shape(vec2 uv, float t) {\n' +
            '        vec2 sine_acc = vec2(0.);\n' +
            '        vec2 res = vec2(0.);\n' +
            '        float scale = 8.;\n' +
            '\n' +
            '        for (int j = 0; j < 15; j++) {\n' +
            '            uv = rotate(uv, 1.);\n' +
            '            sine_acc = rotate(sine_acc, 1.);\n' +
            '            vec2 layer = uv * scale + float(j) + sine_acc - t;\n' +
            '            sine_acc += sin(layer);\n' +
            '            res += (.5 + .5 * cos(layer)) / scale;\n' +
            '            scale *= 1.2;\n' +
            '        }\n' +
            '        return res.x + res.y;\n' +
            '    }\n' +
            '\n' +
            '    void main() {\n' +
            '        vec2 uv = vUv - .7;\n' +
            '        uv.x *= u_ratio;\n' +
            '\n' +
            '        float t = .001 * u_time;\n' +
            '        vec3 color = vec3(0.);\n' +
            '\n' +
            '        float noise = neuro_shape(uv, t);\n' +
            '\n' +
            '        noise = 1.2 * pow(noise, 3.);\n' +
            '        noise += pow(noise, 10.);\n' +
            '        noise = max(.0, noise - .5);\n' +
            '        noise *= (1. - length(vUv - .5));\n' +
            '\n' +
            '        color = normalize(vec3(.2, .5 + .4 * cos(3. * u_scroll_progress), .5 + .5 * sin(3. * u_scroll_progress)));\n' +
            '\n' +
            '        color = color * noise;\n' +
            '\n' +
            '        gl_FragColor = vec4(color, noise);\n' +
            '    }';

        const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

        if (!gl) {
            alert("WebGL is not supported by your browser.");
        }

        function createShader(gl, sourceCode, type) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, sourceCode);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
        const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

        function createShaderProgram(gl, vertexShader, fragmentShader) {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
                return null;
            }

            return program;
        }

        const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
        uniforms = getUniforms(shaderProgram);

        function getUniforms(program) {
            let uniforms = [];
            let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let uniformName = gl.getActiveUniform(program, i).name;
                uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
            }
            return uniforms;
        }

        const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);

        const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        return gl;
    }

    function render() {
        const currentTime = performance.now();

        gl.uniform1f(uniforms.u_time, currentTime);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        canvasEl.width = 400 * devicePixelRatio;
        canvasEl.height = 400 * devicePixelRatio;
        gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
        gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }
}