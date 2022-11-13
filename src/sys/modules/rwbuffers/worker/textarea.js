/*
	TODOS

		1. flush smaller changes
		2. logging from browser, how?
				- browser to taconfig and then to ??

		3.


*/

class TextArea {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.cols = 80;
		this.rows = 30;
		this.x = 0;
		this.y = 0;
		this.hidden = false;

		this.dc = false;
		this.dcCmd = false;

		this.colors ={};
		this.reverse = false;

		this.colors.txtBgColor= 0;
		this.colors.txtColor = 5;

		this.initialized = false;

		this.changes = { all: false, list: [] };
	}


	destroy() {

			this.cellel = undefined;

			this.changes = { all: false, list: [] };
			this.initialized = false;
		}


	_int_addChangeAll() {

		 this.changes.all = true;
		 this.changes.list = [];

	 }

	_int_addChange( area ) {

			if(  this.changes.all ) {
				if( this.changes.list.length > 0 ) {
						this.changes.list = [];
				}
				return;
			}
		 	this.changes.list.push( area );

	 }

	_int_flushAll() {
			this.changes.all = true;
			this.changes.list = [];

			this._int_flush();

		}

		_int_getArea( x1, y1, x2, y2 ) {
			var cells = [];

			for( var y=y1; y<=y2; y++) {
				var row = [];
				for( var x=x1; x<=x2; x++) {
					row.push( this.cellel[ y][ x] );
				}
				cells.push( row );
			}

			var area =
			{
				 cells: cells,
				 x1: x1,
				 y1: y1,
				 x2: x2,
				 y2: y2
			};

			return area;

		}

	 _int_flush() {

			if( this.changes.all ) {
				this.sys.post( "textupdate-all",
						{
 							fg: this.colors.txtColor,
							bg: this.colors.txtBgColor,
							cx: this.x,
							cy: this.y,
							cells: this.cellel
						} );

				this.changes.all = false;


			}
			else if( this.changes.list.length > 0 ) {

				this.sys.post( "textupdate",
					{
						fg: this.colors.txtColor,
						bg: this.colors.txtBgColor,
						cx: this.x,
						cy: this.y,
						areasList:  this.changes.list
					}  );
				this.changes.list = [];
			}
			else {
				this.sys.post( "textupdate",
					{
						fg: this.colors.txtColor,
						bg: this.colors.txtBgColor,
						cx: this.x,
						cy: this.y,
						areasList:  []
					}  );

			}

		}

		attach( w, h ) {
			this._int_initMode( w, h);
		}

		_int_initMode( w, h ) {

			if( this.initialized ) {
				this.destroy();
			}
			var sys = this.sys;
			//var msgs = sys.init.queuedMessages; TODO, what to do with queued messages

			this.x = 0;
			this.y = 0;

			this.rows = h;
			this.cols = w;

			this.colors.txtBgColor= 0;
			this.colors.txtColor = 5;

			this.cellel = [];
			for( var y=0; y<this.rows; y++) {
				var rowArray = [];
				for( var x=0; x<this.cols; x++) {
					var cell = {
						txt: " ",
						fg: this.colors.txtColor,
						bg: this.colors.txtBgColor
					}
					rowArray.push( cell );
				}
				this.cellel.push( rowArray );
			}

			this.changes = { all: true, list: [] };

 		  var _this = this;

			this._int_flushAll();

			this.sys.log("TBCON w Ready.");

			this.initialized = true;
	}


	getDimensions() {
			return [this.cols, this.rows ];
	}

	getCurrentLine() {
		var y = this.y;
		var str = "";
		for( var i = 0; i< this.cols; i++) {
			str += this.cellel[ y ][ i ].txt;
		}
		return str;
	}



	clear() {

		this.cellel = [];
		for( var y=0; y<this.rows; y++) {
			var rowArray = [];
			for( var x=0; x<this.cols; x++) {
				var cell = {
					txt: " ",
					fg: this.colors.txtColor,
					bg: this.colors.txtBgColor
				}
				rowArray.push( cell );
			}
			this.cellel.push( rowArray );
		}

		this.changes = { all: true, list: [] };

		this.x = 0;
		this.y = 0;

		this._int_flushAll();
	}


	cursorMove( dir ) {
		if( dir == "up" ) {
			if( this.y>0) {
				this.y--;
			}
		}
		else if( dir == "down" ) {
			if( this.y< (this.rows-1)) {
				this.y++;
			}
		}
		if( dir == "left" ) {
			if( this.x>0) {
				this.x--;
			}
		}
		else if( dir == "right" ) {
			if( this.x< (this.cols-1)) {
				this.x++;
			}
		}
		this._int_flush();
	}

	backspace() {
		if( this.x == 0) {
			return;
		}

		this.x--;
		var cell = this.cellel[ this.y ][ this.x ];
		cell.txt = " ";

		var area = this._int_getArea( this.x, this.y, this.x, this.y, );
		this._int_addChange( area );
		this._int_flush();
	}

	nl() {

			this.x = 0;
			this.y ++;

			if( this.y >= this.rows ) {

				this.__int_scrollDown();
				this.y = this.rows -1;

				this._int_flushAll();
				return;
			}

			this._int_flush();

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

			for( var i=0; i<str.length; i++) {
				var c = str.substr(i,1);
				this.__int_write_direct_ch( c );
			}
			this.__int_nl();
			this._int_flush();
	}

	_int_write( str ) {
		for (const c of str) {
			this.__int_write_direct_ch( c );
		}
	}

	write( str ) {
			this._int_write( str );

			this._int_flush();
	}



	__int_write_direct_ch( ch ) {

		var code = ch.codePointAt(0);

		if( this.dc && this.dcCmd ) {

			this.dc = false;
			this.dcCmd = false;
			this._int_control( this.dcCmdCode, code );

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

		var cell = this.cellel[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		cell.txt = ch;

		if( !this.reverse  ) {
			cell.fg = this.colors.txtColor;
			cell.bg = this.colors.txtBgColor;
		}
		else {
			cell.bg = this.colors.txtColor;
			cell.fg = this.colors.txtBgColor;
		}

		var oldx = this.x;
		var oldy = this.y;

		this.x++;
		if( this.x >= this.cols ) {
			this.x = 0;
			this.__int_nl();
			this._int_addChangeAll();
			return;
		}

		var area = this._int_getArea( oldx, oldy, oldx, oldy );
		this._int_addChange( area );

	}

	writec( chr ) {

		if( chr == "\n" ) {
			this.__int_nl();
			return;
		}
		this.__int_write_direct_ch( chr );
		this._int_flush();
	}


	_int_setPos( x, y ) {

		if(x >= 0) {
				this.x = x;
		}
		if(y >= 0) {
				this.y = y;
		}

		if( this.x >= this.cols ) { this.x = this.cols-1;}
		if( this.y >= this.rows ) { this.y = this.rows-1;}
	}


	setPos( x, y ) {

		this._int_setPos( x,y );

		this._int_flush();
	}


	_int_control( chr, data ) {

		if( chr == 16 ) {
			this.colors.txtColor = data;
		}
		else if( chr == 17 ) {
			this.colors.txtBgColor = data;
		}
		else if( chr == 18 ) {
			document.body.style.backgroundColor = this.palette[ data ];  //TODO
		}
		else if( chr == 24 ) {  //CANCEL -> (we map it to) Clear Screen
			this.clear();
		}
		else if( chr == 25 ) {  //End of Medium -> (we map it to) Hide
			//this.hide();   TODO
		}
		else if( chr == 64 ) {
			this.reverse = false;
		}
		else if( chr == 65 ) {
			this.reverse = true;
		}
		else {
			this.__int_write_direct_ch( "?" );
		}
	}

	setCursorPos( x, y ) {
		if( x<0 || y<0 ) { return ; }
		if( x>=this.cols || y>= this.rows ) { return ; }

		this.x = x;
		this.y = y;

		this._int_flush();
	}

	getCursorPos() {
			return [this.x, this.y ];
	}

	control( chr, data ) {

		this._int_control( chr, data );
		this._int_flush();

	}

	center( str ) {

			if( str.length > this.cols ) {
				return;
			}

			var l = str.length;
			var l2 = Math.floor( l/2 );

			var wh = this.getDimensions();

			var x = Math.floor( wh[0] / 2 ) - l2;
			this._int_setPos( x, -1 );
			this._int_write( str );

			var area = this._int_getArea( 0, this.y, this.cols-1, this.y );
			this._int_addChange( area );
			this._int_flush();

	}

	__int_scrollDown() {
		for( var x=0; x<this.cols; x++) {
			for( var y=0; y<this.rows-1; y++) {
				var cell = this.cellel[ y ][ x ];
				var cellyp1 = this.cellel[ y+1 ][ x ];

				cell.txt = cellyp1.txt;
				cell.fg = cellyp1.fg;
				cell.bg = cellyp1.bg;
			}
		}

		//fill last row
		var y2 = this.rows-1;
		for( var x=0; x<this.cols; x++) {
			var cell = this.cellel[ y2 ][ x ];
			cell.txt = " ";
			if( !this.reverse  ) {
				cell.fg = this.colors.txtColor;
				cell.bg = undefined;
			}
			else {
				cell.fg = this.colors.txtColor;
				cell.bg = "rgba(0,255,0,0.0)";
			}
		}

	}
}
