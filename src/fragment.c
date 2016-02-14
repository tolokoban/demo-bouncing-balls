varying vec2 var_XY;
varying vec3 var_Position;

uniform vec3 uni_Color;
//uniform 

const float cst_LightValueFront = 0.7;
const float cst_LightValueBack = 0.7;
const vec3 cst_LightColorFront = vec3( 1.0, 1.0, 1.0 );
const vec3 cst_LightColorBack = vec3( 0.0, 0.0, 0.0 );

void main(void) {
  float x = var_XY.x;
  float y = var_XY.y;
  float r = x*x + y*y;

  // On a inversé la condition pour faire tout de
  // suite un sort aux pixels invisibles.
  if (r >= 1.0) {
    gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.0 );
    return;
  }
  
  vec3 color1 = vec3(uni_Color);
  vec3 color2 = vec3( 1.0 - color1.x, 1.0 - color1.y, 1.0 - color1.z );
  vec3 color = color1;

  if (r > 0.8) {
    // Le liseré noir autour de la sphère est créé ainsi.
    // En diminuant 0.99, on épaissit le trait.
    gl_FragColor = vec4( uni_Color * 0.3, 1.0 );
  } 
  else {
    float z = sqrt( 1.0 - r );
    vec4 worldVector = viewMatrix * vec4( x, y, z, 1.0 );
    int idx = 0;
    if (worldVector.x > 0.0) idx = 1 - idx;
    if (worldVector.y > 0.0) idx = 1 - idx;
    if (worldVector.z > 0.0) idx = 1 - idx;
    if (idx == 0) color = color2;

    vec3 colorFront = cst_LightColorFront * cst_LightValueFront
      + color * (1.0 - cst_LightValueFront);
    vec3 colorBack = cst_LightColorBack * cst_LightValueBack
      + color * (1.0 - cst_LightValueBack);

    vec3 dir = normalize( vec3( 7, 2, 5) - cameraPosition );
    float a = dot( dir, vec3( x, y, z ) );

    if (a > 0.0) {
      color = a * colorFront + (1.0 - a) * uni_Color;
    } else {
      a = -a;
      color = a * colorBack + (1.0 - a) * uni_Color;
    }

    color *= 1.0 - r * 0.6;
    gl_FragColor = vec4( color, 1.0 );
  }
}
