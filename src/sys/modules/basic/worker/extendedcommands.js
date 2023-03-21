class ExtendedCommands {

  constructor( basicCmds, runtime ) {
    this.output = runtime.output;
    this.bitmap = runtime.bitmap;
    this.playfields = runtime.playfields;
    this.audio = runtime.audio;
    this.html = runtime.html;
    this.input = runtime.input;
    this.runtime = runtime;
    this.sys = runtime.sys;
    this.cmds = {};
    this.func = {};
    this.statementList = null;
    this.erh = new ErrorHandler();
    this.basicCmds = basicCmds;

  }

  getStatements( raw ) {

    //TODO, why is it called so often?
    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_stat_")) {
        if( stats[i].startsWith("_stat_info_")) { continue; }

        var name = stats[i];

        if( ! raw ) {
            name = name.substr(6 ).toUpperCase();
        }

        stats2.push( name );
      }
    }

    return stats2;
  }

  getFunctions( raw ) {
    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_fun_")) {
        if( stats[i].startsWith("_fun_info_")) { continue; }

        var name = stats[i];

        if( ! raw ) {
            name = name.substr(5 ).toUpperCase().replace("_DLR_","$");
        }

        stats2.push( name );
      }
    }

    return stats2;
  }


  getAllCategories() {
    var categoryIndexes = this.basicCmds.getCategories();
    var categoryIndexes2 = this.getCategories( categoryIndexes );

    return new CommandHelp().getCategoriesNormalize( categoryIndexes2 );
  }

  getCategories( categoryIndexes ) {

    return new CommandHelp().getCategoriesIntermediate( categoryIndexes, this );

  }



  /************************ commands ************************/


  _stat_info_help() { return "general:Show help on commands:[<Help Category Index>]"; }

  _stat_help( pars ) {

  this.output.writeln("");
  var catRecord = this.getAllCategories();
  var lst = catRecord[0];
  var catLists = catRecord[1];
  var hlpctx = 1000;

  if( pars.length == 1 ) {
    hlpctx = pars[0].value;
  }

  if( hlpctx == 1000 ) {
    this.output.writeln("------------------------------");
    this.output.writeln(" Help Categories:");
    this.output.writeln("------------------------------");
    for( var i=0; i<lst.length; i++) {
      this.output.writeln( i + " " + lst[i].toUpperCase() );
    }
  }
  else {

    var lbl = lst[ hlpctx ];
    lst = catLists[ lbl ];
    if(lst === undefined ) {
      this.erh.throwError( "invalid help index" );
    }
    this.output.writeln("------------------------------");
    this.output.writeln(" Help on Category: \"" + lbl.toUpperCase() + "\"");
    this.output.writeln("------------------------------");
    for( var i=0; i<lst.length; i++) {
      //this.context.printLine( ((hlpctx * 100) + i) + " " + lst[i] );
      var attr = lst[i].attribs;
      var padLen = 11-lst[i].name.length;
      var pad = "               ".substr(0,padLen );


      if( attr.description ) {
          this.output.writeln( " " + lst[i].name  + pad + " ; " + attr.description );
      }
      else {
          this.output.writeln( " " + lst[i].name  );
      }
      if( attr.input ) {
        var lines = attr.input.split("\n");

        this.output.writeln( "               input : " + lines[0] );
        for( var l=1; l<lines.length; l++) {
            var line = lines[ l ];

            this.output.writeln( "                       " + line );
          }
          this.output.writeln( "" );
        }

        if( attr.output ) {
          var lines = attr.output.split("\n");

          this.output.writeln( "               output : " + lines[0] );
          for( var l=1; l<lines.length; l++) {
              var line = lines[ l ];

              this.output.writeln( "                       " + line );
            }
            this.output.writeln( "" );
        }
      }
    }
  this.output.writeln("");

  }

  _if_cls() {
    var EXPR = 0, PAR = 1, RAW=2;
    return [RAW];
  }

  _stat_info_cls() { return "general:Clears the screen:[<ResetScreenFlag>]"; }

  _stat_cls( pars ) {
    var reset = false;

    if( pars.length > 1 ) {
      throw "parameters";
    }
    if( pars.length == 1 && pars[0].parts.length > 1 ) {
      throw "parameters";
    }
    if( pars.length == 1 && pars[0].parts.length == 1 ) {
      if( pars[0].parts[0].data.toUpperCase() == "RESET" ) {
          reset = true;
      }
      else {
        throw "parameters";
      }
    }

    if( reset ) {
      this.output.control( 12 );
    }
    else {
      this.output.control( 24 );
    }
  }

  _stat_info_reset() { return "general:Resets the audio and the terminal:[ <Mode> (0=screen, 1=audio, 2=all) ]"; }
  _stat_reset( pars ) {

    if( pars.length == 0 ) {
      this.output.reset();
      this.audio.reset();
      this.runtime.resetTraceVar();
      return;
    }

    var mode = pars[0].value;

    if( mode != 0 && mode != 1 && mode != 2 ) {
      this.erh.throwError( "mode", "only 0, 1, 2 supported" );
      return
    }

    if( mode == 0) {
      this.output.reset();
    }
    if( mode == 1) {
      this.audio.reset();
    }
    else  {
      this.output.reset();
      this.audio.reset();
    }

  }


  _stat_info_menu() { return "general:Enable the programmers menu"; }
  _stat_menu( pars ) {

    if( pars.length == 0 ) {
      this.runtime.toggleMenu();
      return;
    }

  }

  _stat_info_reverse() { return "print:Reverse the print output:<ReverseFlag>"; }

  _stat_reverse( pars ) {

    if( pars.length == 0 ) {
      this.output.control( 65 );
      return;
    }

    var reverse = pars[0].value;
    if( reverse <0 || reverse >1 ) {
      return;
    }

    this.output.control( 64 + reverse );
  }

  _stat_info_beep() { return "sound:Make a short sound:<Channel>,<Frequency>,<Length>"; }
  _stat_beep( pars ) {


    if( pars.length == 0 ) {
      this.audio.playBeep( 0, 440, 100 );

      return
    }

    if( pars.length != 3) {
      this.erh.throwError( "parameter count", "expected channel, freq, time" );
      return
    }

    this.audio.playBeep( pars[0].value, pars[1].value, pars[2].value );

  }



  _stat_info_sound() { return "sound:Make a pre defined sound:<Channel>,<Frequency>,<Length>"; }
  _stat_sound( pars ) {

    if( pars.length == 0 ) {
      this.audio.playSound( 0, 440, 100 );

      return
    }

    if( pars.length != 3) {
      this.erh.throwError( "parameter count", "expected channel, freq, time" );
      return
    }

    this.audio.playSound( pars[0].value, pars[1].value, pars[2].value );

  }


  _stat_info_setadr() { return "sound:Define Attach,Decay and Release:<Channel>, <AttackT>, <decayT>, <releaseT>"; }
  _stat_setadr( pars ) {


    if( pars.length != 4) {
      this.erh.throwError( "parameter count", "expected channel, attackT, decayT, releaseT" );
      return
    }

    this.audio.attackDecayRelease(
       pars[0].value,
       pars[1].value,
       pars[2].value,
       pars[3].value
      );

  }

  _stat_info_volume() { return "sound:Change the audio volume:<Volume>"; }
  _stat_volume( pars ) {

    if( pars.length != 1) {
      this.erh.throwError( "parameter count", "expected volume" );
      return
    }

    this.audio.volume( pars[0].value );

  }

  _stat_info_chfreq() { return "sound:Change the channel audio frequency:<Channel, Frequency>"; }
  _stat_chfreq( pars ) {

    if( pars.length != 2) {
      this.erh.throwError( "parameter count", "expected channel, frequency" );
      return
    }

    this.audio.channelFrequency( pars[0].value, pars[1].value );

  }

  _stat_info_chvolume() { return "sound:Change the channel audio volume:<Channel>, <Volume>"; }
  _stat_chvolume( pars ) {

    if( pars.length != 2) {
      this.erh.throwError( "parameter count", "expected channel, volume" );
      return
    }

    this.audio.channelVolume( pars[0].value, pars[1].value );

  }

  _stat_info_chsvolume() { return "sound:Change the channel sustain volume:<Channel>, <Volume>"; }
  _stat_chsvolume( pars ) {

    if( pars.length != 2) {
      this.erh.throwError( "parameter count", "expected channel, volume" );
      return
    }

    this.audio.channelSustainVolume( pars[0].value, pars[1].value );

  }

  _stat_info_addfx() { return "sound:Add a Sound FX part to the channel:<Channel>, <Type>, <Value>, <Time>"; }
  _stat_addfx( pars ) {

    if( pars.length != 4) {
      this.erh.throwError( "parameter count", "expected channel, type, value and time(ms)" );
      return
    }

    this.audio.addEffect(
        pars[0].value,
        pars[1].value,
        pars[2].value,
        pars[3].value
       );

  }

  _stat_info_clearfx() { return "sound:Clear a sound effect:<Channel>"; }
  _stat_clearfx( pars ) {

    if( pars.length != 1) {
      this.erh.throwError( "parameter count", "expected channel" );
      return
    }

    this.audio.clearEffect( pars[0].value  );

  }

  _stat_info_playfx() { return "sound:Change the channel sustain volume:<Channel> [,<Frequency> ]"; }
  _stat_playfx( pars ) {

    if( pars.length < 1 || pars.length >2 ) {
      this.erh.throwError( "parameter count", "expected <Channel> [,<Frequency> ]" );
      return
    }

    var freq = 0;
    if( pars.length >1 ) {
      freq = pars[1].value;
    }

    this.audio.playEffect( pars[0].value, freq );

  }


  _stat_info_textarea() { return "print:Limit text to certain area: <CollSize>,<RowSize>\n [,<xOffset>,<yOffset>]"; }
  _stat_textarea( pars ) {

    var result;

    if( pars.length != 2 && pars.length != 4) {
      this.erh.throwError( "parameter count", "expected cols, rows [, xoffset, yoffset ]" );
      return
    }

    var cols = Math.round( pars[0].value );
    var rows = Math.round( pars[1].value );

    var wh = this.output.getDimensions();

    var xo, yo;
    xo = -1, yo = -1;
    if( pars.length == 4) {
      var xo = Math.round( pars[2].value );
      var yo = Math.round( pars[3].value );
    }

    if( cols > 0 && rows > 0  && cols <= wh[0] && rows <= wh[1] ) {

        var divx = wh[0] - cols;
        var divy = wh[1] - rows;

        if( xo > 0 && xo > divx ) {
          this.erh.throwError( "parameter", "xo to big");
        }
        if( yo > 0 && yo > divy ) {
          this.erh.throwError( "parameter", "yo to big");
        }

        this.output.textArea(  cols, rows, xo, yo );

        return
    }

  }

  _stat_info_gcolor() { return "graphics:Set graphics pen color index:<Color Index>"; }
  _stat_gcolor( pars ) {

    var result;

    if( pars.length != 1) {
      this.erh.throwError( "parameter count", "expected color" );
      return
    }

    if( pars.length == 1) {
        var col = Math.round( pars[0].value );
        if( col > 0 && col < 32) {
            this.bitmap.setLineColor(  col );
        }
        return
    }

  }

  _stat_info_fcolor() { return "graphics:Set graphics fill color index:<Color Index>"; }
  _stat_fcolor( pars ) {

    var result;

    if( pars.length != 1) {
      this.erh.throwError( "parameter count", "expected color" );
      return
    }

    if( pars.length == 1) {
        var col = Math.round( pars[0].value );
        if( col > 0 && col < 32) {
            this.bitmap.setFillColor(  col );
        }
        return
    }

  }

  _stat_info_origin() { return "graphics:Specify origin of graphics console:<X0>,<Y0>,<Dx>,<Dy>"; }
  _stat_origin( pars ) {
    if( pars.length != 4 ) {
      this.erh.throwError( "parameter count", "expected 4 (x0,y0,dx,dy), not " + pars.length );
      return;
    }

    if( !this.bitmap.isActive() ) {
      this.erh.throwError( "invalid display mode", "current mode cannot show graphics" );
      return;
    }

    if( pars[2].value != 1 && pars[2].value != -1 ) {
      this.erh.throwError( "parameter", "dx must be 1 or -1" );
      return;
    }

    if( pars[3].value != 1 && pars[3].value != -1 ) {
      this.erh.throwError( "parameter", "dy must be 1 or -1" );
      return;
    }

    this.bitmap.origin(
      pars[0].value,
      pars[1].value,
      pars[2].value,
      pars[3].value

    );
  }

  _stat_info_line() { return "graphics:Draw a line:<X0>,<Y0>,<X1>,<Y1>"; }
  _stat_line( pars ) {
    if( pars.length != 4 && pars.length != 2 ) {
      this.erh.throwError( "parameter count", "expected 2 or 4 ([x0,y0,] y1,y1), not " + pars.length );
      return;
    }

    if( !this.bitmap.isActive() ) {
      this.erh.throwError( "invalid display mode", "current mode cannot show graphics" );
      return;
    }

    if( pars.length == 2 ) {

      this.bitmap.line(
        undefined, undefined,
        pars[0].value,
        pars[1].value
      );
      return;
    }

    this.bitmap.line(
      pars[0].value,
      pars[1].value,
      pars[2].value,
      pars[3].value

    );
  }

  _stat_info_box() { return "graphics:Draw a filled rectangle:<X>,<Y>,<W>,<H>"; }
  _stat_box( pars ) {
    if( pars.length != 4 ) {
      this.erh.throwError( "parameter count", "expected 4 (x,y,w,h), not " + pars.length );
      return;
    }

    if( !this.bitmap.isActive() ) {
      this.erh.throwError( "invalid display mode", "current mode cannot show graphics" );
      return;
    }

    this.bitmap.fillRect(
      pars[0].value,
      pars[1].value,
      pars[2].value,
      pars[3].value

    );
  }

  _stat_info_plot() { return "graphics:Plot a pixel:<X0>,<Y0>,<X1>,<Y1>"; }
  _stat_plot( pars ) {
    if( pars.length != 2 ) {
      this.erh.throwError( "parameter count", "expected 2 (x,y), not " + pars.length );
      return;
    }

    if( !this.bitmap.isActive() ) {
      this.erh.throwError( "invalid display mode", "current mode cannot show graphics" );
      return;
    }

    this.bitmap.plot( pars[0].value, pars[1].value );
  }

  
_if_center() {
    var EXPR = 0, PAR = 1, RAW=2;
    return [RAW];
}

isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

normalizeIfNumber( x )  {
  if( this.isNumber( x ) ) {
    if ( x >= 0 ) {
      return " " + x;
    }
  }
  return "" + x;
}


  _stat_info_center() { return "print:Print center text or values to the console:<Value>[;<Value>][;]"; }
  _stat_center( pars ) {

    var runtime = this.runtime;
    var con= this.output;

    if( pars.length == 0 ) {
      con.nl();
      return;
    }
    else if( pars.length == 1 ) {
      if( pars[0].parts.length == 0 ) {
        con.nl();
        return;
      }
    }

    var newLine = true;
    var value;
    for( var i=0; i<pars.length; i++) {

      newLine = true;
      if( i<(pars.length-1)) {
        newLine = false;
      }

      if( i>0) {
        con.write( "         " );
      }

      var exparts = pars[i];
      var exparts2=
        { parts: [],
          binaryNegate: exparts.binaryNegate,
          negate: exparts.negate  };

      for( var j=0; j<exparts.parts.length; j++) {
        if( exparts.parts[j].type == "uniop" &&
            exparts.parts[j].op == ";" && j==(exparts.parts.length-1)
            && (i == pars.length-1)) {
              //console.log( "i="+i+" newline: set to false");
          newLine = false;
        }
        else {
          exparts2.parts.push( exparts.parts[j] );
        }
      }

      value = runtime.evalExpression( exparts2 );

      if( i == 0) {
        //this.output.center( string, inhibitNL );
        con.center( this.normalizeIfNumber( value ), true );
      }
      else {
        con.center( "" + value , true);
      }
      if( newLine ) { con.nl(); runtime.setWaiting( 1 ); }

    }

  }


  _stat_info_gtext() { return "experimental:Write text at position x,y:<X>,<Y>,<Text>"; }
  _stat_gtext( pars ) {

    var string;

    if( pars.length != 3 ) {
      this.erh.throwError( "parameters", "expected x,y and text parameters, not " + pars.length );
      return;
    }

    this.output.gtext( pars[0].value, pars[1].value, pars[2].value );
  }





  _stat_info_pokeccl() { return "poke:Put a character directly into the screen buffer:<Y>,<X>,<Code>,<FGColor>,<BGColor>"; }
  _stat_pokeccl( pars ) {

    var row = -1, col = -1;

    if( pars.length < 3 ) {
      this.erh.throwError( "parameters", "expected at least 3 parameters, not " + pars.length );
      return;
    }

    var fg = undefined;
    var bg = undefined;

    if( pars.length >= 4 ) { fg = pars[3].value; }
    if( pars.length >= 5 ) { bg = pars[4].value; }
    this.output.pokeccl( pars[0].value, pars[1].value, pars[2].value, fg, bg );
  }

  _stat_info_pokec() { return "poke:Put a character directly into the screen buffer:<Y>,<X>,<Code>"; }
  _stat_pokec( pars ) {

    var row = -1, col = -1;

    if( pars.length != 3 ) {
      this.erh.throwError( "parameters", "expected 3 parameters, not " + pars.length );
      return;
    }

    this.output.pokec( pars[0].value, pars[1].value, pars[2].value );
  }

  _stat_info_pokecl() { return "poke:Put color directly into the screen buffer:<X>,<Y>,<FGColor>[,<BGColor>]"; }
  _stat_pokecl( pars ) {

    var row = -1, col = -1;
    var bg = undefined;

    if( pars.length != 3 &&  pars.length != 4 ) {
      this.erh.throwError( "parameters", "expected 3 or 4 parameters, not " + pars.length );
      return;
    }

    if( pars.length == 4 ) {
      bg = pars[3].value;
    }

    this.output.pokecl( pars[0].value, pars[1].value, pars[2].value, bg );
  }

  _stat_info_pokebcl() { return "poke:Put background color directly into the screen buffer:<Y>,<X>,<BGColor>"; }
  _stat_pokebcl( pars ) {

    var row = -1, col = -1;

    if( pars.length != 3 ) {
      this.erh.throwError( "parameters", "expected 3 parameters, not " + pars.length );
      return;
    }

    this.output.pokecl( pars[0].value, pars[1].value, undefined, pars[2].value );
  }


  _int_checkPlayfieldNo( no ) {

    if( no != 0 && 
        no != 1 &&
        no != 2 &&
        no != 3 &&
        no != 4 &&
        no != 5 
         ) {
      this.erh.throwError( "parameters", "Value must be 0,1,2,3,4 or 5" );
      return;
    }
  }



 _stat_info_pfinit() { 
      return  "experimental:(re)Initialize of playfield buffer: <pfIndex>, <Cols>, <Rows>"; 
    }

  _stat_pfinit( pars ) {

    if( !this.playfields.enabled() ) {
      this.erh.throwError( "invalid display mode", "current mode does not have playfields" );
      return;
    }

    if( pars.length != 3 ) {
      this.erh.throwError( "parameters", "expected 3 parameters, not " + pars.length );
      return;
    }

    this._int_checkPlayfieldNo( pars[0].value );

    this.playfields.init( 
        this.runtime.processId,
        pars[0].value, 
        0,0, 
        pars[1].value, pars[2].value,
        pars[1].value, pars[2].value 
    );

    this.runtime.startWaitForMessage( "pfinit" )
  }

  _stat_info_playfield() { return "experimental:Select current playfield:<Nr> ; 0 to 3"; }
  _stat_playfield( pars ) {

    if( !this.playfields.enabled() ) {
      this.erh.throwError( "invalid display mode", "current mode does not have playfields" );
      return;
    }

    if( pars.length != 1 ) {
      this.erh.throwError( "parameters", "expected 1 parameter, not " + pars.length );
      return;
    }

    this._int_checkPlayfieldNo( pars[0].value );

    this.playfields.select( 
              this.runtime.processId,
              pars[0].value );
    this.runtime.startWaitForMessage( "pfselect" );
  }

  _stat_info_pfscroll() { 
      return  "experimental:Set scroll pos of playfield view: <pfIndex>, <sX>, <sY>"; 
    }

  _stat_pfscroll( pars ) {

    if( !this.playfields.enabled() ) {
      this.erh.throwError( "invalid display mode", "current mode does not have playfields" );
      return;
    }

    if( pars.length != 3 ) {
      this.erh.throwError( "parameters", "expected 3 parameters, not " + pars.length );
      return;
    }

    this._int_checkPlayfieldNo( pars[0].value );

    this.playfields.scrollpos( 
        this.runtime.processId,
        pars[0].value, 
        pars[1].value, pars[2].value
    );

  }

  _stat_info_pfview() { 
      return  "experimental:Initialize size of playfield view: <pfIndex>, <X>, <Y>, <W>, <H>"; 
    }

  _stat_pfview( pars ) {

    if( !this.playfields.enabled() ) {
      this.erh.throwError( "invalid display mode", "current mode does not have playfields" );
      return;
    }

    if( pars.length != 5 ) {
      this.erh.throwError( "parameters", "expected 5 parameters, not " + pars.length );
      return;
    }

    this._int_checkPlayfieldNo( pars[0].value );

    this.playfields.viewdefine( 
        this.runtime.processId,
        pars[0].value, 
        pars[1].value, pars[2].value,
        pars[3].value, pars[4].value
    );

  }


 


  _stat_info_pfenable() { 
      return  "experimental:Enable  a playfield to be visible: <pfIndex>, <OnOfFlag>"; 
    }

  _stat_pfenable( pars ) {

    if( !this.playfields.enabled() ) {
      this.erh.throwError( "invalid display mode", "current mode does not have playfields" );
      return;
    }

    if( pars.length != 2 ) {
      this.erh.throwError( "parameters", "expected 2 parameters, not " + pars.length );
      return;
    }

    this._int_checkPlayfieldNo( pars[0].value );

    this.playfields.setEnable( 
        this.runtime.processId,
        pars[0].value, 
        pars[1].value
    );

  }

  _stat_info_locate() { return "print:Set the cursor position:<Y>,<X>"; }
  _stat_locate( pars ) {

    var row = undefined, col = undefined;

    if( pars.length > 2 ) {
      this.erh.throwError( "too many parameters", "expected max 2, not " + pars.length );
      return;
    }

    if( pars.length == 0 ) {
      return;
    }

    if( pars.length >= 1 ) {
      row = pars[0].value;
    }

    if( pars.length >= 2 ) {
      col = pars[1].value;
    }

    this.output.setCursorPos( col, row );
  }

  _stat_info_hide() { return "general:Hide the terminal"; }
  _stat_hide( pars ) {
    this.output.control( 25 );
  }


  _if_html() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

  _stat_info_html() { return "html:Unsupported command"; }
  _stat_html( pars ) {
    var html = this.html;

    if( pars.length == 0 ) {
      return;
    }

    var newLine = true;
    var value;
    var contentIx = 0;
    var handleIx = -1;
    var htmlHandle = null;
    var htmlValue = "";
    var htmlAppend = false;

    if( pars.length == 2) {
      contentIx = 1;
      handleIx = 0;
    }

    for( var i=0; i<pars.length && i<2; i++) {

      var exparts = pars[i];
      var exparts2=
        { parts: [],
          binaryNegate: exparts.binaryNegate,
          negate: exparts.negate  };

      for( var j=0; j<exparts.parts.length; j++) {
        if( exparts.parts[j].type == "uniop" &&
            exparts.parts[j].op == "+" && j==(exparts.parts.length-1)
            && (i == pars.length-1)) {
              htmlAppend = true;
        }
        else {
          exparts2.parts.push( exparts.parts[j] );
        }
      }
      value = this.runtime.evalExpression( exparts2 );

      if( i == handleIx ) {
        htmlHandle =  value;
      }
      else {
        htmlValue = value;
      }
    }

    this.html.html(
        {
          htmlHandle: htmlHandle,
          htmlValue: htmlValue,
          htmlAppend: htmlAppend
        }
      );
  }

  _stat_info_htmlnode() { return "html:Unsupported command"; }
  _stat_htmlnode( pars ) {

    var result;

    if( pars.length == 0) {
        return
    }

    var node = pars[0];

    this.html.htmlnode( node );

  }


  _stat_info_htmlbg() { return "html:Unsupported command"; }
  _stat_htmlbg( pars ) {

    var result;

    if( pars.length == 0) {
        return
    }

    var url = pars[0].value;

    this.html.executeFunction( "body.style.backgroundImage", url );

  }

  _stat_info_color() { return "print:Sets the console color index:<PenColor>[, <PaperColor>\n[, <BorderColor>]]"; }
  _stat_color( pars ) {

    var result;

    if( pars.length == 0) {
        return
    }

    if( pars.length == 1) {
        var col = pars[0].value;
        this.output.control( 16, col );
        return
    }

    var bgcol = pars[1].value;
    var col = pars[0].value;
    this.output.control( 16, col   );
    this.output.control( 17, bgcol );

    if( pars.length == 3) {
        var border = pars[2].value;
        this.output.control( 18, border );
        return
    }

  }

  _stat_info_display() { return "general:Set the console display mode:<DisplayModeNumber>"; }
  _stat_display( pars ) {

    var result;
    var modes = this.sys.screenModes;

    if( pars.length == 0) {

        var list = [ ];


        for( var i=0 ; i<modes.length ; i++) {
          if( modes[ i] ) {
            list.push( i + ":   " + modes[i]);
          }
        }
        //list.push( "Current Mode: " + this.sys.displayMode );

        this.runtime.enterListMode( list );
        return
    }

    if( pars.length > 1) {
        this.erh.throwError( "too many variables", "expected one parameter only" );
    }

    var mode = pars[0].value;
    if( modes[mode] === undefined ) {
      this.erh.throwError( "Invalid mode", "No such display mode" );
    }
    this.sys.setDisplayMode( this.runtime, mode );
    this.sys.blinkMode( !this.runtime.isRunning() );
    this.runtime.flagStatusChange();
    this.runtime.startWaitForMessage( "displaysize" )


  }


  _stat_info_gfilter() { return "experimental:Add a html filter to the display:<FilterString>"; }
  _stat_gfilter( pars ) {

    var result;

    if( pars.length != 1) {
        this.erh.throwError( "too many variables", "expected one parameter only" );
    }

    var filter = pars[0].value;
   
    this.output.setFilter( filter );

  }

  _stat_info_border() { return "general:Changes the border color:<ColorIndex>"; }
  _stat_border( pars ) {

    var result;

    if( pars.length == 0) {
        return
    }

    if( pars.length > 1) {
        this.erh.throwError( "too many parameters", "expected one parameter only" );
    }

    var bcol = pars[0].value;
    this.output.control( 18, bcol );

  }

  _stat_info_export() { return "program:Export program for download"; }
  _stat_export( pars ) {
    if( pars.length > 0) {
        this.erh.throwError( "too many parameters", "export needs no parameters" );
    }

    var code = this.runtime.getProgramAsText();
    this.sys.export( code, "disk" );
  }

  _stat_info_copy() { return "program:Copy program to clipboard"; }
  _stat_copy( pars ) {
    if( pars.length > 0) {
        this.erh.throwError( "too many parameters", "copy needs no parameters" );
    }

    var code = this.runtime.getProgramAsText();
    this.sys.export( code, "clipboard" );
    this.runtime.printLine("Copied " + this.runtime.getProgramSize() + " program lines to the clipboard" );
  }


  _stat_info_txtcopy() { return "experimental:Copy data to clipboard:<StringData$>"; }
  _stat_txtcopy( pars ) {
    if( pars.length != 1) {
        this.erh.throwError( "parameter count", "dcopy needs 1 parameter" );
    }

    this.sys.export( pars[0].value + "", "clipboard" );

  }



  _fun_info_peekcl() { return "poke:Get color information directly from from screen buffer:<Y>,<X>[,<Mode]"; }
  _fun_peekcl( pars ) {

    var row = -1, col = -1;
    var mode = 0;

    if( pars.length != 3  && pars.length != 2 ) {
      this.erh.throwError( "parameters", "expected 2 or 3 parameters, not " + pars.length );
      return;
    }

    if( pars.length == 3 ) {
      mode = pars[2].value;
    }
    return this.output.peekcl( pars[0].value, pars[1].value, mode );
  }


  _fun_info_peekc() { return "poke:Get a character directly into from screen buffer:<Y>,<X>"; }
  _fun_peekc( pars ) {

    var row = -1, col = -1;

    if( pars.length != 2 ) {
      this.erh.throwError( "parameters", "expected 2 parameters, not " + pars.length );
      return;
    }

    return this.output.peekc( pars[0].value, pars[1].value );
  }


  _fun_info_ucbase() { return "string:Return unicode-set base character code:<SetName$>"; }
  _fun_ucbase( pars ) {

    if( pars.length != 1 ) {
      this.erh.throwError( "parameters", "UCBASE() needs one parameter" );
    }

    var baseLabel = pars[0].value;

    if( baseLabel.toLowerCase() == "box" ) {
      return parseInt( "2500", 16 );
    }
    else if( baseLabel.toLowerCase() == "blocks" ) {
      return parseInt( "2580", 16 );
    }
    else if( baseLabel.toLowerCase() == "symbol" ) {
      return parseInt( "2b00", 16 ); //can be too wide
    }
    else if( baseLabel.toLowerCase() == "legacy" ) {
      return parseInt( "1fb00", 16 );
    }
    return 0;
  }

  _fun_info_uc_DLR_() { return "string:Create unicode character:<UnicodeHexCode$>"; }
  _fun_uc_DLR_( pars ) {

    if( pars[0].value ) {
      if( typeof pars[0].value == "string" ) {
          return String.fromCodePoint( parseInt( pars[0].value, 16 ) );
      }
      return String.fromCodePoint( pars[0].value);
    }
    return "?";
  }

  _fun_info_dc_DLR_() { return "print:Return device control char. sequence:<Parameter1>, <Parameter2>"; }
  _fun_dc_DLR_( pars ) {

    var val = "";

    val = String.fromCodePoint( 17 ) + String.fromCodePoint( pars[0].value) + String.fromCodePoint( pars[1].value);

    return val;
  }

  _fun_info_html_DLR_() { return "html:Unsupported function"; }
  _fun_html_DLR_( pars ) {
    return
      this.html.get();
  }


  _fun_info_width() { return "general:Return the console width in pixels"; }
  _fun_width( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "width() has no parameters" );
    }

    var wh = this.bitmap.getDimensions();
    return wh[0];
  }

  _fun_info_height() { return "general:Return the console height in pixels"; }
  _fun_height( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "width() has no parameters" );
    }

    var wh = this.bitmap.getDimensions();
    return wh[1];
  }

  _fun_info_cols()  { return "print:Return the console width in columns"; }
  _fun_cols( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "cols() has no parameters" );
    }

    var wh = this.output.getDimensions();
    return wh[0];
  }

  _fun_info_columns() { return "print:Return the console width in columns"; }
  _fun_columns( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "columns() has no parameters" );
    }

    var wh = this.output.getDimensions();
    return wh[0];
  }

  _fun_info_rows() { return "print:Return the console height in rows"; }
  _fun_rows( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "rows() has no parameters" );
    }

    var wh = this.output.getDimensions();
    return wh[1];
  }

}
