function getZoomAttributes( touches ) {
    var x1 = touches[0].clientX;
    var y1 = touches[0].clientY;
    var x2 = touches[1].clientX;
    var y2 = touches[1].clientY;

    var cx = (x1 + x2) * .5;
    var cy = (y1 + y2) * .5;
    var dx = (x1 - x2) * .5;
    var dy = (y1 - y2) * .5;
    var radius = Math.sqrt( dx*dx + dy*dy );

    return {
        cx: cx, cy: cy,
        radius: radius,
        time: Date.now()
    };
}


module.exports = function( element ) {
    var slots = {
        onStart: function( evt ) {},
        onStop: function( evt ) {},
        onZoom: function( delta ) {},
        onWheel: function( evt ) {},
        onDblSwipe: function( evt ) {
            console.log("not implemented!");
        },
        onMove: function( evt ) {},
        onDrag: function( evt ) {},
        onTap: function( evt ) {},
        // Read only
        target: element,
        // Radius for  Tap. If  the pointer  moved more than `threshold`
        // pixels, this is not consideder as a Tap.
        threshold: 8,
        // In double finger touch mode, don't send more than one onWheel
        // event per `wheelDelay` milliseconds.
        wheelDelay: 200
    };
    // 0 = no touch nor mouse down
    // 1 = Mouse is down
    // 2 = touch has started
    var state = 0;
    var x0, y0;
    var xx, yy;
    var t0 = 0;   // Last touch/press
    var t1 = 0;   // Last move
    var zoom0, zoom1;
    var wheelTime = 0;

    function handleMouseMove( event ) {
        event.preventDefault();
        event.stopPropagation();

        var x = event.clientX;
        var y = event.clientY;

        if (state == 0) {
            slots.onMove({ x: x, y: y });
        }
        else if (state == 1) {
            var t = Date.now();
            var d = 1000 / Math.max( 1, t - t1 );
            slots.onDrag({
                x0: x0, y0: y0,
                xx: xx, yy: yy,
                sx: (x - xx) * d,  // Pixels / second
                sy: (y - yy) * d,  // Pixels / second
                x: x, y: y
            });
            xx = x;
            yy = y;
            t1 = t;
        }
    }

    function handleMouseDown( event ) {
        event.preventDefault();
        event.stopPropagation();

        if (state == 2) return;

        state = 1;
        x0 = xx = event.clientX;
        y0 = yy = event.clientY;
        t0 = t1 = Date.now();
        slots.onStart({ x: x0, y: y0 });
    }

    function handleMouseUp( event ) {
        event.preventDefault();
        event.stopPropagation();

        if (state != 1) return;

        state = 0;

        var x = event.clientX;
        var y = event.clientY;
        var dx = Math.abs(x - x0);
        var dy = Math.abs(y - y0);
        x0 = x;
        y0 = y;
        if (Math.max( dx, dy) > slots.threshold) {
            return;
        }
        slots.onStop({ x: x, y: y });
    }

    function handleTouchMove( event ) {
        event.preventDefault();
        event.stopPropagation();

        var x, y, d;
        
        if (state == 2) {
            var t = Date.now();
            var touches = event.touches;
            if (touches.length == 1) {
                x = touches[0].clientX;
                y = touches[0].clientY;
                d = 1000 / Math.max( 1, t - t1 );
                slots.onDrag({
                    x0: x0, y0: y0,
                    xx: xx, yy: yy,
                    sx: (x - xx) * d,  // Pixels / second
                    sy: (y - yy) * d,  // Pixels / second
                    x: x, y: y
                });
                xx = x;
                yy = y;
                t1 = t;
            }
            else if (touches.length == 2) {
                var z = getZoomAttributes( touches );
                x = z.cx;
                y = z.cy;
                d = 1000 / Math.max( 1, t - z.time );
                console.log("Calling onDblSwipe()");
                slots.onDblSwipe({
                    x0: zoom0.cx, y0: zoom0.cy,
                    xx: zoom1.cx, yy: zoom1.cy,
                    sx: (x - zoom1.cx) * d,  // Pixels / second
                    sy: (y - zoom1.cy) * d,  // Pixels / second
                    x: x, y: y
                });
                zoom1 = z;
            }
        }
    }

    function handleTouchStart( event ) {
        event.preventDefault();
        event.stopPropagation();

        if (state == 1) return;

        var touches = event.touches;
        if (touches.length == 1) {
            state = 2;
            x0 = xx = touches[0].clientX;
            y0 = yy = touches[0].clientY;
            t0 = t1 = Date.now();
            slots.onStart({ x: x0, y: y0 });
        }
        else if (touches.length == 2) {
            zoom0 = zoom1 = getZoomAttributes( touches );
        }
    }

    function handleTouchEnd( event ) {
        event.preventDefault();
        event.stopPropagation();

        if (state != 2) return;

        var touches = event.touches;
        if (touches.length == 1) {
            state = 0;

            var x = touches[0].clientX;
            var y = touches[0].clientY;
            var dx = Math.abs(x - x0);
            var dy = Math.abs(y - y0);
            x0 = x;
            y0 = y;
            if (Math.max( dx, dy) > slots.threshold) {
                return;
            }
            slots.onStop({ x: x, y: y });
        }
    }

    function handleMouseWheel( event ) {
        event.preventDefault();
        event.stopPropagation();

        var delta = 0;
        if ( event.wheelDelta !== undefined ) {
            // WebKit / Opera / Explorer 9
            delta = event.wheelDelta;
        } else if ( event.detail !== undefined ) {
            // Firefox
            delta = - event.detail;
        }

        if ( delta != 0) {
            slots.onWheel( delta > 0 ? 1 : -1 );
        }
    }


    element.addEventListener( 'touchmove', handleTouchMove, false );
    element.addEventListener( 'touchstart', handleTouchStart, false );
    element.addEventListener( 'touchend', handleTouchEnd, false );
    element.addEventListener( 'mousewheel', handleMouseWheel, false );
    element.addEventListener( 'MozMousePixelScroll', handleMouseWheel, false ); // firefox
    element.addEventListener( 'mousemove', handleMouseMove, false );
    element.addEventListener( 'mousedown', handleMouseDown, false );
    element.addEventListener( 'mouseup', handleMouseUp, false );

    return slots;
};
