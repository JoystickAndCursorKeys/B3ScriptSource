class MrBeep {

  constructor( MrBeepChannel ) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext);

    this.masterVolume = { value: 0.8 };
    this.channels = [];
    this.defaults = [
      "square","sawtooth","triangle", "sine",
      "noise","square","sawtooth", "triangle"
    ]

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect( this.audioCtx.destination );
    this.masterGain.gain.value=0.0;
    this.channelCount = 8;

    for( var i=0; i<this.channelCount; i++) {
        this.channels.push( new MrBeepChannel( this.audioCtx, this.defaults[ i ], this.masterGain, this._int_v2g ) );
    }

    this.FLR = 10;
    this.FS = 11;
    this.VLR = 20;
    this.VS = 21;
  }

  _int_log10(x) {
    return Math.log(x)/Math.LN10;
  }

  _int_v2g(v) {
    //var x = -this._int_log10( 1-(v*.9));
    var x = -Math.log( 1-(v*.9) )/Math.LN10;

    console.log( v, "->", x);
    return x;
  }

  reset() {
    for( var i=0; i<this.channelCount; i++) {
        this.channels[i].setVolume( 0 );
        this.channels[i].clearEffect();
    }
  }

  setVolume( v ) {
    //var x = -this._int_log10( 1-(l*.9));//Math.pow(10, (decibel_level / 20));

    this.masterGain.gain.value= this._int_v2g( v );
  }

  channelVolume( channel, x ) {
    this.channels[ channel ].setVolume( x );
  }

  channelFrequency( channel, f ) {
    this.channels[ channel ].setFrequency( f );
  }

  channelSetAttackDecayRelease( channel, attackT, decayT, releaseT ) {
    if( channel <0 || channel > 7) {
      throw "MrBeep:no such channel " + channel;
    }

    this.channels[ channel ].setAttackDecayRelease( attackT, decayT, releaseT );
  }

  channelSetSustainLevel( channel,  sustainV ) {
    if( channel <0 || channel > 7) {
      throw "MrBeep:no such channel " + channel;
    }

    this.channels[ channel ].setSustainLevel( sustainV );
  }


  playBeep( channel, frequency, duration ) {
    if( channel <0 || channel > 7) {
      throw "MrBeep:no such channel " + channel;
    }

    this.channels[ channel ].playBeep( frequency, duration );
  }

  playSound( channel, frequency, duration ) {
    if( channel <0 || channel > 7) {
      throw "MrBeep:no such channel " + channel;
    }

    this.channels[ channel ].playSound( frequency, duration );
  }


  startSound( channel, frequency ) {
    if( channel <0 || channel > 7) {
      throw "MrBeep:no such channel " + channel;
    }

    this.channels[ channel ].startSound( frequency );
  }

  releaseSound( channel, frequency ) {
    if( channel <0 || channel > 7) {
      throw "MrBeep:no such channel " + channel;
    }

    this.channels[ channel ].releaseSound( frequency );
  }

  addEffect( channel,  type , value, time ) {
    this.channels[ channel ].addEffect( type , value, time );
  }

  clearEffect( channel ) {
    this.channels[ channel ].clearEffect();
  }

  playEffect( channel, freq ) {
    this.channels[ channel ].playEffect( freq );
  }
}

export { MrBeep as default};
