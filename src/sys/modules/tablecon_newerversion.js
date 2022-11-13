class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.cols = 80;
		this.rows = 30;
		this.x = 0;
		this.y = 0;
		this.hidden = false;

		this.outColors ={};

		this.fontSize = "18px";
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
	}


	init() {

			var sys = this.sys;
			var msgs = sys.init.queuedMessages;
			var conStyle = sys.init.conStyle;
			var displayMode = sys.init.displayMode;

			sys.init.inputElement = document.body;

			this.outDiv0 = document.createElement("div");
			this.outDiv1 = document.createElement("div");

			this.outEl = document.createElement("table");
			this.outEl.value = "";

			function getHTMLOfSelection () {
			  var range;
			  if (document.selection && document.selection.createRange) {
			    range = document.selection.createRange();
			    return range.htmlText;
			  }
			  else if (window.getSelection) {
			    var selection = window.getSelection();
			    if (selection.rangeCount > 0) {
			      range = selection.getRangeAt(0);
			      var clonedSelection = range.cloneContents();
			      var div = document.createElement('div');
			      div.appendChild(clonedSelection);
			      return div.innerHTML;
			    }
			    else {
			      return '';
			    }
			  }
			  else {
			    return '';
			  }
			}

			this.outEl.addEventListener('copy', (event) => {

				var sel = getHTMLOfSelection();

				console.log("an selection", sel)
				console.log("an event", event)

			});

			if( displayMode )  {
				if( displayMode != "default" ) {
					var tmp = displayMode.split("x");
					if( tmp.length == 2) {
						this.rows = parseInt( tmp[1] );
						this.cols = parseInt( tmp[0] );
					}
				}
			}

			this.colsPercentage = (1/this.cols) * 100;

			if( conStyle )  {
				var tmp = conStyle.split(":");

				var ix = 0;
				if( tmp.length>ix) {
					if( tmp[ix] != "" ) {
						this.fontSize = tmp[ix];
					}
				} ix++;

				if( tmp.length>ix) {
					if( tmp[ix] != "" ) {
						this.fontFamily = tmp[ix];
					}
				} ix++;


				if( tmp.length>ix) {
					if( tmp[ix] != "" ) {
						this.outColors.txtBgColor = this.colors[ parseInt( tmp[ix] ) ];
					}
				} ix++;

				if( tmp.length>ix) {
					if( tmp[ix] != "" ) {
						this.outColors.txtColor = this.colors[ parseInt( tmp[ix] ) ];
					}
				} ix++;

			}

			this.table =  this.outEl;
			this.table.style.borderCollapse = "collapse";
			this.table.style.borderSpacing = 0;
			this.table.style.backgroundColor = this.outColors.txtBgColor;

			this.table.style.resize = "none";
			this.table.style.fontFamily = this.fontFamily;
			this.table.style.fontSize = this.fontSize;
			this.table.style.tableLayout = "fixed";
			this.table.readOnly = true;

			this.rowel = [];
			this.cellel = [];

			for( var y=0; y<this.rows; y++) {
				var tr =  document.createElement("tr");
				tr.style.padding = "0px";

				this.rowel.push( tr );
				this.outEl.appendChild( tr );
				var rowArray = [];
				for( var x=0; x<this.cols; x++) {
					var td =  document.createElement("td");
					td.style.width = this.colsPercentage + "%";
					//td.style.overflow = "hidden";
					//console.log( td.style.width );
					td.style.padding = "0px";
					td.style.color = this.outColors.txtColor;
					td.style.backgroundColor = undefined;
					td.style.textOverflow = "";
					td.style.whiteSpace= "nowrap";
					td.style.overflow = "hidden";
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
				 setInterval(function()  {
				 	_this.blink();
				}, 500);

				for( var i=0; i<msgs.length; i++) {
					this.writeln( msgs[ i ]);
				}


			 this.sys.log("TBCON Ready.");
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


	blinkOf() {

		if( !this.cursorOn ) {
			return;
		}

		this.cursorOn = false;

		var cell = this.cellel[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		cell.innerHTML = "";

	}

	blink() {

		var cell = this.cellel[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		this.cursorOn = !this.cursorOn;

		if( this.cursorOn ) {
			cell.innerHTML = "█";
		}
		else {
			cell.innerHTML = "";
		}
	}

	clear() {
		this.blinkOf();
		this.show();

		for( var x=0; x<this.cols; x++) {
			for( var y=0; y<this.rows; y++) {
				var cell = this.cellel[ y ][ x ];
				cell.innerHTML = "&nbsp;";

			}
		}

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

			for( var i=0; i<str.length; i++) {
				var c = str.substr(i,1);
				this.__int_write_direct_ch( c );
			}
			this.__int_nl();
	}

	write( str ) {
			this.blinkOf();
			this.show();

			for( var i=0; i<str.length; i++) {
				var c = str.substr(i,1);
				this.__int_write_direct_ch( c );
			}

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



	writec( chr ) {
		this.blinkOf();
		this.show();

		if( chr == "\n" ) {
			this.__int_nl();
			return;
		}
		this.__int_write_direct_ch( chr );

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
				var cell = this.cellel[ y ][ x ];
				var cellyp1 = this.cellel[ y+1 ][ x ];

				cell.innerHTML = cellyp1.innerHTML;
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
