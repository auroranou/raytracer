attribute vec4 aPosition;

void main() {
  gl_Position = vec4(aPosition.xy, 0.0, 1.0);
}