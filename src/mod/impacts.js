var scene;
var impacts = initImpacts( 8 );


function initImpacts( count ) {
    var arr = [];
    for ( var i=0 ; i<count ; i++ ) {
        arr.push( null );
    }
    return arr;
}

function createMesh( info ) {
    return new THREE.Mesh( createGeo( info ), createMat( info ) );
};

var FACES = {
    y: [
        [ .5,  0, .5],
        [ .5,  0,-.5],
        [-.5,  0,-.5],
        [-.5,  0, .5]
    ]
};

function createGeo( info ) {
    var geo = new THREE.Geometry();
    var f = FACES[info.t];
    geo.vertices.push(
        new THREE.Vector3( info.x + f[0][0], info.y + f[0][1], info.z + f[0][2] ),
        new THREE.Vector3( info.x + f[1][0], info.y + f[1][1], info.z + f[1][2] ),
        new THREE.Vector3( info.x + f[2][0], info.y + f[2][1], info.z + f[2][2] ),
        new THREE.Vector3( info.x + f[3][0], info.y + f[3][1], info.z + f[3][2] )
    );
console.info("[impacts] geo.vertices=...", geo.vertices);    
    geo.faces.push(
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 0, 2, 3 )
    );
    geo.computeFaceNormals ();
    geo.computeVertexNormals ();
    return geo;
}

function createMat( info ) {
    var mat = new THREE.ShaderMaterial({
        uniforms: {
            uni_Color: { type: "v3", value: info.color },
            uni_Life: { type: "f", value: 1 }
        },
        vertexShader: document.getElementById( 'vertex-impact' ).textContent,
        fragmentShader: document.getElementById( 'fragment-impact' ).textContent,
        transparent: true
    });

    mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    return mat;
};

exports.move = function( time, delta ) {
    impacts.forEach(function (imp, idx) {
        if (!imp) return;
        imp.life -= delta * .001;
        if (imp.life < 0) {
            scene.remove( imp.mesh );
            impacts[idx] = null;
        }
    });
};

exports.add = function( newImpacts ) {
    newImpacts.forEach(function (info) {
        for ( var i=0 ; i<impacts.length ; i++ ) {
            if (!impacts[i]) {
                var mesh = createMesh( info ) ;                
                impacts[i] = { life: 1, mesh: mesh };
                scene.add( mesh );
                return;
            }
        }
    });
};

exports.setScene = function( s ) {
    scene = s;
};
