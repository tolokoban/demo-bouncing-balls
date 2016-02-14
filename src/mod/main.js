var Balls = require("balls");

var cameraMotion = {
    alpha: 0,
    beta: Math.PI / 8,
    radius: 6,
    target: Balls.center
};

console.info("[main] window.innerWidth=", window.innerWidth);
console.info("[main] window.innerHeight=", window.innerHeight);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor( 0x000000, 0.0);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

createFloorGrid();

// Adding balls.
Balls.create(400).forEach(function ( mesh ) {
    scene.add( mesh );
});


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
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'touchmove', onDocumentMouseMove, false );

function onWindowResize() {
    var W = window.innerWidth;
    var H = window.innerHeight;

    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize( W, H );
}

function onDocumentMouseMove( evt ) {
    if (Array.isArray(evt.touches)) {
        evt = evt.touches[0];
    }
    var x = 2 * (evt.clientX / window.innerWidth) - 1;
    var y = 2 * (evt.clientY / window.innerHeight) - 1;
    cameraMotion.alpha = x * Math.PI;
    cameraMotion.beta = (1 + y) * Math.PI / 5;
}



var lastTime = 0;

function anim( time ) {
    window.requestAnimationFrame( anim );
    if (!lastTime) {
        lastTime = time;
        return;
    }
    Balls.move( time, time - lastTime );
    moveCamera();
    lastTime = time;
    // Ask WebGL to refresh the screen.
    renderer.render( scene, camera );
}

window.requestAnimationFrame( anim );


function moveCamera() {
    var cam = cameraMotion;

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
