import  SymbolsTileImage   from    './symbols.js';
import  SimpleTiles   from    './simpletiles.js';

class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.hidden = false;
		this.blinking = true;
		this.cursorMode = "insert";
		this.bmFontEnable = true;
		this.colors ={};

		this.palette = [
			"#000000",
			"#ffffff",
			"#ee2222",
			"#22aa22",
			"#1111cc",
			"#eeee22",
			"#22eeee",
			"#ee22ee",
			"#bbbbbb",
			"#777777",
			"#444444",
			"#FFAC1C",
			"#5C3317",
			"#F88379",
			"#79F883",
			"#8379F8"

		];



		var pad2 = function( hs ) {
			var rv = hs;
			while ( rv.length < 2 ) {
				rv = "0" + rv;
			}
			return rv;
		}

		var pl = this.palette.length;
		for( var i=0; i < pl; i++) {
			var htmlCol = this.palette[i];
			var r = pad2( Math.floor(parseInt(htmlCol.substr(1,2),16) / 2).toString(16));
			var g = pad2( Math.floor(parseInt(htmlCol.substr(3,2),16) / 2).toString(16));
			var b = pad2( Math.floor(parseInt(htmlCol.substr(5,2),16) / 2).toString(16));
			var newcolor = "#" + r + g + b;
			this.palette.push( newcolor );

		}


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

		var __this = this;
		var image = new Image();
		image.onload = function ( evt ) {
			__this._postLoadFontImage();
		}
		image.src = new SymbolsTileImage().getBlobURL();

		this.fimage = image;

		var UNICODE=0;
		var CUSTOM=1;
		var GLYPHS0=2;
		var GLYPHS1=3;
		var GLYPHS2=4;
		var GLYPHS3=5;

		this.GLYPHSADDR = [ NaN, NaN, 0, 128, 256 , 384];

		this.characterbank0 = GLYPHS0;
		this.characterbank1 = GLYPHS1;
		this.characterbank2 = GLYPHS2;
		this.characterbank3 = UNICODE;

		this.bankDefaultBaseAddr = 256;
		this.bankBaseAddr = this.bankDefaultBaseAddr;


	}

	_postLoadFontImage() {


		this.bfont = new SimpleTiles( this.fimage, 12, 20, { r:0, g:0, b:0 } );

	}

	htmlColor( ix ) {
		return this.palette[ ix ];
	}


	destroy() {
		this.outDiv0.remove();
		this.cvs = null;
		this.cvs2 = null;
		this.cvsCursor = null;
		this.ctx = null;
		this.ctx2 = null;
		this.ctxCursor = null;
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

		this.fontSize = "20";  //16x10, 18x11, 20x12

		this.fontSizeCSS = this.fontSize + "px";
		this.fontSizeIntW = 12 ; //Math.floor(parseInt( this.fontSize ) * .7)-1;
		this.fontSizeIntH = parseInt( this.fontSize );
		this.fontFamily = "monospace";

		var oc = this.colors;
		oc.bg = 0;
		oc.fg = 5;

		this.colors.bgHTML = this.palette[ oc.bg ];
		this.colors.fgHTML = this.palette[ oc.fg ];
		this.colors.bgRGB = this.bmPalette[ oc.bg ];
		this.colors.fgRGB = this.bmPalette[ oc.fg ];

	}

	init() {
	}

	initMode( config, headerElementManager ) {

			var sys = this.sys;
			var msgs = sys.init.queuedMessages;

			this.cursorOn = false;
			this.blinking = true;

			var w;
			var h;
			if( config[0].indexOf("x") > 0) {
				var tmp = config[0].split("x");
				w = parseInt( tmp[0] );
				h = parseInt( tmp[1] );
			}
			else {
				var ww = window.innerWidth;
				var wh = window.innerHeight;

				if( config[0].startsWith( "%%" )) {
					var percentages = config[0].substr( 2 ).split(",");
					var percentagex = percentages[0] / 100;
					var percentagey = percentages[1] / 100;
					w = Math.floor(ww * percentagex);
					h = Math.floor(wh * percentagey);
				}
				else if( config[0].startsWith( "%" )) {
					var percentage = config[0].substr( 1 );
					percentage = percentage / 100;
					w = Math.floor(ww * percentage);
					h = Math.floor(wh * percentage);
				}


			}



			this.cols = Math.floor( w / this.fontSizeIntW );
			this.rows = Math.floor( h / this.fontSizeIntH );

			/* adjust w,h to fit exactly so many cols and rows */
			w = this.cols * this.fontSizeIntW;
			h = this.rows * this.fontSizeIntH;

			var fsw = this.fontSizeIntW;
			var fsh = this.fontSizeIntH;

			this.width = w;
			this.height = h;

			console.log("Reinit with " , w, h);
			console.log(" colsXrows " , this.cols, this.rows);
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

			this.cvs2 = document.createElement("canvas"); //only used for scrolling, really needed??
			this.ctx2 = this.cvs2.getContext('2d');

			this.cvsCursor = document.createElement("canvas");
			this.ctxCursor = this.cvsCursor.getContext('2d');

			this.cache = [];
			this.updCtxImageData = { synched: false }

			this.cvs.width = w;
			this.cvs.height = h;
			this.cvs2.width = w;
			this.cvs2.height = h;
			this.cvsCursor.width = fsw;
			this.cvsCursor.height = fsh;

			this.offsets = [];

			var ctx = this.ctx;
  		ctx.font =  this.fontSizeCSS + " " + this.fontFamily;
			//ctx.font =  "20px Verdana";
 		  ctx.textBaseline = "bottom";
			//ctx.fontStretch="expanded";

			var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890@+_!#%&/()=?*-:;,.'\"";
			var fsid2 = this.fontSizeIntW / 2;
			for (const c of str) {
				var tmp3 =  this.ctx.measureText( c )  ;
				var tmp2 =  tmp3.width  ;
				var tmp1 =  (tmp2 / 2) ;
				var tmp0 =  fsid2 - tmp1 ;
				var tmp = Math.floor( tmp0 );
				if( tmp<0 ) { tmp = 0; }
				this.offsets[ c ] = tmp;
 		 }

		 	this.oIndicatorChar = "\u2595";
		  this.oIndicatorSize = this.ctx.measureText( this.oIndicatorChar )  ;
			this.oIndicatorOffset = Math.floor( fsid2 - (this.oIndicatorSize.width / 2));

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
			if( headerElementManager ) {
				this.headerElementManager = headerElementManager;
				this.center.appendChild( this.headerElementManager.get() );
				this.headerElementManager.setDimensions( w, h );

				this.headerElementManager.enable();
			}
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


	notifyOnClick( handler, myFunction ) {

		this.cvs.addEventListener( "click", function() {
			handler[myFunction]();
		} );

	}

	hideInner() {
		this.cvs.hidden = true;
	}

showInner() {
		this.cvs.hidden = false;
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

		var fsw = this.fontSizeIntW;
		var fsh = this.fontSizeIntH;

		var x0 = (fsw * this.x);
		var y0 = fsh * (this.y );

		var ctx = this.ctx;

		this.ctx.drawImage(this.cvsCursor, x0, y0);

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
		oc.fgRGB = this.bmPalette[ oc.fg ];
		oc.bgRGB = this.bmPalette[ oc.bg ];

	}


	_int_restore_color() {

		var oc = this.colors;
		oc.fg = this.oldfg;
		oc.bg = this.oldbg;
		oc.fgHTML = this.palette[ oc.fg ];
		oc.bgHTML = this.palette[ oc.bg ];
		oc.fgRGB = this.bmPalette[ oc.fg ];
		oc.bgRGB = this.bmPalette[ oc.bg ];

	}

	_int_blink() {

		if( ! this.blinking ) {
			return;
		}

		var currentCursorIsOn = this.cursorOn;

		this.cursorOn = !this.cursorOn;

		var fsw = this.fontSizeIntW;
		var fsh = this.fontSizeIntH;

		var x0 = (fsw * this.x);
		var y0 = (fsh * this.y);
		var oc = this.colors;

		var ctx = this.ctx;
		var cell = this.cells[ this.y][this.x ];


		if(  this.cursorOn ) {

				/* first we backup underneath cursor */
				this.ctxCursor.drawImage(this.cvs, x0, y0, fsw, fsh, 0, 0, fsw, fsh);

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

				this.paintCursor( x0, y0, cell.txt, index, index2, this.cursorMode == "overwrite" );

				return;

		}
		else {

			//cursor off
			this.ctx.drawImage(this.cvsCursor, x0, y0);

		}

	}

	_int_updateArea( srccells, x0, y0, x1, y1 ) {

		var ctx = this.ctx;
		var fsw = this.fontSizeIntW;
		var fsh = this.fontSizeIntH;
		var oc = this.colors;

		var x; var y;
		try {

		for( y=y0; y<=y1; y++) {
			var yy = fsh * y;
			var offX =x0 * fsw;
			//for( x=x1; x>=x0; x--) {
			for( x=x0; x<=x1; x++) {
				var cell = this.cells[ y ][ x ];
				var src = srccells[ y-y0 ][ x-x0 ];
				var ch = src.txt;

				oc.bg = src.bg;
				oc.fg = src.fg;

				oc.bgHTML = this.palette[ src.bg ];
				oc.fgHTML = this.palette[ src.fg ];
				oc.bgRGB = this.bmPalette[ src.bg ];
				oc.fgRGB = this.bmPalette[ 	src.fg ];

				cell.txt = ch;
				cell.fg = src.fg;
				cell.bg = src.bg;

				this._int_paintchar( offX , yy , ch );
				offX += fsw;
			}
		}
	} catch ( e ) {
		console.log("x= " + x + " y= " + y);
		console.log("x0=", x0, "y0=",y0, "x1=",x1,"y1=",y1);
		console.log(e);
	}

	}

	paintCursor( x, y, ch , col1, col2, mode ) {
		this._int_storeset_color( col2, col1 );
		this._int_paintchar( x, y, ch );
		if(  mode ) {
			this._int_drawIndicator( x, y, ch );
		}
		this._int_restore_color();
	}


	_int_drawIndicator( x, y, c ) {

		var ctx = this.ctx;

		ctx.font =  this.fontSizeCSS + " " + this.fontFamily;
		ctx.textBaseline = "top";

		ctx.fillStyle = this.colors.fgHTML
		ctx.fillRect(  x,y + (4*this.fontSizeIntH)/5, this.fontSizeIntW, (this.fontSizeIntH)/5 );

	}

	setCharacterBank( addr, mode ) {
		this.characterbank[addr] = mode;
	}

	_int_paintchar( x, y, ch ) {

			this.updCtxImageData.synched = false;

			var oc = this.colors;
			var index = ch + ":"+oc.bg+":"+oc.fg;
			var cacheel = this.cache[ index ];
			var fsw = this.fontSizeIntW;
			var fsh = this.fontSizeIntH;

			if( ! cacheel ) {

				var cvs = document.createElement("canvas");

				var code = ch.charCodeAt(0);

/*
	what is this.bmFontEnable ??

		var UNICODE=0;
		var CUSTOM=1;
		var GLYPHS0=2;
		var GLYPHS1=3;
		var GLYPHS2=4;
		var GLYPHS3=5;
		this.characterbank0 = GLYPHS0;
		this.characterbank1 = GLYPHS1;
		this.characterbank2 = GLYPHS2;
		this.characterbank3 = GLYPHS3;

		this.bankDefaultBaseAddr = 256;
		this.bankBaseAddr = this.bankDefaultBaseAddr;

*/

				var GLYPHS0=2;
				var GLYPHS1=3;
				var GLYPHS2=4;
				var GLYPHS3=5;

				var bitmapchar = false;
				var glyphs;
				var bitmapchar0 = ( code >= this.bankBaseAddr && code < (this.bankBaseAddr + 512));
				var charAddr;
				var relCode;
				//var bank;


				if( bitmapchar0  ) {

					if ( code < (this.bankBaseAddr + 128) && this.characterbank0 >= GLYPHS0) {
						 bitmapchar = true;
						 //bank = 0;
					   //glyphs = this.characterbank0;
						// bankaddr = 0;
						// if( )
						// charAddr = code - this.bankBaseAddr;

						relCode = code - (this.bankBaseAddr );
						charAddr = this.GLYPHSADDR[ this.characterbank0 ] + relCode;
					}
					else if ( (code >= this.bankBaseAddr + 128) && code < (this.bankBaseAddr + 256) && this.characterbank1 >= GLYPHS0) {
						bitmapchar = true;
						//bank = 1;
						//glyphs = this.characterbank1;
						//charAddr = code - (this.bankBaseAddr);

						relCode = code - (this.bankBaseAddr + 128);
						charAddr = this.GLYPHSADDR[ this.characterbank1 ] + relCode;

/*
						example:
							code = 130
							this.characterbank1 = GLYPHS2;

							charBaseAddr = 130-128 = 2
							charAddr = addr( GLYPHS2 ) + 2;
*/
					}
					else if ( (code >= this.bankBaseAddr + 256 ) && code < (this.bankBaseAddr + 384) && this.characterbank2 >= GLYPHS0) {
						bitmapchar = true;
						//glyphs = this.characterbank2;
						relCode = code - (this.bankBaseAddr + 256);
						charAddr = this.GLYPHSADDR[ this.characterbank2 ] + relCode;
					}
					else if ( (code >= this.bankBaseAddr + 384 ) && this.characterbank3 >= GLYPHS0) {
						bitmapchar = true;
						//glyphs = this.characterbank3;
						relCode = code - (this.bankBaseAddr + 384);
						charAddr = this.GLYPHSADDR[ this.characterbank3 ] + relCode;
					}

					//bankaddr =

				}

				if( code > 256 && !bitmapchar ) {
					var tmp3 =  this.ctx.measureText( ch )  ;
					var tmpw =  Math.floor( tmp3.width ) ;
					if( tmpw > fsw ) {
						fsw = tmpw;
					}
				}

				cvs.width = fsw;
				cvs.height = fsh;

				var ctx = cvs.getContext('2d', {alpha: false});

				if( bitmapchar ) {

					var grid = this.bfont.getCharData( charAddr ); //code-this.bankBaseAddr );

					var imgdata = ctx.getImageData(0, 0, fsw, fsh );
					var sd  = imgdata.data;

					var offset;
					var yoffset = 0, xoffset=0;
					var yofflen = 4 * fsw;
					var xofflen = 4;

					var bgc = this.colors.bgRGB;
					var fgc = this.colors.fgRGB;

 					for( var yy=0; yy<fsh; yy++) {

						xoffset = 0;
 						for( var xx=0; xx<fsw; xx++) {
							var pix = grid[yy][xx];
							offset = xoffset + yoffset;

							if( pix ) {
								sd[ offset + 0] = fgc.r;
								sd[ offset + 1] = fgc.g;
								sd[ offset + 2] = fgc.b;
							}
							else {
								sd[ offset + 0] = bgc.r;
								sd[ offset + 1] = bgc.g;
								sd[ offset + 2] = bgc.b;
							}

							sd[ offset + 3] = 255;
							xoffset += xofflen;
						}
						yoffset += yofflen;
					}

					ctx.putImageData( imgdata, 0, 0);
				}
				else {
					ctx.font =  this.fontSizeCSS + " " + this.fontFamily;
					ctx.textBaseline = "top";

					var off = 0;
					if( this.offsets[ ch ] ) {
						off = this.offsets[ ch ];
					}

					ctx.fillStyle = this.colors.bgHTML;
					ctx.fillRect(  0,0, fsw, fsh);

					ctx.fillStyle = this.colors.fgHTML;
					ctx.fillText( ch , off, 0);


				}

				this.cache[ index ] = { ctx: ctx, cvs: cvs, w: fsw } ;
				cacheel = this.cache[ index ];

			}

			this.ctx.drawImage( cacheel.cvs, x, y );
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
			this.colors.bgRGB = this.bmPalette[ p.bg ];
			this.colors.fgRGB = this.bmPalette[ 	p.fg ];

			this.colors.bg = p.bg;
			this.colors.fg = p.fg;
			this.cursorMode = p.cursorMode;

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
			this.colors.bgRGB = this.bmPalette[ p.bg ];
			this.colors.fgRGB = this.bmPalette[ 	p.fg ];

			this.colors.bg = p.bg;
			this.colors.fg = p.fg;
			this.cursorMode = p.cursorMode;

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

		this.ctx.fillStyle = this.colors.bgHTML;
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
		var fsw = this.fontSizeIntW;
		var fsh = this.fontSizeIntH;

		var off = 0;
		if( this.offsets[ ch.txt ] ) {
			off = this.offsets[ ch.txt ];
		}

		this.ctx.fillStyle = this.colors.bgHTML;
		ctx.fillRect(  (fsw * this.x) , fsh * (this.y ), fsw, fsh);

		ctx.fillStyle = this.colors.fgHTML;
		ctx.fillText( ch.txt , off + (fsw * this.x) , fsh * (this.y +1));

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

		var fsw = this.fontSizeIntW;
		var fsh = this.fontSizeIntW;
		this.ctx2.drawImage(this.cvs, 0, 0);
		var w = this.cvs2.width;
		var h = this.cvs2.height-fsh;

		this.ctx.fillStyle = this.colors.bg;
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

		this.ctx.drawImage(this.cvs2, 0, fsh, w, h-fsh, 0, 0, w, h-fsh );
		//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

	}

}

export { KERNALMODULE as default};
