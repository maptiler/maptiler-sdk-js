precision mediump float;

varying vec3 vTextureCoord;

%USE_TEXTURE_MACRO_MARKER%

# ifdef USE_TEXTURE
uniform samplerCube u_cubeSampler;
uniform float u_fadeOpacity;
# endif

uniform vec4 u_bgColor;

void main(void) {
  #ifdef USE_TEXTURE
  vec4 texColor = textureCube(u_cubeSampler, vTextureCoord);


  if (texColor.a < 1.0) {
    gl_FragColor = mix(
      u_bgColor,
      texColor,
      min(texColor.a, u_fadeOpacity)
    );
  } else {
    gl_FragColor = mix(u_bgColor, texColor, u_fadeOpacity);
  }

  #else
  gl_FragColor = u_bgColor;
  #endif
}
