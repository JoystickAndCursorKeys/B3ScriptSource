class processes {

	constructor( sys ) {

		const STATE_NULL 		= 9660;
		const STATE_LASTSTATE = 9661;
		const STATE_CLI = 		9670;
		const STATE_RUNNING = 9671;
		const STATE_INPUT 	= 9672;
		const STATE_WAITING = 9673;

		this.STATE_NULL 			= STATE_NULL;
		this.STATE_LASTSTATE 	= STATE_LASTSTATE;
		this.STATE_CLI 				= 		STATE_CLI;
		this.STATE_RUNNING 		= STATE_RUNNING;
		this.STATE_INPUT 			= STATE_INPUT;
		this.STATE_WAITING 		= STATE_WAITING;

		this.sys = sys;
		this.processes = [];

		var _this = this;
    var processes = _this.processes;

		this.idlerInterval = null;
		this.runInterval = null;
		this.waitTimeOut = null;

		var lastState = STATE_NULL;
		var state = STATE_NULL;

		this.avgIdlerTime = 10;

		var changeState = function( newState, data ) {

				if( newState == STATE_INPUT ) {
					_this.killRuntimeInterval();
				}
				else if( newState == STATE_WAITING ) {
					_this.killRuntimeInterval();
					_this.startWaitingTimeOut( data );
				}
				else if( newState == STATE_CLI ) {
					_this.killRuntimeInterval();
					_this.killWaitingTimeOut();
				}
				else if( newState == STATE_RUNNING ) {
					_this.killWaitingTimeOut();
					_this.startRuntimeInterval( data );
				}

				lastState = state;
				state = newState;
		}

		var flags, pstate, update, wtime, p;

		this.idlerFunction = function()  {
			var m1 = new Date().getTime();

			if( state == STATE_RUNNING  || state == STATE_WAITING ) {
				return; //don't steal cycles from running or waiting timer
			}

			p = processes[0];

			var running = p.cpuNeeded();
			if( running>.1 ) { //we do not get this from cycle.  At least not in good time.
				var stat = p.getStatus();
				_this.sys.poststatus( 0, stat );

				changeState( STATE_RUNNING, running );
				return;
			}

			flags = p.cycle();

			update = flags[ 0 ];
			pstate = flags[ 1 ];
			wtime = flags[ 2 ];

			if( update ) {
				var stat = p.getStatus();
				_this.sys.poststatus( 0, stat );
			}

			if( pstate != state ) {
				changeState( pstate, wtime );
			}

			var m2 = new Date().getTime();
			var m3 = m2-m1;

			_this.avgIdlerTime = ((_this.avgIdlerTime * 99) + m3) / 100;
		}

		this.runningFunction = function()  {

			if( state != STATE_RUNNING ) {
				return; //should never get here
			}

			//p = processes[0];
			flags = p.cycle();

			pstate = flags[ 1 ];
			wtime = flags[ 2 ];

			if( pstate != state ) {
				changeState( pstate, wtime );
			}

		}

		this.waitingFunction = function()  {

			_this.runInterval = null;
			p.clearWaiting();
			changeState( lastState, 0 );

			if( state == STATE_RUNNING ) {
				_this.runningFunction();
			}
		}

		changeState( STATE_CLI );
}

	startIdlerInterval()  {
		if( this.idlerInterval == null ) {
				 //this.sys.log("Starting process interval (first register)");
				 this.idlerInterval = setInterval( this.idlerFunction, 200) ;
		}
	}

	startRuntimeInterval( cpu )  {
		if( this.runInterval == null ) {
				 //this.sys.log("Starting running interval " + cpu);

				 var iv = Math.floor( 220 - (200*cpu) );
				 //this.sys.log("Starting running interval# " + iv);

				 this.runInterval = setInterval( this.runningFunction, iv) ;
		}
	}

	killRuntimeInterval()  {
		if( this.runInterval != null ) {
				 //this.sys.log("Stopping running interval");
				 clearInterval( this.runInterval ) ;
				 this.runInterval = null;
		}
	}

	startWaitingTimeOut( t )  {
		if( this.waitTimeOut == null ) {
				 //this.sys.log("Starting waiting timeout " + t);
				 this.waitTimeOut = setTimeout( this.waitingFunction, t, t ) ;
		}
	}

	killWaitingTimeOut()  {
		if( this.waitTimeOut != null ) {
				 //this.sys.log("Stopping running wait timeout!!");
				 clearTimeout( this.waitTimeOut ) ;
				 this.waitTimeOut = null;
		}
	}

/*


		var togglerSpeedFunction = function()  {

			fastloop = false;

			for( var i=0; i<processes.length; i++ ) {
				var p = processes[i];
				var psl = psleep[i];

				if( p ) {

						var cpuHungry =  processes[ i ].cpuNeeded();
						var found = _this.fastProcesses[ i ];

						if( !cpuHungry ) {
							var debugPoint = 1;
						}

						if( cpuHungry && !found) {
							_this.fastProcesses[ i ] = true;
						}
						else if( !cpuHungry && found) {
								_this.fastProcesses[ i ] = false;
						}

						if( _this.fastProcesses[ i ] ) {
							fastloop = true;
						}
					}
				}
		}

		var cycleFunction = function()  {

			var flags, upd, wait, time;

			var m = null;

			for( var i=0; i<processes.length; i++ ) {
				var p = processes[i];
				var psl = psleep[i];

				if( p ) {

					if( psl > 0 ) {

						if( m === null ) {
							m = new Date().getTime();
						}

						if( m<psl ) {
							continue;
						}

						psleep[i] = 0;
						p.clearWaiting();
					}

					flags = p.cycle();

					upd = flags[ 0 ];
					wait = flags[ 1 ];

					if( wait ) {
						var time = flags[ 2 ];

						if( m === null ) {
								var m = new Date().getTime();
						}

						psleep[i] = m + time  + 10;
					}

					if( upd ) {
						var stat = processes[ i ].getStatus();
						_this.sys.poststatus( i, stat );
					}
				}
			}

			if( fastloop ) {
				setTimeout( cycleFunction, 10 );
			}
			else {
				setTimeout( cycleFunction, 100 );
			}

		};


		changeState

		setInterval( togglerSpeedFunction, 100) ;
		setTimeout( cycleFunction, 100 );


*/


	getTicks() {
		return this.count;
	}

	get( id ) {
		return this.processes[ id ];
	}

	register( obj ) {

		var newId = this.processes.length;

		this.processes.push( obj );
		//this.processesSleep.push( 0 );
		//this.fastProcesses.push( false );

		obj.processId = newId;
		obj.procIf = this;

		this.startIdlerInterval();

		return newId;
	}


	getRoot() {

		return this.processes[ 0 ];
	}
}
