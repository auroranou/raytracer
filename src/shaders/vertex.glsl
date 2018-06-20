attribute vec4 aPosition;
uniform vec2 uResolution;
varying vec2 vPosition;

void main() {
  gl_Position = vec4(aPosition.xy, 1.0, 1.0);
}