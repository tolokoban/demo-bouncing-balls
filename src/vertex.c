varying vec2 var_XY;
varying vec3 var_Position;

uniform float ratio;

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

  vec4 center = vec4( 0.0, 0.0, position.z, 1.0 );
  vec4 p = projectionMatrix * modelViewMatrix * center;
  p.x += position.x;
  p.y += position.y * ratio;
  
  gl_Position = p;
  var_Position = vec3(gl_Position);
}
