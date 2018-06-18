import { attribs, uniforms, vsSource, varMap } from './VertexShader';
import { fsSource } from './FragmentShader';

export class Raytracer {
  private attribs: AttribsMap;
  public canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null;
  private uniforms: UniformsMap;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
      throw new Error('WebGL is not available');
    }

    this.canvas = canvas;
    this.gl = gl;

    // Set clear color to black, fully opaque
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.program = this.createProgram(vsSource, fsSource);
    if (!this.program) {
      throw new Error('WebGL program was not created');
    }

    this.attribs = Object.keys(attribs).reduce((memo: AttribsMap, curr: string) => {
      const val = attribs[curr];
      memo[val] = this.gl.getAttribLocation(this.program, val);
      return memo;
    }, {});

    this.uniforms = Object.keys(uniforms).reduce((memo: UniformsMap, curr: string) => {
      const val = uniforms[curr];
      const loc = this.gl.getUniformLocation(this.program, val);
      if (loc) memo[val] = loc;
      return memo;
    }, {});

    const buffers = this.createBuffers();
    this.resizeCanvas();
    this.render(buffers);
  }

  private createProgram(vsSource: string, fsSource: string): WebGLProgram | null {
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
      console.log(shaderProgram);
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

  private createBuffers(): BufferObject {
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
    const realToCSSPixels = window.devicePixelRatio;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    const displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
    const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width !== displayWidth ||
      gl.canvas.height !== displayHeight) {

      // Make the canvas the same size
      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  private render(buffers: BufferObject) {
    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    if (!this.program) return;
    this.gl.useProgram(this.program);

    // Bind the position buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);

    const positionAttribLoc = this.attribs[attribs.pos];
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;             // 2 components per iteration
    var type = this.gl.FLOAT; // the data is 32bit floats
    var normalize = false;    // don't normalize the data
    var stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;           // start at the beginning of the buffer
    this.gl.vertexAttribPointer(positionAttribLoc, size, type, normalize, stride, offset);
    this.gl.enableVertexAttribArray(positionAttribLoc);

    var primitiveType = this.gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    this.gl.drawArrays(primitiveType, offset, count);

    console.log('rendered!');
  }
}

export type BufferObject = {
  [key: string]: WebGLBuffer;
};

export type AttribsMap = {
  [key: string]: number;
};

export type UniformsMap = {
  [key: string]: WebGLUniformLocation;
};