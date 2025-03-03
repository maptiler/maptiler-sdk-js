precision mediump float;

varying vec3 vTextureCoord;

uniform samplerCube u_cubeSampler;

void main(void) {
  vec4 texColor = textureCube(u_cubeSampler, vTextureCoord);

  gl_FragColor = texColor;
}
