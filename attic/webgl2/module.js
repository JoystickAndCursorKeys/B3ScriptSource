/* Helpfull websites for webgl:
  https://webglfundamentals.org/webgl/lessons/webgl-qna-emulating-palette-based-graphics-in-webgl.html
  https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
 */


class KERNALMODULE {

  constructor( sys ) {

    this.sys = sys;

    this.cursorOn = false;
    this.blinking = true;


    this.setupDefaultColors();
    this.setupDefaultTextMode();

    this.vertexShader = 
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
      } 
      `;


    this.fragmentShader = 
      `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;
        uniform sampler2D u_palette;
        
        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;
        varying vec2 v_colors; //cellcolors

        void main() {

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

  }


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

  init() {
  }

  htmlColor( ix ) {
    return this.palette[ ix ];
  }


  setupDefaultTextMode() {

    this.fSize = 32;
    this.fxfact = 1;
    this.fontSizeCSS = this.fSize + "px";
    this.fsw = Math.floor( this.fSize * this.fxfact );
    this.fsh = this.fSize;
    this.fswOff = Math.floor(this.fsw * .2);
    this.fshOff = Math.floor(this.fsh * .2);
    this.fontFamily = "monospace";

    this.x = 0;
    this.y = 0;

    var oc = this.colors;
    oc.bg = 0;
    oc.fg = 5;

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


  initCells( rows, cols ) {
    
    this.cells = [];

    var oc = this.colors
    var colors = this.color6PointsArray( oc.fg, oc.bg );

    for( var y=0; y<rows; y++) {
      this.cells[ y ] = [];
      for( var x=0; x<cols; x++) {
        var c = {};
        this.cells[ y ][ x ] = c;

        var cache = this.createLetterCanvasCache( " " );
        c.cvs = cache.cvs;
        c.ctx = cache.ctx;
        c.texture = cache.texture;

        c.change = true;
        c.txt = " ";

        var x1 = (x * this.fsw  );
        var x2 = (x1 + this.fsw );
        var y1 = (y * this.fsh  );
        var y2 = (y1 + this.fsh );

        x1 +=  this.cellsXO;
        x2 +=  this.cellsXO;
        y1 +=  this.cellsYO;
        y2 +=  this.cellsYO;

        c.rect = new Float32Array([
           x1, y1,
           x2, y1,
           x1, y2,
           x1, y2,
           x2, y1,
           x2, y2]);

        c.oldrect = new Float32Array([
           x1, y1,
           x2, y1,
           x1, y2,
           x1, y2,
           x2, y1,
           x2, y2]);        


        c.cols = colors;
        c.fg = oc.fg;
        c.bg = oc.bg;

      }
    }
  }

  createLetterCanvasCache( ch ) {
    var gl = this.gl;
    var ca = this.cvsCache[ ch ];
    if( ca ) {
      return ca;
    }

    ca = {};

    ca.txt = ch;
    ca.cvs = document.createElement("canvas");
    ca.ctx = ca.cvs.getContext('2d', {alpha: false});  
    var ctx = ca.ctx;
    var cvs = ca.cvs;

    ca.cvs.width = this.fsw;
    ca.cvs.height = this.fsh;

    ca.cvs.dataset.txt = ch;
    //var code = ch.charCodeAt(0);

    var fontFamily = this.fontFamily;

    ctx.font =  this.fontSizeCSS + " " + fontFamily;
    ctx.textBaseline = "top";

    ctx.fillStyle = "#000000";
    ctx.fillRect(  0,0, this.fsw, this.fsh);

    ctx.fillStyle = "#ffffff";
    var woff, hoff;
    var measr =  ctx.measureText( ch )  ;
    woff = 0; 
    if( measr.width < this.fsw ) {
      woff = Math.floor(this.fsw/2) - (measr.width/2)  ;
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

    this.cvsCache[ ch ] = ca;
    return ca;

  }


    update( p, list ) {

      this._int_blinkOff();
      this.show();

      this.x = p.cx;
      this.y = p.cy;
      if(
        this.x<0 || this.y<0 ||
        this.x>= this.cols || this.y>= this.rows
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
        this.x>= this.cols || this.y>= this.rows
      ) {
        console.log("ouch");

      }

      this.colors.bg = p.bg;
      this.colors.fg = p.fg;
      this.cursorMode = p.cursorMode;

      this._int_updateArea( srccells, 0,0, this.cols -1, this.rows -1 );

      this.render();

    }


  _int_updateArea( srccells, x0, y0, x1, y1 ) {

//    var ctx = this.ctx;
  var fsw = this.fsw;
  var fsh = this.fsh;
  var oc = this.colors;

  var x; var y;

  try {

      for( y=y0; y<=y1; y++) {
        var yy = fsh * y;
        var offX =x0 * fsw;

        for( x=x0; x<=x1; x++) {
          var cell = this.cells[ y ][ x ];
          var src = srccells[ y-y0 ][ x-x0 ];

          if( cell.fg == src.fg &&
              cell.bg == src.bg &&
              cell.txt == src.txt 
              )
          {
            continue;
          }

          var ch = src.txt;

          var cache = this.createLetterCanvasCache( ch );
    
          oc.bg = src.bg;
          oc.fg = src.fg;

          cell.txt = ch;
          cell.fg = src.fg;
          cell.bg = src.bg;
          cell.cols = this.color6PointsArray( src.fg, src.bg );
          cell.cvs = cache.cvs;
          cell.ctx = cache.ctx;
          cell.texture = cache.texture;

          offX += fsw;
        }
      }
  } catch ( e ) {
    console.log("x= " + x + " y= " + y);
    console.log("x0=", x0, "y0=",y0, "x1=",x1,"y1=",y1);
    console.log(e);
  }

  }

  getColumCount() {
    return this.cols;
  }

  getRowCount() {
    return this.rows;
  }

  getDimensions() {
      return [this.cols, this.rows ];
  }

  hasPixels() {
    return false;
  }

  clear() {

    var oc = this.colors;
    var cols = this.color6PointsArray( oc.fg, oc.bg );

    this._int_blinkOff();
    this.show();

    var cache = this.createLetterCanvasCache( " " );
    
    var b=0;
    for( var x=0; x<this.cols; x++) {
      b=1-b;
      for( var y=0; y<this.rows; y++) {

        c.cvs = cache.cvs;
        c.ctx = cache.ctx;
        c.texture = cache.texture;

        this.cells[ y ][ x ].txt = " ";
        this.cells[ y ][ x ].cols = cols;
        this.cells[ y ][ x ].fg = oc.fg;
        this.cells[ y ][ x ].bg = oc.bg;
        this.cells[ y ][ x ].cvs = cache.cvs;
        this.cells[ y ][ x ].ctx = cache.ctx;
        this.cells[ y ][ x ].texture = cache.texture;
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

    var ce = this.cells[ this.y ][ this.x ];

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
    var ce = this.cells[ this.y ][ this.x ];

    ce.cols = this.color6PointsArray( ce.fg, ce.bg );

    this.cursorOn = false;
  }

  _int_blinkOn() {
    if( this.cursorOn ) {
      return;
    }
    var ce = this.cells[ this.y ][ this.x ];

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
    if( this.y >= this.rows ) {
            this.x = 0; this.y = 0;
    }
  }

  __int_print( text ) {
  
    this._int_blinkOff();
    var oc = this.colors;

    for( var i=0; i<text.length; i++ ) {

        var ch = text.charAt( i );
        
        var ce = this.cells[ this.y ][ this.x ];
        
        var cache = this.createLetterCanvasCache(  ch );

        ce.txt = cache.txt;
        ce.cvs = cache.cvs;
        ce.ctx = cache.ctx;
        ce.texture = cache.texture;
        ce.cols = this.color6PointsArray( oc.fg, oc.bg );
        ce.fg = oc.fg;
        ce.bg = oc.bg;

        this.x ++;
        if( this.x >= this.cols ) {
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
    this.cells = [];

    if( this.blinkInterval ) {
      clearInterval ( this.blinkInterval );
      this.blinkInterval = undefined;
    }

    if( this.renderFlag ) {
      this.renderFlag = false;
//      clearInterval ( this.renderInterval );
//      this.renderInterval = undefined;
    }
    
  }



  initMode( config, headerElementManager  ) {

    var sys = this.sys;
    var msgs = sys.init.queuedMessages;

    this.cvsCache = {};
    this.colarrCache = {};    

    this.cursorOn = false;
    this.blinking = true;


    var w;
    var h;

    if( config[0].indexOf("x") > 0) {
        var tmp = config[0].split("x");
        w = parseInt( tmp[0] );
        h = parseInt( tmp[1] );
    }
    else {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        if( config[0].startsWith( "%%" )) {
          var percentages = config[0].substr( 2 ).split(",");
          var percentagex = percentages[0] / 100;
          var percentagey = percentages[1] / 100;
          w = Math.floor(ww * percentagex);
          h = Math.floor(wh * percentagey);
        }
        else if( config[0].startsWith( "%" )) {
          var percentage = config[0].substr( 1 );
          percentage = percentage / 100;
          w = Math.floor(ww * percentage);
          h = Math.floor(wh * percentage);
        }
    }


//-------------------------------------------------


    this.outDiv0 = document.createElement("div");
    this.outDiv1 = document.createElement("div");
    this.center = document.createElement("center");

    this.cnt = 0;

    this.canvas = document.createElement("canvas");
    this.gl = this.canvas.getContext( "webgl" , {antialias: true, alpha: false } );

    var gl = this.gl;
    var canvas = this.canvas;

    canvas.width=w;
    canvas.height=h;

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
        this.headerElementManager.setDimensions( w, h );

        this.headerElementManager.enable();
    }
    this.center.appendChild( this.canvas );


    this.canvas.focus( );

    var cols =  Math.floor( canvas.width / this.fsw );
    canvas.width = cols * this.fsw;

    var rows =  Math.floor( canvas.height / this.fsh );
    canvas.height = rows * this.fsh;

    if( cols > 48 ) { 
      //cols = 48;
    }
 
    if( rows > 16 ) { 
      //rows = 16;
    }
 
    this.cols = cols;
    this.rows = rows;

    var xdiff = canvas.width - (cols * this.fsw) ;
    var ydiff = canvas.height - (rows * this.fsh) ;

    this.cellsXO = Math.floor( xdiff / 2 );
    this.cellsYO = Math.floor( ydiff / 2 );

    this.initCells( rows, cols );

    if (!gl) {
      alert( "No WebGL!!");
      return;
    }

    gl.viewport( 0,0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.5, 0.0, 1.0);
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

    //cursor
    var _this = this;
    this.blinkInterval = setInterval(
        function()  {
          _this._int_blink();
        }, 300);

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

  renderAll( ) {

  if( !this.scrollX ) {
    this.scrollX = 0;
  }

  this.scrollX = this.scrollX + 1;
  if( this.scrollX > 63 ) {
    this.scrollX = 0;
  }

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

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
  gl.uniform1i(this.u_paletteLocation, 1);  // texture unit 1
  gl.uniform1i(this.u_imageLocation, 0);  // texture unit 1

  var lastbg = -1;
  var lastfg = -1;
  var lasttxt = "";
  var c;

  for( var y=0; y<this.rows; y++) {
    for( var x=0; x<this.cols; x++) {

        if( true ) {
          c = this.cells[ y ][ x ];

          //to be specific we need to bind the buffer like this
          //

          var rx = Math.random() * 15;

          for( var i=0; i<12; i+=2 ) {
            c.rect[i] =   c.oldrect[i] + this.scrollX;
          }
          

          gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);  
          gl.bufferData(gl.ARRAY_BUFFER, c.rect, gl.STATIC_DRAW);

          gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);  
          gl.bufferData(gl.ARRAY_BUFFER, c.cols, gl.STATIC_DRAW);            

          lastbg = c.bg;
          lastfg = c.fg;
          
          if( lasttxt != c.txt ) {

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, c.texture);

            lasttxt = c.txt;
          }


          gl.drawArrays(gl.TRIANGLES, 0, 6);

        }
      }
    }

    //cursor
    c = this.cells[ this.y ][ this.x ];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);  
    gl.bufferData(gl.ARRAY_BUFFER, c.rect, gl.STATIC_DRAW);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);  
    gl.bufferData(gl.ARRAY_BUFFER, c.cols, gl.STATIC_DRAW);            

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, c.texture);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

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

}

export { KERNALMODULE as default};

