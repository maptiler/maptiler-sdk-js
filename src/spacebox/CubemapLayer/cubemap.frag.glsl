precision mediump float;

varying vec3 vTextureCoord;

uniform samplerCube u_cubeSampler;
uniform vec4 u_bgColor;

void main(void) {
  vec4 texColor = textureCube(u_cubeSampler, vTextureCoord);
  gl_FragColor = u_bgColor;
  gl_FragColor = vec4(0.0);
  gl_FragColor = texColor;
  // gl_FragColor.a = 0.5;
}
