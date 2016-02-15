/****************************************
 This modules deals with balls creation and animation.

 Exports:
 * `center`:
 * `create( nbBalls )`:
 * `move( time, delta )`:
 ****************************************/

// Bounds of the box in which the balls bounce.
var bounds = {
    x: -7, X: 7,
    y: 0, Y: 7,
    z: -7, Z: 7
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
            vx: (Math.random() - .5) * 10,
            vy: (Math.random() - .5),
            vz: (Math.random() - .5) * 10,
            x: rnd( bounds.x, bounds.X ),
            y: rnd( bounds.y, bounds.Y ),
            z: rnd( bounds.z, bounds.Z ),
            flash: 1,
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
            uni_Speed: { type: "f", value: (Math.random() - .5) * 0.01 },
            uni_Flash: { type: "f", value: 0 }
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
    var impacts = [];
    
    delta = Math.min( 160, delta );
    var bx = bounds.x + .5;
    var bX = bounds.X - .5;
    var by = bounds.y + .5;
    var bY = bounds.Y - .5;
    var bz = bounds.z + .5;
    var bZ = bounds.Z - .5;
    var speed = 0.0002;

    var ratio = window.innerWidth / window.innerHeight;

    bounceBalls();

    balls.forEach(function (ball) {
        // Gravity.
        ball.vy -= delta * speed;

        // Move the ball.
        var mesh = ball.mesh;
        var pos = mesh.position;
        mesh.material.uniforms.uni_Ratio.value = window.innerWidth / window.innerHeight;
        mesh.material.uniforms.uni_Alpha.value = cameraMotion.alpha;
        mesh.material.uniforms.uni_Beta.value = cameraMotion.beta;
        mesh.material.uniforms.uni_Time.value = time;
        mesh.material.uniforms.uni_Flash.value = ball.flash;

        ball.flash = Math.max( 0, ball.flash - delta * 0.003);
        
        pos.x = ball.x + ball.vx * delta * speed;
        pos.y = ball.y + ball.vy * delta * speed;
        pos.z = ball.z + ball.vz * delta * speed;

        // Detect bounces.
        if (pos.x < bx) {
            ball.vx = -ball.vx;
            pos.x = bx;
        }
        if (pos.x > bX) {
            ball.vx = -ball.vx;
            pos.x = bX;
        }
        if (pos.y < by) {
            ball.vy = -ball.vy;
            if (ball.vy < 0.001) {
                // Bounces are amortized and they can stop entirely.
                ball.vy = Math.random() * 5;
            }
            /*
            impacts.push({
                color: mesh.material.uniforms.uni_Color.value,
                x: pos.x, y: by - .5, z: pos.z, t: 'y'
            });
             */
            pos.y = by;
        }
        if (pos.y > bY) {
            ball.vy = -ball.vy;
            pos.y = bY;
        }
        if (pos.z < bz) {
            ball.vz = -ball.vz;
            pos.z = bz;
        }
        if (pos.z > bZ) {
            ball.vz = -ball.vz;
            pos.z = bZ;
        }

        // Save current position and delta.
        ball.x = pos.x;
        ball.y = pos.y;
        ball.z = pos.z;
        ball.delta = delta;
    }, this);

    return impacts;
}


// Make balls bounce on each other.
function bounceBalls() {
    var a, b;
    var ballA, ballB;
    // Coords of the normal vector.
    // This is a vector between the centre of both colliding balls.
    var nx, ny, nz;
    // r2 = nx^2 + ny^2 + nz^2
    var r2;
    // r = sqrt( r2 );
    var r;
    // Projection of  the ball's direction  on the normal vector  of the
    // contact between two balls.
    var proj;
    // Mesh position;
    var pA, pB;
    // Center between both balls.
    var cx, cy, cz;
    
    for ( a=0 ; a<balls.length - 1; a++ ) {
        ballA = balls[a];
        pA = ballA.mesh.position;
        for ( b=a+1 ; b<balls.length ; b++ ) {
            ballB = balls[b];
            pB = ballB.mesh.position;
            // Already colliding?
            if (ballB.flash > 0 && ballA.flash > 0) break;
            nx = pB.x - pA.x;
            ny = pB.y - pA.y;
            nz = pB.z - pA.z;
            r2 = nx*nx + ny*ny + nz*nz;
            if (r2 >= 1) break;
            // Prevent extremly rare division by zero.
            if (r2 == 0) break;
            // ballA and ballB are colliding.
            cx = (pB.x + pA.x) * 0.5;
            cy = (pB.y + pA.y) * 0.5;
            cz = (pB.z + pA.z) * 0.5;
            r = Math.sqrt( r2 );
            // Normalizing the normal vector A->B.
            nx /= r;
            ny /= r;
            nz /= r;
            // Min distance between ballA and ballB must be 1.
            pA.x = cx - nx * 0.5;
            pA.y = cy - ny * 0.5;
            pA.z = cz - nz * 0.5;
            pB.x = cx + nx * 0.5;
            pB.y = cy + ny * 0.5;
            pB.z = cz + nz * 0.5;
            // Compute bounce.
            proj = Math.abs( ballA.vx * nx + ballA.vy * ny + ballA.vz * nz );
            ballA.vx -= 2 * proj * nx;
            ballA.vy -= 2 * proj * ny;
            ballA.vz -= 2 * proj * nz;
            proj = Math.abs( ballB.vx * nx + ballB.vy * ny + ballB.vz * nz );
            ballB.vx += 2 * proj * nx;
            ballB.vy += 2 * proj * ny;
            ballB.vz += 2 * proj * nz;
            // Two colliding balls emit a flash.
            ballA.flash = 1;
            ballB.flash = 1;
            // Limit balls' speed.
            if (ballA.vx > 5) ballA.vx = 5;
            if (ballA.vx < -5) ballA.vx = -5;
            if (ballA.vy > 5) ballA.vy = 5;
            if (ballA.vy < -5) ballA.vy = -5;
            if (ballA.vz > 5) ballA.vz = 5;
            if (ballA.vz < -5) ballA.vz = -5;
            if (ballB.vx > 5) ballB.vx = 5;
            if (ballB.vx < -5) ballB.vx = -5;
            if (ballB.vy > 5) ballB.vy = 5;
            if (ballB.vy < -5) ballB.vy = -5;
            if (ballB.vz > 5) ballB.vz = 5;
            if (ballB.vz < -5) ballB.vz = -5;
        }
    }
}

function randomColor() {
    var dice = Math.floor( Math.random() * 6 );
    var R = Math.random() * 0.4;
    var G = Math.random() * 0.4;
    var B = Math.random() * 0.4;
    var x = Math.random();
    if ( dice == 0 ) return new THREE.Color( 1.0 - R, 0.0 + G, x );
    if ( dice == 1 ) return new THREE.Color( 0.0 + R, 1.0 - G, x );
    if ( dice == 2 ) return new THREE.Color( 1.0 - R, x, 0.0 + B );
    if ( dice == 3 ) return new THREE.Color( 0.0 + R, x, 1.0 - B );
    if ( dice == 4 ) return new THREE.Color( x, 0.0 + G, 1.0 - B );
    if ( dice == 5 ) return new THREE.Color( x, 1.0 - G, 0.0 + B );
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
