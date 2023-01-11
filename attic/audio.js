class Audio {

	constructor( sys ) {
		this.sys = sys;
  }


  playBeep( channel, frequency, len ) {

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

		this.sys.post( "audio",
		{
					method: "setVolume",
					parCount: 1,
					p1: volume
		}
		);
	}


	attackDecayRelease( channel, attackT, decayT, releaseT ) {
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
		this.sys.post( "audio",
		{
					method: "channelVolume",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}

	channelSustainVolume( channel, v ) {
		this.sys.post( "audio",
		{
					method: "channelSetSustainLevel",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}

}
