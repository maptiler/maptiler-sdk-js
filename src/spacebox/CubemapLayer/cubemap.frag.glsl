precision mediump float;

varying vec3 vTextureCoord;

uniform samplerCube u_cubeSampler;
uniform bool u_useChromaKey;
uniform vec3 u_chromaKeyColor;
uniform float u_chromaKeyThreshold;

void main(void) {
  vec4 texColor = textureCube(u_cubeSampler, vTextureCoord);

  if (u_useChromaKey) {
    float d = distance(texColor.rgb, u_chromaKeyColor);
    float alphaFactor = smoothstep(0.0, u_chromaKeyThreshold, d);
    gl_FragColor = vec4(texColor.rgb, texColor.a * alphaFactor);
  } else {
    gl_FragColor = texColor;
  }
}
