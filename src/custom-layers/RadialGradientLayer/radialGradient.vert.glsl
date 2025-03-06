attribute vec3 a_position;

uniform mat4 u_matrix;
uniform mat4 u_rotationMatrix;

uniform float u_scale;

varying vec2 v_pos;
varying float v_scale;

void main() {
  v_scale = u_scale;
  v_pos = a_position.xy * u_scale;
  gl_Position = u_matrix * u_rotationMatrix * vec4(a_position, 1.0);
}
