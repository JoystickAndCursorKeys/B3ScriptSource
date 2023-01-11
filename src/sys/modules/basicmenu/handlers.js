class HANDLERS {

	constructor( menuSys ) {
		this.menuSys = menuSys;
		this.sys = this.menuSys.sys;

	}

	setBasic() {
		this.basic = this.sys.m.basic;
	}

	doExposedAction( id, data ) {

		if( id == "paste" ) {
			if( !navigator.clipboard.readText ) {
				this.handler_pasteBox( data );
			}
			else {
				this.handler_pasteFromClip( data );
			}
		}
	}

	handler_pasteBox( type ) {

		this.menuSys.pastebox.style.display = "block";
		this.menuSys.pasteArea.value = this.menuSys.defaultPasteText;

		this.oldInnerText = this.menuSys.pasteArea.innerText;

		this.input = this.sys.input;
    this.input.unsetInputHandler();

		this.menuSys.clearMenu();
		this.menuSys.hideMenu();

		this.menuSys.pasteArea.style.color = this.menuSys.color;
		this.menuSys.pasteArea.style.backgroundColor = this.menuSys.bgColor;

		this.menuSys.pasteArea.focus();
		this.menuSys.pasteArea.select();

		this.sys.out.hideInner();

		var __this = this;

		this.pasteHandler = function ( e ) {
			setTimeout(__this.pasteHandler2 , 10 );
		}

		this.pasteHandler2 = function( e ) {
			__this.sys.out.showInner();
			__this.menuSys.unhideMenu();
			__this.basic.setInput( __this.sys.input );
			__this.menuSys.pasteArea.removeEventListener( "paste", __this.pasteHandler );
			__this.menuSys.pastebox.style.display = "none";
			if( __this.oldInnerText != __this.menuSys.pasteArea.value ) {
				__this.basic.pasteTextFromClipboard( __this.menuSys.pasteArea.value, type );
			}

		}

		this.menuSys.pasteArea.addEventListener("paste", this.pasteHandler);
		//this.menuSys.pasteArea.addEventListener("paste", this.pasteHandler);
	}


	handler_pasteFromClip( type ) {
		var __this = this;

		if( !navigator.clipboard.readText ) {
			alert("Clipboard reading is disabled in your browser\nYou have to enable it to make this feature work.");
		}

		navigator.clipboard.readText().then(
			(clipText) => {
				__this.basic.pasteTextFromClipboard( clipText, type );
			} );

	}

}

export { HANDLERS as default};
