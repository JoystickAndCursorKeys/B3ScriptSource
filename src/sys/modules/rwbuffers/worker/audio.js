class Audio {

	constructor( sys ) {
		this.sys = sys;
		this.userInput = false;
  }

	flagUserInput() {
		this.userInput = true;
	}

  playBeep( channel, frequency, len ) {

		if( !this.userInput ) { return; }
    this.sys.post( "audio",
    {
          method: "playBeep",
					parCount: 3,
					p1: channel,
					p2: frequency,
					p3: len
    }
    );
  }

	playSound( channel, frequency, len ) {

		if( !this.userInput ) { return; }
    this.sys.post( "audio",
    {
          method: "playSound",
					parCount: 3,
					p1: channel,
					p2: frequency,
					p3: len
    }
    );
  }

	volume( volume ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "setVolume",
					parCount: 1,
					p1: volume
		}
		);
	}

	reset() {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
			{
						method: "reset",
						parCount: 0
			}
			);

	}

	attackDecayRelease( channel, attackT, decayT, releaseT ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelSetAttackDecayRelease",
					parCount: 4,
					p1: channel,
					p2: attackT,
					p3: decayT,
					p4: releaseT
		}
		);
	}

	channelVolume( channel, v ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelVolume",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}

	channelFrequency( channel, v ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelFrequency",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}


	channelSustainVolume( channel, v ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelSetSustainLevel",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}

	addEffect( channel,  type , value, time ) {
		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "addEffect",
					parCount: 4,
					p1: channel,
					p2: type,
					p3: value,
					p4: time
		}
		);
  }

  clearEffect( channel ) {
		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "clearEffect",
					parCount: 1,
					p1: channel
		}
		);

  }

	playEffect( channel, freq ) {
		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "playEffect",
					parCount: 2,
					p1: channel,
					p2: freq
		}
		);

	}

}
