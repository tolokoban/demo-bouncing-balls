varying vec2 var_XY;

void main(void) {
  float x = position.x;
  float y = position.y;

  if (x > 0.0) {
    if (y > 0.0) {
      var_XY = vec2( 1.0, 1.0 );
    } else {
      var_XY = vec2( 1.0, -1.0 );
    }
  } else {
    if (y > 0.0) {
      var_XY = vec2( -1.0, 1.0 );
    } else {
      var_XY = vec2( -1.0, -1.0 );
    }
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
