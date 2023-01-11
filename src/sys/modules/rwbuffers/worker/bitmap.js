class BitMap {

	constructor( sys ) {
		this.sys = sys;
    this.lineColor = 1;
    this.changes = {};
    this.changes.flag = false;
    this.changes.pixels = [];

		this.origin( 0,0,1,1);
  }


	origin( ox0, oy0, odx, ody ) {
		this.ox0 = ox0;
		this.oy0 = oy0;
		this.odx = odx;
		this.ody = ody;

		var dir = ["m",undefined,"p"];
		var xdir = "x" + dir[ odx + 1 ];
		var ydir = "y" + dir[ ody + 1 ];
		var direction = xdir + ydir;

		this["_int_convertxy"] = this.getConvertFunc( direction );

	}

	reInit( w, h ) {
		this.width = w;
    this.height = h;
	}

  attach( w, h ) {
		this.reInit( w, h );
	}

  isActive() {
    return this.width > 0;
  }

  getDimensions() {
			return [this.width, this.height ];
	}

  triggerFlush() {

    this._int_flush();

  }

  _int_flush() {

    if( this.changes.flag ) {

      this.sys.post( "gfxupdate",
        {
          pixels: this.changes.pixels
        }
      );
    }

    pixels: this.changes.pixels = [];
    this.changes.flag = false;

  }

	setLineColor( c ) {
    this.lineColor = c;
    this.sys.post( "nativeout",{
      action: "gcolor",
      params: { c: c }
    });
  }

	getConvertFunc( direction ) {
		var __this = this;
		if( direction == "xpyp") {
			return function( x,y ) {
				return [ Math.floor(x + __this.ox0), Math.floor(y + __this.oy0)];
			}
		}
		else if( direction == "xpym") {
			return function( x,y ) {
				return [ Math.floor(x + this.ox0), Math.floor( this.oy0 - y ) ];
			}
		}
		else if( direction == "xmyp") {
			return function( x,y ) {
				return [ Math.floor( __this.ox0 - x ), Math.floor(y + __this.oy0)];
			}
		}
		else if( direction == "xmym") {
			return function( x,y ) {
				return [ Math.floor( __this.ox0 - x ), Math.floor( this.oy0 - y ) ];
			}
		}
	}

	_int_convertxy_xpyp( x,y ) {
		return [ Math.floor(x + this.ox0), Math.floor(y + this.oy0)];
	}

	_int_convertxy_xpym( x,y ) {
		return [ Math.floor(x + this.ox0), Math.floor( this.oy0 - y )];
	}

	_int_convertxy_xmyp( x,y ) {
		return [ Math.floor( this.ox0 - x), Math.floor( y + this.oy0)];
	}

	_int_convertxy_xmym( x,y ) {
		return [ Math.floor( this.ox0 - x), Math.floor( this.oy0 - y )];
	}


  plot( x, y ) {
		var xy2 = this._int_convertxy( x, y );

    var pixel = { x: xy2[0], y: xy2[1], c:this.lineColor };

    this.changes.pixels.push( pixel );
    this.changes.flag = true;

  }

	line( x0,y0, x1, y1 ) {

		var xy0 = this._int_convertxy( x0, y0 );
		var xy1 = this._int_convertxy( x1, y1 );

    this.sys.post( "nativeout",{
      action: "line",
      params: { x0:xy0[0], y0:xy0[1], x1:xy1[0], y1:xy1[1] }
    });
  }

	destroy() {

	}
}
