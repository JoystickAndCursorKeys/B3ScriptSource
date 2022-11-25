class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.cols = 80;
		this.rows = 30;
		this.x = 0;
		this.y = 0;
		this.hidden = false;
	}


	init() {

			var sys = this.sys;
			var msgs = sys.init.queuedMessages;
			var conMode = sys.init.conMode;
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

			this.outColors ={};
			this.outColors.txtBgColor="#000000";
			this.outColors.txtColor="#ffff00";
			this.outColors.pageBgColor = "#333333";
			this.fontSize = "18px";
			this.fontFamily = "monospace";

			if( conMode )  {
				var tmp = conMode.split(":");

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
						this.outColors.pageBgColor = tmp[ix];
					}
				} ix++;


				if( tmp.length>ix) {
					if( tmp[ix] != "" ) {
						this.outColors.txtBgColor = tmp[ix];
					}
				} ix++;

				if( tmp.length>ix) {
					if( tmp[ix] != "" ) {
						this.outColors.txtColor = tmp[ix];
					}
				} ix++;

			}

			this.table =  this.outEl;
			this.table.style.borderCollapse = "collapse";
			this.table.style.borderSpacing = 0;

			this.table.style.color = this.outColors.txtColor;
			this.table.style.backgroundColor = this.outColors.txtBgColor;
		//this.table.style.width = "100%";
			//this.table.style.height = "100%";
			this.table.style.resize = "none";
			this.table.style.fontFamily = this.fontFamily;
			this.table.style.fontSize = this.fontSize;
			this.table.readOnly = true;
			//this.table.className = "outputCon";

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
					td.style.padding = "0px";
					td.innerHTML = "&nbsp;";
					rowArray.push( td );
					tr.appendChild( td );
				}
				this.cellel.push( rowArray );
			}


			document.body.style.backgroundColor = this.outColors.pageBgColor;

			document.body.appendChild( this.outDiv0 );


			this.outDiv0.style.width = "100%";
			this.outDiv0.style.display = "table";
			this.outDiv0.style.height = "100%";
			this.outDiv0.style.position = "absolute";
			this.outDiv0.style.zIndex = "10000";
			this.outDiv0.style.backgroundColor = "#ff3333";
			this.outDiv0.style.justifyContent = "center";

			this.outDiv1.style.width = "100%";
			//this.outDiv1.style.height = "600px";
			this.outDiv1.style.display = "table-cell";
			this.outDiv1.style.verticalAlign = "middle";
			//this.outDiv0.style.float = "center";
			//this.outDiv1.style.verticalAlign = "middle";
			this.outDiv1.style.backgroundColor = "#0033ff";
			this.outDiv1.style.marginLeft = "auto";
			this.outDiv1.style.marginRight = "auto";
			//this.outDiv1.style.position = "absolute";
			//this.outDiv1.style.top = "50%";
			//this.outDiv1.style.left = "50%";
			//this.outDiv1.style.transform = "translate(-50%, 0%)";
			//this.outDiv1.style.backgroundColor = "#0033ff";

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

	control( chr ) {
		this.blinkOf();
		this.show();

		if( chr == 24 ) {  //CANCEL -> (we map it to) Clear Screen
			this.clear();
		}
		else if( chr == 25 ) {  //End of Medium -> (we map it to) Hide
			this.hide();
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
			}
		}

		var y2 = this.rows-1;
		for( var x=0; x<this.cols; x++) {
			var cell = this.cellel[ y2 ][ x ];
			cell.innerHTML = "&nbsp;";
		}

	}

}

export { KERNALMODULE as default};
