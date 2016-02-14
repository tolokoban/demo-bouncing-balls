/****************************************
This modules deals with balls creation and animation.

Exports:
* `center`:
* `create( nbBalls )`:
* `move( time, delta )`:
****************************************/

// Bounds of the box in which the balls bounce.
var bounds = {
    x: -6, X: 6,
    y: 0, Y: 2*6,
    z: -6, Z: 6
};
// Point the camera loot at.
var center = new THREE.Vector3(
    0.5 * (bounds.x + bounds.X),
    bounds.y + 1,
    0.5 * (bounds.z + bounds.Z)
);
// Array of the objects describing the balls.
// { mesh:..., vx,..., vy:..., vz:..., x:..., y:..., z:..., delta:...}
var balls = [];

function createBalls(nbBalls) {
    var meshes = [];
    var ball;
    for ( var i=0 ; i<nbBalls ; i++ ) {
        ball = {
            mesh: new THREE.Mesh( createGeo(), createMat() ),
            vx: Math.random() - .5,
            vy: Math.random() - .5,
            vz: Math.random() - .5,
            x: rnd( bounds.x, bounds.X ),
            y: rnd( bounds.y, bounds.Y ),
            z: rnd( bounds.z, bounds.Z ),
            delta: 1
        };
        ball.mesh.position.set( ball.x, ball.y, ball.z );
        balls.push( ball );
        meshes.push( ball.mesh );
    }
    return meshes;
}


/**
 * Create  a   shader  material  using  the   shaders  `vertex.c`  and
 * `fragment.c`.
 */
function createMat() {
    var col = randomColor();
    var vec = new THREE.Vector3( col.r, col.g, col.b );
    var mat = new THREE.ShaderMaterial({
        uniforms: {            
            uni_Color: { type: "v3", value: vec },
            uni_Ratio: { type: "f", value: window.innerWidth / window.innerHeight },
            uni_Alpha: { type: "f", value: 0 },
            uni_Beta: { type: "f", value: 0 },
            uni_Time: { type: "f", value: 0 },
            uni_Speed: { type: "f", value: (Math.random() - .5) * 0.01 }
        },
        vertexShader: document.getElementById( 'vertex' ).textContent,
        fragmentShader: document.getElementById( 'fragment' ).textContent,
        transparent: true
    });
    return mat;
};


/**
 * Create the geometry of a single square centered in (0,0,0) on plane
 * Z=0 and with a side of length 1.
 */
function createGeo() {
    var geo = new THREE.Geometry();
    geo.vertices.push(
        new THREE.Vector3( -.5, -.5, 0 ),
        new THREE.Vector3(  .5, -.5, 0 ),
        new THREE.Vector3(  .5,  .5, 0 ),
        new THREE.Vector3( -.5,  .5, 0 )
    );
    geo.faces.push(
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 0, 2, 3 )
    );
    geo.computeFaceNormals ();
    geo.computeVertexNormals ();
    return geo;
}


/**
 * Bounces of the balls.
 */
function moveBalls( time, delta, cameraMotion ) {
    delta = Math.min( 160, delta );
    var bx = bounds.x + .5;
    var bX = bounds.X - .5;
    var by = bounds.y + .5;
    var bY = bounds.Y - .5;
    var bz = bounds.z + .5;
    var bZ = bounds.Z - .5;
    var speed = 0.0002;

    var ratio = window.innerWidth / window.innerHeight;

    balls.forEach(function (ball) {
        // Gravity.
        ball.vy -= delta * speed;

        // Move the ball.
        var mesh = ball.mesh;
        mesh.material.uniforms.uni_Ratio.value = window.innerWidth / window.innerHeight;
        mesh.material.uniforms.uni_Alpha.value = cameraMotion.alpha;
        mesh.material.uniforms.uni_Beta.value = cameraMotion.beta;
        mesh.material.uniforms.uni_Time.value = time;
        mesh.position.x = ball.x + ball.vx * delta * speed;
        mesh.position.y = ball.y + ball.vy * delta * speed;
        mesh.position.z = ball.z + ball.vz * delta * speed;

        // Detect bounces.
        if (mesh.position.x < bx) {
            ball.vx = -ball.vx;
            mesh.position.x = bx;
        }
        if (mesh.position.x > bX) {
            ball.vx = -ball.vx;
            mesh.position.x = bX;
        }
        if (mesh.position.y < by) {
            ball.vy = -ball.vy;
            if (ball.vy < 0.001) {
                ball.vy = Math.random() * 5;
            }
            mesh.position.y = by;
        }
        if (mesh.position.y > bY) {
            ball.vy = -ball.vy;
            mesh.position.y = bY;
        }
        if (mesh.position.z < bz) {
            ball.vz = -ball.vz;
            mesh.position.z = bz;
        }
        if (mesh.position.z > bZ) {
            ball.vz = -ball.vz;
            mesh.position.z = bZ;
        }

        // Save current position and delta.
        ball.x = mesh.position.x;
        ball.y = mesh.position.y;
        ball.z = mesh.position.z;
        ball.delta = delta;
    }, this);
}


function randomColor() {
    var dice = Math.floor( Math.random() * 6 );
    var x = Math.random();
    if ( dice == 0 ) return new THREE.Color( 1, 0, x );
    if ( dice == 1 ) return new THREE.Color( 0, 1, x );
    if ( dice == 2 ) return new THREE.Color( 1, x, 0 );
    if ( dice == 3 ) return new THREE.Color( 0, x, 1 );
    if ( dice == 4 ) return new THREE.Color( x, 0, 1 );
    if ( dice == 5 ) return new THREE.Color( x, 1, 0 );
}


function rnd( a, b ) {
    if (typeof a === 'undefined') a = 1;
    if (typeof b === 'undefined') {
        b = a;
        a = 0;
    }
    return a + Math.random() * (b - a);
}


function constraint( v, min, max ) {
    if (typeof min === 'undefined') min = 1;
    if (typeof max === 'undefined') max = -min;

    if (max < min) {
        var tmp = min;
        min = max;
        max = tmp;
    }

    return Math.max( min, Math.min( max, v ) );
}



exports.bounds = bounds;
exports.center = center;
exports.move = moveBalls;
exports.create = createBalls;
