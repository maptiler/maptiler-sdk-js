attribute vec2 a_position;

uniform mat4 u_matrix;

varying vec2 v_position;

void main() {
  v_position = a_position;
  gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
}
