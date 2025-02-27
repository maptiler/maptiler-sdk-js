attribute vec3 a_position;

uniform mat4 u_matrix;
uniform mat4 u_rotationMatrix;

varying vec2 v_pos;

void main() {
  v_pos = a_position.xy;
  gl_Position = u_matrix * u_rotationMatrix * vec4(a_position, 1.0);
}
