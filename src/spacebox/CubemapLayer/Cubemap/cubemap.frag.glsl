precision mediump float;

varying vec3 vTextureCoord;
uniform samplerCube uCubeSampler;
uniform vec3 uAlphaColor;
uniform float uAlphaThreshold;  
uniform float uAlpha;

void main(void) {
  vec4 texColor = textureCube(uCubeSampler, vTextureCoord);

  // default approach (no alpha)
  // gl_FragColor = texColor;

  // global alpha and discard based on color distance
  // if (distance(texColor.rgb, uAlphaColor) < uAlphaThreshold) {
  //   discard;
  // }
  // gl_FragColor = vec4(texColor.rgb, texColor.a * uAlpha);

  // smoothstep approach
  float d = distance(texColor.rgb, uAlphaColor);
  float alphaFactor = smoothstep(0.0, uAlphaThreshold, d);
  gl_FragColor = vec4(texColor.rgb, texColor.a * uAlpha * alphaFactor);
}
