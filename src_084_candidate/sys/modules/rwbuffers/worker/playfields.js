class Playfields {

	constructor( sys ) {
		this.sys = sys;

		this.current = 0;
		this.enabledFlag = false;
		this.list = null;
  	}

  	enable( flag )  {
  		this.enabledFlag = flag;
  	}

  	set( list )  {
  		this.list = list;
  	}

  	enabled() {
  		return this.enabledFlag;
  	}

  	setEnable( pid, ix, flag ) {
		this.sys.post( "pfenable",
			{
				processId: pid,
				ix: ix,
				flag: flag
			}  );	  		
  	}


	select( pid, ix ) {
		if( ix >= this.list.length ) {
			throw "No such playfield " + ix;
		}

		if( this.list[ ix ] == null ) {
			throw "Playfield not active";
		}	

		this.sys.post( "pfselect",
			{
				processId: pid,
				ix: ix
			}  );		

		this.current = ix;
	}


	scrollpos( pid, ix, x, y ) {
		if( ix >= this.list.length ) {
			throw "No such playfield " + ix;
		}

		if( this.list[ ix ] == null ) {
			throw "Playfield not active";
		}	

		this.sys.post( "pfscrollpos",
			{
				processId: pid,
				ix: ix,
				x: x,
				y: y
			}  );		

	}
	

	viewdefine( pid, ix, x, y, w, h ) {
		if( ix >= this.list.length ) {
			throw "No such playfield " + ix;
		}

		if( this.list[ ix ] == null ) {
			throw "Playfield not active";
		}	

		this.sys.post( "pfviewsize",
			{
				processId: pid,
				ix: ix,
				x: x,
				y: y,
				w: w,
				h: h
			}  );		

	}

	init( pid, pfIx, bcwC, brhC ) {

		/* If current we also need to update our 
			worker text area buffers when done */

		this.sys.post( "pfinit",
			{
				processId: pid,
				ix: pfIx,
				bcwC: bcwC, brhC: brhC,
				fgColor: 1, bgColor: 0
			}  );
	}

	old_init( pid, pfIx, xo, yo, cwC, rhC, bcwC, brhC ) {


		/* If current we also need to update our 
			worker text area buffers when done */

		this.sys.post( "pfinit",
			{
				processId: pid,
				ix: pfIx,
				isCurrentIx: this.current == pfIx,
				xo: xo, yo: yo,
				cC: cwC, rC: rhC,
				bcwC: bcwC, brhC: brhC,
				fgColor: 1, bgColor: 0
			}  );
	}

}
