var l=document.querySelector(".home-back");l.width=l.clientWidth,l.height=l.clientHeight;var u={SIM_RESOLUTION:128,DYE_RESOLUTION:256,DENSITY_DISSIPATION:.99,VELOCITY_DISSIPATION:.8,PRESSURE_DISSIPATION:.5,PRESSURE_ITERATIONS:40,CURL:0,SPLAT_RADIUS:2,SHADING:0,COLORFUL:1,PAUSED:!1,BACK_COLOR:{r:255,g:255,b:255},TRANSPARENT:0,BLOOM:0,BLOOM_ITERATIONS:8,BLOOM_RESOLUTION:64,BLOOM_INTENSITY:.8,BLOOM_THRESHOLD:.6,BLOOM_SOFT_KNEE:.7};function s(){this.id=-1,this.x=0,this.y=0,this.dx=0,this.dy=0,this.down=!1,this.moved=!1,this.color=[30,0,300]}var p=[],d=[],c=[];p.push(new s);var f=function(e){var n,r,t={alpha:0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1},i=e.getContext("webgl2",t),o=!!i;o||(i=e.getContext("webgl",t)||e.getContext("experimental-webgl",t)),r=o?(i.getExtension("EXT_color_buffer_float"),i.getExtension("OES_texture_float_linear")):(n=i.getExtension("OES_texture_half_float"),i.getExtension("OES_texture_half_float_linear")),i.clearColor(0,0,0,1);var a,u,v,g=o?i.HALF_FLOAT:n.HALF_FLOAT_OES;return v=o?(a=y(i,i.RGBA16F,i.RGBA,g),u=y(i,i.RG16F,i.RG,g),y(i,i.R16F,i.RED,g)):(a=y(i,i.RGBA,i.RGBA,g),u=y(i,i.RGBA,i.RGBA,g),y(i,i.RGBA,i.RGBA,g)),{gl:i,ext:{formatRGBA:a,formatRG:u,formatR:v,halfFloatTexType:g,supportLinearFiltering:r}}}(l),g=f.gl,m=f.ext;function y(e,n,r,t){if(!function(e,n,r,t){var i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,n,4,4,0,r,t,null);var o=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),e.checkFramebufferStatus(e.FRAMEBUFFER)==e.FRAMEBUFFER_COMPLETE}(e,n,r,t))switch(n){case e.R16F:return y(e,e.RG16F,e.RG,t);case e.RG16F:return y(e,e.RGBA16F,e.RGBA,t);default:return null}return{internalFormat:n,format:r}}var b=function(e,n){if(this.uniforms={},this.program=g.createProgram(),g.attachShader(this.program,e),g.attachShader(this.program,n),g.linkProgram(this.program),!g.getProgramParameter(this.program,g.LINK_STATUS))throw g.getProgramInfoLog(this.program);for(var r=g.getProgramParameter(this.program,g.ACTIVE_UNIFORMS),t=0;t<r;t++){var i=g.getActiveUniform(this.program,t).name;this.uniforms[i]=g.getUniformLocation(this.program,i)}};function _(e,n){var r=g.createShader(e);if(g.shaderSource(r,n),g.compileShader(r),!g.getShaderParameter(r,g.COMPILE_STATUS))throw g.getShaderInfoLog(r);return r}b.prototype.bind=function(){g.useProgram(this.program)};var x,k,w,E,T,L,A,S,C,O,I=_(g.VERTEX_SHADER,"\n    precision highp float;\n\n    attribute vec2 aPosition;\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform vec2 texelSize;\n\n    void main () {\n        vUv = aPosition * 0.5 + 0.5;\n        vL = vUv - vec2(texelSize.x, 0.0);\n        vR = vUv + vec2(texelSize.x, 0.0);\n        vT = vUv + vec2(0.0, texelSize.y);\n        vB = vUv - vec2(0.0, texelSize.y);\n        gl_Position = vec4(aPosition, 0.0, 1.0);\n    }\n"),P=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform float value;\n\n    void main () {\n        gl_FragColor = value * texture2D(uTexture, vUv);\n    }\n"),z=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n\n    uniform vec4 color;\n\n    void main () {\n        gl_FragColor = color;\n    }\n"),D=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform float aspectRatio;\n\n    #define SCALE 25.0\n\n    void main () {\n        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));\n        float v = mod(uv.x + uv.y, 2.0);\n        v = v * 0.1 + 0.8;\n        gl_FragColor = vec4(vec3(v), 1.0);\n    }\n"),j=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n\n    void main () {\n        vec3 C = texture2D(uTexture, vUv).rgb;\n        float a = max(C.r, max(C.g, C.b));\n        gl_FragColor = vec4(C, a);\n    }\n"),M=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform sampler2D uBloom;\n    uniform sampler2D uDithering;\n    uniform vec2 ditherScale;\n\n    void main () {\n        vec3 C = texture2D(uTexture, vUv).rgb;\n        vec3 bloom = texture2D(uBloom, vUv).rgb;\n        vec3 noise = texture2D(uDithering, vUv * ditherScale).rgb;\n        noise = noise * 2.0 - 1.0;\n        bloom += noise / 800.0;\n        bloom = pow(bloom.rgb, vec3(1.0 / 2.2));\n        C += bloom;\n        float a = max(C.r, max(C.g, C.b));\n        gl_FragColor = vec4(C, a);\n    }\n"),R=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uTexture;\n    uniform vec2 texelSize;\n\n    void main () {\n        vec3 L = texture2D(uTexture, vL).rgb;\n        vec3 R = texture2D(uTexture, vR).rgb;\n        vec3 T = texture2D(uTexture, vT).rgb;\n        vec3 B = texture2D(uTexture, vB).rgb;\n        vec3 C = texture2D(uTexture, vUv).rgb;\n\n        float dx = length(R) - length(L);\n        float dy = length(T) - length(B);\n\n        vec3 n = normalize(vec3(dx, dy, length(texelSize)));\n        vec3 l = vec3(0.0, 0.0, 1.0);\n\n        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);\n        C.rgb *= diffuse;\n\n        float a = max(C.r, max(C.g, C.b));\n        gl_FragColor = vec4(C, a);\n    }\n"),B=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uTexture;\n    uniform sampler2D uBloom;\n    uniform sampler2D uDithering;\n    uniform vec2 ditherScale;\n    uniform vec2 texelSize;\n\n    void main () {\n        vec3 L = texture2D(uTexture, vL).rgb;\n        vec3 R = texture2D(uTexture, vR).rgb;\n        vec3 T = texture2D(uTexture, vT).rgb;\n        vec3 B = texture2D(uTexture, vB).rgb;\n        vec3 C = texture2D(uTexture, vUv).rgb;\n\n        float dx = length(R) - length(L);\n        float dy = length(T) - length(B);\n\n        vec3 n = normalize(vec3(dx, dy, length(texelSize)));\n        vec3 l = vec3(0.0, 0.0, 1.0);\n\n        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);\n        C *= diffuse;\n\n        vec3 bloom = texture2D(uBloom, vUv).rgb;\n        vec3 noise = texture2D(uDithering, vUv * ditherScale).rgb;\n        noise = noise * 2.0 - 1.0;\n        bloom += noise / 800.0;\n        bloom = pow(bloom.rgb, vec3(1.0 / 2.2));\n        C += bloom;\n\n        float a = max(C.r, max(C.g, C.b));\n        gl_FragColor = vec4(C, a);\n    }\n"),H=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform vec3 curve;\n    uniform float threshold;\n\n    void main () {\n        vec3 c = texture2D(uTexture, vUv).rgb;\n        float br = max(c.r, max(c.g, c.b));\n        float rq = clamp(br - curve.x, 0.0, curve.y);\n        rq = curve.z * rq * rq;\n        c *= max(rq, br - threshold) / max(br, 0.0001);\n        gl_FragColor = vec4(c, 0.0);\n    }\n"),F=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uTexture;\n\n    void main () {\n        vec4 sum = vec4(0.0);\n        sum += texture2D(uTexture, vL);\n        sum += texture2D(uTexture, vR);\n        sum += texture2D(uTexture, vT);\n        sum += texture2D(uTexture, vB);\n        sum *= 0.25;\n        gl_FragColor = sum;\n    }\n"),U=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uTexture;\n    uniform float intensity;\n\n    void main () {\n        vec4 sum = vec4(0.0);\n        sum += texture2D(uTexture, vL);\n        sum += texture2D(uTexture, vR);\n        sum += texture2D(uTexture, vT);\n        sum += texture2D(uTexture, vB);\n        sum *= 0.25;\n        gl_FragColor = sum * intensity;\n    }\n"),N=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTarget;\n    uniform float aspectRatio;\n    uniform vec3 color;\n    uniform vec2 point;\n    uniform float radius;\n\n    void main () {\n        vec2 p = vUv - point.xy;\n        p.x *= aspectRatio;\n        vec3 splat = exp(-dot(p, p) / radius) * color;\n        vec3 base = texture2D(uTarget, vUv).xyz;\n        gl_FragColor = vec4(base + splat, 1.0);\n    }\n"),q=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform vec2 dyeTexelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {\n        vec2 st = uv / tsize - 0.5;\n\n        vec2 iuv = floor(st);\n        vec2 fuv = fract(st);\n\n        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);\n        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);\n        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);\n        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);\n\n        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\n    }\n\n    void main () {\n        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;\n        gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);\n        gl_FragColor.a = 1.0;\n    }\n"),V=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    void main () {\n        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;\n        gl_FragColor = dissipation * texture2D(uSource, coord);\n        gl_FragColor.a = 1.0;\n    }\n"),X=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    varying highp vec2 vL;\n    varying highp vec2 vR;\n    varying highp vec2 vT;\n    varying highp vec2 vB;\n    uniform sampler2D uVelocity;\n\n    void main () {\n        float L = texture2D(uVelocity, vL).x;\n        float R = texture2D(uVelocity, vR).x;\n        float T = texture2D(uVelocity, vT).y;\n        float B = texture2D(uVelocity, vB).y;\n\n        vec2 C = texture2D(uVelocity, vUv).xy;\n        if (vL.x < 0.0) { L = -C.x; }\n        if (vR.x > 1.0) { R = -C.x; }\n        if (vT.y > 1.0) { T = -C.y; }\n        if (vB.y < 0.0) { B = -C.y; }\n\n        float div = 0.5 * (R - L + T - B);\n        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);\n    }\n"),G=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    varying highp vec2 vL;\n    varying highp vec2 vR;\n    varying highp vec2 vT;\n    varying highp vec2 vB;\n    uniform sampler2D uVelocity;\n\n    void main () {\n        float L = texture2D(uVelocity, vL).y;\n        float R = texture2D(uVelocity, vR).y;\n        float T = texture2D(uVelocity, vT).x;\n        float B = texture2D(uVelocity, vB).x;\n        float vorticity = R - L - T + B;\n        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);\n    }\n"),W=_(g.FRAGMENT_SHADER,"\n    precision highp float;\n    precision highp sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uCurl;\n    uniform float curl;\n    uniform float dt;\n\n    void main () {\n        float L = texture2D(uCurl, vL).x;\n        float R = texture2D(uCurl, vR).x;\n        float T = texture2D(uCurl, vT).x;\n        float B = texture2D(uCurl, vB).x;\n        float C = texture2D(uCurl, vUv).x;\n\n        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\n        force /= length(force) + 0.0001;\n        force *= curl * C;\n        force.y *= -1.0;\n\n        vec2 vel = texture2D(uVelocity, vUv).xy;\n        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);\n    }\n"),Y=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    varying highp vec2 vL;\n    varying highp vec2 vR;\n    varying highp vec2 vT;\n    varying highp vec2 vB;\n    uniform sampler2D uPressure;\n    uniform sampler2D uDivergence;\n\n    vec2 boundary (vec2 uv) {\n        return uv;\n        // uncomment if you use wrap or repeat texture mode\n        // uv = min(max(uv, 0.0), 1.0);\n        // return uv;\n    }\n\n    void main () {\n        float L = texture2D(uPressure, boundary(vL)).x;\n        float R = texture2D(uPressure, boundary(vR)).x;\n        float T = texture2D(uPressure, boundary(vT)).x;\n        float B = texture2D(uPressure, boundary(vB)).x;\n        float C = texture2D(uPressure, vUv).x;\n        float divergence = texture2D(uDivergence, vUv).x;\n        float pressure = (L + R + B + T - divergence) * 0.25;\n        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);\n    }\n"),K=_(g.FRAGMENT_SHADER,"\n    precision mediump float;\n    precision mediump sampler2D;\n\n    varying highp vec2 vUv;\n    varying highp vec2 vL;\n    varying highp vec2 vR;\n    varying highp vec2 vT;\n    varying highp vec2 vB;\n    uniform sampler2D uPressure;\n    uniform sampler2D uVelocity;\n\n    vec2 boundary (vec2 uv) {\n        return uv;\n        // uv = min(max(uv, 0.0), 1.0);\n        // return uv;\n    }\n\n    void main () {\n        float L = texture2D(uPressure, boundary(vL)).x;\n        float R = texture2D(uPressure, boundary(vR)).x;\n        float T = texture2D(uPressure, boundary(vT)).x;\n        float B = texture2D(uPressure, boundary(vB)).x;\n        vec2 velocity = texture2D(uVelocity, vUv).xy;\n        velocity.xy -= vec2(R - L, T - B);\n        gl_FragColor = vec4(velocity, 0.0, 1.0);\n    }\n"),Q=(g.bindBuffer(g.ARRAY_BUFFER,g.createBuffer()),g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),g.STATIC_DRAW),g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,g.createBuffer()),g.bufferData(g.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),g.STATIC_DRAW),g.vertexAttribPointer(0,2,g.FLOAT,!1,0,0),g.enableVertexAttribArray(0),function(e){g.bindFramebuffer(g.FRAMEBUFFER,e),g.drawElements(g.TRIANGLES,6,g.UNSIGNED_SHORT,0)}),J=function(){var n=g.createTexture();g.bindTexture(g.TEXTURE_2D,n),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.REPEAT),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.REPEAT),g.texImage2D(g.TEXTURE_2D,0,g.RGB,1,1,0,g.RGB,g.UNSIGNED_BYTE,new Uint8Array([255,255,255]));var e={texture:n,width:1,height:1,attach:function(e){return g.activeTexture(g.TEXTURE0+e),g.bindTexture(g.TEXTURE_2D,n),e}},r=new Image;return r.onload=function(){e.width=r.width,e.height=r.height,g.bindTexture(g.TEXTURE_2D,n),g.texImage2D(g.TEXTURE_2D,0,g.RGB,g.RGB,g.UNSIGNED_BYTE,r)},r.src=void 0,e}(),Z=new b(I,P),tt=new b(I,z),et=new b(I,D),it=new b(I,j),st=new b(I,M),rt=new b(I,R),nt=new b(I,B),ot=new b(I,H),at=new b(I,F),ht=new b(I,U),lt=new b(I,N),pt=new b(I,m.supportLinearFiltering?V:q),ut=new b(I,X),dt=new b(I,G),ct=new b(I,W),vt=new b(I,Y),ft=new b(I,K);function gt(){var e=Et(u.SIM_RESOLUTION),n=Et(u.DYE_RESOLUTION);x=e.width,k=e.height,w=n.width,E=n.height;var r=m.halfFloatTexType,t=m.formatRGBA,i=m.formatRG,o=m.formatR,a=m.supportLinearFiltering?g.LINEAR:g.NEAREST;T=null==T?yt(w,E,t.internalFormat,t.format,r,a):bt(T,w,E,t.internalFormat,t.format,r,a),L=null==L?yt(x,k,i.internalFormat,i.format,r,a):bt(L,x,k,i.internalFormat,i.format,r,a),A=mt(x,k,o.internalFormat,o.format,r,g.NEAREST),S=mt(x,k,o.internalFormat,o.format,r,g.NEAREST),C=yt(x,k,o.internalFormat,o.format,r,g.NEAREST),function(){var e=Et(u.BLOOM_RESOLUTION),n=m.halfFloatTexType,r=m.formatRGBA,t=m.supportLinearFiltering?g.LINEAR:g.NEAREST;O=mt(e.width,e.height,r.internalFormat,r.format,n,t);for(var i=c.length=0;i<u.BLOOM_ITERATIONS;i++){var o=e.width>>i+1,a=e.height>>i+1;if(o<2||a<2)break;var v=mt(o,a,r.internalFormat,r.format,n,t);c.push(v)}}()}function mt(e,n,r,t,i,o){g.activeTexture(g.TEXTURE0);var a=g.createTexture();g.bindTexture(g.TEXTURE_2D,a),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,o),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,o),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE),g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE),g.texImage2D(g.TEXTURE_2D,0,r,e,n,0,t,i,null);var u=g.createFramebuffer();return g.bindFramebuffer(g.FRAMEBUFFER,u),g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,a,0),g.viewport(0,0,e,n),g.clear(g.COLOR_BUFFER_BIT),{texture:a,fbo:u,width:e,height:n,attach:function(e){return g.activeTexture(g.TEXTURE0+e),g.bindTexture(g.TEXTURE_2D,a),e}}}function yt(e,n,r,t,i,o){var a=mt(e,n,r,t,i,o),u=mt(e,n,r,t,i,o);return{get read(){return a},set read(e){a=e},get write(){return u},set write(e){u=e},swap:function(){var e=a;a=u,u=e}}}function bt(e,n,r,t,i,o,a){var u,v;return e.read=(u=e.read,v=mt(n,r,t,i,o,a),Z.bind(),g.uniform1i(Z.uniforms.uTexture,u.attach(0)),g.uniform1f(Z.uniforms.value,1),Q(v.fbo),v),e.write=mt(n,r,t,i,o,a),e}gt(),kt(12);var _t=Date.now();function xt(e,n,r,t,i){g.viewport(0,0,x,k),lt.bind(),g.uniform1i(lt.uniforms.uTarget,L.read.attach(0)),g.uniform1f(lt.uniforms.aspectRatio,l.width/l.height),g.uniform2f(lt.uniforms.point,e/l.width,1-n/l.height),g.uniform3f(lt.uniforms.color,r,-t,1),g.uniform1f(lt.uniforms.radius,u.SPLAT_RADIUS/100),Q(L.write.fbo),L.swap(),g.viewport(0,0,w,E),g.uniform1i(lt.uniforms.uTarget,T.read.attach(0)),g.uniform3f(lt.uniforms.color,i.r,i.g,i.b),Q(T.write.fbo),T.swap()}function kt(e){for(var n=0;n<e;n++){var r=wt();r.r*=10,r.g*=10,r.b*=10,xt((.25+.5*Math.random())*l.width,(.25+.5*Math.random())*l.height,1e3*(Math.random()-.5),1e3*(Math.random()-.5),r)}}function wt(){return{r:0,g:.1,b:.2}}function Et(e){var n=g.drawingBufferWidth/g.drawingBufferHeight;n<1&&(n=1/n);var r=Math.round(e*n),t=Math.round(e);return g.drawingBufferWidth>g.drawingBufferHeight?{width:r,height:t}:{width:t,height:r}}function Tt(e,n,r){return{x:n/e.width,y:r/e.height}}!function e(){l.width==l.clientWidth&&l.height==l.clientHeight||(l.width=l.clientWidth,l.height=l.clientHeight,gt()),function(){0<d.length&&kt(d.pop());for(var e=0;e<p.length;e++){var n=p[e];n.moved&&(xt(n.x,n.y,n.dx,n.dy,n.color),n.moved=!1)}if(u.COLORFUL&&_t+100<Date.now()){_t=Date.now();for(var r=0;r<p.length;r++){p[r].color=wt()}}}(),u.PAUSED||function(){g.disable(g.BLEND),g.viewport(0,0,x,k),dt.bind(),g.uniform2f(dt.uniforms.texelSize,1/x,1/k),g.uniform1i(dt.uniforms.uVelocity,L.read.attach(0)),Q(S.fbo),ct.bind(),g.uniform2f(ct.uniforms.texelSize,1/x,1/k),g.uniform1i(ct.uniforms.uVelocity,L.read.attach(0)),g.uniform1i(ct.uniforms.uCurl,S.attach(1)),g.uniform1f(ct.uniforms.curl,u.CURL),g.uniform1f(ct.uniforms.dt,.016),Q(L.write.fbo),L.swap(),ut.bind(),g.uniform2f(ut.uniforms.texelSize,1/x,1/k),g.uniform1i(ut.uniforms.uVelocity,L.read.attach(0)),Q(A.fbo),Z.bind(),g.uniform1i(Z.uniforms.uTexture,C.read.attach(0)),g.uniform1f(Z.uniforms.value,u.PRESSURE_DISSIPATION),Q(C.write.fbo),C.swap(),vt.bind(),g.uniform2f(vt.uniforms.texelSize,1/x,1/k),g.uniform1i(vt.uniforms.uDivergence,A.attach(0));for(var e=0;e<u.PRESSURE_ITERATIONS;e++)g.uniform1i(vt.uniforms.uPressure,C.read.attach(1)),Q(C.write.fbo),C.swap();ft.bind(),g.uniform2f(ft.uniforms.texelSize,1/x,1/k),g.uniform1i(ft.uniforms.uPressure,C.read.attach(0)),g.uniform1i(ft.uniforms.uVelocity,L.read.attach(1)),Q(L.write.fbo),L.swap(),pt.bind(),g.uniform2f(pt.uniforms.texelSize,1/x,1/k),m.supportLinearFiltering||g.uniform2f(pt.uniforms.dyeTexelSize,1/x,1/k);var n=L.read.attach(0);g.uniform1i(pt.uniforms.uVelocity,n),g.uniform1i(pt.uniforms.uSource,n),g.uniform1f(pt.uniforms.dt,.016),g.uniform1f(pt.uniforms.dissipation,u.VELOCITY_DISSIPATION),Q(L.write.fbo),L.swap(),g.viewport(0,0,w,E),m.supportLinearFiltering||g.uniform2f(pt.uniforms.dyeTexelSize,1/w,1/E),g.uniform1i(pt.uniforms.uVelocity,L.read.attach(0)),g.uniform1i(pt.uniforms.uSource,T.read.attach(1)),g.uniform1f(pt.uniforms.dissipation,u.DENSITY_DISSIPATION),Q(T.write.fbo),T.swap()}(),function(e){u.BLOOM&&function(e,n){if(!(c.length<2)){var r=n;g.disable(g.BLEND),ot.bind();var t=u.BLOOM_THRESHOLD*u.BLOOM_SOFT_KNEE+1e-4,i=u.BLOOM_THRESHOLD-t,o=2*t,a=.25/t;g.uniform3f(ot.uniforms.curve,i,o,a),g.uniform1f(ot.uniforms.threshold,u.BLOOM_THRESHOLD),g.uniform1i(ot.uniforms.uTexture,e.attach(0)),g.viewport(0,0,r.width,r.height),Q(r.fbo),at.bind();for(var v=0;v<c.length;v++){var f=c[v];g.uniform2f(at.uniforms.texelSize,1/r.width,1/r.height),g.uniform1i(at.uniforms.uTexture,r.attach(0)),g.viewport(0,0,f.width,f.height),Q(f.fbo),r=f}g.blendFunc(g.ONE,g.ONE),g.enable(g.BLEND);for(var m=c.length-2;0<=m;m--){var l=c[m];g.uniform2f(at.uniforms.texelSize,1/r.width,1/r.height),g.uniform1i(at.uniforms.uTexture,r.attach(0)),g.viewport(0,0,l.width,l.height),Q(l.fbo),r=l}g.disable(g.BLEND),ht.bind(),g.uniform2f(ht.uniforms.texelSize,1/r.width,1/r.height),g.uniform1i(ht.uniforms.uTexture,r.attach(0)),g.uniform1f(ht.uniforms.intensity,u.BLOOM_INTENSITY),g.viewport(0,0,n.width,n.height),Q(n.fbo)}}(T.read,O),g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA),g.enable(g.BLEND);var n=g.drawingBufferWidth,r=g.drawingBufferHeight;if(g.viewport(0,0,n,r),!u.TRANSPARENT){tt.bind();var t=u.BACK_COLOR;g.uniform4f(tt.uniforms.color,t.r/255,t.g/255,t.b/255,1),Q(e)}if(u.TRANSPARENT&&(et.bind(),g.uniform1f(et.uniforms.aspectRatio,l.width/l.height),Q(null)),u.SHADING){var i=u.BLOOM?nt:rt;if(i.bind(),g.uniform2f(i.uniforms.texelSize,1/n,1/r),g.uniform1i(i.uniforms.uTexture,T.read.attach(0)),u.BLOOM){g.uniform1i(i.uniforms.uBloom,O.attach(1)),g.uniform1i(i.uniforms.uDithering,J.attach(2));var o=Tt(J,n,r);g.uniform2f(i.uniforms.ditherScale,o.x,o.y)}}else{var a=u.BLOOM?st:it;if(a.bind(),g.uniform1i(a.uniforms.uTexture,T.read.attach(0)),u.BLOOM){g.uniform1i(a.uniforms.uBloom,O.attach(1)),g.uniform1i(a.uniforms.uDithering,J.attach(2));var v=Tt(J,n,r);g.uniform2f(a.uniforms.ditherScale,v.x,v.y)}}Q(e)}(null),requestAnimationFrame(e)}(),window.addEventListener("mousemove",function(e){p[0].moved=p[0].down,p[0].dx=5*(e.pageX-p[0].x),p[0].dy=5*(e.pageY-p[0].y),p[0].x=e.pageX,p[0].y=e.pageY}),window.addEventListener("touchmove",function(e){e.preventDefault();for(var n=e.targetTouches,r=0;r<n.length;r++){var t=p[r];t.moved=t.down,t.dx=8*(n[r].pageX-t.x),t.dy=8*(n[r].pageY-t.y),t.x=n[r].pageX,t.y=n[r].pageY}},!1),window.addEventListener("touchstart",function(e){e.preventDefault();for(var n=e.targetTouches,r=0;r<n.length;r++)r>=p.length&&p.push(new s),p[r].id=n[r].identifier,p[r].down=!0,p[r].x=n[r].pageX,p[r].y=n[r].pageY,p[r].color=wt()}),window.addEventListener("click",function(e){e.preventDefault(),p[0].moved=p[0].down,p[0].dx=5*(e.pageX-p[0].x),p[0].dy=5*(e.pageY-p[0].y),p[0].x=e.pageX,p[0].y=e.pageY}),window.addEventListener("touchend",function(e){for(var n=e.changedTouches,r=0;r<n.length;r++)for(var t=0;t<p.length;t++)n[r].identifier==p[t].id&&(p[t].down=!1)}),window.addEventListener("load",function(){p[0].down=!0,p[0].color=wt()});