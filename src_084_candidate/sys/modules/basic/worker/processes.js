class processes {

	constructor( sys ) {

		const STATE_NULL 		= 9660;
		const STATE_LASTSTATE = 9661;
		const STATE_CLI = 		9670;
		const STATE_RUNNING = 9671;
		const STATE_INPUT 	= 9672;
		const STATE_WAITING = 9673;
		const STATE_SYNCHING = 9674;

		this.STATE_NULL 			= STATE_NULL;
		this.STATE_LASTSTATE 	= STATE_LASTSTATE;
		this.STATE_CLI 				= 		STATE_CLI;
		this.STATE_RUNNING 		= STATE_RUNNING;
		this.STATE_INPUT 			= STATE_INPUT;
		this.STATE_WAITING 		= STATE_WAITING;
		this.STATE_SYNCHING 		= STATE_SYNCHING;		

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
			else if( newState == STATE_SYNCHING ) {
				_this.killRuntimeInterval();
				_this.killWaitingTimeOut();
				
				_this.sys.postsynchrequest( 0 );
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

			if( state == STATE_RUNNING  || state == STATE_WAITING || state == STATE_SYNCHING) {
				return; //don't steal cycles from running or waiting timer, or synching process
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

		this.synch = function( id )  {

			_this.runInterval = null;
			p.clearSynching();

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
