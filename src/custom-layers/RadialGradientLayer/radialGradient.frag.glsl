precision mediump float;
varying vec2 v_pos;
      
uniform int u_stopsNumber;
uniform float u_stops[100];
uniform vec4 u_colors[100];
uniform float u_maxDistance;

varying float v_scale;

const float EPSILON = 0.000001;

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
    float lastStopValue = u_stops[i - 1];
    float thisStopValue = u_stops[i];

    // this is to avoid blending errors when the stops are the same
    // eg when you would want a sharp edge between two stops.
    // `numbersAreEqual` will be 1.0 if the numbers are equal, 0.0 if they are not.
    // We then subtract EPSILON from the last stop making the stop value _almost_ equal
    // to the next stop but not enough to cause blending issues.
    // It's more efficient to do this than an if / else statement.
    float numbersAreEqual = 1.0 - step(EPSILON, abs(lastStopValue - thisStopValue));
    lastStopValue = lastStopValue - numbersAreEqual * EPSILON;

    float lastScaledStopPosition = lastStopValue * pow(v_scale, 1.6);

    if (distanceFromGlobeEdge <= scaledStopPosition) {
      float stopBlendFactor = (distanceFromGlobeEdge - lastScaledStopPosition) / (scaledStopPosition - lastScaledStopPosition);
      color = mix(u_colors[i - 1], u_colors[i], stopBlendFactor);
      break;
    }
  }
  
  // gl_FragColor = color;
  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
