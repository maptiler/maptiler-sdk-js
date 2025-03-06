attribute vec3 a_vertexPosition;
varying vec3 vTextureCoord;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
  
void main(void) {
  vTextureCoord = vec3(-a_vertexPosition.x, a_vertexPosition.y, a_vertexPosition.z);
  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_vertexPosition, 1.0);
}
