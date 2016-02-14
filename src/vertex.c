const vec4 cst_Light1 = vec4( 60.0, 10.0, 50.0, 1.0 );
const vec4 cst_Light2 = vec4( 20.0, 40.0, -30.0, 1.0 );
const vec4 cst_Light3 = vec4( -100.0, 33.0, 0.0, 1.0 );

varying vec2 var_XY;
varying vec3 var_Position;
varying vec3 var_Light1;
varying vec3 var_Light2;
varying vec3 var_Light3;

uniform float uni_Ratio;
uniform float uni_Alpha;
uniform float uni_Beta;

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

  var_Light1 = normalize( vec3( projectionMatrix * modelViewMatrix * cst_Light1 ) );
  var_Light2 = normalize( vec3( projectionMatrix * modelViewMatrix * cst_Light2 ) );
  var_Light3 = normalize( vec3( projectionMatrix * modelViewMatrix * cst_Light3 ) );

  vec4 center = vec4( 0.0, 0.0, position.z, 1.0 );
  vec4 p = projectionMatrix * modelViewMatrix * center;
  p.x += position.x;
  p.y += position.y * uni_Ratio;
  
  gl_Position = p;
  var_Position = vec3(gl_Position);
}
