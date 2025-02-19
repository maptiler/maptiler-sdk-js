precision mediump float;

varying vec2 v_uv;

uniform int u_gradientType; // 0: linear, 1: radial
uniform vec2 u_center;
uniform float u_radius;
uniform float u_aspect;

uniform int u_stopsNumber;
uniform float u_stops[10];
uniform vec4 u_colors[10];

void main() {
  float currentGradientPosition;

  if(u_gradientType == 0) {
    // Linear gradient
    currentGradientPosition = v_uv.y;
  } else {
    // Radial gradient
    vec2 center = u_center;
    vec2 uv = v_uv - center;
    uv.x *= u_aspect;
  
    float r_max = (u_aspect > 1.0) ? 0.5 * u_aspect : 0.5;
    currentGradientPosition = clamp(length(uv) / (u_radius * r_max), 0.0, 1.0);
  }

  vec4 color = u_colors[0];
  
  for (int i = 1; i < 100; i++) { // uniform value can't be used here
    if(i >= u_stopsNumber) {
      break;
    }
    
    if(currentGradientPosition <= u_stops[i]) {
      float stopBlendFactor = (currentGradientPosition - u_stops[i-1]) / (u_stops[i] - u_stops[i-1]);
      color = mix(u_colors[i-1], u_colors[i], stopBlendFactor);
      break;
    }
  }
  
  gl_FragColor = color;
}
