import  menuData   from        './menudata.js';
import  menuHandlers   from        './handlers.js';

class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;

		this.defaultPasteText = "Press CTRL-V here";

		this.options = new menuData().getOptions();
		this.handlers = new menuHandlers( this );
    this.menus = {};
		this.statusWidgets = {};
		this.status = {
			pgmLen: 0,
			status: "stopped",
			varLen: 0,
			displayMode: 0
		}

		this.mnuBttnOptContainers = [];
		this.mnuBttnOptContainersTgl = [];
		this.mnuBttns = [];
		this.mnuBttnContainers = [];
		this.mnuLinks = [];

		this.color = "#ffffff";
		this.bgColor = "#000000";
		this.font = "16px arial,serif";

		this.statusTopMargin = "4px";
		this.statusColor = "#eeffff";
		this.statusBgColor = "#000000";
		this.statusFont = "700 14px arial,serif";

		this.cnt = 0;
	}

	destroy() {

		var f = this.getOnClickMenuButtonFunc();
		var tmp = 1;

		for( var i=0; i<this.mnuBttns.length ; i++ ) {
			var b = this.mnuBttns[i];
			b.dataset.i = i;

			var optLst = this.mnuBttnOptContainers[i];

			var f = this.getOnClickMenuButtonFunc();
			b.removeEventListener( "click", f );

			var ll = this.mnuLinks[i];

			for( var k=0; k<ll.length ; k++ ) {
				var lnk = ll[ k ];
				lnk.dataset.i = i;
				lnk.removeEventListener( "click", this.getClickLinkFunc() );
				lnk.removeEventListener( "mouseover", this.getOnOverLinkFunc() );
			}
		}
		this.element = null;
	}


	init() {
		this.handlers.setBasic();
		this.basic = this.sys.m.basic;
	}

	showMenu( flag ) {
		if( flag ) {
			this.element.style.display = "flex";
		}
		else {
			this.element.style.display = "none";
		}
	}

	button( parent, id, text, menuOptions ) {

		var div0 = document.createElement("div");
		var buttn0 = document.createElement("button");
		var div1 = document.createElement("div");

		div0.appendChild( buttn0 );
		div0.appendChild( div1 );

		div0.id = "menu_buttnparent_" + id;
		//div0.style.float = "left";
		buttn0.innerHTML = text;
		buttn0.id = "menu_buttn_" + id;
		buttn0.style.backgroundColor = this.bgColor;
		buttn0.style.color = this.color;
		buttn0.style.font = this.font;
		buttn0.style.marginLeft = "2px";
		buttn0.style.marginRight = "0px";
		buttn0.style.borderTop = "0px #ccc solid";
		buttn0.style.borderBottom = "0px #ccc solid";
		buttn0.style.borderLeft = "0px #777 solid";
		buttn0.style.borderRight = "0px #777 solid";

		div1.id = "menu_opts_buttn_" + id;

		div1.style.display = "none";
		div1.style.marginLeft = "2px";
		div1.style.position = "absolute";
		div1.style.minWidth = "260px";
		div1.style.zIndex = "1";
		div1.style.backgroundColor = this.bgColor;
		div1.style.color = this.color;
		div1.style.borderTop = "1px #ccc solid";
		div1.style.borderBottom = "1px #ccc solid";
		div1.style.borderLeft = "1px #777 solid";
		div1.style.borderRight = "1px #777 solid";

		this.mnuBttns.push( buttn0 );
		this.mnuBttnContainers.push( div0 );
		this.mnuBttnOptContainers.push( div1 );
		this.mnuBttnOptContainersTgl.push( { active: false } );
		var lnks = [];

		if(  menuOptions ) {
			for( var i=0; i<menuOptions.length; i++) {
				var o = menuOptions[ i ];

				var lnk = document.createElement("a");
				lnk.innerHTML = o.display;
				lnk.style.padding = "12px 16px";
				lnk.style.display = "block";
				lnk.style.font = this.font;
				lnk.dataset.action = o.opt;
				if( o.data ) {
					lnk.dataset.data = JSON.stringify( o.data );
				}
				lnks.push( lnk );
				div1.appendChild( lnk );
			}
		}

		this.mnuLinks.push( lnks );

		div0.style.display = "inline-block";
		div0.style.position = "relative";
		//div0.style.marginTop = "12px";

		parent.appendChild( div0 );

	}

	doAction( id, data ) {
		this.showMenu( true );
		this.handlers.doExposedAction( id, data );
	}

	statusItem( parent, text ) {


		var div0 = document.createElement("div");
		div0.innerText = text;
		if( text == "" ) {
			div0.style.width = "10px";
		}
		else if( text == " " ) {
			div0.style.width = "50px";
		}

		div0.style.marginTop= this.statusTopMargin;
		div0.style.color = this.statusColor;
		div0.style.backgroundColor = this.statusBgColor;
		div0.style.font = this.statusFont;
		parent.appendChild( div0 );

		this.statusWidgets.list.push( div0 );
		return div0;

	}

	statusItems( parent ) {


		this.statusWidgets.list = [];

		this.statusItem( parent, " ");
		this.statusWidgets.displayMode = this.statusItem( parent, "MODE: " + this.status.displayMode );
		this.statusItem( parent, "");
		this.statusWidgets.fs = this.statusItem( parent, "FS: " + this.sys.fs.getCurrent()  );
		this.statusItem( parent, "");
		this.statusWidgets.pgmLen = this.statusItem( parent, "LINES: " + this.status.pgmLen );
		this.statusItem( parent, "");
		this.statusWidgets.varLen = this.statusItem( parent, "VARCOUNT: " + this.status.varLen );
		this.statusItem( parent, "");
		this.statusWidgets.interpreterStatus = this.statusItem( parent, "STATUS: " + this.status.status );

	}


	setStatus( status ) {

		this.statusWidgets.fs.innerText = "FS: " + this.sys.fs.getCurrent() ;

		if( status ) {
			this.status = status;
			this.statusWidgets.interpreterStatus.innerText = "STATUS: " + this.status.status;
			this.statusWidgets.pgmLen.innerText = "LINES: " + this.status.pgmLen;
			this.statusWidgets.varLen.innerText = "VARCOUNT: " + this.status.varLen;
			this.statusWidgets.displayMode.innerText = "MODE: " + this.status.displayMode;



		}

	}


	buttons( parent ) {

		var mainOptions = this.options["main"]
		for( var i=0; i<mainOptions.length ; i++ ) {
			var o = mainOptions[i];

			this.button( parent, i, o.display, this.options[ o.opt ]  );
		}
	}


	onDeselect() {
		if( this.element.style.display != "none" ) {
			this.clearMenu();
		}
	}

	styleButtons( buttonTable ) {
		buttonTable.style.backgroundColor = "black";
		buttonTable.style.color = "white";
		buttonTable.style.width = "100%";

	}

	create() {
		this.element = document.createElement("div");
		this.element.style.marginLeft = "auto";
		this.element.style.marginRight = "auto";
		this.element.style.display = "none";
		this.element.style.backgroundColor = this.statusBgColor;
		this.element.style.paddingBottom = "5px";
		this.element.style.paddingTop = "5px";

		this.buttons( this.element );

		this.statusItems( this.element );

		var paste = document.createElement("div");
		this.pastebox = paste;
		paste.style.display = "none";
		paste.style.width = "100%";

		var ta = document.createElement("textarea");
		this.pasteArea = ta;
		ta.style.width = "100%";
		ta.style.height = "200px";
		this.element.appendChild( paste );
		paste.appendChild( ta );

		//this.styleButtons( this.element.childNodes[0]	);

	}

	get() {
		return this.element;
	}


	getClickLinkFunc() {

		var __this = this;

		return function(){

			console.log( this.dataset.action );


			for( var j=0; j<__this.mnuBttnOptContainers.length ; j++ ) {
				var optLst2 = __this.mnuBttnOptContainers[j];
				var optLstTgl = __this.mnuBttnOptContainersTgl[j];

				console.log("dsp["+j+"]" , optLst2 );
				optLst2.style.display = "none";
				optLstTgl.active = false;

			}

			var funData = undefined;
			if( (typeof this.dataset.data).toLowerCase() == "string" ) {
				funData = JSON.parse( this.dataset.data );
			}
			if( this.dataset.action.startsWith("@")  ) {
				__this.basic[ this.dataset.action.substr(1) ]( funData );
			}
			else {
				__this.handlers[ "handler_" + this.dataset.action ]( funData );
			}
		}
	}

	getOnOverLinkFunc() {

		var __this = this;

		return function(){

			var ll = __this.mnuLinks[ this.dataset.i ];

			for( var k2=0; k2<ll.length ; k2++ ) {
				var lnk2 = ll[ k2 ];

				lnk2.style.color = __this.color;
				lnk2.style.backgroundColor = __this.bgColor;

			}


			this.style.color = __this.bgColor;
			this.style.backgroundColor = __this.color;
		}
	}

	getOnClickMenuButtonFunc() {

		var __this = this;

		return function(){

			var thisIx = this.dataset.i;
			var active =  __this.mnuBttnOptContainersTgl[ thisIx ].active;

			//Disable all other menus
			for( var j=0; j<__this.mnuBttnOptContainers.length ; j++ ) {
				var optLst2 = __this.mnuBttnOptContainers[j];
				var optLstTgl = __this.mnuBttnOptContainersTgl[j];

				console.log("dsp["+j+"]" , optLst2 );
				optLst2.style.display = "none";
				optLstTgl.active = false;

			}

			for( var j=0; j<__this.mnuBttnOptContainers.length ; j++ ) {
				var optLst2 = __this.mnuBttnOptContainers[j];
				console.log("dsp["+j+"]" , optLst2.style.display );

			}


			var ll = __this.mnuLinks[ thisIx ];
			for( var k=0; k<ll.length ; k++ ) {
				var lnk2 = ll[ k ];

				lnk2.style.color = __this.color;
				lnk2.style.backgroundColor = __this.bgColor;

			}

			var optLst = __this.mnuBttnOptContainers[ thisIx ];

			console.log(active);
			if( active ) {
				__this.mnuBttnOptContainersTgl[ thisIx ].active = false;
				optLst.style.display = "none";
			}
			else {
				__this.mnuBttnOptContainersTgl[ thisIx ].active = true;
				optLst.style.display = "block";
			}

		};

	}

	enable() {
		var tmp = 1;

		for( var i=0; i<this.mnuBttns.length ; i++ ) {
			var b = this.mnuBttns[i];
			b.dataset.i = i;

			var optLst = this.mnuBttnOptContainers[i];

			var f = this.getOnClickMenuButtonFunc();
			b.addEventListener( "click", f );

			var ll = this.mnuLinks[i];

			for( var k=0; k<ll.length ; k++ ) {
				var lnk = ll[ k ];
				lnk.dataset.i = i;
				lnk.addEventListener( "click", this.getClickLinkFunc() );
				lnk.addEventListener( "mouseover", this.getOnOverLinkFunc() );
			}


		}
	}

	setDimensions( w,h ) {
			this.element.style.width = w + "px";
			this.element.style.textAlign = "left";
	}

	clearMenu() {
		for( var j=0; j<this.mnuBttnOptContainers.length ; j++ ) {

			var optLstTgl = this.mnuBttnOptContainersTgl[j];

			if( optLstTgl.active ) {

				var optLst2 = this.mnuBttnOptContainers[j];
				//console.log("dsp["+j+"]" , optLst2 );
				optLst2.style.display = "none";
				optLstTgl.active = false;
			}
		}
	}

	hideMenu() {

		for( var j=0; j<this.mnuBttnContainers.length ; j++ ) {
			var buttonCtr = this.mnuBttnContainers[j];
			buttonCtr.style.display = "none";
		}

		var statusWidgets = this.statusWidgets.list;
		for( var j=0; j<statusWidgets.length ; j++ ) {
			var wid = statusWidgets[j];
			wid.style.display = "none";
		}



	}

	unhideMenu() {

		for( var j=0; j<this.mnuBttnContainers.length ; j++ ) {
			var buttonCtr = this.mnuBttnContainers[j];
			buttonCtr.style.display = "block";
		}

		var statusWidgets = this.statusWidgets.list;
		for( var j=0; j<statusWidgets.length ; j++ ) {
			var wid = statusWidgets[j];
			wid.style.display = "block";
		}

	}


}

export { KERNALMODULE as default};
