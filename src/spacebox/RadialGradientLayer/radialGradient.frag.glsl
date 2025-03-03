precision mediump float;
varying vec2 v_pos;
      
uniform int u_stopsNumber;
uniform float u_stops[100];
uniform vec4 u_colors[100];
uniform float u_maxDistance;

void main() {
  float currentGradientPosition = length(v_pos) / u_maxDistance;
  currentGradientPosition = clamp(currentGradientPosition, 0.0, 1.0);
  
  vec4 color = u_colors[0];

  for (int i = 1; i < 100; i++) {
    if (i >= u_stopsNumber) {
      break;
    }
            
    if (currentGradientPosition <= u_stops[i]) {
      float stopBlendFactor = (currentGradientPosition - u_stops[i - 1]) / (u_stops[i] - u_stops[i - 1]);
      color = mix(u_colors[i - 1], u_colors[i], stopBlendFactor);
      break;
    }
  }
  
  // gl_FragColor = color;
  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
