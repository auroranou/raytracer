import fsSource from '!raw-loader!../shaders/fragment.glsl';
import vsSource from '!raw-loader!../shaders/vertex.glsl';
import { Vector } from './Vector';
import { IdMap } from './helpers';
import { UniformControl, Controls } from './Controls';

export class Raytracer {
  public canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private positionAttributeLocation: number;
  private program: WebGLProgram | null;
  private resolutionUniformLocation: WebGLUniformLocation;
  private uniforms: IdMap<UniformControl>;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL is not available');
    }

    this.canvas = canvas;
    this.gl = gl;

    this.program = this.createProgram();
    if (!this.program) {
      throw new Error('WebGL program was not created');
    }

    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'aPosition');
    this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'uResolution') as WebGLUniformLocation;

    // Slider-controlled uniforms for lighting
    const controls = new Controls(this.gl);
    this.uniforms = controls.uniformControls;
    controls.render();

    this.render();
  }

  private createProgram(): WebGLProgram | null {
    const { gl } = this;
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram
    const vShader = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fShader = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();

    // Shaders are unusable until they are attached to a program
    gl.attachShader(shaderProgram, vShader);
    gl.attachShader(shaderProgram, fShader);
    gl.linkProgram(shaderProgram);

    if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      return shaderProgram;
    }

    gl.deleteProgram(shaderProgram);
    return null;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const { gl } = this;

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }

    gl.deleteShader(shader);
    return null;
  }

  private initBuffers(): IdMap<WebGLBuffer> {
    const { gl } = this;

    // Allocate a new buffer and bind it to the GL context
    const positionBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Represents vertices in a square plane
    const positions = [
      1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      -1.0, -1.0
    ];

    // WebGL needs strongly typed data, hence the Float32Array
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW);

    return { position: positionBuffer };
  }

  private resizeCanvas(): void {
    const { gl } = this;
    const realToCssPixels = window.devicePixelRatio;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in device pixels.
    const displayWidth = Math.floor(gl.canvas.clientWidth * realToCssPixels);
    const displayHeight = Math.floor(gl.canvas.clientHeight * realToCssPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
      // Make the canvas the same size
      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  private render() {
    const { gl, program } = this;
    if (!program) return;

    gl.useProgram(program);

    // Bind the position buffer.
    const buffers = this.initBuffers();

    this.resizeCanvas();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Set values that can be controlled using range inputs
    Object.keys(this.uniforms).forEach(key => {
      const uniform = this.uniforms[key];
      if (uniform && uniform.location) {
        const val = uniform.value || uniform.defaultValue;
        gl.uniform3f(uniform.location, val.x / 255, val.y / 255, val.z / 255);
      }
    });

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}