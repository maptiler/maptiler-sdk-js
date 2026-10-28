precision highp float;

// premultiplied
uniform vec4 u_color;
// minX, minY, maxX, maxY of the image, in the same coordinates as a_position
uniform vec4 u_imageRect;

varying vec2 v_position;

void main() {
  // the outside of the cutline can reach beyond the image, it is only drawn on the image
  if (v_position.x < u_imageRect.x || v_position.y < u_imageRect.y || v_position.x > u_imageRect.z || v_position.y > u_imageRect.w) {
    discard;
  }

  gl_FragColor = u_color;
}
