varying vec2 var_XY;
varying vec3 var_Position;
varying vec3 var_Light1;
varying vec3 var_Light2;
varying vec3 var_Light3;

uniform vec3 uni_Color;
uniform float uni_Ratio;
uniform float uni_Alpha;
uniform float uni_Beta;
uniform float uni_Time;
uniform float uni_Speed;

const float cst_LightValueFront = 0.9;
const float cst_LightValueBack = 1.0;
const vec3 cst_LightColorFront = vec3( 1.0, 1.0, 1.0 );
const vec3 cst_LightColorBack = vec3( 0.0, 0.0, 0.0 );
const float t1 = 0.3;
const float t2 = 0.5;
const float t3 = 0.8;


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

  float z = sqrt( 1.0 - r );
  float ang = uni_Time * uni_Speed;
  float C = cos(ang);
  float S = sin(ang);
  mat4 mat = viewMatrix;
  vec4 vx = mat[0] * C - mat[1] * S;
  vec4 vy = mat[0] * S + mat[1] * C;
  vec4 vz = mat[2];
  vec3 ray3 = vec3( x, y, z );
  vec4 ray4 = vec4( ray3, 1.0 );
  float light1 = dot( ray3, var_Light1 );
  float light2 = dot( ray3, var_Light2 );
  float light3 = dot( ray3, var_Light3 );
  float xx = dot( vx, ray4 );
  float yy = dot( vy, ray4 );
  float zz = dot( vz, ray4 );

  int idx = 0;
  if (xx > 0.0) idx = 1 - idx;
  if (yy > 0.0) idx = 1 - idx;
  if (zz > 0.0) idx = 1 - idx;
  if (idx == 0) color = color2;

  if (r > 0.9 || abs(xx) < 0.02 || abs(yy) < 0.02 || abs(zz) < 0.02) {
    // Le liseré noir autour de la sphère est créé ainsi.
    // En diminuant 0.9, on épaissit le trait.
    gl_FragColor = vec4( uni_Color * 0.3, 1.0 );
  }
  else {
    vec3 colorFront = cst_LightColorFront * cst_LightValueFront
      + color * (1.0 - cst_LightValueFront);
    vec3 colorBack = cst_LightColorBack * cst_LightValueBack
      + color * (1.0 - cst_LightValueBack);

    vec3 color1 = vec3(color);
    if (light1 > t1) {
      color1 = cst_LightColorFront;
    } else {
      color1 = color * (light1 + 1.0) / (t1 + 1.0);
    }
    vec3 color2 = vec3(color);
    if (light2 > t2) {
      color2 = cst_LightColorFront;
    } else {
      color2 = color * (light2 + 1.0) / (t2 + 1.0);
    }
    vec3 color3 = vec3(color);
    if (light3 > t3) {
      color3 = cst_LightColorFront;
    } else {
      color3 = color * (light3 + 1.0) / (t3 + 1.0);
    }

    gl_FragColor = vec4( (color1 + color2 + color3) / 3.0, 1.0 );
  }
}
