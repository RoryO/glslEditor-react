import React from 'react';
import ReactDOM from 'react-dom';
import Texture from './Texture';
import './GlslCanvas.css';

function isDiff(a, b) {
    if (a && b) {
        return a.toString() !== b.toString();
    }
    return false;
}

// By Brett Camber on
// https://github.com/tangrams/tangram/blob/master/src/gl/glsl.js
function parseUniforms(uniforms, prefix = null) {
    let parsed = [];

    for (let name in uniforms) {
        let uniform = uniforms[name];
        let u;

        if (prefix) {
            name = prefix + '.' + name;
        }

        // Single float
        if (typeof uniform === 'number') {
            parsed.push({
                type: 'float',
                method: '1f',
                name,
                value: uniform
            });
        }
        // Array: vector, array of floats, array of textures, or array of structs
        else if (Array.isArray(uniform)) {
            // Numeric values
            if (typeof uniform[0] === 'number') {
                // float vectors (vec2, vec3, vec4)
                if (uniform.length === 1) {
                    parsed.push({
                        type: 'float',
                        method: '1f',
                        name,
                        value: uniform
                    });
                }
                // float vectors (vec2, vec3, vec4)
                else if (uniform.length >= 2 && uniform.length <= 4) {
                    parsed.push({
                        type: 'vec' + uniform.length,
                        method: uniform.length + 'fv',
                        name,
                        value: uniform
                    });
                }
                // float array
                else if (uniform.length > 4) {
                    parsed.push({
                        type: 'float[]',
                        method: '1fv',
                        name: name + '[0]',
                        value: uniform
                    });
                }
                // TODO: assume matrix for (typeof == Float32Array && length == 16)?
            }
            // Array of textures
            else if (typeof uniform[0] === 'string') {
                parsed.push({
                    type: 'sampler2D',
                    method: '1i',
                    name: name,
                    value: uniform
                });
            }
            // Array of arrays - but only arrays of vectors are allowed in this case
            else if (Array.isArray(uniform[0]) && typeof uniform[0][0] === 'number') {
                // float vectors (vec2, vec3, vec4)
                if (uniform[0].length >= 2 && uniform[0].length <= 4) {
                    // Set each vector in the array
                    for (u = 0; u < uniform.length; u++) {
                        parsed.push({
                            type: 'vec' + uniform[0].length,
                            method: uniform[u].length + 'fv',
                            name: name + '[' + u + ']',
                            value: uniform[u]
                        });
                    }
                }
                // else error?
            }
            // Array of structures
            else if (typeof uniform[0] === 'object') {
                for (u = 0; u < uniform.length; u++) {
                    // Set each struct in the array
                    parsed.push(...parseUniforms(uniform[u], name + '[' + u + ']'));
                }
            }
        }
        // Boolean
        else if (typeof uniform === 'boolean') {
            parsed.push({
                type: 'bool',
                method: '1i',
                name,
                value: uniform
            });
        }
        // Texture
        else if (typeof uniform === 'string') {
            parsed.push({
                type: 'sampler2D',
                method: '1i',
                name,
                value: uniform
            });
        }
        // Structure
        else if (typeof uniform === 'object') {
            // Set each field in the struct
            parsed.push(...parseUniforms(uniform, name));
        }
        // TODO: support other non-float types? (int, etc.)
    }
    return parsed;
}

const DEFAULT_VERTEX_STRING = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
}
`;

const DEFAULT_FRAGMENT_STRING = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texcoord


void main(){
    gl_FragColor = vec4(0.0);
}
`;

export default class GlslCanvas extends React.Component {
    static version = 1.0;

    static defaultProps = {
        vertexString: DEFAULT_VERTEX_STRING,
        fragmentString: DEFAULT_FRAGMENT_STRING,
        width: 500,
        height: 500,
        webGlContextAttributes: {}
    }

    static NoWebGLError = class extends Error {
        constructor(...args) {
            super(...args);
            this.name = 'NoWebGLError';
            Error.captureStackTrace(this, GlslCanvas.NoWebGLError);
        }
    }

    static ShaderCompileError = class extends Error {
        constructor(...args) {
            super(...args);
            this.name = 'ShaderCompileError';
            Error.captureStackTrace(this, GlslCanvas.ShaderCompileError);
        }
    }

    static ShaderLinkError = class extends Error {
        constructor(...args) {
            super(...args);
            this.name = 'ShaderLinkError';
            Error.captureStackTrace(this, GlslCanvas.ShaderLinkError);
        }
    }

    componentDidMount() {
        this.canvas = ReactDOM.findDOMNode(this);
        this.create3DContext(this.props.webglContextCreationAttirbutes);
        this.load();
        this.setVertexBuffer();
        this.animationCallbackId = requestAnimationFrame(this.renderCanvas.bind(this));
    }

    componentWillUnmount() {
        this.destroy();
        cancelAnimationFrame(this.animationCallbackId);
    }

    componentDidUpdate(_prevProps, _prevState) {
        try {
            this.createShaders();
            this.forceRender = true;
        }
        catch(e) {
            if (e.name !== 'ShaderCompileError') {
                throw(e);
            }
            if (this.props.handleShaderError) {
                this.props.handleShaderError(e);
            }
        }
    }

    constructor(props) {
        super(props);
        if (window && !window.WebGLRenderingContext) {
            throw new GlslCanvas.NoWebGLError();
        }

        this.isValid = false
        this.program = null;
        this.textures = {};
        this.uniforms = {};
        this.vbo = {};

        this.timeLoad = this.timePrev = performance.now();
        this.timeDelta = 0.;
        this.forceRender = true;
        this.paused = false;


        // ========================== EVENTS
        /* let mouse = {
         *     x: 0,
         *     y: 0
         * };
         */
        //let sandbox = this;
        /* function RenderLoop() {
         *     if (!sandbox.gl) {
         *         return
         *     }
         *     if (sandbox.nMouse > 1) {
         *         sandbox.setMouse(mouse);
         *     }
         *     sandbox.renderCanvas();
         *     sandbox.forceRender = sandbox.resize();
         * }
         */
        // Start
        // this.setMouse({ x: 0, y: 0 });
    }

    destroy() {
        this.animated = false;
        this.isValid = false;
        for (let tex in this.textures) {
            if (tex.destroy){
                tex.destroy()
            }
        }
        this.textures = {};
        for (let att in this.attribs) {
            this.gl.deleteBuffer(this.attribs[att]);
        }
        this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
        this.program = null;
        this.gl = null;
    }

    load() {
        this.animated = true;
        this.nDelta = (this.props.fragmentString.match(/u_delta/g) || []).length;
        this.nTime = (this.props.fragmentString.match(/u_time/g) || []).length;
        this.nDate = (this.props.fragmentString.match(/u_date/g) || []).length;
        this.nMouse = (this.props.fragmentString.match(/u_mouse/g) || []).length;
        this.animated = this.nDate > 1 || this.nTime > 1 || this.nMouse > 1;

        let nTextures = this.props.fragmentString.search(/sampler2D/g);
        if (nTextures) {
            let lines = this.props.fragmentString.split('\n');
            for (let line of lines) {
                let match = line.match(/uniform\s*sampler2D\s*([\w]*);\s*\/\/\s*([\w|\:\/\/|\.|\-|\_]*)/i);
                if (match) {
                    let ext = match[2].split('.').pop().toLowerCase();
                    if (match[1] &&  match[2] &&
                        (ext === 'jpg' || ext === 'jpeg' || ext === 'png' ||
                         ext === 'ogv' || ext === 'webm' || ext === 'mp4')) {
                        this.setUniform(match[1], match[2]);
                    }
                }
                let main = line.match(/\s*void\s*main\s*/g);
                if (main) {
                    break;
                }
            }
        }

        this.createShaders();
        this.isValid = true;
        this.forceRender = true;
    }

    loadTexture(name, urlElementOrData, options) {
        if (!options) {
            options = {};
        }

        if (typeof urlElementOrData === 'string') {
            options.url = urlElementOrData;
        }
        else if (typeof urlElementOrData === 'object' && urlElementOrData.data && urlElementOrData.width && urlElementOrData.height) {
            options.data = urlElementOrData.data;
            options.width = urlElementOrData.width;
            options.height = urlElementOrData.height;
        }
        else if (typeof urlElementOrData === 'object') {
            options.element = urlElementOrData;
        }

        if (this.textures[name]) {
            if (this.textures[name]) {
                this.textures[name].load(options);
                this.textures[name].on('loaded', (args) => {
                    this.forceRender = true;
                });
            }
        }
        else {
            this.textures[name] = new Texture(this.gl, name, options);
            this.textures[name].on('loaded', (args) => {
                this.forceRender = true;
            });
        }

    }

    setUniform(name, ...value) {
        let u = {};
        u[name] = value;
        this.setUniforms(u);
    }

    setUniforms(uniforms) {
        let parsed = parseUniforms(uniforms);
        // Set each uniform
        for (let u in parsed) {
            if (parsed[u].type === 'sampler2D') {
                // For textures, we need to track texture units, so we have a special setter
                // this.uniformTexture(parsed[u].name, parsed[u].value[0]);
                this.loadTexture(parsed[u].name, parsed[u].value[0]);
            }
            else {
                this.uniform(parsed[u].method, parsed[u].type, parsed[u].name, parsed[u].value);
                this.forceRender = true;
            }
        }
    }

    setMouse(mouse) {
        // set the mouse uniform
        let rect = this.canvas.getBoundingClientRect();
        if (mouse &&
            mouse.x && mouse.x >= rect.left && mouse.x <= rect.right &&
            mouse.y && mouse.y >= rect.top && mouse.y <= rect.bottom) {
            this.uniform('2f', 'vec2', 'u_mouse', mouse.x - rect.left, this.canvas.height - (mouse.y - rect.top));
        }
    }

	// ex: program.uniform('3f', 'position', x, y, z);
    uniform(method, type, name, ...value) { // 'value' is a method-appropriate arguments list
        this.uniforms[name] = this.uniforms[name] || {};
        let uniform = this.uniforms[name];
        let change = isDiff(uniform.value, value);
        if (change || this.change || uniform.location === undefined || uniform.value === undefined) {
            uniform.name = name;
            uniform.value = value;
            uniform.type = type;
            uniform.method = 'uniform' + method;
            uniform.location = this.gl.getUniformLocation(this.program, name);

            this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.value));
        }
    }

    uniformTexture(name, texture, options) {
        if (this.textures[name] === undefined) {
            this.loadTexture(name, texture, options);
        }
        else {
            this.uniform('1i', 'sampler2D', name, this.texureIndex);
            this.textures[name].bind(this.texureIndex);
            this.uniform('2f', 'vec2', name + 'Resolution', this.textures[name].width, this.textures[name].height);
            this.texureIndex++;
        }
    }

    resize() {
        if (this.width !== this.canvas.clientWidth ||
            this.height !== this.canvas.clientHeight) {
            let realToCSSPixels = window.devicePixelRatio || 1;

            // Lookup the size the browser is displaying the canvas in CSS pixels
            // and compute a size needed to make our drawingbuffer match it in
            // device pixels.
            let displayWidth = Math.floor(this.gl.canvas.clientWidth * realToCSSPixels);
            let displayHeight = Math.floor(this.gl.canvas.clientHeight * realToCSSPixels);

            // Check if the canvas is not the same size.
            if (this.gl.canvas.width !== displayWidth ||
                this.gl.canvas.height !== displayHeight) {
                // Make the canvas the same size
                this.gl.canvas.width = displayWidth;
                this.gl.canvas.height = displayHeight;
                // Set the viewport to match
                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            }
            this.width = this.canvas.clientWidth;
            this.height = this.canvas.clientHeight;
            return true;
        }
        else {
            return false;
        }
    }

    get shouldRenderFrame() {
        return this.forceRender || (this.animated &&
                                    this.isCanvasVisible &&
                                    !this.paused)
    }

    renderCanvas () {
        if (this.shouldRenderFrame) {
            let date = new Date();
            let now = performance.now();
            this.timeDelta =  (now - this.timePrev) / 1000.0;
            this.timePrev = now;
            if (this.nDelta > 1) {
                // set the delta time uniform
                this.uniform('1f', 'float', 'u_delta', this.timeDelta);
            }

            if (this.nTime > 1 ) {
                // set the elapsed time uniform
                this.uniform('1f', 'float', 'u_time', (now - this.timeLoad) / 1000.0);
            }

            if (this.nDate) {
                // Set date uniform: year/month/day/time_in_sec
                this.uniform('4f', 'float', 'u_date', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds() + date.getMilliseconds() * 0.001 );
            }

            // set the resolution uniform
            this.uniform('2f', 'vec2', 'u_resolution', this.canvas.width, this.canvas.height);

            for (const texture in this.textures) {
                this.uniformTexture(texture);
            }

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

            this.change = false;
            this.forceRender = false;
        }
        this.animationCallbackId = requestAnimationFrame(this.renderCanvas.bind(this));
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    create3DContext(optAttribs) {
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            throw new Error('GL context not initialized');
        }
        this.gl.getExtension('OES_standard_derivatives');
    }

    setVertexBuffer() {
        let texCoordsLoc = this.gl.getAttribLocation(this.program, 'a_texcoord');
        this.vbo.texCoords = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo.texCoords);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(texCoordsLoc);
        this.gl.vertexAttribPointer(texCoordsLoc, 2, this.gl.FLOAT, false, 0, 0);

        let verticesLoc = this.gl.getAttribLocation(this.program, 'a_position');
        this.vbo.vertices = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo.vertices);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(verticesLoc);
        this.gl.vertexAttribPointer(verticesLoc, 2, this.gl.FLOAT, false, 0, 0);
    }

    get isCanvasVisible() {
        return	((this.canvas.getBoundingClientRect().top + this.canvas.height) > 0) &&
            (this.canvas.getBoundingClientRect().top < (window.innerHeight || document.documentElement.clientHeight));
    }

/*
    *	Create a Vertex of a specific type (gl.VERTEX_SHADER/)
    */
    createShaders() {
        const program = this.gl.createProgram();
        const compiledShaders = [];

        for (let shaderType of [this.gl.VERTEX_SHADER, this.gl.FRAGMENT_SHADER]) {
            let source = shaderType === this.gl.VERTEX_SHADER ? this.props.vertexString : this.props.fragmentString;
            const shader = this.gl.createShader(shaderType);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);

            const compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

            if (!compiled) {
                const errorMessage = this.gl.getShaderInfoLog(shader);
                this.gl.deleteShader(shader);
                throw new GlslCanvas.ShaderCompileError(errorMessage);
            }
            this.gl.attachShader(program, shader);
            compiledShaders.push(shader);
        }

        this.gl.linkProgram(program);
        let linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!linked) {
            const lastError = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new GlslCanvas.ShaderLinkError(lastError);
        }
        this.gl.useProgram(program);
        this.program = program;
        for (let s of compiledShaders) {
            this.gl.deleteShader(s);
        }
    }

    render() {
        return(
        <canvas
            className="glslCanvas"
            width={this.props.width}
            height={this.props.height}
        />
        )
    }
}
