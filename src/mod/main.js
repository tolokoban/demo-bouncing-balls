var Balls = require("balls");
var Events = require("events");
//var Impacts = require("impacts");

var BALLS = 100;

// Div where to put the frames per second.
var fps = document.getElementById('fps');

var cameraMotion = {
    alpha: Math.PI * Math.random(),
    beta: Math.random() * Math.PI / 2,
    speed: {
        alpha: Math.random() * 0.001,
        beta: Math.random() * 0.001
    },
    radius: 40,
    radiusTarget: 12,
    target: Balls.center
};

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor( 0x000000, 0.0);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

createFloorGrid();

// Adding balls.
Balls.create( BALLS ).forEach(function ( mesh ) {
    scene.add( mesh );
});

//Impacts.setScene( scene );


function createFloorGrid() {
    var x, z;
    var b = Balls.bounds;

    for ( x=b.x ; x<=b.X ; x++ ) {
        scene.add(
            createLine({
                vertices: [[x, b.y, b.z], [x, b.y, b.Z]]
            })
        );
    }
    for ( z=b.z ; z<=b.Z ; z++ ) {
        scene.add(
            createLine({
                vertices: [[b.x, b.y, z], [b.X, b.y, z]]
            })
        );
    }
}


window.addEventListener( 'resize', onWindowResize, false );

var events = Events( renderer.domElement );

events.onStart = function() {
    cameraMotion.speed.alpha = cameraMotion.speed.beta = 0;
};

events.onDrag = function( evt ) {
    var x = evt.sx / window.innerWidth;
    var y = evt.sy / window.innerHeight;
    var speed = 0.001;

    cameraMotion.speed.alpha = constraint( x * speed, -.01, .01 );
    cameraMotion.speed.beta = constraint( y * speed * .2, -.01, .01 );
};

events.onDblSwipe = function( evt ) {
    var y = evt.y / window.innerHeight;
    cameraMotion.radiusTarget = cameraMotion.radius = constraint( 31 * y, 1, 31 );
};

events.onWheel = function( delta ) {
    if (delta > 0) delta = 1;
    else delta = -1;
    cameraMotion.radiusTarget -= delta;
    cameraMotion.radiusTarget = Math.max( 1, cameraMotion.radiusTarget );
    cameraMotion.radiusTarget = Math.min( 30, cameraMotion.radiusTarget );
};

function onWindowResize() {
    var W = window.innerWidth;
    var H = window.innerHeight;

    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize( W, H );
}




var lastTime = 0;
var fpsTime = 0;
var nbFrames = 0;

function anim( time ) {
    window.requestAnimationFrame( anim );
    if (!lastTime) {
        lastTime = time;
        fpsTime = time;
        nbFrames = 0;
        return;
    }
    nbFrames++;
    if (nbFrames == 10) {
        fps.textContent = (10000 / (time - fpsTime)).toFixed(0) + " fps";
        fpsTime = time;
        nbFrames = 0;
    }
    var delta = time - lastTime;
    var impacts = Balls.move( time, delta, cameraMotion );
    //Impacts.add( impacts );
    //Impacts.move( time, delta );
    moveCamera( time, delta );
    lastTime = time;
    // Ask WebGL to refresh the screen.
    renderer.render( scene, camera );
}

window.requestAnimationFrame( anim );


function moveCamera( time, delta ) {
    var cam = cameraMotion;

    cam.alpha = cam.alpha + delta* cam.speed.alpha;
    cam.beta = cam.beta + delta * cam.speed.beta;
    if (cam.beta < 0) {
        cam.beta = 0;
        cam.speed.beta = Math.abs( cam.speed.beta );
    }
    if (cam.beta > Math.PI / 2) {
        cam.beta = Math.PI / 2;
        cam.speed.beta = -Math.abs( cam.speed.beta );
    }

    if (cam.radius < cam.radiusTarget) {
        cam.radius = Math.min( cam.radiusTarget, cam.radius + delta * 0.01 );
    }
    else if (cam.radius > cam.radiusTarget) {
        cam.radius = Math.max( cam.radiusTarget, cam.radius - delta * 0.01 );
    }
    
    var R = cam.radius;
    var r = R * Math.cos( cam.beta );
    var x = r * Math.cos( cam.alpha );
    var y = R * Math.sin( cam.beta );
    var z = r * Math.sin( cam.alpha );

    camera.position.x = x + cam.target.x;
    camera.position.y = y + cam.target.y;
    camera.position.z = z + cam.target.z;
    camera.lookAt( cam.target );
}


function constraint( v, min, max ) {
    return Math.max( min, Math.min( max, v ) );
}

function createLine(opt) {
    if (typeof opt === 'undefined') opt = { vertices: [] };
    if (typeof opt.color === 'undefined') opt.color = 0x000000;
    if (typeof opt.linewidth === 'undefined') opt.linewidth = 1;


    var mat = new THREE.LineBasicMaterial({
        color: opt.color,
        linewidth: opt.linewidth
    });

    var geo = new THREE.Geometry();
    opt.vertices.forEach(function (vertex) {
        geo.vertices.push(
            new THREE.Vector3( vertex[0], vertex[1], vertex[2] )
        );
    });

    return new THREE.Line( geo, mat );
};


