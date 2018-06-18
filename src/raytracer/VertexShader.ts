export type varMap = {
  [key: string]: string
};

export const attribs: varMap = {
  pos: 'aPosition'
};

export const uniforms: varMap = {
  mv: 'uModelView',
  proj: 'uProjection'
}

export const varyings: varMap = {
  col: 'vColor'
}

export const vsSource = `
  attribute vec4 ${attribs.pos};

  void main() {
    gl_Position = ${attribs.pos};
  }
`;

export default vsSource;