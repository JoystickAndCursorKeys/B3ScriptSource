class ExtendedCommands {

  constructor( runtime ) {
    this.output = runtime.output;
    this.bitmap = runtime.bitmap;
    this.html = runtime.html;
    this.input = runtime.input;
    this.runtime = runtime;
    this.sys = runtime.sys;
    this.cmds = {};
    this.func = {};
    this.statementList = null;
    this.erh = new ErrorHandler();

  }

  getStatements() {

    //TODO, why is it called so often?
    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_stat_")) {
        stats2.push( stats[i].substr(6 ).toUpperCase() );
      }
    }

    return stats2;
  }

  getFunctions() {
    var stats = Object.getOwnPropertyNames( ExtendedCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_fun_")) {
        var name = stats[i].substr(5 ).toUpperCase().replace("_DLR_","$");

        stats2.push( name );
      }
    }

    return stats2;
  }

  /************************ commands ************************/
  _stat_cls( pars ) {
    this.output.control( 24 );
  }

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


  _stat_gcolor( pars ) {

    var result;

    if( pars.length != 1) {
      this.erh.throwError( "parameter count", "expected color" );
      return
    }

    if( pars.length == 1) {
        var col = pars[0].value;
        this.bitmap.setLineColor( col );
        return
    }

  }


  _stat_line( pars ) {
    if( pars.length != 4 ) {
      this.erh.throwError( "parameter count", "expected 2 (x0,y0,y1,y1), not " + pars.length );
      return;
    }

    if( !this.bitmap.isActive() ) {
      this.erh.throwError( "invalid display mode", "current mode cannot show graphics" );
      return;
    }

    this.bitmap.line(
      pars[0].value,
      pars[1].value,
      pars[2].value,
      pars[3].value

    );
  }

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

  _stat_center( pars ) {

    var string;

    if( pars.length > 1 ) {
      this.erh.throwError( "too many parameters", "expected max 2, not " + pars.length );
      return;
    }

    if( pars.length == 0 ) {
      return;
    }

    string = pars[0].value;

    this.output.center( string );
  }


  _stat_locate( pars ) {

    var row = -1, col = -1;

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

  _stat_hide( pars ) {
    this.output.control( 25 );
  }

  _if_html() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

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

  _stat_htmlnode( pars ) {

    var result;

    if( pars.length == 0) {
        return
    }

    var node = pars[0];

    this.html.htmlnode( node );

  }

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

  _stat_display( pars ) {

    var result;

    if( pars.length == 0) {
        return
    }

    if( pars.length > 1) {
        this.erh.throwError( "too many variables", "expected one parameter only" );
    }

    var mode = pars[0].value;
    this.sys.setDisplayMode( this.runtime, mode   );
    this.runtime.startWaitForMessage( "displaysize" )


  }


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

  _stat_export( pars ) {
    if( pars.length > 0) {
        this.erh.throwError( "too many parameters", "export needs no parameters" );
    }

    var code = this.runtime.getProgramAsText();
    this.sys.export( code );
  }

  _fun_uc_DLR_( pars ) {


    if( pars[0].value ) {
      if( typeof pars[0].value == "string" ) {
          return String.fromCodePoint( parseInt( pars[0].value, 16 ) );
      }
      return String.fromCodePoint( pars[0].value);
    }
    return "?";
  }

  _fun_dc_DLR_( pars ) {

    var val = "";

    val = String.fromCodePoint( 17 ) + String.fromCodePoint( pars[0].value) + String.fromCodePoint( pars[1].value);

    return val;
  }

  _fun_html_DLR_( pars ) {
    return
      this.html.get();
  }


  _fun_width( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "width() has no parameters" );
    }

    var wh = this.bitmap.getDimensions();
    return wh[0];
  }

  _fun_height( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "width() has no parameters" );
    }

    var wh = this.bitmap.getDimensions();
    return wh[0];
  }

  _fun_cols( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "cols() has no parameters" );
    }

    var wh = this.output.getDimensions();
    return wh[0];
  }

  _fun_columns( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "columns() has no parameters" );
    }

    var wh = this.output.getDimensions();
    return wh[0];
  }

  _fun_rows( pars ) {

    if( pars.length != 0 ) {
        this.erh.throwError( "too many parameters", "rows() has no parameters" );
    }

    var wh = this.output.getDimensions();
    return wh[1];
  }

}