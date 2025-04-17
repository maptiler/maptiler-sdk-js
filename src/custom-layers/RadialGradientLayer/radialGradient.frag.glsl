precision mediump float;
varying vec2 v_pos;
      
uniform int u_stopsNumber;
uniform float u_stops[100];
uniform vec4 u_colors[100];
uniform float u_maxDistance;

varying float v_scale;

vec2 center = vec2(0.0, 0.0);
// TODO: We could look at implementing a color ramp instead.
// Render the color ramp to a canvas and then to a texture
// then select the color based on the distance from the center.
void main() {

  // QUASI SUCCESS
  // float distanceFromGlobeEdge = (distance(center, v_pos) - 2.0) / (sqrt(v_scale) * 1.05) + 1.0;
  // ORIGINAL
  // float distanceFromGlobeEdge = distance(center, v_pos) - 1.0; 
  float rawDistance = distance(center, v_pos);
  float distanceFromGlobeEdge = rawDistance - 1.0;

    vec4 color = u_colors[0];

  // if we're further than the max distance, we should not render anything.
  // This is to always render a circle, otherwise we end up rendering
  // to the corners of the plane.
  if (distance(center, v_pos) > u_maxDistance * v_scale) {
    discard;
  }

  for (int i = 1; i < 100; i++) {
    // if we're past the last stop
    // we should fill to the end with the last stop color
    if (i >= u_stopsNumber) {
      color = u_colors[i - 1];
      break;
    }

    float scaledStopPosition = u_stops[i] * pow(v_scale, 1.6);
    float lastScaledStopPosition = u_stops[i - 1] * pow(v_scale, 1.6);

    if (distanceFromGlobeEdge <= scaledStopPosition) {
      float stopBlendFactor = (distanceFromGlobeEdge - lastScaledStopPosition) / (scaledStopPosition - lastScaledStopPosition);
      color = mix(u_colors[i - 1], u_colors[i], stopBlendFactor);
      break;
    }
  }
  
  // gl_FragColor = color;
  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
