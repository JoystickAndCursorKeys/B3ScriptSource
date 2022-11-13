class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;

	}



	init() { //textArea, width, height,  colors ) {


			var msgs = sys.init.queuedMessages;

			this.outDiv0 = document.createElement("div");
			this.outDiv1 = document.createElement("div");

			this.outEl = document.createElement("textarea");
			this.outEl.value = "";

			this.outColors ={};
			this.outColors.txtBgColor="#000000";
			this.outColors.txtColor="#ffff00";
			this.outColors.cursorColor="#00ff00";
			 var colors = this.outColors;


			this.textArea =  this.outEl;
			this.textArea.style.color = colors.txtColor;
			this.textArea.style.backgroundColor = colors.txtBgColor;
			this.textArea.style.width = "100%";
			this.textArea.style.height = "100%";
			this.textArea.style.resize = "none";
			this.textArea.style.fontFamily = "monospace";
			this.textArea.style.fontSize = "20px";
			this.textArea.readOnly = true;
			//this.textArea.className = "outputCon";

			document.body.style.backgroundColor = "#333333";

			document.body.appendChild( this.outDiv0 );
			this.outDiv0.appendChild( this.outDiv1 );
			this.outDiv1.appendChild( this.outEl );

			this.outEl.focus( );

			this.outDiv0.style.width = "100%";
			this.outDiv0.style.height = "100%";
			this.outDiv0.style.position = "relative";

			this.outDiv1.style.width = "800px";
			this.outDiv1.style.height = "600px";
			this.outDiv1.style.margin = "0";
			this.outDiv1.style.position = "absolute";
			this.outDiv1.style.top = "35%";
			this.outDiv1.style.left = "50%";
			this.outDiv1.style.transform = "translate(-50%, 35%)";

			 this.colors = this.outColors;

			 this.dirty = true;
			 this.dirtyFlags = {
				 bg: true,
				 color: true,
				 cursorColor: true
			 }

				 var _this = this;
				 setInterval(function()  {
				 	_this.blink();
				}, 500);

				for( var i=0; i<msgs.length; i++) {
					this.writeln( msgs[ i ]);
				}


			 this.sys.log("TA-OUT Ready.");
	}


	getElement() {
		return this.textArea;
	}


	blinkOf() {

		if( !this.cursorOn ) {
			return;
		}

		this.cursorOn = false;

		this.textArea.value =
				this.textArea.value.substr(0,this.textArea.value.length-1);

	}

	blink() {

		//return;
		var ta = this.textArea;
		var ss = ta.selectionStart;
		var se = ta.selectionEnd;

		if( ss != se ) { return;}
		this.cursorOn = !this.cursorOn;

		if( this.cursorOn ) {
			this.textArea.value += "█";
			//e2 96 88 for cursor symbol
		}
		else {
			this.textArea.value =
				this.textArea.value.substr(0,this.textArea.value.length-1);
		}
	}

	clear() {
		this.blinkOf();

		this.textArea.value = "";
	}


	nl() {
			this.blinkOf();
			this.textArea.value += "\n";

			this.__int_scrollDown();
	}

	writeln( str ) {
			this.blinkOf();

			this.textArea.value += str;
			this.nl();

			this.__int_scrollDown();
	}

	write( str ) {
			this.blinkOf();
			this.textArea.value += str;

			this.__int_scrollDown();
	}

	writec( chr ) {
		this.blinkOf();
		this.textArea.value += chr;

		this.__int_scrollDown();
	}

	control( chr ) {
		this.blinkOf();
		this.textArea.value += chr;

		if( chr == 24 ) {  //CANCEL -> (we map it to) Clear Screen
			this.textArea.value = "";
		}
	}

	__int_scrollDown() {
		var textarea = this.textArea;
		textarea.scrollTop = textarea.scrollHeight;
	}
}

export { KERNALMODULE as default};
