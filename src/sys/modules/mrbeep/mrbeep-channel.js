class MrBeepChannel {

  constructor( audioCtx, waveform, masterVolume, volumeFunc ) {
    this.audioCtx = audioCtx;
    this.waveform = waveform;
    this.masterVolume = masterVolume;
    this.volumeFunc = volumeFunc;

    this.initialized = false;
    this.initializedFully = false;

    this.effects = [];

    this.FLR = 10;  //frequency linair range
    this.FS = 11;   //frequency set
    this.VLR = 20;  //volume linair range
    this.VS = 21;   //volume set

  }

  enable() {
    this._init();
  }

  disable() {
    this.maxGain.gain.value=0.0;
  }

  _init() {

    if( this.initialized ) {
      return;
    }

    this.initialized = true;

    this.maxGain = this.audioCtx.createGain();
    this.maxGain.connect( this.masterVolume );

    this.maxGain.gain.value=0.0;
    this.volumeValue = 0.0;

    this.gain = this.audioCtx.createGain();
    this.gain.connect( this.maxGain );

    if( this.waveform == "noise" ) {


      //var from = 300;
      //var to = 30000;
      //var geometricMean = Math.sqrt(from * to);
      //this.filter.Q.value = geometricMean / (to - from);

      /*
      this.filter = this.audioCtx.createBiquadFilter();

      this.filter.type = "bandpass";
      this.filter.frequency.value = 440;
      this.frequency = this.filter.frequency;
      this.filter.Q.value = 5;
      this.filter.connect(this.gain);

      var bufferSize = 4096;

      var b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      var node = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = function(e) {
          var output = e.outputBuffer.getChannelData(0);
          for (var i = 0; i < bufferSize; i++) {
              var white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11; // (roughly) compensate for gain
              b6 = white * 0.115926;
          }
      }

      this.occilator = node;
      this.occilator.connect( this.filter );

      this.gain.gain.value=0.0;
      this.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);

      this.initializedFully = true;
      */

    }
    else {
      // we create the gain module, named as volume, and connect it to our
      //these sines are the same, exept for the last connect statement.
      //Now they are connected to the volume gain module and not to the au

      this.filter = null;

      this.occilator = this.audioCtx.createOscillator();
      this.occilator.frequency.value = 440;
      this.frequency = this.occilator.frequency;

      this.occilator.type = this.waveform;
      this.occilator.connect(this.gain);
      this.gain.gain.value=0.0;
      this.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.occilator.start(0);
      this.initializedFully = true;




    }
  }

  setVolume( volume ) {

    this.enable();

    this.maxGain.gain.value= volume;
    this.volumeValue = volume;

    if( volume == 0) {
      this.disable();
    }

  }

  playBeep( frequency, duration ) {

    this._init();
    if( !this.initializedFully ) { return; }

    var durInSeconds = duration / 1000;
    var durInSeconds0 = durInSeconds/20;
    var durInSeconds1 = durInSeconds - (durInSeconds/20);
    var durInSeconds2 = durInSeconds;
    var now =this.audioCtx.currentTime;

    this.frequency.cancelScheduledValues( now );
    this.gain.gain.cancelScheduledValues( now );

    this.frequency.setValueAtTime( frequency,  now );

    this.gain.gain.linearRampToValueAtTime(1.0 , now + durInSeconds0);
    this.gain.gain.linearRampToValueAtTime(1.0 , now + durInSeconds1);
    this.gain.gain.linearRampToValueAtTime(0.0 , now + durInSeconds2);

  }

  clearEffect() {
    this.effects  = [];
  }

  addEffect( type , value, time ) {
    if( this.effects.length > 254 ) {
      return;
    }

    this.effects.push( {
      type: type ,
      value: value,
      time: time
      }
    );
  }

  playEffect( freq ) {

    this._init();
    if( !this.initializedFully ) { return; }

    var now =this.audioCtx.currentTime;

    this.gain.gain.cancelScheduledValues( now );
    this.frequency.cancelScheduledValues( now );

    //this.maxGain.gain.value= this.volumeValue;

    var jiffy = 0.000001;
    now = now + jiffy;

    for( var i = 0; i < this.effects.length ; i++) {
      var e = this.effects[ i ];
      if( e.type == this.VLR ) {
        this.gain.gain.linearRampToValueAtTime( e.value , now + e.time/1000 );
      }
      else if( e.type == this.FLR ) {
        this.frequency.linearRampToValueAtTime( e.value + freq , now + e.time/1000 );
      }
      else if( e.type == this.VS ) {
        this.gain.gain.setValueAtTime( e.value , now + e.time/1000 );
      }
      else if( e.type == this.FS ) {
        this.frequency.setValueAtTime( e.value  + freq, now + e.time/1000 );
      }

    }

  }

  setAttackDecayRelease( attackT, decayT, releaseT ) {

    this.attackT = attackT;
    this.decayT = decayT;
    this.releaseT = releaseT;

  }

  setSustainLevel( sustainV ) {

    this.sustainV = sustainV;

  }


  playSound( frequency, sustainT ) {

    var now =this.audioCtx.currentTime;

    this._init();
    if( !this.initializedFully ) { return; }

    var durInSeconds0 = (this.attackT/1000);
    var durInSeconds1 = (this.attackT/1000) + (this.decayT/1000);
    var durInSeconds2 = (this.attackT/1000) + (this.decayT/1000) + (sustainT/1000) ;
    var durInSeconds3 = (this.attackT/1000) + (this.decayT/1000) + (sustainT/1000) + (this.releaseT/1000);

    this.frequency.cancelScheduledValues( now );
    this.gain.gain.cancelScheduledValues( now );
    //this.frequency.value = frequency;
    this.frequency.setValueAtTime( frequency, now );

    this.gain.gain.linearRampToValueAtTime( 1.0              , now + durInSeconds0);
    this.gain.gain.linearRampToValueAtTime( this.sustainV    , now + durInSeconds1);
    this.gain.gain.linearRampToValueAtTime( this.sustainV    , now + durInSeconds2);
    this.gain.gain.linearRampToValueAtTime( 0                , now + durInSeconds3);

  }

  setFrequency( f ) {

    var now =this.audioCtx.currentTime;
    this.frequency.cancelScheduledValues( now );
    //this.frequency.value = f;
    this.frequency.setValueAtTime( f, now );
  }

  startSound( frequency ) {

    this._init();
    if( !this.initializedFully ) { return; }

    var durInSeconds0 = this.attackT/1000;
    var durInSeconds1 = (this.attackT/1000) + (this.decayT/1000);

    //this.frequency.value = frequency;
    this.frequency.cancelScheduledValues( now );
    this.frequency.setValueAtTime( frequency, now );

    var now =this.audioCtx.currentTime;
    this.gain.gain.cancelScheduledValues( now );

    this.gain.gain.linearRampToValueAtTime(1.0              , now + durInSeconds0);
    this.gain.gain.linearRampToValueAtTime( this.sustainV   , now + durInSeconds1);

  }

  releaseSound( frequency ) {

    this._init();
    if( !this.initializedFully ) { return; }

    var durInSeconds0 = this.releaseT/1000;

    this.frequency.value = frequency;

    var now =this.audioCtx.currentTime;
    this.gain.gain.cancelScheduledValues( now );

    this.gain.gain.linearRampToValueAtTime(0.0              , now +durInSeconds0);

  }

}

export { MrBeepChannel as default};
