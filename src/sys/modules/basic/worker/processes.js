class processes {

	constructor( sys ) {

		this.sys = sys;
		this.processes = [];
		this.count = 0;

		var _this = this;
    var processes = _this.processes;

		this.sys.log("Starting process interval");
		setInterval(function()  {

			for( var i=0; i<processes.length; i++ ) {
				if( processes[i] ) {
					processes[ i ].cycle();
					//_this.count++;
				}
			}
		}, 100);
	}

	getTicks() {
		return this.count;
	}

	register( obj ) {

		var newId = this.processes.length;

		this.processes.push( obj );

		return newId;
	}

	getRoot() {

		return this.processes[ 0 ];
	}
}
