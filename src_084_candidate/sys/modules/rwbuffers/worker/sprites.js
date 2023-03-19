class Sprites {

	constructor( sys ) {
		this.sys = sys;

		this.maxSprites = 32;
		this.list = [];
		this.frameCount = 0;




  }

	init( max ) {
		this.maxSprites = max;

		for( var i=0; i<this.maxSprites ) {
			var sprite = {};

			sprite.x=0;
			sprite.y=0;
			sprite.dx=0;
			sprite.dy=0;
			sprite.enabled = 0;
			sprite.frame = -1;

			this.list.push( sprite );
		}
	}


  addFrames( url, transparency ) {

    this.sys.post( "sprite",
    {
          method: "addFrames",
					parCount: 2,
					p1: url,
					p2: transparency
    }
    );

  }

	__addSprite() {

    this.sys.post( "sprite",
    {
          method: "addSprite",
					parCount: 1,
					p1: this.list.length
    }
    );

		this.list.push();

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
