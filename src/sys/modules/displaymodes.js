class KERNALMODULE {

	constructor( sys ) {
		this.initialized = false;
		this.default = 3;

		this.sys = sys;
		this.drivers = [];

	}

	init() {

			if( this.initialized ) {
				return;
			}

			this.drivers["text"] = this.sys.m.tablecon;
			this.drivers["canvas"] = this.sys.m.canvas;

			this.modes = [];

			var textmode1 = "text:80x30";
			var textmode2 = "text:80x50";
			var textmode3 = "text:120x50";
			var textmode4 = "text:80x150";

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

			this.modes[12] = textmode4 + ":" + fontSmall;
			this.modes[13] = textmode4 + ":" + fontMedium1;
			this.modes[14] = textmode4 + ":" + fontMedium2;
			this.modes[15] = textmode4 + ":" + fontBig;

			this.modes[100] = "canvas:1024x768";

			this.modes[200] = "canvas:800x600";
			this.modes[201] = "canvas:640x512";
			this.modes[202] = "canvas:640x480";
			this.modes[203] = "canvas:640x400";
			this.modes[204] = "canvas:320x512";
			this.modes[205] = "canvas:320x400";
			this.modes[206] = "canvas:320x256";
			this.modes[207] = "canvas:320x200";

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

	setMode( x ) {
		this.init();

		if( x === undefined || x === null || x === -1 || Number.isNaN( x ) ) {
			this.setMode( this.default );
		}

		var dc = this.getDeviceConfig( x );
		if(! dc ) {
			return;
		}

		var cm = this.currentMode;
		if( ! (cm === undefined || cm === null || cm === -1 || Number.isNaN( x ) ) ) {
				this.endMode( this.currentMode );
		}

		dc.device.initMode( dc.config );
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
