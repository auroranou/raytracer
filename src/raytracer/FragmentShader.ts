import { varyings } from './VertexShader';

export const fsSource = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1);
  }
`;

export default fsSource;