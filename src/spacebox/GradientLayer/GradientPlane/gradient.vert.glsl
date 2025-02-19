attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);

  // [-1, 1] to [0, 1]
  v_uv = (a_position + vec2(1.0)) / 2.0;
}
