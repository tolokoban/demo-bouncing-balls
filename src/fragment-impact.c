varying vec2 var_XY;

uniform vec3 uni_Color;
uniform float uni_Life;


void main(void) {
  float x = var_XY.x;
  float y = var_XY.y;
  float r = x*x + y*y;

  if (r >= 1.0) {
    gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.0 );
    return;
  }

  vec3 color = vec3( uni_Color );
  
  int idx = 0;
  if (x > 0.0) idx = 1 - idx;
  if (y > 0.0) idx = 1 - idx;
  if (idx == 0) color = vec3( 1.0 - color.x, 1.0 - color.y, 1.0 - color.z );

  if (r > 0.9 || abs(x) < 0.02 || abs(y) < 0.02) {
    // Le liseré noir autour de la sphère est créé ainsi.
    // En diminuant 0.9, on épaissit le trait.
    gl_FragColor = vec4( color * 0.3, uni_Life );
  }
  else {
    gl_FragColor = vec4( color, uni_Life );
  }
}
