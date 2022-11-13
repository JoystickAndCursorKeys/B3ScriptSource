class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.cols = 80;
		this.rows = 30;
		this.x = 0;
		this.y = 0;
		this.hidden = false;
		this.blinking = true;

		this.outColors ={};

		this.fontSizeInt = 18;
		this.fontSizeCSS = this.fontSizeInt + "px";
		this.fontFamily = "monospace";
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

		this.outColors.txtBgColor= this.colors[0];
		this.outColors.txtColor = this.colors[5];

		this.initialized = false;
	}


	destroy() {
			this.outDiv0.remove();
			this.cvs = null;
			this.cvs2 = null;
			this.ctx = null;
			this.ctx2 = null;

			this.rowel = undefined;
			this.cellel = undefined;

			if( this.blinkInterval ) {
				clearInterval ( this.blinkInterval );
				this.blinkInterval = undefined;
			}

			this.initialized = false;
		}

		init() {
		}

		getColumCount() {
			return this.cols;
		}

		getRowCount() {
			return this.rows;
		}

		getDimensions() {
				return [this.cols, this.rows ];
		}

		initMode( m ) {

			var sys = this.sys;
			var msgs = sys.init.queuedMessages;

			sys.init.inputElement = document.body;

			this.x = 0;
			this.y = 0;
			this.blinking = true;

			var tmp = m[0].split("x");
			if( tmp.length == 2) {
				this.rows = parseInt( tmp[1] );
				this.cols = parseInt( tmp[0] );
			}
			else {
				return;
			}

			tmp = m[1].split("=");
			if( tmp.length == 2) {

				this.fontSizeInt = parseInt( tmp[1] );
				this.fontSizeCSS = this.fontSizeInt + "px";
			}
			else {
				return;
			}

			this.colsPercentage = (1/this.cols) * 100;
			this.outColors.txtBgColor = this.colors[ 4 ];
			this.outColors.txtColor = this.colors[ 1 ];

			/* Build DOM */

			this.outDiv0 = document.createElement("div");
			this.outDiv1 = document.createElement("div");

			this.outEl = document.createElement("table");
			this.outEl.value = "";

			function getTextOfSelection () {
			  var range;
			  if (document.selection && document.selection.createRange) {
			    range = document.selection.createRange();
			    return range.toString();
			  }
			  else if (window.getSelection) {
			    var selection = window.getSelection();
			    if (selection.rangeCount > 0) {
			      range = selection.getRangeAt(0);
						const documentFragment = range.cloneContents();

						var rows = documentFragment.childNodes;
						var text = "";
						for( var rix=0; rix< rows.length ; rix++ ) {
							var r = rows[rix];
							if( text != "" ) {
								text += "\n";
							}

							var cols = r.childNodes;
							for( var cix=0; cix< cols.length ; cix++ ) {
								var c = cols[cix];
								text += c.firstChild.data;
							}

						}
						return text;
			    }
			    else {
			      return '';
			    }
			  }
			  else {
			    return '';
			  }
			}

			var __this = this;

			this.outDiv0.addEventListener('copy', (event) => {

				var sel = getTextOfSelection();

				event.clipboardData.setData("text/plain", sel );
			  event.preventDefault();

			});

			this.table =  this.outEl;
			this.table.style.borderCollapse = "collapse";
			this.table.style.borderSpacing = 0;
			this.table.style.backgroundColor = this.outColors.txtBgColor;

			this.table.style.resize = "none";
			this.table.style.fontFamily = this.fontFamily;
			this.table.style.fontSize = this.fontSizeCSS;
			this.table.style.tableLayout = "fixed";
			this.table.readOnly = true;
			this.table.textAlign = "center";

			this.rowel = [];
			this.cellel = [];

			for( var y=0; y<this.rows; y++) {
				var tr =  document.createElement("tr");
				tr.style.padding = "0px";
				tr.style.maxHeight = this.fontSizeInt;
				tr.style.height = this.fontSizeInt;

				this.rowel.push( tr );
				this.outEl.appendChild( tr );
				var rowArray = [];
				for( var x=0; x<this.cols; x++) {
					var td =  document.createElement("td");
					//td.style.width = this.colsPercentage + "%";
					//td.style.overflow = "hidden";
					//console.log( td.style.width );
					td.style.padding = "0px";
					td.style.color = this.outColors.txtColor;
					td.style.backgroundColor = undefined;
					td.style.textOverflow = "";
					td.style.whiteSpace= "nowrap";
					td.style.overflow = "hidden";
					td.style.maxWidth = this.fontSizeInt;
					td.style.maxHeight = this.fontSizeInt;
					//td.style.width = this.fontSize;
					td.style.height = this.fontSizeInt;

					td.innerHTML = "&nbsp;";

					rowArray.push( td );
					tr.appendChild( td );
				}
				this.cellel.push( rowArray );
			}


			document.body.appendChild( this.outDiv0 );

			this.outDiv0.style.display = "table";
			this.outDiv0.style.width = "99%";
			this.outDiv0.style.height = "99%";
			this.outDiv0.style.position = "absolute";
			this.outDiv0.style.zIndex = "10000";

			this.outDiv1.style.display = "table-cell";
			this.outDiv1.style.verticalAlign = "middle";

			this.table.style.marginLeft = "auto";
			this.table.style.marginRight = "auto";

			this.outDiv0.appendChild( this.outDiv1 );
			this.outDiv1.appendChild( this.outEl );

			this.outEl.focus( );

			 this.dirty = true;
			 this.dirtyFlags = {
				 bg: true,
				 color: true
			 }

			var _this = this;
			this.blinkInterval = 	 setInterval(function()  {
				 	_this._int_blink();
				}, 500);

				for( var i=0; i<msgs.length; i++) {
					this.writeln( msgs[ i ]);
				}

			 this.sys.log("TBCON Ready.");
	}

	blinkMode( mode ) {
		this.blinking = mode;
	}

	_int_updateArea( srccells, x0, y0, x1, y1 ) {


		for( var x=x0; x<=x1; x++) {
			for( var y=y0; y<=y1; y++) {
				var cell = this.cellel[ y ][ x ];
				var src = srccells[ y-y0 ][ x-x0 ];

				if( src.txt == " ") {
						cell.innerHTML = "&nbsp;";
				}
				else {
						cell.textContent = src.txt;
				}
				cell.style.color =  this.colors[ src.fg ];
				cell.style.backgroundColor = this.colors[ src.bg ];

			}
		}

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

		this.outColors.txtBgColor= this.colors[ p.bg ];
		this.outColors.txtColor = this.colors[ 	p.fg];

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
		this.outColors.txtBgColor= this.colors[ p.bg ];
		this.outColors.txtColor = this.colors[ 	p.fg];

		this._int_updateArea( srccells, 0,0, this.cols -1, this.rows -1 );

	}


	hide() {
		if( !this.hidden ) {
			this.outDiv0.hidden = true;
			this.hidden = true;
		}
	}

	show() {
		if( this.hidden ) {
			this.outDiv0.hidden = false;
			this.hidden = false;
		}
	}


	getElement() {
		return null;
	}


	_int_blinkOff() {

		if( !this.cursorOn ) {
			return;
		}

		this.cursorOn = false;

		var cell = this.cellel[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		cell.style.color = this.outColors.txtColor;
		cell.style.backgroundColor = this.outColors.txtBgColor;


	}

	_int_blink() {

		if( ! this.blinking ) {
			return;
		}

		var cell;
		try {
				cell = this.cellel[ this.y ][ this.x ];
		}
		catch {
			cell = null;
		}

		if( cell == null ) {
			console.log( "Blink exception: Cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		this.cursorOn = !this.cursorOn;

		if( !this.cursorOn ) {
			cell.style.color = this.outColors.txtColor;
			cell.style.backgroundColor = this.outColors.txtBgColor;
		}
		else {
			cell.style.backgroundColor = this.outColors.txtColor;
			cell.style.color = this.outColors.txtBgColor;
		}
	}

	clear() {
		this._int_blinkOff();
		this.show();

		for( var x=0; x<this.cols; x++) {
			for( var y=0; y<this.rows; y++) {
				var cell = this.cellel[ y ][ x ];
				cell.innerHTML = "&nbsp;";
				cell.style.color = this.outColors.txtColor;
				cell.style.backgroundColor = this.outColors.txtBgColor;

			}
		}

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
			console.log( "writeln" + str );

			for( var i=0; i<str.length; i++) {
				var c = str.substr(i,1);
				this.__int_write_direct_ch( c );
			}
			this.__int_nl();
	}


	__int_write_direct_ch( ch ) {

		var cell = this.cellel[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		if( ch == " ") {
				cell.innerHTML = "&nbsp";
		}
		else {
			cell.innerHTML = ch;
		}

		if( !this.reverse  ) {
			cell.style.color = this.outColors.txtColor;
			cell.style.backgroundColor = undefined;
		}
		else {
			cell.style.backgroundColor = this.outColors.txtColor;
			cell.style.color = this.outColors.txtBgColor;
		}

		this.x++;
		if( this.x >= this.cols ) {
			this.x = 0;
			this.__int_nl();
		}
	}



	__int_scrollDown() {
		for( var x=0; x<this.cols; x++) {
			for( var y=0; y<this.rows-1; y++) {
				var cell = this.cellel[ y ][ x ];
				var cellyp1 = this.cellel[ y+1 ][ x ];

				cell.textContent = cellyp1.textContent;
				cell.style.color = cellyp1.style.color;
				cell.style.backgroundColor = cellyp1.style.backgroundColor;


			}
		}

		var y2 = this.rows-1;
		for( var x=0; x<this.cols; x++) {
			var cell = this.cellel[ y2 ][ x ];
			cell.innerHTML = "&nbsp;";
			if( !this.reverse  ) {
				cell.style.color = this.outColors.txtColor;
				cell.style.backgroundColor = undefined;
			}
			else {
				cell.style.backgroundColor = this.outColors.txtColor;
				cell.style.color = "rgba(0,255,0,0.0)";
			}
		}
	}
}

export { KERNALMODULE as default};
