/* Helpfull websites for webgl:
  https://webglfundamentals.org/webgl/lessons/webgl-qna-emulating-palette-based-graphics-in-webgl.html
  https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html

  TODOs, when making new buffer orix and oriy are first taken as column,row, 
  and a bit later as pixel coords (see line 831)
 */


class KERNALMODULE {

  constructor( sys ) {

    this.sys = sys;

    this.cursorOn = false;
    this.blinking = true;
    this.fxfact = 1;

    this.setupDefaultColors();

    this.fontFamily = "monospace";

    this.x = 0;
    this.y = 0;
    var oc = this.colors;
    oc.bg = 0;
    oc.fg = 5;    

    var shaders = this.getShaderSource() ;   /* see end of this file */
    this.vertexShader = shaders[0];
    this.fragmentShader = shaders[1];

    this.maxPlayfields = 6;
    this.views = [];
    this.current = 0;

  }

  init() {}

  setPlayfield( ix ) {
    this._int_blinkOff();
    this.view = this.views[ ix ];
    this.x = 0;
    this.y = 0;
    this.render();

  }


  getPlayFields() {

    var pfs = [];
    for( var i=0; i<this.maxPlayfields; i++ ) {
      var v = this.views[i];
      if( v == null ) {
        pfs.push( null );
      }
      else {
        var pf = {
            oX: v.oX,
            oY: v.oY,
            w: v.w,
            h: v.h,
            bufw: v.bw,
            bufh: v.bh,
            tilew: v.tileDim.fsw,
            tileh: v.tileDim.fsh

        };

        pfs.push( pf );
      }
    }
    return pfs;

  }

  __int_getDefaultViewConfig( cols, rows, cellsize ) {

    var mainW = cols;
    var mainH = rows - 2;

    var cfg0 = {
      origin: { x:0, y:cellsize },
      size: { w:mainW * cellsize, h: mainH * cellsize },
      buffersize: { w:cols + 1, h: (rows + 1 )-2  },
      scroll:  { up:0, left: 0 },
      enable: true
    };

    var cfg1 = {
      origin: { x:0, y:0 },
      size: { w:cols * cellsize , h:1 * cellsize },
      buffersize: { w:cols, h:1 },
      scroll:  { up:0, left: 0 },      
      enable: true
    };
 
    var cfg2 = {
      origin: { x:0, y: (rows-1) * cellsize },
      size: { w:cols * cellsize, h:1 * cellsize },
      buffersize: { w:cols, h:1 },
      scroll:  { up:0, left: 0 },      
      enable: true
    };

    var cfg3 = {
      origin: { x:0, y:0 },
      size: { w:1 * cellsize, h:1 * cellsize },
      buffersize: { w:cols, h:rows },
      scroll:  { up:0, left: 0 },      
      enable: false
    };

    var cfg4 = {
      origin: { x:0, y:0 },
      size: { w:1 * cellsize, h:1 * cellsize },
      buffersize: { w:cols, h:rows },
      scroll:  { up:0, left: 0 },      
      enable: false
    };

    var cfg5 = {
      origin: { x:0, y:0 },
      size: { w:1 * cellsize, h:1 * cellsize },
      buffersize: { w:cols, h:rows },
      scroll:  { up:0, left: 0 },      
      enable: false
    };

    return [ cfg0, cfg1, cfg2, cfg3, cfg4, cfg5 ];
  }


  autoFit( canvas_buf_width, canvas_buf_height, toW, toH ) {

    var w = toW; 
    var h = toH; 

    var canvas_style_width = canvas_buf_width;
    var canvas_style_height = canvas_buf_height;

    /* 

      canvas smaller then screen, do we need to upscale?  

    */
    if( canvas_buf_width < w && canvas_buf_height < h ) {

      if( canvas_buf_width * 2 < w && canvas_buf_height * 2 < h ) {
        canvas_style_width=(canvas_buf_width * 2.0 ) + "px";  
        canvas_style_height=(canvas_buf_height * 2.0 ) + "px";          
        console.log( "WEBGL upscale 2.0x");
      }
      else if( canvas_buf_width * 1.75 < w && canvas_buf_height * 1.75 < h ) {
        canvas_style_width=(canvas_buf_width * 1.75 ) + "px";  
        canvas_style_height=(canvas_buf_height * 1.75 ) + "px";          
        console.log( "WEBGL upscale 1.75x");
      }      
      else if( canvas_buf_width * 1.5 < w && canvas_buf_height * 1.5 < h ) {
        canvas_style_width=(canvas_buf_width * 1.5 ) + "px";  
        canvas_style_height=(canvas_buf_height * 1.5 ) + "px";          
        console.log( "WEBGL upscale 1.5x");
      }      
      else if( canvas_buf_width * 1.25 < w && canvas_buf_height * 1.25 < h ) {
        canvas_style_width=(canvas_buf_width * 1.25 ) + "px";  
        canvas_style_height=(canvas_buf_height * 1.25 ) + "px";          
        console.log( "WEBGL upscale 1.25x");
      }
      else {
        /* only little but smaller then screen */
        console.log( "WEBGL no upscale"); 
      }
    }
    else  {

      /* 

        canvas bigger (or equal) then screen, how much do we need to downscale?  

      */

      console.log( "WEBGL check downscale needed"); 
      var extra = .05;
      var one_dot_twofiveish = (1.25 + extra);
      var one_dot_fiveish = (1.5 + extra);
      var one_dot_sevenfiveish = (1.75 + extra);
      var two_dot_zeroish = (2.0 + extra);

      console.log( "dsw(1.25): " + (canvas_buf_width / one_dot_twofiveish ));
      console.log( "dsw(1.25): " + (canvas_buf_height / one_dot_twofiveish ));
      console.log( "dsw(1.5): " + (canvas_buf_width / one_dot_fiveish ));
      console.log( "dsw(1.5): " + (canvas_buf_height / one_dot_fiveish ));
      console.log( "dsw(1.75): " + (canvas_buf_width / one_dot_sevenfiveish ));
      console.log( "dsw(1.75): " + (canvas_buf_height / one_dot_sevenfiveish ));
      console.log( "dsw(2.0): " + (canvas_buf_width / two_dot_zeroish ));
      console.log( "dsw(2.0): " + (canvas_buf_height / two_dot_zeroish ));

      if( canvas_buf_width / one_dot_twofiveish < w && canvas_buf_height / one_dot_twofiveish < h ) {
        /* downscaling 1.25 will fit */
        canvas_style_width=(canvas_buf_width / 1.25 ) + "px";  
        canvas_style_height=(canvas_buf_height / 1.25 ) + "px";          
        console.log( "WEBGL downscale 1.25x");
      }
      else if( canvas_buf_width / one_dot_fiveish < w && canvas_buf_height / one_dot_fiveish < h ) {
        /* downscaling 1.5 will fit */
        canvas_style_width=(canvas_buf_width / 1.5 ) + "px";  
        canvas_style_height=(canvas_buf_height / 1.5 ) + "px";          
        console.log( "WEBGL downscale 1.5x");
      }      
      else if( canvas_buf_width / one_dot_sevenfiveish < w && canvas_buf_height / one_dot_sevenfiveish < h ) {
        /* downscaling 1.75 will fit */
        canvas_style_width=(canvas_buf_width / 1.75 ) + "px";  
        canvas_style_height=(canvas_buf_height / 1.75 ) + "px";          
        console.log( "WEBGL downscale 1.75x");
      }      
      else {
        /* downscaling 2.0 then maybe will fit, if downscale 1.5 is not enough */
        canvas_style_width=(canvas_buf_width / 2.0 ) + "px";  
        canvas_style_height=(canvas_buf_height / 2.0 ) + "px";          
        console.log( "WEBGL downscale 2.0x");
      }

    }

    return [ canvas_style_width, canvas_style_height ];
  }





/*
  width, height -> in col x rows
  
  *repeat for 1,2,3,4
  viewCfg[ X ]
    origin
    size
    buffersize


  tileSize
*/
  __int_initTiledViews(

        width, height,
        viewCfg,
        tileSize

      ) {
  var xSizeMax, ySizeMax;

  xSizeMax = width;
  ySizeMax = height;

  // - - - - Check tile size

  if( 
    tileSize != 8 &&
    tileSize != 16 &&
    tileSize != 24 &&
    tileSize != 32 &&
    tileSize != 48 &&
    tileSize != 64
   ) {
    throw "INVALID WEBGLT CFG: tileSize must be from (8, 16, 24, 32, 48, 64)";
  }


  // - - - - Check Views 

  if( viewCfg.length > this.maxPlayfields ) {
    throw "INVALID WEBGLT CFG: too many views (>"+this.maxPlayfields+")";
  }

  if( viewCfg.length <1 ) {
    throw "INVALID WEBGLT CFG: too few views (<1)";
  }

  for( var i=0; i< viewCfg.length; i++ ) {
    this.__int_checkViewCfg( viewCfg[i] );  
  }

  // - - - - Build low level views


  this.views = [ null, null, null, null, null, null ];

    // Cell dimentions
  var fontSizeCSS = Math.floor( tileSize ) + "px";
  var tileDim = { fsw: tileSize, fsh: tileSize, fszCss: fontSizeCSS, ff: this.fontFamily };

  // main views
  var v;
  for( var i=0; i<viewCfg.length; i++) {

    var vcfg = viewCfg[ i ];

    v =  {
          oX: vcfg.origin.x,
          oY: vcfg.origin.y,
          w: vcfg.size.w,
          h: vcfg.size.h,
          bw: vcfg.buffersize.w,
          bh: vcfg.buffersize.h,
          s_up: vcfg.scroll.up, 
          s_lft: vcfg.scroll.left,  
          enable: vcfg.enable,        
          tileDim: tileDim
        };

    v.buf = this.__int_makeBuffer( 
          v.bw, v.bh, 
          v.oX, v.oY, 
          this.colors.fg, this.colors.bg, 
          tileDim ) ;

    this.views[ i ] = v;   
  }

  this.view = this.views[0];

  }


 __int_checkViewCfg( v ) {


    if( v.size.w <1) {
     throw "VIEW too small"; 
    }
    if( v.size.h <1) {
     throw "VIEW too small"; 
    }
    if( v.size.w > 4096 ) {
     throw "VIEW too large"; 
    }
    if( v.size.h > 4096) {
     throw "VIEW too large"; 
    }

    if( v.buffersize.w <1) {
     throw "BUFFERW too small"; 
    }
    if( v.buffersize.h <1) {
     throw "BUFFERH too small"; 
    }
    if( v.buffersize.w > 4096 ) {
     throw "BUFFERW too large"; 
    }
    if( v.buffersize.h > 4096) {
     throw "BUFFERH too large"; 
    }


  }

  initMode( config, headerElementManager  ) {

    var sys = this.sys;
    var msgs = sys.init.queuedMessages;

    this.cvsCache = {};
    this.colarrCache = {};    

    this.cursorOn = false;
    this.blinking = true;

    var totCols;
    var totRows;
    var cellSize;

    if( config[0].indexOf("x") > 0) {
        var tmp = config[0].split("x");
        totCols = parseInt( tmp[0] );
        totRows = parseInt( tmp[1] );
        cellSize = parseInt( tmp[2] );
    }
    else {
      throw "Mode Error for WebGLTiles"
    }

    // - - - Set up Basic HTML - - -

    this.outDiv0 = document.createElement("div");
    this.outDiv1 = document.createElement("div");
    this.center = document.createElement("center");

    this.cnt = 0;

    this.canvas = document.createElement("canvas");
    this.gl = this.canvas.getContext( "webgl" , {antialias: false, alpha: false } );

    var gl = this.gl;
    var canvas = this.canvas;

    document.body.appendChild( this.outDiv0 );

    this.outDiv0.style.display = "table";
    this.outDiv0.style.width = "99%";
    this.outDiv0.style.height = "99%";
    this.outDiv0.style.position = "absolute";
    this.outDiv0.style.zIndex = "10000";

    this.outDiv1.style.display = "table-cell";
    this.outDiv1.style.verticalAlign = "middle";

    this.canvas.style.marginLeft = "auto";
    this.canvas.style.marginRight = "auto";

    this.outDiv0.appendChild( this.outDiv1 );
    this.outDiv1.appendChild( this.center );

    if( headerElementManager ) {
        this.headerElementManager = headerElementManager;
        this.center.appendChild( this.headerElementManager.get() );
        this.headerElementManager.setDimensions( totCols * cellSize, totRows * cellSize );

        this.headerElementManager.enable();
    }
    this.center.appendChild( this.canvas );
    this.canvas.focus( );


    // - - - -Canvas buffer pixel size - - - - -
    var cols =  totCols;
    canvas.width = cols * cellSize;

    var rows =  totRows;
    canvas.height = rows * cellSize;


    // - - - - Canvas appearance pixel size - - - - -
    var targetW = window.innerWidth;
    var targetH = window.innerHeight;
    var wPadding = 0.05;
    var hPadding = 0.05;

    console.log( "WEBGL style scaler precondition: s:" + targetW + "x" + targetH +  
      " cb:" + canvas.width + "x" + canvas.height );

    var newWH = this.autoFit( 
      canvas.width, canvas.height, 
      targetW, targetH, 
      wPadding, hPadding );
  
    //canvas.style.width =  newWH[0];
    //canvas.style.height = newWH[1];

  
    //- - - setup base values & buffers for WebGL - - -
 
    if (!gl) {
      alert( "No WebGL!!");
      return;
    }

    gl.viewport( 0,0, canvas.width, canvas.height );
    gl.clearColor(1.0, 0.5, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.shaderInit() ;
    var progObj = this.progObj;

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(progObj, "u_resolution");
    //var textureSizeLocation = gl.getUniformLocation(progObj, "u_textureSize");

    this.resolutionLocation = resolutionLocation;
    //this.textureSizeLocation = textureSizeLocation;

    //var colorLocation = gl.getUniformLocation(progObj, "u_color");
    //this.colorLocation = colorLocation;

    // look up where the vertex data needs to go.

    this.positionLocation = gl.getAttribLocation(progObj, "a_position");
    this.texCoordLocation = gl.getAttribLocation(progObj, "a_texCoord");
    this.colorsLocation = gl.getAttribLocation(progObj, "a_colors");

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       0.0,  0.0,
       1.0,  0.0,
       0.0,  1.0,
       0.0,  1.0,
       1.0,  0.0,
       1.0,  1.0]), gl.STATIC_DRAW);
 
    gl.enableVertexAttribArray(this.texCoordLocation);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // set the resolution
    gl.uniform2f(this.resolutionLocation, canvas.width, canvas.height);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0); // <-- binding positionLocation  to the buffer
    /*
    The WebGLRenderingContext.vertexAttribPointer() method of the WebGL API 
    binds the buffer currently bound to gl.ARRAY_BUFFER 
    to a generic vertex attribute of the current vertex buffer object and specifies its layout. 

    vertexAttribPointer(index, size, type, normalized, stride, offset)
       specifying the index of the vertex attribute that is to be modified. 
    */

    // ------------ make palette texture and upload palette
    this.paletteValues= this.getDefaultColors();
    //TEMP gl.activeTexture(gl.TEXTURE1);
    this.paletteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.paletteValues);
    

    this.u_imageLocation = gl.getUniformLocation(progObj, "u_image");
     this.u_paletteLocation = gl.getUniformLocation(progObj, "u_palette");
    
    this.colorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.enableVertexAttribArray(this.colorsLocation);
    gl.vertexAttribPointer(this.colorsLocation, 2, gl.FLOAT, false, 0, 0); // <-- binding positionLocation  to the buffer

    // - - - - Setup Tiled virtual Views - - - - - - - - - -

    this.totCols = totCols;
    this.totRows = totRows;

    var vcfg = this.__int_getDefaultViewConfig( totCols, totRows, cellSize );
    var bTop,bBottom,bLeft, bRight;

    this.__int_initTiledViews(
      totCols, totRows,
      vcfg,
      cellSize
    );


    // ------------- Timer for Cursor----------
    var _this = this;
    this.blinkInterval = setInterval(
        function()  {
          _this._int_blink();
        }, 300);



/*    this.blinkInterval = setInterval(
        function()  {

          var v0 = _this.views[ 0 ];

          v0.s_lft +=4;
          v0.s_up +=4;

          if( v0.s_lft > 31 ) {
            v0.s_lft = 0;
          }

          if( v0.s_up > 31 ) {
            v0.s_up = 0;
          }

          _this.render();
        }, 20);
*/





    // ------------- requestAnimationFrame ----------

    this.renderFlag = false;
    this.renderIntervalFlag = true;

    this.renderFunction = 
        function( timestamp )  {
          if( _this.renderFlag ) {
            _this.renderAll();
            _this.renderFlag = false;
          }

          if( _this.renderIntervalFlag ) {
                window.requestAnimationFrame( _this.renderFunction );
          }
        };


    window.requestAnimationFrame( this.renderFunction );
     
    

  }  // end init --------------------


  setupDefaultColors() {

    this.colors = { fg:0, bg:0 }; 
    this.palette = [
      "#000000",
      "#ffffff",
      "#ee2222",
      "#22aa22",
      "#1111cc",
      "#eeee22",
      "#22eeee",
      "#ee22ee",
      "#bbbbbb",
      "#777777",
      "#444444",
      "#FFAC1C",
      "#5C3317",
      "#F88379",
      "#79F883",
      "#8379F8"

    ];


    var pad2 = function( hs ) {
      var rv = hs;
      while ( rv.length < 2 ) {
        rv = "0" + rv;
      }
      return rv;
    }

    var pl = this.palette.length;
    for( var i=0; i < pl; i++) {
      var htmlCol = this.palette[i];
      var r = pad2( Math.floor(parseInt(htmlCol.substr(1,2),16) / 2).toString(16));
      var g = pad2( Math.floor(parseInt(htmlCol.substr(3,2),16) / 2).toString(16));
      var b = pad2( Math.floor(parseInt(htmlCol.substr(5,2),16) / 2).toString(16));
      var newcolor = "#" + r + g + b;
      this.palette.push( newcolor );

    }

  }

  scrollPlayfield( ix, x, y ) {

    this.views[ ix ].s_lft = x;
    this.views[ ix ].s_up = y;

    this.render();
  }

  setView( ix, x, y, w, h ) {

    this.views[ ix ].oX = x;
    this.views[ ix ].oY = y;
    this.views[ ix ].w = w;
    this.views[ ix ].h = h;

    this.render();
  }



  enablePlayfield( ix, flag ) {

    this.views[ ix ].enable = flag;

    this.render();
  }

  pfInit( ix, xo, yo,
            cC, rC,
            bcwC, brhR,
            fgColor, bgColor
            ) {

  
    var tileDim = this.views[0].tileDim;
    var vcfg, v;

    vcfg =  {
          origin: { x: 0, y: 0 },
          size: { w: bcwC, h: brhC },
          buffersize: { w: bcwC, h: brhR },
          scroll:  { up:0, left: cellsize }
    };
    this.__int_checkViewCfg( vcfg );

    v = {
          oX: xo,
          oY: yo,
          w: cC,
          h: rC,
          s_up: vcfg.scroll.up, 
          s_lft: vcfg.scoll.left,
          bw: bcwC,
          bh: brhR,
          enable: false
    };

    v.tileDim = tileDim;

    v.buf = this.__int_makeBuffer( v.bw, v.bh, v.oX, v.oY, fgColor, bgColor, tileDim ) ;

    this.views[ ix ] = v;

  }

  htmlColor( ix ) {
    return this.palette[ ix ];
  }

  shaderInit( ) {
    var gl = this.gl;
    //shader init
    var vertShaderObj = gl.createShader(gl.VERTEX_SHADER);
    var fragShaderObj = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertShaderObj, this.vertexShader);
    gl.shaderSource(fragShaderObj, this.fragmentShader);
    gl.compileShader(vertShaderObj);
    gl.compileShader(fragShaderObj);

    var progObj = gl.createProgram();
    gl.attachShader(progObj, vertShaderObj);
    gl.attachShader(progObj, fragShaderObj);
    gl.linkProgram(progObj);
    gl.useProgram(progObj);

    this.progObj = progObj;
  }

  color6PointsArray( fg, bg ) {

    var el = this.colarrCache[ fg + "_" + bg ];
    if( el ) { return el ; }

    el = new Float32Array([
           fg, bg,
           fg, bg,
           fg, bg,
           fg, bg,
           fg, bg,
           fg, bg]);

    this.colarrCache[ fg + "_" + bg ] = el;

    return el;
  }

   color6PointsArrayCrsr( fg0, bg0 ) {
   var fg = fg0 + 1;
   if( fg > 31 ) {
    fg = fg - 32;
   }

   var bg = bg0 + 1;
   if( fg == bg ) {
    bg = bg0 + 2;
   }
   if( bg > 31 ) {
    bg = bg - 32;
   }

   return this.color6PointsArray( fg, bg );
  }


  __int_makeBuffer( cols, rows, xoriP, yoriP, fgColor, bgColor, tDim ) {

    //tDim { fsw: tileSize, fsh: tileSize, fszCss: fontSizeCSS, ff: this.fontFamily };

    var cells = [];

    var colors = this.color6PointsArray( fgColor, bgColor );

    for( var y=0; y<rows; y++) {
      
      var row = [];
      for( var x=0; x<cols; x++) {
        var c = {};
        row.push( c );

        var cache = this.__int_createLetterCanvasCache( " ", tDim );
        c.cvs = cache.cvs;
        c.ctx = cache.ctx;
        c.texture = cache.texture;

        c.change = true;
        c.txt = " ";

        var x1 = (x * tDim.fsw  );
        var x2 = (x1 + tDim.fsw );
        var y1 = (y * tDim.fsh  );
        var y2 = (y1 + tDim.fsh );

        c.rect = new Float32Array([
           x1, y1,
           x2, y1,
           x1, y2,
           x1, y2,
           x2, y1,
           x2, y2]);

        c.baserect = new Float32Array([
           x1, y1,
           x2, y1,
           x1, y2,
           x1, y2,
           x2, y1,
           x2, y2]);        


        c.cols = colors;
        c.fg = bgColor;
        c.bg = fgColor;

      }

      cells.push( row );
    }


    return cells;
  }

  __int_createLetterCanvasCache( ch, tDim ) {

    //tDim { fsw: tileSize, fsh: tileSize, fszCss: fontSizeCSS, ff: this.fontFamily };

    var gl = this.gl;
    var caIx = ch + "_" + tDim.fsw + "_" + tDim.fsh ;
    var ca = this.cvsCache[ caIx ];
    if( ca ) {
      return ca;
    }

    ca = {};

    ca.txt = ch;
    ca.cvs = document.createElement("canvas");
    ca.ctx = ca.cvs.getContext('2d', {alpha: false});  
    var ctx = ca.ctx;
    var cvs = ca.cvs;

    ca.cvs.width = tDim.fsw;
    ca.cvs.height = tDim.fsh;

    ca.cvs.dataset.txt = ch;
    //var code = ch.charCodeAt(0);

    var fontFamily = tDim.ff;

    ctx.font =  tDim.fszCss + " " + fontFamily;
    ctx.textBaseline = "top";

    ctx.fillStyle = "#000000";
    ctx.fillRect(  0,0, tDim.fsw, tDim.fsh);

    ctx.fillStyle = "#ffffff";
    var woff, hoff;
    var measr =  ctx.measureText( ch )  ;
    woff = 0; 
    if( measr.width < tDim.fsw ) {
      woff = Math.floor(tDim.fsw/2) - (measr.width/2)  ;
    }

    hoff = 2; 
    ctx.fillText( ch , woff, hoff );
    
    ca.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ca.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ca.cvs);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.cvsCache[ caIx ] = ca;
    return ca;

  }


    update( p, list ) {

      this._int_blinkOff();
      this.show();

      this.x = p.cx;
      this.y = p.cy;
      if(
        this.x<0 || this.y<0 ||
        this.x>= this.view.w || this.y>= this.view.h
      ) {
        console.log("ouch");
      }

      this.colors.bg = p.bg;
      this.colors.fg = p.fg;
      this.cursorMode = p.cursorMode;

      for( var i=0; i< list.length; i++) {

        var el = list[ i ];
        this._int_updateArea( el.cells, el.x1, el.y1, el.x2, el.y2 );

      }
      this.render();

    }

    updateAll( p, srccells ) {

      this._int_blinkOff();
      this.show();

      this.x = p.cx;
      this.y = p.cy;

      if(
        this.x<0 || this.y<0 ||
        this.x>= this.view.w  || this.y>= this.view.h
      ) {
        console.log("ouch");

      }

      this.colors.bg = p.bg;
      this.colors.fg = p.fg;
      this.cursorMode = p.cursorMode;

      this._int_updateArea( srccells, 0,0, this.view.bw -1, this.view.bh -1 );

      this.render();

    }


  _int_updateArea( srccells, x0, y0, x1, y1 ) {

//    var ctx = this.ctx;
  var oc = this.colors;
  var x; var y;

  var tDim = this.view.tileDim;
  var cells = this.view.buf;
  var fsw = tDim.fsw;
  var fsh = tDim.fsh;

  try {

      for( y=y0; y<=y1; y++) {
        var yy = fsh * y;
        var offX =x0 * fsw;

        for( x=x0; x<=x1; x++) {
          var cell = cells[ y ][ x ];
          var src = srccells[ y-y0 ][ x-x0 ];

          if( cell.fg == src.fg &&
              cell.bg == src.bg &&
              cell.txt == src.txt 
              )
          {
            continue;
          }

          oc.bg = src.bg;
          oc.fg = src.fg;

          
          if(!( cell.fg == src.fg &&  cell.bg == src.bg )) {
            cell.cols = this.color6PointsArray( src.fg, src.bg );  
            cell.fg = src.fg;
            cell.bg = src.bg;
          }

          var ch = src.txt;
          if( ch != cell.txt ) {
            var cache = this.__int_createLetterCanvasCache( ch, tDim );
            cell.txt = ch;
            cell.cvs = cache.cvs;
            cell.ctx = cache.ctx;
            cell.texture = cache.texture;
          }

        }
      }
  } catch ( e ) {
    console.log("x= " + x + " y= " + y);
    console.log("x0=", x0, "y0=",y0, "x1=",x1,"y1=",y1);
    console.log(e);
  }

  }

  getColumCount() {
    return this.view.w ;
  }

  getRowCount() {
    return this.view.h;
  }

  getDimensions() {
      return [this.view.bw, this.view.bh ];
  }

  getPfBufferDimensions( pfIx ) {

      var pfViewx = this.views[ pfIx ];

      return [ pfViewx.bw, pfViewx.bh ];
  }

  getPfCells( pfIx ) {

      var pfViewx = this.views[ pfIx ];

      var cellsSrc = pfViewx.buf;
      var cells = [];

      for( var y=0; y<cellsSrc.length ; y++ ) {
        var srcRow = cellsSrc[ y ];
        var dstRow = [];
        for( var x=0; x<srcRow.length ; x++ ) {
          var srcCell = srcRow[ x ];
          var dstcell = {};
          dstcell.fg = srcCell.fg;
          dstcell.bg = srcCell.bg;
          dstcell.txt = srcCell.txt;

          dstRow.push( dstcell );
        }

        cells.push( dstRow );
      }

      return cells;

  }

  getBitmapDimensions() {
    return [ this.canvas.width, this.canvas.height ];
  }

  hasPixels() {
    return false;
  }

  clear() {

    var oc = this.colors;
    var cols = this.color6PointsArray( oc.fg, oc.bg );
    var cells = this.view.buf;

    this._int_blinkOff();
    this.show();

    var cache = this.__int_createLetterCanvasCache( " ", this.view.tileDim );
    
    var b=0;
    for( var x=0; x<this.view.w ; x++) {
      b=1-b;
      for( var y=0; y<this.view.h; y++) {

        c.cvs = cache.cvs;
        c.ctx = cache.ctx;
        c.texture = cache.texture;

        cells[ y ][ x ].txt = " ";
        cells[ y ][ x ].cols = cols;
        cells[ y ][ x ].fg = oc.fg;
        cells[ y ][ x ].bg = oc.bg;
        cells[ y ][ x ].cvs = cache.cvs;
        cells[ y ][ x ].ctx = cache.ctx;
        cells[ y ][ x ].texture = cache.texture;
      }
    }

    this.x = 0;
    this.y = 0;
  }



  show() {
    // TODO
  }

  blinkMode( mode ) {
    this.blinking = mode;
  }


  _int_blink() {

    if( !this.blinking ) {
      return;
    }

    var ce = this.view.buf[ this.y ][ this.x ];

    this.cursorOn = !this.cursorOn;

    if( this.cursorOn ) {
      ce.cols = this.color6PointsArrayCrsr( ce.fg+1, ce.bg+1 );  
    }
    else {
      ce.cols = this.color6PointsArray( ce.fg, ce.bg );  
    }

    this.render();
  }


  _int_blinkOff() {
    if( ! this.cursorOn ) {
      return;
    }
    var ce = this.view.buf[ this.y ][ this.x ];

    ce.cols = this.color6PointsArray( ce.fg, ce.bg );

    this.cursorOn = false;
  }

  _int_blinkOn() {
    if( this.cursorOn ) {
      return;
    }
    var ce = this.view.buf[ this.y ][ this.x ];

    ce.cols = this.color6PointsArray( ce.bg, ce.fg );

    this.cursorOn = true;
  }

  writeln( str ) {
      this._int_blinkOff();
      this.show();
      
      this.__int_print( str );

      this.__int_nl();
  }

  __int_nl() {
    this.y++;
    this.x = 0;
    if( this.y >= this.view.h ) {
            this.x = 0; this.y = 0;
    }
  }

  __int_print( text ) {
  
    this._int_blinkOff();
    var oc = this.colors;
    var cells = this.view.buf;

    for( var i=0; i<text.length; i++ ) {

        var ch = text.charAt( i );
        
        var ce = cells[ this.y ][ this.x ];
        
        var cache = this.__int_createLetterCanvasCache(  ch, this.view.tileDim );

        ce.txt = cache.txt;
        ce.cvs = cache.cvs;
        ce.ctx = cache.ctx;
        ce.texture = cache.texture;
        ce.cols = this.color6PointsArray( oc.fg, oc.bg );
        ce.fg = oc.fg;
        ce.bg = oc.bg;

        this.x ++;
        if( this.x >= this.view.w  ) {
          this.__int_nl();
        }
    }
  }

  notifyOnClick( handler, myFunction ) {

    this.canvas.addEventListener( "click", function() {
      handler[myFunction]();
    } );

  }

  getElement() {
    return null;
  }

  destroy() {
    
    this.outDiv0.remove();
    this.canvas = null;
    this.gl = null;
    this.cvsCache = null;
    this.views = null;
    this.view = null;

    if( this.blinkInterval ) {
      clearInterval ( this.blinkInterval );
      this.blinkInterval = undefined;
    }

    if( this.renderFlag ) {
      this.renderFlag = false;
    }
    
  }

  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }


  getDefaultColors() {
    
    var arr = new Uint8Array( 1024 );

    for( var i=0; i< this.palette.length; i++ ) {
      var rgb = this.hexToRgb( this.palette[ i ] );

      arr[ (i*4) + 0 ] = rgb.r ;
      arr[ (i*4) + 1 ] = rgb.g ;
      arr[ (i*4) + 2 ] = rgb.b ;
      arr[ (i*4) + 3 ] = 255;
    }

    return arr;

  }

  render() {
    this.renderFlag = true;
  }


  renderAll() {

    var gl = this.gl;

    gl.viewport( 0,0, this.canvas.width, this.canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for( var vi =0; vi < this.views.length; vi++) {
      var v = this.views[ vi ];
      //if( v == null ) {
      //  continue;
      //}
      if( !v.enable ) {
        continue;
      }
      this.renderTView( v, vi == this.current ); 
    }
  }

  renderTView( tview, hasCursor ) {

/* 
    oX, oY,
    w, h
    bw, bh
    tileDim
    cells

    tileDim = fsw, fsh , fszCss, ff
*/

  var canvas = this.canvas;
  var cols = tview.bw;
  var rows = tview.bh;
  var xOff = tview.oX - tview.s_lft;
  var yOff = tview.oY - tview.s_up;
  var cells = tview.buf;
  var gl = this.gl;

  /* colors work like this, we have the following parts:
      palette, a rgb palette, put into a texture
      colorBuffer, this is a array with 12 items. There are 6 point in 2 triangles, and all points have the same 2 colors indexes 
        for the current cell.  (this is because the vector shader interpolates the values between the points)
      texture.  the texture contains the shape, but only the intensity of the red is used

      color calculation. Take the fg and bg color index of the cell, look up in the pallete,
        then take the pixel value. The pixel value determines if a pixel is more a bg or a fg color
        and calculates the middle point between this. This is done to keep font antialiasing.
  */

  var vpW = tview.w;
  var vpH = tview.h;

  //TODO, not supported left off screen
  //if( ( tview.oX + tview.w ) >  canvas.width ) {
//    vpW = canvas.width - tview.oX;
  //}

  //if( ( tview.oY + tview.h ) >  canvas.height ) {
//    vpH = canvas.height - tview.oY;
  //}

  //gl.viewport( 
      //0,//tview.oX,
      //0,//tview.oX, 
      //100, 100 
  //);


  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
  gl.uniform1i(this.u_paletteLocation, 1);  // texture unit 1
  gl.uniform1i(this.u_imageLocation, 0);  // texture unit 1

  var lasttxt = "";
  var c;

  for( var y=0; y<rows; y++) {
    for( var x=0; x<cols; x++) {

          c = cells[ y ][ x ];

          if( c.fg == 0 && c.bg == 0 ) {
            continue;
          }

          //Only when xOFF changed, can optimize
          for( var i=0; i<12; i+=2 ) {
            c.rect[i] =   c.baserect[i] + xOff;
            c.rect[i+1] =   c.baserect[i+1] + yOff;
          }

          gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);  
          gl.bufferData(gl.ARRAY_BUFFER, c.rect, gl.STATIC_DRAW);

          gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);  
          gl.bufferData(gl.ARRAY_BUFFER, c.cols, gl.STATIC_DRAW);            

          if( lasttxt != c.txt ) {

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, c.texture);

            lasttxt = c.txt;
          }

          gl.drawArrays(gl.TRIANGLES, 0, 6);  
      }
    }

    //cursor
    if( hasCursor ) {

      c = cells[ this.y ][ this.x ];
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);  
      gl.bufferData(gl.ARRAY_BUFFER, c.rect, gl.STATIC_DRAW);
    
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);  
      gl.bufferData(gl.ARRAY_BUFFER, c.cols, gl.STATIC_DRAW);            

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, c.texture);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

    }

    gl.flush();


  } //---------------------- end render
  
  checkError( gl ) {
    var err = gl.getError();

    if( err === gl.NO_ERROR ) {
      //nothing
    }
    else {
      throw err;
    }
  }

  getShaderSource() {

      var shaders = [];
      
      shaders[0] = 
      `
      //in from webgl
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      attribute vec2 a_colors; // cell bg and fg color

      //in directly by code
      uniform vec2 u_resolution;

      //passed on to next shader
      varying vec2 v_texCoord;
      varying vec2 v_colors;  //used to pass a_colors on to fragment-shader
      varying vec2 v_resolution;

      void main() {
         // convert the rectangle from pixels to 0.0 to 1.0

         vec2 zeroToOne = a_position / u_resolution;

         // convert from 0->1 to 0->2
         vec2 zeroToTwo = zeroToOne * 2.0;

         // convert from 0->2 to -1->+1 (clipspace)
         vec2 clipSpace = zeroToTwo - 1.0;

         gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

         // pass the texCoord to the fragment shader
         // The GPU will interpolate this value between points.
         v_texCoord = a_texCoord;

         // pass the fg and bg color array to the fragment shader
         // The GPU will interpolate this value between points. (?!)
         v_colors = a_colors;

         v_resolution = u_resolution;
      } 
      `;


    shaders[1] = 
      `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;
        uniform sampler2D u_palette;
        
        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;
        varying vec2 v_colors; //cellcolors
        varying vec2 v_resolution;

        void main() {

          //if( gl_FragCoord.x < 32.0 || gl_FragCoord.x > (v_resolution.x - 32.0 ) ) {
          //  discard;
          //}

          //if( gl_FragCoord.y < 32.0 || gl_FragCoord.y > (v_resolution.y - 32.0 ) ) {
          //  discard;
          //}

          float i,one_minus_i;
          vec4 fgCol, bgCol, intensityColor;
          float indexfg, indexbg;
          indexfg = v_colors[ 0 ];
          indexbg = v_colors[ 1 ];

          fgCol = texture2D(u_palette, vec2((indexfg + 0.5) / 256.0, 0.5));
          bgCol = texture2D(u_palette, vec2((indexbg + 0.5) / 256.0, 0.5));
          intensityColor = ( texture2D(u_image, v_texCoord)  ) ;

          i = intensityColor.r;
          one_minus_i = 1.0 - i;

          gl_FragColor.r = ((fgCol.r * i)+  (bgCol.r * one_minus_i )) ;
          gl_FragColor.g = ((fgCol.g * i)+  (bgCol.g * one_minus_i )) ;
          gl_FragColor.b = ((fgCol.b * i)+  (bgCol.b * one_minus_i )) ;
          gl_FragColor.a = 1.0;

        }
      `;

      return shaders;
  }

}

export { KERNALMODULE as default};

