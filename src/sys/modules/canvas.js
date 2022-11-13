class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.hidden = false;

		this.dc = false;
		this.dcCmd = false;

		this.outColors ={};
		this.reverse = false;

		this.colors = [
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

		this.defaultTextMode();

		this.initialized = false;

	}


	destroy() {
		this.outDiv0.remove();
		this.cvs = null;
		this.cvs2 = null;
		this.ctx = null;
		this.ctx2 = null;

		if( this.blinkInterval ) {
			clearInterval ( this.blinkInterval );
			this.blinkInterval = undefined;
		}
		this.initialized = false;
	}

	defaultTextMode() {
		//this.cols = 80;
		//this.rows = 30;
		this.x = 0;
		this.y = 0;

		this.fontSize = "18";

		this.fontSizeCSS = this.fontSize + "px";
		this.fontSizeInt = parseInt( this.fontSize );
		this.fontFamily = "monospace";

		this.outColors.txtBgColor= this.colors[0];
		this.outColors.txtColor = this.colors[5];

	}

	init() {
	}

	initMode( config ) {

			var sys = this.sys;
			var msgs = sys.init.queuedMessages;

			var tmp = config[0].split("x");
			var w = parseInt( tmp[0] );
			var h = parseInt( tmp[1] );

			this.cols = Math.floor( w / this.fontSizeInt );
			this.rows = Math.floor( w / this.fontSizeInt );

			this.x = 0;
			this.y = 0;

			sys.init.inputElement = document.body;

			this.outDiv0 = document.createElement("div");
			this.outDiv1 = document.createElement("div");
			this.center = document.createElement("center");

			this.cvs = document.createElement("canvas");
			this.ctx = this.cvs.getContext('2d');
			//this.cvs = this.outEl;

			this.cvs2 = document.createElement("canvas");
			this.ctx2 = this.cvs2.getContext('2d');


			this.cvs.width = w;
			this.cvs.height = h;
			this.cvs2.width = w;
			this.cvs2.height = h;

			this.offsets = [];

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


		 var ctx = this.ctx;
 		 ctx.font =  this.fontSizeCSS + " " + this.fontFamily;
		 ctx.textBaseline = "bottom";

			this.rowel = [];
			this.cellText = [];

			for( var y=0; y<this.rows; y++) {
				var rowArray = [];
				for( var x=0; x<this.cols; x++) {
					rowArray.push( " " );
				}
				this.cellText.push( rowArray );
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

				 	_this.blink();
				}, 500);

				for( var i=0; i<msgs.length; i++) {
					this.writeln( msgs[ i ]);
				}

			 this.clear();

			 this.initialized = true;

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


	blinkOf() {


		if( !this.cursorOn ) {
			return;
		}

		this.cursorOn = false;
		var ctx = this.ctx;
		var fs = this.fontSizeInt;

		ctx.fillStyle = this.outColors.txtBgColor ; //this.outColors.txtBgColor;
		ctx.fillRect( (fs * this.x) , fs * (this.y ), fs, fs);

	}

	blink() {

		this.cursorOn = !this.cursorOn;

		var front;
		var back;

		if( this.cursorOn ) {
			back = this.outColors.txtBgColor;
			front = this.outColors.txtColor;
		}
		else {
			front = this.outColors.txtBgColor;
			back = this.outColors.txtColor;
		}

		var fs = this.fontSizeInt;
		var ctx = this.ctx;

		ctx.fillStyle = front;
		ctx.fillRect(  (fs * this.x) , fs * (this.y ), fs, fs);

	}

	clear() {
		this.blinkOf();
		this.show();

		var b=0;
		for( var x=0; x<this.cols; x++) {
			b=1-b;
			for( var y=0; y<this.rows; y++) {
				this.cellText[ y ][ x ] = " ";

			}
		}

		this.ctx.fillStyle = this.outColors.txtBgColor;
		//this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
		this.x = 0;
		this.y = 0;
	}


	nl() {
			this.blinkOf();
			this.show();
			this.x = 0;
			this.y ++;
			if( this.y >= this.rows ) {
				this.y = this.rows -1;
			}
			this.__int_scrollDown();
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
			this.blinkOf();
			this.show();
			console.log( "writeln" + str );

			for (const c of str) {
			  this.__int_write_direct_ch( c );
			}
			this.__int_nl();
	}

	write( str ) {
			this.blinkOf();
			this.show();

			for (const c of str) {
			  this.__int_write_direct_ch( c );
			}

	}

	__int_write_direct_ch( ch ) {

		var code = ch.codePointAt(0);

		if( ch == "@" ) {
			var tmp = 1;
		}
		if( this.dc && this.dcCmd ) {

			this.dc = false;
			this.dcCmd = false;
			this.control( this.dcCmdCode, code );

			return;
		}

		if( this.dc && !this.dcCmd ) {
			this.dcCmd = true;
			this.dcCmdCode = code;
			return;
		}

		if( code == 17 ) {
			//DC1
			this.dc = true;
			this.dcCmd = false;
			return;
		}

		var cell = this.cellText[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		cell = ch;

		var ctx = this.ctx;
		var fs = this.fontSizeInt;

		var off = 0;
		if( this.offsets[ ch ] ) {
			off = this.offsets[ ch ];
		}

		this.ctx.fillStyle = this.outColors.txtBgColor;
		ctx.fillRect(  (fs * this.x) , fs * (this.y ), fs, fs);

		ctx.fillStyle = this.outColors.txtColor;
		ctx.fillText( ch , off + (fs * this.x) , fs * (this.y +1));

		this.x++;
		if( this.x >= this.cols ) {
			this.x = 0;
			this.__int_nl();
		}
	}



	writec( chr ) {
		this.blinkOf();
		this.show();

		if( chr == "\n" ) {
			this.__int_nl();
			return;
		}
		this.__int_write_direct_ch( chr );

	}


	getDimensions() {
			return [this.cols, this.rows ];
	}


	setPos( x, y ) {
		this.blinkOf();
		if(x >= 0) {
				this.x = x;
		}
		if(y >= 0) {
				this.y = y;
		}

		if( this.x >= this.cols ) { this.x = this.cols-1;}
		if( this.y >= this.rows ) { this.y = this.rows-1;}
	}



	control( chr, data ) {
		this.blinkOf();
		this.show();

		if( chr == 16 ) {  //CANCEL -> (we map it to) Clear Screen
			this.outColors.txtColor = this.colors[ data ];
		}
		else if( chr == 17 ) {  //CANCEL -> (we map it to) Clear Screen
			this.outColors.txtBgColor = this.colors[ data ];
		}
		else if( chr == 18 ) {  //CANCEL -> (we map it to) Clear Screen
			document.body.style.backgroundColor = this.colors[ data ];
		}
		else if( chr == 24 ) {  //CANCEL -> (we map it to) Clear Screen
			this.clear();
		}
		else if( chr == 25 ) {  //End of Medium -> (we map it to) Hide
			this.hide();
		}
		else if( chr == 64 ) {  //End of Medium -> (we map it to) Hide
			this.reverse = false;
		}
		else if( chr == 65 ) {  //End of Medium -> (we map it to) Hide
			this.reverse = true;
		}
		else {
			this.__int_write_direct_ch( "?" );
		}
	}

	__int_scrollDown() {
		for( var x=0; x<this.cols; x++) {
			for( var y=0; y<this.rows-1; y++) {
				var cell = this.cellText[ y ][ x ];
				var cellyp1 = this.cellText[ y+1 ][ x ];

				cell = cellyp1;

			}
		}

		//fill last row
		var y2 = this.rows-1;
		for( var x=0; x<this.cols; x++) {
			var cell = this.cellText[ y2 ][ x ];
			cell = "";
		}

		var fs = this.fontSizeInt;
		this.ctx2.drawImage(this.cvs, 0, 0);
		var w = this.cvs2.width;
		var h = this.cvs2.height-fs;

		this.ctx.fillStyle = this.outColors.txtBgColor;
		this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

		this.ctx.drawImage(this.cvs2, 0, fs, w, h, 0, 0, w, h );
		//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

	}

}

export { KERNALMODULE as default};
