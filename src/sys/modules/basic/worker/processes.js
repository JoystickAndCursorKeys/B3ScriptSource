class processes {

	constructor( sys ) {

		this.sys = sys;
		this.processes = [];
		this.fastProcesses = [];
		this.fastProcessesIds = {};
		this.count = 0;

		var _this = this;
    var processes = _this.processes;

		this.sys.log("Starting process interval");

		//slow loop
		setInterval(function()  {

			for( var i=0; i<processes.length; i++ ) {
				if( processes[i] ) {

					var upd;

					upd = processes[ i ].cycle();
					if( upd ) {
						var stat = processes[ i ].getStatus();
						_this.sys.poststatus( i, stat );
					}

					var cpuHungry =  processes[ i ].cpuNeeded();
					var found = !(_this.fastProcessesIds[ i + "_"] === undefined);

					if( cpuHungry && !found) {
						_this.fastProcessesIds[ i + "_"] = _this.fastProcesses.length;
						_this.fastProcesses.push( processes[ i ] );
					}
					else if( !cpuHungry && found) {
						var fpID = _this.fastProcessesIds[ i + "_"];
						var nfpArr = [];
						for( var j=0; j<_this.fastProcesses.length; j++ ) {
							var el = _this.fastProcesses[ j ];
							if( j!= fpID ) {
								nfpArr.push( el );
							}
						}
						_this.fastProcesses = nfpArr;
						_this.fastProcessesIds[ i + "_"] = undefined;
					}
				}
			}
		}, 100);

		//fast loop
		setInterval(function()  {

			for( var i=0; i<_this.fastProcesses.length; i++ ) {
					var dummy = _this.fastProcesses[ i ].cycle();
			}
		}, 10);
	}



	getTicks() {
		return this.count;
	}

	old_register( obj ) {

		var newId = this.processes.length-1;

		this.processes[newId] = obj;
		obj.processId = newId;

		return newId;
	}

	get( id ) {
		return this.processes[ id ];
	}

	register( obj ) {

		var newId = this.processes.length;

		this.processes.push( obj );

		obj.processId = newId;
		return newId;
	}


	getRoot() {

		return this.processes[ 0 ];
	}
}
