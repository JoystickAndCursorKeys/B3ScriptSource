class BitMap {

	constructor( sys ) {
		this.sys = sys;
    this.lineColor = 1;
    this.changes = {};
    this.changes.flag = false;
    this.changes.pixels = [];
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


  line( x0,y0, x1, y1 ) {
    this.sys.post( "nativeout",{
      action: "line",
      params: { x0:x0, y0:y0, x1:x1, y1:y1 }
    });
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

  plot( x, y ) {
    var pixel = { x: Math.floor(x), y:Math.floor(y), c:this.lineColor };

    this.changes.pixels.push( pixel );
    this.changes.flag = true;

  }

  setLineColor( c ) {
    this.lineColor = c;
    this.sys.post( "nativeout",{
      action: "gcolor",
      params: { c: c }
    });
  }

	destroy() {

	}
}
