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

		this.defaultFG = 5;
		this.defaultBG = 0;

		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		this.initialized = false;

		this.changes = { all: false, list: [] };
		this.pokeFlush = true;


		//this.textArea( this.cols , this.rows , -1, -1 );
	}

	isActive() {
    return this.initialized && !this.hidden;
  }

	reInit( w, h ) {
		this._int_initMode( w, h );
	}


	destroy() {

			this.cellel = undefined;

			this.changes = { all: false, list: [] };
			this.initialized = false;
		}


  /* Adding changes, to be posted to MT throught flush */
	_int_addChangeAll() {

		 this.changes.all = true;
		 this.changes.list = [];

	 }



	 changeCount() {
		 if( this.changes.all ) { return 65535; }
		 return this.changes.list.length;
	 }

	/* Adding single change, to be posted to MT throught flush */
	_int_addChange( area ) {

			if(  this.changes.all ) {
				if( this.changes.list.length > 0 ) {
						this.changes.list = [];
				}
				return;
			}

			var clist = this.changes.list;
			if( clist.length > 0 ) {
				var lc = clist[ clist.length -1 ];
				var nc = area;
				if( lc.y1 == lc.y2 && nc.y1 == nc.y2 && lc.y1 == nc.y1) {
					if( nc.x1 == lc.x2 +1 ) {
							var x2 = lc.x2;
							var temp=1;
							var changesTargetArray = lc.cells[0];
							for( var i=0; i<area.cells[0].length; i++) {
								var cell = area.cells[0][i];
								changesTargetArray.push( cell );
							}
							lc.x2 = nc.x2;
							return;
					}
				}
			}

		 	this.changes.list.push( area );

	 }

	 /* Force flush to MT the whole buffer */
	_int_flushAll() {
			this.changes.all = true;
			this.changes.list = [];

			this._int_flush();

		}

  /* Utility function to prepare input for addChange (which itself prepares for flush )*/
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

   /* Flush local changes to Main Thread for actual display updates*/
	 _int_flush() {

			if( this.changes.all ) {
				this.sys.post( "textupdate-all",
						{
 							fg: this.colors.txtColor,
							bg: this.colors.txtBgColor,
							cx: this.x,
							cy: this.y,
							cells: this.cellel,
							cursorMode: this.cursorMode
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
						areasList:  this.changes.list,
						cursorMode: this.cursorMode
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
						areasList:  [],
						cursorMode: this.cursorMode
					}  );

			}

		}

		attach( w, h ) {
			this._int_initMode( w, h);
		}

		setPokeFlush( flag ) {
		  this.pokeFlush = flag;
		}


		peekc( x, y ) {

			var cell = this.cellel[y][x];
     	return cell.txt.codePointAt(0);

		}

		peekcl( x, y, m ) {

			var cell = this.cellel[y][x];

			if( m== 0 ) {
				return cell.fg;
			}
			else if( m== 1 ) {
				return cell.bg;
			}
			else  {
				return cell.fg + (16*cell.bg);
			}
		}

		pokec( x, y , c ) {

			try {
				var cell = this.cellel[y][x];
				cell.txt = String.fromCodePoint( c );

				var area = this._int_getArea( x, y, x, y );
				this._int_addChange( area );

				if( this.pokeFlush ) {
					this._int_flush();
				}
			}
			catch( e ) {
				throw "Cannot pokec to adress (" + x + "," + y + ")";
			}

		}

		pokecl( x, y , fg, bg ) {

			try {
				var cell = this.cellel[y][x];
				if( !(fg === undefined )) {
					cell.fg = fg;
				}
				if( !(bg === undefined )) {
					cell.bg = bg;
				}
				var area = this._int_getArea( x, y, x, y );
				this._int_addChange( area );

				if( this.pokeFlush ) {
					this._int_flush();
				}

			}
			catch( e ) {
				throw "Cannot pokec to adress (" + x + "," + y + ")";
			}
		}


		pokeccl( x, y , c, fg, bg ) {

			try {
				var cell = this.cellel[y][x];

				cell.txt = String.fromCodePoint( c );
				if( !(fg === undefined )) {
					cell.fg = fg;
				}
				if( !(bg === undefined )) {
					cell.bg = bg;
				}

				var area = this._int_getArea( x, y, x, y );
				this._int_addChange( area );

				if( this.pokeFlush ) {
					this._int_flush();
				}

			}
			catch( e ) {
				throw "Cannot pokec to adress (" + x + "," + y + ")";
			}
		}

		triggerFlush() {

			this._int_flush();
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

			this.textArea( this.cols, this.rows, -1, -1 );

			this.colors.txtBgColor= this.defaultBG;
			this.colors.txtColor = this.defaultFG;

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

			this.sys.log("TEXTAREA w Ready.");

			this.initialized = true;
			this.pokeFlush = true;
			/* if true then all pokes in "character memory" will be flushed immediately to the */
			/*main browswer process */
	}


	getDimensions() {
			return [this.cols, this.rows ];
	}

	getCurrentLine() {
		var y = this.y;
		var str = "";
		for( var i = 0; i< this.acols; i++) {
			var xi = i + this.ax0;
			str += this.cellel[ y ][ xi ].txt;
		}
		return str;
	}

	getLineFrom( x0, y ) {

		var str = "";
		var x2 = this.acols + this.ax0 - 1;

		for( var i = x0; i< x2; i++) {
			str += this.cellel[ this.ay0 + y ][ i ].txt;
		}
		return str;
	}

	/* Commands and functions to modify the text area buffer */


	setDefault( fg, bg ) {
		this.defaultBG = bg;
		this.defaultFG = fg;

	}


	colorReset() {

		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		//this.cellel = [];
		var fg = this.defaultFG;
		var bg = this.defaultBG;

		for( var ay=0; ay<this.rows; ay++) {
			//var rowArray = [];

			var y = ay;
			for( var ax=0; ax<this.cols; ax++) {

				var x = ax;

				var cell = this.cellel[ y ][ x];

				cell.fg = fg;
				cell.bg = bg;
			}
			//this.cellel.push( rowArray );
		}

		this.changes = { all: true, list: [] };

		this._int_flushAll();
	}

	reset() {
		this.textArea( this.cols, this.rows, -1, -1 );

		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		this.pokeFlush = true;
		this.clear();

	}

	textArea( w, h, xo, yo ) {
		var divx = this.cols - w;
		var divy = this.rows - h;

		if( xo < 0 ) {
				this.ax0 = Math.floor(divx / 2);
		}
		else {
			this.ax0 = xo;
		}

		if( yo < 0 ) {
				this.ay0 = Math.floor(divy / 2);
		}
		else {
			this.ay0 = yo;
		}

		this.acols = w;
		this.arows = h;
		this.x = this.ax0;
		this.y = this.ay0;
	}

	clear() {

		//this.cellel = [];
		for( var ay=0; ay<this.arows; ay++) {
			//var rowArray = [];

			var y = this.ay0 + ay;
			for( var ax=0; ax<this.acols; ax++) {

				var x = this.ax0 + ax;

				var cell = {
					txt: " ",
					fg: this.colors.txtColor,
					bg: this.colors.txtBgColor
				}
				this.cellel[ y ][ x] = cell;
			}
			//this.cellel.push( rowArray );
		}

		this.changes = { all: true, list: [] };

		this.x = this.ax0;
		this.y = this.ay0;

		this._int_flushAll();
	}


	jumpTo( destination ) {
		if( destination == "home" ) {
			this.y = this.ay0;
			this.x = this.ax0;
		}
		if( destination == "end" ) {
			this.y = this.ay0 + this.arows - 1;
			this.x = this.ax0 + this.acols - 1;
		}
		else if( destination == "line-start" ) {
			this.x = this.ax0;
		}
		else if( destination == "line-end" ) {
			this.x = this.ax0 + this.acols - 1;
		}
		else if( destination == "text-end" ) {

			/* where is the last char -> maxX */
			var c = "DC";
			var oldx = this.x;
			this.x = ((this.ax0 + this.acols)-1);
			var max = ((this.ax0 + this.acols)-1);

			while( this.x >= this.ax0 ) {
						c = this.cellel[ this.y ][ this.x ].txt;
						if( c != " " ) {
							this.x++;
							if( this.x > max) {
								this.x = max;
							}
							break;
						}
						this.x--;
			}

			var maxX = this.x;
			/*-reset, and jump to end of next text area-*/
			this.x = oldx;
			var c = "DC";
			while( this.x< ((this.ax0 + this.acols)-1) && c != " ") {
						this.x++;
						c = this.cellel[ this.y ][ this.x ].txt;
			}


			/*make sure we did not jump past last char*/
			if( this.x > maxX ) {
				this.x = maxX;
			}
		}
		else if( destination == "text-end-all" ) {
			var c = "DC";
			this.x = ((this.ax0 + this.acols)-1);
			var max = ((this.ax0 + this.acols)-1);

			while( this.x >= this.ax0 ) {
						c = this.cellel[ this.y ][ this.x ].txt;
						if( c != " " ) {
							this.x++;
							if( this.x > max) {
								this.x = max;
							}
							break;
						}
						this.x--;
			}
		}
		else if( destination == "text-start" ) {
			var c = "DC";
			while( this.x> this.ax0 && c != " ") {
						this.x--;
						c = this.cellel[ this.y ][ this.x ].txt;
			}
		}

		this._int_flush();
	}

	cursorMove( dir ) {
		if( dir == "up" ) {
			if( this.y>this.ay0) {
				this.y--;
			}
		}
		else if( dir == "down" ) {
			if( this.y< ((this.ay0 + this.arows)-1)) {
				this.y++;
			}
			else if( this.y== ((this.ay0 + this.arows)-1)) {
				this.__int_scrollDown();
				this._int_addChangeAll();
			}
		}
		if( dir == "left" ) {
			if( this.x>this.ax0) {
				this.x--;
			}
		}
		else if( dir == "right" ) {
			if( this.x< ((this.ax0 + this.acols)-1)) {
				this.x++;
			}
		}
		this._int_flush();
	}

	backspace() {
		if( this.x != this.ax0 ) {
				this.x--;
		}

		this.__int_scrollLineLeftFrom( this.x, this.y );

		var area = this._int_getArea( this.x, this.y, this.cols-1, this.y, );
		this._int_addChange( area );
		this._int_flush();
	}

	delete() {

		this.__int_scrollLineLeftFrom( this.x, this.y );

		var area = this._int_getArea( this.x, this.y, this.cols-1, this.y, );
		this._int_addChange( area );
		this._int_flush();
	}

	nl() {

			this.x = this.ax0;
			this.y ++;
			var ya = this.y - this.ay0;

			if( ya >= this.arows ) {

				this.__int_scrollDown();
				this.y = this.ay0 + (this.arows -1);

				this._int_flushAll();
				return;
			}

			this._int_flush();

	}

	__int_nl() {
			this.x = this.ax0;
			this.y ++;
			var ya = this.y - this.ay0;
			if( ya >= this.arows ) {
				this.__int_scrollDown();
				this.y = this.ay0 + (this.arows -1);
				return { scroll: true }
			}
			return { scroll: false }

	}

	writeln( str ) {

			for( var i=0; i<str.length; i++) {
				var c = str.substr(i,1);
				this.__int_write_direct_ch( c );
			}
			var stat = this.__int_nl();
			if( stat.scroll ) {
					this._int_addChangeAll();
			}
			this._int_flush();
	}

	_int_write( str, insert ) {
		for (const c of str) {
			this.__int_write_direct_ch( c, insert );
		}
	}

	write( str ) {
			this._int_write( str );

			this._int_flush();
	}


	insert( str ) {
			this._int_write( str, true );

			this._int_flush();
	}




	__int_scrollLinesDownFrom( y  ) {

			for( var yy=this.rows-1; yy>y; yy-- ) {
				for( var xx=0; xx<this.cols; xx++ ) {

					var cell1 = this.cellel[ yy-1  ][ xx ];
					var cell2 = this.cellel[ yy  ]  [ xx];

					cell2.fg = cell1.fg;
					cell2.bg = cell1.bg;
					cell2.txt = cell1.txt;

				}
			}

			for( var xx=0; xx<this.cols; xx++ ) {

				var cell1 = this.cellel[ yy  ][ xx ];

				cell1.txt = " ";

			}

			this._int_addChangeAll();

	}


	ScrollDownByCurrentLine() {

		if( (this.y ) < (this.rows-1) ) {
			this.__int_scrollLinesDownFrom( this.y );
			this._int_flush();
		}
	}

	__int_scrollLineRightFrom( x0, y  ) {

		var x = x0;
		var x1 = this.ax0 + this.acols - 1;

		if( x0 == x1 ) {
			return;
		}

		for( var i=x1; i>x0; i--) {
			var cell1 = this.cellel[ y  ][ i-1 ];
			var cell2 = this.cellel[ y  ][ i ];

			cell2.fg = cell1.fg;
			cell2.bg = cell1.bg;
			cell2.txt = cell1.txt;
		}
	}

	__int_scrollLineLeftFrom( x0, y  ) {

		var x = x0;
		var x1 = this.ax0 + this.acols - 1;

		if( x0 == x1 ) {
			return;
		}

		for( var i=x0; i<x1; i++) {
			var cell1 = this.cellel[ y  ][ i +1 ];
			var cell2 = this.cellel[ y  ][ i ];

			cell2.fg = cell1.fg;
			cell2.bg = cell1.bg;
			cell2.txt = cell1.txt;
		}


	}

	__int_write_direct_ch( ch, insert ) {

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

		var area;

		if( insert ) {
			this.__int_scrollLineRightFrom( this.x, this.y );

			area = this._int_getArea( this.x, this.y, this.ax0 + this.acols-1, this.y );
			this._int_addChange( area );

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
		var ax = this.x - this.ax0;
		if( ax > (this.acols-1) ) {
			this.x = this.ax0;
			var stat = this.__int_nl();
			if( stat.scroll ) {
				this._int_addChangeAll();
				return;
			}
		}

		area = this._int_getArea( oldx, oldy, oldx, oldy );
		this._int_addChange( area );
		//this._int_addChangeAll();

	}

	writec( chr ) {

		if( chr == "\n" ) {
			var stat = this.__int_nl();
			if( stat.scroll ) {
					this._int_addChangeAll();
			}

			return;
		}
		this.__int_write_direct_ch( chr );
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
			this.sys.post( "border", { d: data }  );
		}
		else if( chr == 24 ) {  //CANCEL -> (we map it to) Clear Screen
			this.clear();
		}
		else if( chr == 12 ) {  //FORMFEED -> (we map it to) RESET SCREEN
			this.reset();
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


	setPos( x, y ) {

		this._int_setPos( x,y );

		this._int_flush();
	}

	setCursorMode( mode ) {
		this.cursorMode = mode;
		this._int_flush();
	}

	setCursorPos( x, y ) {
		if( x<0 || y<0 ) { throw "pos("+x+","+y+") < 0" ; }

		if( x>=this.acols || y>= this.arows ) { throw "pos("+x+","+y+") > max" ; }

		this.x = x + this.ax0;
		this.y = y + this.ay0;

		this._int_flush();
	}

	getCursorPos() {
			return [this.x - this.ax0, this.y - this.ay0 ];
	}

	control( chr, data ) {

		this._int_control( chr, data );
		this._int_flush();

	}


	_int_setPos( x, y ) {

		if(x >= 0) {
				this.x = x + this.ax0;
		}
		if(y >= 0) {
				this.y = y + this.ay0;
		}

		if( this.x >= this.acols ) { this.x = this.acols-1;}
		if( this.y >= this.arows ) { this.y = this.arows-1;}
	}

	center( str ) {

			if( str.length > this.cols ) {
				return;
			}

			var l = str.length;
			var l2 = l/2;

			var wh = [ this.acols, this.arows ];

			var x = Math.floor( (wh[0] / 2)-l2 );
			this._int_setPos( x, -1 );
			this._int_write( str );
			this.__int_nl();

			var area = this._int_getArea( this.ax0, this.y, this.acols-1, this.y );
			this._int_addChange( area );
			this._int_flush();

	}

	__int_scrollDown() {

		var ax0 = this.ax0;
		var ay0 = this.ay0;

		for( var ax=0; ax<this.acols; ax++) {

			var x = ax + ax0;
			for( var ay=0; ay<this.arows-1; ay++) {

				var y = ay + ay0;

				var cell = this.cellel[ y ][ x ];
				var cellyp1 = this.cellel[ y+1 ][ x ];

				cell.txt = cellyp1.txt;
				cell.fg = cellyp1.fg;
				cell.bg = cellyp1.bg;
			}
		}

		//fill last row
		var y2 = ay0 + (this.arows-1);
		for( var ax=0; ax<this.acols; ax++) {

			var x = ax + ax0;

			var cell = this.cellel[ y2 ][ x ];
			cell.txt = " ";
			if( !this.reverse  ) {
				cell.fg = this.colors.txtColor;
				cell.bg = this.colors.txtBgColor;
			}
			else {
				cell.fg = this.colors.txtBgColor;
				cell.bg = this.colors.txtColor;
			}
		}

	}
}
