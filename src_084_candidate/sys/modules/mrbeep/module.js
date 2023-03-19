import  mrBeepChannelClass   from    './mrbeep-channel.js';
import  mrBeepClass   from           './mrbeep.js';


class KERNALMODULE {

	constructor( sys ) {
		this.sys = sys;
	}

	destroy() {
	}


	init() {
		this.mrBeep = new mrBeepClass( mrBeepChannelClass );
	}

	reset() {
			this.mrBeep.reset();
	}

  setVolume( x ) {
    this.mrBeep.setVolume( x );
  }

  channelVolume( channel, x ) {
    this.mrBeep.channelVolume( channel, x );
  }

	channelFrequency( channel, f ) {
    this.mrBeep.channelFrequency( channel, f );
  }

  channelSetAttackDecayRelease( channel, attackT, decayT, releaseT ) {
    this.mrBeep.channelSetAttackDecayRelease( channel, attackT, decayT, releaseT );
  }

  channelSetSustainLevel( channel,  sustainV ) {
    this.mrBeep.channelSetSustainLevel( channel,  sustainV );
  }


  playBeep( channel, frequency, duration ) {
    this.mrBeep.playBeep( channel, frequency, duration );
  }

  playSound( channel, frequency, duration ) {
    this.mrBeep.playSound( channel, frequency, duration );
  }


  startSound( channel, frequency ) {
    this.mrBeep.startSound( channel, frequency );
  }

  releaseSound( channel, frequency ) {
    this.mrBeep.releaseSound( channel, frequency );
  }


	addEffect( channel,  type , value, time ) {

		this.mrBeep.addEffect( channel,  type , value, time );

  }

  clearEffect( channel ) {

		this.mrBeep.clearEffect( channel );

  }

	playEffect( channel, freq ) {
		this.mrBeep.playEffect( channel, freq );
	}


}

export { KERNALMODULE as default};
