class KERNALMODULE {

	constructor( sys ) {
		this.initialized = false;
		this.default = 100;

		this.sys = sys;
		this.drivers = [];

	}

	init() {

			if( this.initialized ) {
				return;
			}

			this.drivers["text"] = this.sys.m.tablecon;
			this.drivers["canvas"] = this.sys.m.canvas;
			//this.drivers["webglt"] = this.sys.m.webglt;			

			this.modes = [];

			var textmode1 = "text:80x30";
			var textmode2 = "text:80x50";
			var textmode3 = "text:80x150";

			var fontSmall = 	"font=14";
			var fontMedium1 = "font=16";
			var fontMedium2 = "font=18";
			var fontBig = 		"font=22";

			this.modes[0] = textmode1 + ":" + fontSmall;
			this.modes[1] = textmode1 + ":" + fontMedium1;
			this.modes[2] = textmode1 + ":" + fontMedium2;
			this.modes[3] = textmode1 + ":" + fontBig;

			this.modes[4] = textmode2 + ":" + fontSmall;
			this.modes[5] = textmode2 + ":" + fontMedium1;
			this.modes[6] = textmode2 + ":" + fontMedium2;
			this.modes[7] = textmode2 + ":" + fontBig;

			this.modes[8] = textmode3 + ":" + fontSmall;
			this.modes[9] = textmode3 + ":" + fontMedium1;
			this.modes[10] = textmode3 + ":" + fontMedium2;
			this.modes[11] = textmode3 + ":" + fontBig;

			this.modes[100] = "canvas:%95";

			this.modes[101] = "canvas:%85";
			this.modes[102] = "canvas:%75";
			this.modes[103] = "canvas:%65";
			this.modes[104] = "canvas:%45";
			this.modes[105] = "canvas:%35";
			this.modes[106] = "canvas:%25";
			this.modes[107] = "canvas:%15";

			this.modes[110] = "canvas:%%95,25";
			this.modes[111] = "canvas:%%95,50";
			this.modes[120] = "canvas:%%25,95";
			this.modes[121] = "canvas:%%50,95";

			this.modes[200] = "canvas:1024x768";

			this.modes[500] = "canvas:800x600";
			this.modes[501] = "canvas:640x512";
			this.modes[502] = "canvas:640x480";
			this.modes[503] = "canvas:640x400";
			this.modes[504] = "canvas:320x512";
			this.modes[505] = "canvas:320x400";
			this.modes[506] = "canvas:320x256";
			this.modes[507] = "canvas:320x200";

			//this.modes[1000] = "webgl:1024x768";

			//this.modes[1002] = "webglt:24x16x32";
			//this.modes[1003] = "webglt:24x16x48";
			//this.modes[1004] = "webglt:24x16x64";

			//this.modes[1010] = "webglt:32x24x32";
			//this.modes[1011] = "webglt:32x24x48";
			//this.modes[1012] = "webglt:32x24x64";

			//this.modes[1020] = "webglt:48x32x16";
			//this.modes[1021] = "webglt:48x32x24";
			//this.modes[1022] = "webglt:48x32x32";


			//this.modes[1001] = "webgl:%85";
			//this.modes[1002] = "webgl:%75";
			//this.modes[1003] = "webgl:%65";
			//this.modes[1004] = "webgl:%45";
			//this.modes[1005] = "webgl:%35";
			//this.modes[1006] = "webgl:%25";
			//this.modes[1007] = "webgl:%15";

			//this.modes[1110] = "webgl:%%95,25";
			//this.modes[1111] = "webgl:%%95,50";
			//this.modes[1120] = "webgl:%%25,95";
			//this.modes[1121] = "webgl:%%50,95";

			//this.modes[1200] = "webgl:1024x768";

			//this.modes[1500] = "webgl:800x600";
			//this.modes[1501] = "webgl:640x512";
			//this.modes[1502] = "webgl:640x480";
			//this.modes[1503] = "webgl:640x400";
			//this.modes[1504] = "webgl:320x512";
			//this.modes[1505] = "webgl:320x400";
			//this.modes[1506] = "webgl:320x256";
			//this.modes[1507] = "webgl:320x200";


			this.menuCreated = false;
	}

	getDriver() {
		return this.currentDriver;
	}

	getMode( x ) {
		this.init();

		if( ! x ) {
			return getMode( this.default );
		}
		return this.modes[ x ];
	}


	getModes() {
		return this.modes;
	}

	getCurrentMode() {
		return this.currentMode;
	}

	setMode( x, menu ) {
		this.init();


		if( menu ) {
			this.menu = menu;
		}

		if( x === undefined || x === null || x === -1 || Number.isNaN( x ) ) {
			this.setMode( this.default, menu );
		}

		var dc = this.getDeviceConfig( x );
		if(! dc ) {
			return;
		}

		var cm = this.currentMode;
		if( ! (cm === undefined || cm === null || cm === -1 || Number.isNaN( x ) ) ) {
				this.endMode( this.currentMode );
				this.menuCreated = false;
		}

		if( !this.menuCreated ) {
		 this.menu.create();
		 this.menuCreated = true;
		}

		dc.device.initMode( dc.config, this.menu );
		this.sys.out =  dc.device;

		this.sys.out.notifyOnClick( this.sys.m.basicmenu, "onDeselect" );

		this.currentMode = x;
		this.currentDriver = dc.device;

	}

	endMode() {

		this.init();

		if( !this.currentDriver ) {
			return;
		}

		var dev = this.currentDriver;

		dev.destroy();
		this.menu.destroy();

		this.currentMode = undefined;
		this.currentDriver = undefined;

	}

	getDeviceConfig( x ) {

		if( x === undefined || x === null || x === -1 || Number.isNaN( x ) ) {
			return undefined;
		}

		if( !this.modes[ x ] ) {
			return undefined;
		}

		var tmp = this.modes[ x ].split(":");
		if( tmp.length < 2 ) {
			return undefined;
		}

		var driver = tmp[0];
		if( !this.drivers[ driver ] ) {
			return undefined;
		}

		var driverDevice = this.drivers[ driver ];

		var param = tmp.splice(1);

		return {
			device: driverDevice,
			config: param
		};

	}

}

export { KERNALMODULE as default};
