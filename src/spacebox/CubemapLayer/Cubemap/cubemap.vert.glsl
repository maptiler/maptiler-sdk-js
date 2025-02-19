attribute vec3 aPosition;
varying vec3 vTextureCoord;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
  
void main(void) {
  vTextureCoord = vec3(-aPosition.x, aPosition.y, aPosition.z);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
