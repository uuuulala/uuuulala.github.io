function setupEyesPatternAnimation() {
    const canvasEl = document.querySelector("#eyes-pattern");
    const devicePixelRatio = Math.min(window.devicePixelRatio, 2);

    const params = {
        scale: .22,
        speed: .3,
        saturation: .7,
        blueRatio: .5,
        redness: .25
    }

    let uniforms;
    const gl = initShader();

    render();
    resizeCanvas();

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
        
        const fsSource = '\n' +
            '    precision mediump float;\n' +
            '\n' +
            '    varying vec2 vUv;\n' +
            '    uniform float u_scale;\n' +
            '    uniform float u_time;\n' +
            '    uniform float u_speed;\n' +
            '    uniform float u_ratio;\n' +
            '    uniform float u_saturation;\n' +
            '    uniform float u_redness;\n' +
            '    uniform float u_blue_ratio;\n' +
            '    uniform vec2 u_pointer;\n' +
            '\n' +
            '    #define TWO_PI 6.28318530718\n' +
            '\n' +
            '\n' +
            '    // =================================================\n' +
            '    // cell-related helpers\n' +
            '    vec2 hash(vec2 p) {\n' +
            '        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n' +
            '        return fract(sin(p)*18.5453);\n' +
            '    }\n' +
            '    // polynomial-based smooth minimum;\n' +
            '    // used for rounded Voronoi shaping\n' +
            '    float smin(float angle, float b, float k) {\n' +
            '        float h = clamp(.5 + .5 * (b - angle) / k, 0., 1.);\n' +
            '        return mix(b, angle, h) - k * h * (1. - h);\n' +
            '    }\n' +
            '\n' +
            '    // =================================================\n' +
            '    // eye-related helpers\n' +
            '    float rand(vec2 n) {\n' +
            '        return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n' +
            '    }\n' +
            '    float noise(vec2 n) {\n' +
            '        const vec2 d = vec2(0.0, 1.0);\n' +
            '        vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n' +
            '        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\n' +
            '    }\n' +
            '    float fbm(vec2 n) {\n' +
            '        float total = 0.0, amplitude = .4;\n' +
            '        for (int i = 0; i < 4; i++) {\n' +
            '            total += noise(n) * amplitude;\n' +
            '            n += n;\n' +
            '            amplitude *= 0.6;\n' +
            '        }\n' +
            '        return total;\n' +
            '    }\n' +
            '    vec3 hsv2rgb(vec3 c) {\n' +
            '        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n' +
            '        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n' +
            '        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n' +
            '    }\n' +
            '\n' +
            '\n' +
            '    // =================================================\n' +
            '\n' +
            '    vec3 eye_pattern(vec2 uv, float tile_time, float pointer_angle, float pointer_distance) {\n' +
            '\n' +
            '        // tiles coordinates\n' +
            '        vec2 i_uv = floor(uv);\n' +
            '        vec2 f_uv = fract(uv);\n' +
            '\n' +
            '        // outputs\n' +
            '        vec2 randomizer = vec2(0.);\n' +
            '        vec3 distance = vec3(1.);\n' +
            '        float angle = 0.;\n' +
            '\n' +
            '        // get Voronoi cell data\n' +
            '        for (int y = -1; y <= 1; y++) {\n' +
            '            for (int x = -1; x <= 1; x++) {\n' +
            '                vec2 tile_offset = vec2(float(x), float(y));\n' +
            '                vec2 blick_tile_offset = tile_offset;\n' +
            '                vec2 o = hash(i_uv + tile_offset);\n' +
            '                tile_offset += (.5 + (.25 + pointer_distance) * sin(tile_time + TWO_PI * o)) - f_uv;\n' +
            '                blick_tile_offset += (.9 - f_uv);\n' +
            '\n' +
            '                float dist = dot(tile_offset, tile_offset);\n' +
            '                float old_min_dist = distance.x;\n' +
            '\n' +
            '                distance.z = max(distance.x, max(distance.y, min(distance.z, dist)));\n' +
            '                distance.y = max(distance.x, min(distance.y, dist));\n' +
            '                distance.x = min(distance.x, dist);\n' +
            '\n' +
            '                if (old_min_dist > distance.x) {\n' +
            '                    angle = atan(tile_offset.x, tile_offset.y);\n' +
            '                    randomizer = o;\n' +
            '                }\n' +
            '            }\n' +
            '        }\n' +
            '\n' +
            '        distance = sqrt(distance);\n' +
            '        distance = sqrt(distance);\n' +
            '        float cell_shape = min(smin(distance.z, distance.y, .1) - distance.x, 1.);\n' +
            '        float cell_radius = distance.x;\n' +
            '        float eye_radius = 2. * cell_radius - .5 * cell_shape;\n' +
            '\n' +
            '        // at this point, we have\n' +
            '        // -- randomizer (x2)\n' +
            '        // -- angle to use as polar coordinate\n' +
            '        // -- cell_shape - Voronoi cell w/ rounded endges\n' +
            '        // -- cell_radius - exact circle in the mid of cell\n' +
            '        // -- eye_radius - mix of two\n' +
            '\n' +
            '        // ============================================================\n' +
            '\n' +
            '        float redness_angle = angle * 2. + randomizer.y;\n' +
            '        float eye_ball_redness = fbm(vec2(redness_angle, cell_shape * 3.));\n' +
            '        eye_ball_redness *= pow(cell_radius, 1. / u_redness); // more on edges\n' +
            '        eye_ball_redness *= randomizer.y; // less for some cells\n' +
            '        eye_ball_redness *= (1. - smoothstep(5., 6.6, redness_angle) - smoothstep(-4.3, -5.7, redness_angle));\n' +
            '        vec3 eye_ball_color = vec3(1., 1. - eye_ball_redness, 1. - eye_ball_redness);\n' +
            '\n' +
            '\n' +
            '        // iris color\n' +
            '        float iris_color_1_hue = (1. - u_blue_ratio) * pow(randomizer.x, 3. - 2. * u_blue_ratio) + u_blue_ratio * pow(randomizer.x, 1.3 - u_blue_ratio);\n' +
            '        iris_color_1_hue = mix(.07, .59, iris_color_1_hue);\n' +
            '        vec3 iris_color_1 = hsv2rgb(vec3(iris_color_1_hue, u_saturation, .5 + iris_color_1_hue));\n' +
            '        vec3 iris_color_2 = hsv2rgb(vec3(.67 * randomizer.x - .1 * randomizer.y, .5, .1 + .2 * randomizer.y));\n' +
            '\n' +
            '        float outer_color_noise = fbm(vec2(angle * 4., cell_radius));\n' +
            '        vec3 color = iris_color_1;\n' +
            '        color = mix(color, iris_color_2, outer_color_noise);\n' +
            '\n' +
            '        vec3 iris_center_color = hsv2rgb(vec3(.2 - .1 * randomizer.y, u_saturation, .5));\n' +
            '        color = mix(iris_center_color, color, smoothstep(.05 + randomizer.y * .25, .45, cell_radius - .2 * pointer_distance));\n' +
            '\n' +
            '        float white_incertion_noise = smoothstep(.4, 1., fbm(vec2(8. * angle, 10. * cell_shape)));\n' +
            '        white_incertion_noise *= (.9 + .5 * randomizer.x);\n' +
            '        color = mix(color, vec3(1.), white_incertion_noise);\n' +
            '\n' +
            '        float dark_incertion_noise = smoothstep(.5, 1., fbm(vec2(3. * angle, 11. * cell_shape)));\n' +
            '        color = mix(color, vec3(0.), dark_incertion_noise);\n' +
            '\n' +
            '        // dark pupil\n' +
            '        float pupil_shape = smoothstep(.35, .45, 1.2 * eye_radius - pointer_distance);\n' +
            '        color = mix(vec3(.0), color, pupil_shape);\n' +
            '\n' +
            '        // darkness on the edge of iris\n' +
            '        color *= pow(smoothstep(1., .6, eye_radius), .3);\n' +
            '\n' +
            '        // crop the iris\n' +
            '        float outer_shape = smoothstep(.9, 1., eye_radius);\n' +
            '        color = mix(color, eye_ball_color, outer_shape);\n' +
            '\n' +
            '        float blick = smoothstep(1.6, .2, eye_radius + .1 * randomizer.y * sin(.007 * u_time * randomizer.x));\n' +
            '        blick *= smoothstep(.5 - pointer_distance, .7, eye_radius - .2 * randomizer.y);\n' +
            '        blick *= (1. - sin(angle + pointer_angle));\n' +
            '        blick = step(1., blick);\n' +
            '        blick *= step(.5, fbm(2. * uv + vec2(0., .0005 * u_time)));\n' +
            '\n' +
            '        // dark cell border\n' +
            '        color -= .1 * pow(1. - cell_shape, 6.);\n' +
            '        color -= .4 * pow(1. - cell_shape, 100.);\n' +
            '\n' +
            '        float round_shadow = -sin(angle + pointer_angle);\n' +
            '        round_shadow *= smoothstep(.4, .5, cell_radius);\n' +
            '        round_shadow = .13 * mix(0., round_shadow, 1. - smoothstep(.1, .2, pointer_distance));\n' +
            '        color += round_shadow;\n' +
            '\n' +
            '        color = mix(color, vec3(1.), blick);\n' +
            '\n' +
            '        return color;\n' +
            '    }\n' +
            '\n' +
            '\n' +
            '    void main() {\n' +
            '        vec2 uv = vUv;\n' +
            '        uv.x *= u_ratio;\n' +
            '\n' +
            '        vec2 _uv = (vUv - .5) / u_scale + .5;\n' +
            '        _uv.x *= u_ratio;\n' +
            '\n' +
            '        float tile_floating_speed = .001 * u_speed * u_time;\n' +
            '\n' +
            '        vec2 point = u_pointer;\n' +
            '        point.x *= u_ratio;\n' +
            '        point -= uv;\n' +
            '        float pointer_angle = atan(point.y, point.x);\n' +
            '        float pointer_distance = pow(1. - .5 * length(point), 2.);\n' +
            '        pointer_distance *= .2;\n' +
            '\n' +
            '        vec3 color = eye_pattern(_uv, tile_floating_speed, pointer_angle, pointer_distance);\n' +
            '\n' +
            '        gl_FragColor = vec4(color, 1.);\n' +
            '    }\n'

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

        gl.uniform1f(uniforms.u_scale, params.scale);
        gl.uniform1f(uniforms.u_speed, params.speed);
        gl.uniform1f(uniforms.u_saturation, params.saturation);
        gl.uniform1f(uniforms.u_redness, params.redness);
        gl.uniform1f(uniforms.u_blue_ratio, params.blueRatio);

        return gl;
    }

    function render() {
        const currentTime = performance.now();

        gl.uniform1f(uniforms.u_time, currentTime);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        canvasEl.width = 400 * devicePixelRatio;
        canvasEl.height = 400 * devicePixelRatio;
        gl.viewport(0, 0, canvasEl.width, canvasEl.height);
        gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
    }
}