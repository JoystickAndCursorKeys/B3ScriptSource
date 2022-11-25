class KERNALMODULE {

	//TODO, keep colors somewhere, so multi colored text can be done
	//with update, and scroll

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.hidden = false;
		this.blinking = true;
		this.reverse = false;

		this.colors ={};

		this.palette = [
			"#000000",
			"#ffffff",
			"#ee2222",
			"#22ee22",
			"#2222ee",
			"#eeee22",
			"#22eeee",
			"#ee22ee",
			"#aaaaaa",
			"#777777",
			"#444444",
			"#FFAC1C",
			"#5C3317",
			"#F88379",
			"#79F883",
			"#8379F8"

		];

		this.bmPalette = [];
		for( var i=0; i<this.palette.length; i++) {
			var htmlCol = this.palette[i];
			var r = parseInt(htmlCol.substr(1,2),16)
			var g = parseInt(htmlCol.substr(3,2),16)
			var b = parseInt(htmlCol.substr(5,2),16)
			this.bmPalette.push(
				{
					r:r,g:g,b:b
				}
			)
		}

		this.defaultTextMode();


	}


	destroy() {
		this.outDiv0.remove();
		this.cvs = null;
		this.cvs2 = null;
		this.cvs3 = null;
		this.ctx = null;
		this.ctx2 = null;
		this.ctx3 = null;
		this.cache = null;

		this.cells = [];

		if( this.blinkInterval ) {
			clearInterval ( this.blinkInterval );
			this.blinkInterval = undefined;
		}
	}

	defaultTextMode() {
		this.cols = 80;
		this.rows = 30;
		this.x = 0;
		this.y = 0;

		this.fontSize = "18";

		this.fontSizeCSS = this.fontSize + "px";
		this.fontSizeInt = parseInt( this.fontSize );
		this.fontFamily = "monospace";

		var oc = this.colors;
		oc.bg = 0;
		oc.fg = 5;

		this.colors.bgHTML = this.palette[ oc.bg ];
		this.colors.fgHTML = this.palette[ oc.fg ];

	}

	init() {
	}

	initMode( config ) {

			var sys = this.sys;
			var msgs = sys.init.queuedMessages;

			this.cursorOn = false;
			this.blinking = true;
			this.reverse = false;
			this.cursorMode = 1;

			var tmp = config[0].split("x");
			var w = parseInt( tmp[0] );
			var h = parseInt( tmp[1] );

			this.cols = Math.floor( w / this.fontSizeInt );
			this.rows = Math.floor( h / this.fontSizeInt );

			/* adjust w,h to fit exactly so many cols and rows */
			w = this.cols * this.fontSizeInt;
			h = this.rows * this.fontSizeInt;

			this.width = w;
			this.height = h;

			console.log("Reinit with " , w, h);
			console.log("Reinit with " , this.cols, this.rows);
			this.x = 0;
			this.y = 0;
			this.blinking = true;

			var oc = this.colors;
			oc.bg = 0;
			oc.fg = 5;
			oc.bgHTML = this.palette[ oc.bg ];
			oc.fgHTML = this.palette[ oc.fg ];

			sys.init.inputElement = document.body;

			this.outDiv0 = document.createElement("div");
			this.outDiv1 = document.createElement("div");
			this.center = document.createElement("center");

			this.cvs = document.createElement("canvas");
			this.ctx = this.cvs.getContext('2d', {alpha: false});
			this.ctx.strokeStyle = '#ffffff';
			this.cX = 0;
			this.cY = 0;
			//this.cvs = this.outEl;

			this.cvs2 = document.createElement("canvas");
			this.ctx2 = this.cvs2.getContext('2d');

			this.cvs3 = document.createElement("canvas");
			this.ctx3 = this.cvs3.getContext('2d');

			this.cache = [];
			this.updCtxImageData = { synched: false }

			this.cvs.width = w;
			this.cvs.height = h;
			this.cvs2.width = w;
			this.cvs2.height = h;

			var fs = this.fontSizeInt;
			this.cvs3.width = fs;
			this.cvs3.height = fs;

			this.offsets = [];

			var ctx = this.ctx;
  		ctx.font =  this.fontSizeCSS + " " + this.fontFamily;
 		  ctx.textBaseline = "bottom";

			var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890@+_!#%&/()=?*-:;,.'\"";
			var fsid2 = this.fontSizeInt / 2;
			for (const c of str) {
				var tmp3 =  this.ctx.measureText( c )  ;
				var tmp2 =  tmp3.width  ;
				var tmp1 =  (tmp2 / 2) ;
				var tmp0 =  fsid2 - tmp1 ;
				var tmp = Math.floor( tmp0 );
				this.offsets[ c ] = tmp;
 		 }

			this.cells = [];

			var cols = this.colors;

			for( var y=0; y<this.rows; y++) {
				var rowArray = [];
				for( var x=0; x<this.cols; x++) {
					rowArray.push( { txt: " ", fg: cols.fg, bg: cols.bg } );
				}
				this.cells.push( rowArray );
			}

			document.body.appendChild( this.outDiv0 );

			this.outDiv0.style.display = "table";
			this.outDiv0.style.width = "99%";
			this.outDiv0.style.height = "99%";
			this.outDiv0.style.position = "absolute";
			this.outDiv0.style.zIndex = "10000";

			this.outDiv1.style.display = "table-cell";
			this.outDiv1.style.verticalAlign = "middle";

			this.cvs.style.marginLeft = "auto";
			this.cvs.style.marginRight = "auto";

			this.outDiv0.appendChild( this.outDiv1 );
			this.outDiv1.appendChild( this.center );
			this.center.appendChild( this.cvs );


			this.cvs.focus( );


 		  var _this = this;

			this.blinkInterval = setInterval(function()  {

				 	_this._int_blink();
				}, 300);

				for( var i=0; i<msgs.length; i++) {
					this.writeln( msgs[ i ]);
				}

			 this.clear();


			 this.sys.log("CANVASCON Ready.");
	}

	hide() {
		this.init();
		if( !this.hidden ) {
			this.outDiv0.hidden = true;
			this.hidden = true;
		}
	}

	show() {
		this.init();
		if( this.hidden ) {
			this.outDiv0.hidden = false;
			this.hidden = false;
		}
	}


	getElement() {
		return null;
	}


	blinkMode( mode ) {
		this.blinking = mode;
	}


	_int_blinkOff() {


		if( !this.cursorOn ) {
			return;
		}

		var fs = this.fontSizeInt;

		var x0 = (fs * this.x);
		var y0 = fs * (this.y );

		var ctx = this.ctx;

		this.ctx.drawImage(this.cvs3, x0, y0);

		this.cursorOn = false;

	}

	_int_storeset_color( fg, bg ) {

		this.oldfg = fg;
		this.oldbg = bg;

		var oc = this.colors;
		oc.fg = fg;
		oc.bg = bg;
		oc.fgHTML = this.palette[ oc.fg ];
		oc.bgHTML = this.palette[ oc.bg ];

	}


	_int_restore_color() {

		var oc = this.colors;
		oc.fg = this.oldfg;
		oc.bg = this.oldbg;
		oc.fgHTML = this.palette[ oc.fg ];
		oc.bgHTML = this.palette[ oc.bg ];

	}

	_int_blink() {

		if( ! this.blinking ) {
			return;
		}

		var currentCursorIsOn = this.cursorOn;

		this.cursorOn = !this.cursorOn;

		var fs = this.fontSizeInt;

		var x0 = (fs * this.x);
		var y0 = fs * (this.y );
		var oc = this.colors;

		var ctx = this.ctx;
		var cell = this.cells[ this.y][this.x ];

		if(  this.cursorOn ) {

				//ctx.filter = 'contrast(1.4) sepia(1) drop-shadow(-9px 9px 3px #e81)';

				/* first we backup underneath cursor */
				this.ctx3.drawImage(this.cvs, x0, y0, fs, fs, 0, 0, fs, fs);

				/* we decide the colors */
				var col = this.colors.fgHTML;
				var index = this.colors.fg;
				var index2 = this.colors.bg;

				/*if cell.bg == cell.fg, use instead black on white or white on black */
				if( cell.fg == cell.bg ) {
					if( cell.fg == 0 ) {
						index = 1;
						index2 = 0;
					}
					else {
						index = 0;
						index2 = 1;
					}
				}
				else {
					/*if bg!=fg use cell colors*/
					index = cell.fg;
					index2 = cell.bg;
				}

				this.paintCursor( x0, y0, cell.txt, index, index2, this.cursorMode );

				return;

		}
		else {

			//cursor off
			this.ctx.drawImage(this.cvs3, x0, y0);

		}

	}

	_int_updateArea( srccells, x0, y0, x1, y1 ) {

		var ctx = this.ctx;
		var fs = this.fontSizeInt;
		var oc = this.colors;

		try {
		for( var x=x0; x<=x1; x++) {
			for( var y=y0; y<=y1; y++) {
				var cell = this.cells[ y ][ x ];
				var src = srccells[ y-y0 ][ x-x0 ];
				var ch = src.txt;

				oc.bg = src.bg;
				oc.fg = src.fg;

				oc.bgHTML = this.palette[ src.bg ];
				oc.fgHTML = this.palette[ src.fg ];

				cell.txt = ch;
				cell.fg = src.fg;
				cell.bg = src.bg;


				this.paintchar( fs * x , fs * y , ch );
			}
		}
	} catch ( e ) {
		console.log(e);
	}

	}

	paintCursor( x, y, ch , col1, col2, mode ) {
		this._int_storeset_color( col2, col1 );
		this.paintchar( x, y, ch );
		this._int_restore_color();
	}

	paintchar( x, y, ch ) {
			this.updCtxImageData.synched = false;

			var oc = this.colors;
			var index = ch + ":"+oc.bg+":"+oc.fg;
			this.reverse
			var cacheel = this.cache[ index ];
			var fs = this.fontSizeInt;

			if( ! cacheel ) {

				var cvs = document.createElement("canvas");
				var ctx = cvs.getContext('2d', {alpha: false});
				cvs.width = fs;
				cvs.height = fs;

				ctx.font =  this.fontSizeCSS + " " + this.fontFamily;
				ctx.textBaseline = "top";

				var off = 0;
				if( this.offsets[ ch ] ) {
					off = this.offsets[ ch ];
				}

				ctx.fillStyle = this.colors.bgHTML
				ctx.fillRect(  0,0, fs, fs);

				ctx.fillStyle = this.colors.fgHTML;
				ctx.fillText( ch , off, 0);

				//TODO what about all reverse's

				this.cache[ index ] = { ctx: ctx, cvs: cvs } ;
				cacheel = this.cache[ index ];

			}

			if( ch != " " )  {
				var tmp = 1;
			}

			//if( cacheel.cvs != null ) {
					this.ctx.drawImage( cacheel.cvs, x, y);
			//}

		}

		op_gcolor( params ) {
				var htmlCol = this.palette[ params.c ];
				var ctx = this.ctx;
				ctx.strokeStyle = htmlCol;

		}


		op_line( params ) {

			this.updCtxImageData.synched = false;

			var ctx = this.ctx;

			var x0 =params.x0;
			var y0 =params.y0;
			if( x0 < 0) {
				x0=this.cX;
			}
			if( y0 < 0) {
				y0=this.cY;
			}

			ctx.beginPath(); // Start a new path
			ctx.moveTo( x0,  y0); // Move the pen to (30, 50)
			ctx.lineTo(params.x1, params.y1); // Draw a line to (150, 100)
			ctx.stroke(); // Render the path

			this.cX = params.x1;
			this.cY = params.y1;

		}

		native( operation ) {



			this[ "op_" + operation.action]( operation.params);
		}

		gfxUpdate__old( record ) {//see 152

			var lineLen = 100 * 4;
			var cellLen = 4;

			var pixels = record.pixels;
			var ctx = this.ctx;

			var arrs = [];
			var list = [];
			var arrNo = -1;

			var areasW = Math.ceil ( this.width / 100 );
			var areasH = Math.ceil ( this.height /100 );

			//console.log("Pixels to update " + pixels.length)
			for( var i=0; i< pixels.length; i++) {
				var p = pixels[ i ];

				var areaNoX = Math.floor( p.x / 100 );
				var areaNoY = Math.floor( p.y / 100 );
				var areaKey = areaNoX + "_" + areaNoY;

				var pdata;
				var imd;

				if( !arrs[ areaKey ] ) {
					//

					var x0 = areaNoX * 100;
					var y0 = areaNoY * 100;
					var x1 = x0 + 100 - 1;
					var y1 = y0 + 100 - 1;
					if( x1 > (this.width-1) ) {
						x1 = this.width-1;
					}
					if( y1 > (this.height-1) ) {
						y1 = this.height-1;
					}

					var w = 1+(x1-x0);
					var h = 1+(y1-y0);

					imd = ctx.getImageData( x0, y0, w, h );
					pdata = imd.data;

					var cache = { x: x0, y: y0, w: w, h: h, imd: imd, pdata: pdata };
					arrs[ areaKey ] = cache;
					list.push( cache );


				}
				else {
					var cache = arrs[ areaKey ];
					pdata = cache.pdata;
					imd = cache.imd;

				}

				var xrel = p.x - (areaNoX * 100);
				var yrel = p.y - (areaNoY * 100);

				var offset = ( yrel * lineLen ) + xrel * cellLen;

				var c = this.bmPalette[ p.c ];
				pdata[offset+0] = c.r;
				pdata[offset+1] = c.g;
				pdata[offset+2] = c.b;

			}


			for( var i = 0; i<list.length; i++) {

				var cache = list[ i ];
				imd = cache.imd;
				var x = cache.x;
				var y = cache.y;
				ctx.putImageData(imd, x, y);
			}

		}


		gfxUpdate( record ) {//see 152

			var lineLen = this.width * 4;
			var cellLen = 4;

			var pixels = record.pixels;
			var ctx = this.ctx;

			var upd = this.updCtxImageData;

			if(! upd.synched ) {
				upd.imd = ctx.getImageData( 0, 0, this.width, this.height );
				upd.data = upd.imd.data;
				upd.synched = true;
			}

			var pdata = upd.data;
			var imd = upd.imd;

			for( var i=0; i< pixels.length; i++) {
				var p = pixels[ i ];

				var xrel = p.x;
				var yrel = p.y;

				var offset = ( yrel * lineLen ) + xrel * cellLen;

				var c = this.bmPalette[ p.c ];
				pdata[offset+0] = c.r;
				pdata[offset+1] = c.g;
				pdata[offset+2] = c.b;

			}
			ctx.putImageData(imd, 0, 0);

		}


		update( p, list ) {

			this._int_blinkOff();
			this.show();

			this.x = p.cx;
			this.y = p.cy;
			if(
				this.x<0 || this.y<0 ||
				this.x>= this.cols || this.y>= this.rows
			) {
				console.log("ouch");

			}

			this.colors.bgHTML = this.palette[ p.bg ];
			this.colors.fgHTML = this.palette[ 	p.fg ];

			for( var i=0; i< list.length; i++) {

				var el = list[ i ];
				this._int_updateArea( el.cells, el.x1, el.y1, el.x2, el.y2 );

			}


		}

		updateAll( p, srccells ) {

			this._int_blinkOff();
			this.show();

			this.x = p.cx;
			this.y = p.cy;

			if(
				this.x<0 || this.y<0 ||
				this.x>= this.cols || this.y>= this.rows
			) {
				console.log("ouch");

			}
			this.colors.bgHTML = this.palette[ p.bg ];
			this.colors.fgHTML = this.palette[ 	p.fg];
			this.colors.bg = p.bg;
			this.colors.fg = p.fg;

			this._int_updateArea( srccells, 0,0, this.cols -1, this.rows -1 );

		}

	clear() {
		this._int_blinkOff();
		this.show();

		var b=0;
		for( var x=0; x<this.cols; x++) {
			b=1-b;
			for( var y=0; y<this.rows; y++) {
				this.cells[ y ][ x ].txt = " ";
				this.cells[ y ][ x ].fg = this.colors.fg;
				this.cells[ y ][ x ].bg = this.colors.bg;

			}
		}

		this.ctx.fillStyle = this.colors.bg;
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
		this.x = 0;
		this.y = 0;
	}


	__int_nl() {
		this.x = 0;
		this.y ++;
		if( this.y >= this.rows ) {
			this.__int_scrollDown();
			this.y = this.rows -1;
		}
	}

	writeln( str ) {
			this._int_blinkOff();
			this.show();
			//console.log( "writeln" + str );

			for (const c of str) {
			  this.__int_write_direct_ch( c );
			}
			this.__int_nl();
	}


	__int_write_direct_ch( ch ) {

		var cell = this.cells[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		cell = ch.txt;

		var ctx = this.ctx;
		var fs = this.fontSizeInt;

		var off = 0;
		if( this.offsets[ ch.txt ] ) {
			off = this.offsets[ ch.txt ];
		}

		this.ctx.fillStyle = this.colors.bgHTML;
		ctx.fillRect(  (fs * this.x) , fs * (this.y ), fs, fs);

		ctx.fillStyle = this.colors.fgHTML;
		ctx.fillText( ch.txt , off + (fs * this.x) , fs * (this.y +1));

		this.x++;
		if( this.x >= this.cols ) {
			this.x = 0;
			this.__int_nl();
		}
	}

	getDimensions() {
			return [this.cols, this.rows ];
	}

	hasPixels() {
		return true;
	}

	getBitmapDimensions() {
		return [ this.width, this.height ];
	}

	/*plot( x, y, col ) {
		var ctx = this.ctx;

		const pixel = ctx.getImageData( x, y, 1, 1);
		const pdata = pixel.data;

		var c = this.bmPalette[ col ];
		pdata[0] = c.r;
		pdata[1] = c.g;
		pdata[2] = c.b;

		ctx.putImageData(pixel, x, y);

	}*/

	getColumCount() {
		return this.cols;
	}

	getRowCount() {
		return this.rows;
	}


	__int_scrollDown() {
		for( var x=0; x<this.cols; x++) {
			for( var y=0; y<this.rows-1; y++) {
				var cell = this.cells[ y ][ x ];
				var cellyp1 = this.cells[ y+1 ][ x ];

				cell = cellyp1;

			}
		}

		//fill last row
		var y2 = this.rows-1;
		for( var x=0; x<this.cols; x++) {
			var cell = this.cells[ y2 ][ x ];
			cell.txt = " ";
		}

		var fs = this.fontSizeInt;
		this.ctx2.drawImage(this.cvs, 0, 0);
		var w = this.cvs2.width;
		var h = this.cvs2.height-fs;

		this.ctx.fillStyle = this.colors.bg;
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

		this.ctx.drawImage(this.cvs2, 0, fs, w, h-fs, 0, 0, w, h-fs );
		//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

	}

}

export { KERNALMODULE as default};
