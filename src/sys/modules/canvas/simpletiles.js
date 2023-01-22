
class TILES {

	constructor( img, gridw, gridh, transCol ) {

			this.img = img;
			this.gridw = gridw;
			this.gridh = gridh;

			this.iconGrid = [];

			var w = this.img.width;
			var h = this.img.height;

			this.iconCanvas = document.createElement('canvas');
			this.iconContext = this.iconCanvas.getContext('2d');

			this.iconCanvas.width = 	w;
			this.iconCanvas.height = 	h;

			this.iconContext.drawImage( this.img, 0, 0, w, h);

			this.xiconcount = w / this.gridw;
      this.xiconrowcount = h / this.gridh;


      for (var yicon = 0; yicon < this.xiconrowcount; yicon++) {
			for (var xicon = 0; xicon < this.xiconcount; xicon++) {

				var sx = (xicon * this.gridw);
				var sy = (yicon * this.gridh);
				var imgdata = this.iconContext.getImageData(sx, sy, this.gridw, this.gridh);
				var sd  = imgdata.data;

				var xoffset = 0;
				var yoffset = 0;
				var rowoffset = this.gridw * 4;
				var offset;

				var grid = [];
				for (var y = 0; y < this.gridh; y++) {
					xoffset = 0;

					var row = [];
					for (var x = 0; x < this.gridw; x++) {
						var pix = 1;

						offset = yoffset + xoffset;

						if( sd[ offset + 0] == transCol.r && sd[ offset + 1] == transCol.g && sd[ offset + 2] == transCol.b )
						{
							pix = 0;
						}

						row.push( pix );
						xoffset += 4;
					}
					grid.push( row );
					yoffset += rowoffset;
				}

				//dcontext.putImageData( dimgdata, 0, 0);
				this.iconGrid.push( grid  );
				//this.iconsContext.push( dcontext );
			}
      }

      this.iconCanvas = null;
      this.iconContext = null;
      this.img = null;
	}


	getCharData( i ) {

		return this.iconGrid[ i ];
  }

}



export { TILES as default};
