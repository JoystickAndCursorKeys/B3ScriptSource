class BasicCommands {

  constructor( runtime ) {
    this.output = runtime.output;
    this.bitmap = runtime.bitmap;
    this.input = runtime.input;
    this.runtime = runtime;
    this.sys = runtime.sys;
    this.cmds = {};
    this.func = {};
    this.statementList = null;
    this.erh = new ErrorHandler();

    this.randnrs = [];
    for(var i=0; i<10000;i++) {
      this.randnrs.push( Math.random() );
    }
    this.randIndex = 0;
    this.randStep = 1;

  }

  getStatements() {

    //if( this.statementList != null ) {
    //  return this.statementList;
    //}

    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

    var stats2 = [];

    for( var i=0;i<stats.length;i++) {
      if( stats[i].startsWith("_stat_")) {
        stats2.push( stats[i].substr(6 ).toUpperCase() );
      }
    }

    //this.statementList = stats2;
    return stats2;
  }

  getFunctions() {
    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

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
  _stat_new( pars ) {
    this.runtime.new();
  }

  _stat_list( pars ) {

    var start = 0;
    var end   = 999999;
    var parts = [];

    var mode = "noparam";

    if( pars.length==1 ) {
      parts = pars[0].parts;
    }

    if( parts.length == 1 && parts[0].type == "num" && parts[0].data >=0 ) {
      start = parts[0].data;
      end = parts[0].data;
    }
    else if( parts.length == 1 && parts[0].type == "num" && parts[0].data <0 ) {
      /*NOTE, this will stop working if RAW changes to return uniop + posnum */
      end = -parts[0].data;
    }
    else if( parts.length == 2
        && parts[0].type == "num"
        && parts[1].type == "num"
        && parts[1].op == "-"
          ) {
      start = parts[0].data;
      end = parts[1].data;

    }
    else if( parts.length == 2
        && parts[0].type == "num"
        && parts[1].type == "uniop"
        && parts[1].op == "-"
          ) {
      start = parts[0].data;
    }

    var runtime = this.runtime;
    var list = [];
    for (const l of runtime.program)
      {

        var lineNr = parseInt(l[0]);
        if(  l[0] == null || (lineNr>= start && lineNr<= end) ) {
          list.push( l[2] );
        }
      }

      this.runtime.enterListMode( list );
  }

  _if_get() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [PAR];
  }

  _if_read() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [PAR];
  }

  _if_input() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW, RAW, RAW, RAW, RAW, RAW, RAW, RAW, RAW, RAW];
  }

  _if_list() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

  _if_run() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [RAW];
  }

  _stat_read( pars ) {
    var p0 = pars[ 0 ];
    if( p0.type != "var" ) {
      this.erh.throwError( "not a var", "parameter 0" );
    }

    var data = this.runtime.readData();
    if( data === undefined ) { this.erh.throwError( "out of data" ); }
    else {
      if( data.type =="num" ) {
        this.runtime.setVar(
          p0.value, parseInt( data.data ) );
        }
        else {
          this.runtime.setVar(
            p0.value,  data.data );
        }
      }
  }

  _stat_get( pars ) {
    var p0 = pars[ 0 ];

    if( p0.type != "var" ) {
      this.erh.throwError( "not a var", "parameter 0" );
    }

    var k = this.input.getKey();
    if( k == null ) { this.runtime.setVar(p0.value, ""); }
    else {
      this.runtime.setVar(p0.value, k.key );
    }
  }

  _stat_input( pars ) {

    var vars = [];
    var con = this.output;

    for( var i=0; i<pars.length; i++) {
      if( i == 0 ) {
        var par = pars[0];

        if( par.parts.length == 2 ) {
          if( par.parts[0].type == "str" ) {
            con.write( par.parts[0].data );
            if( par.parts[1].type == "var" && par.parts[1].op == ";" ) {
              vars.push( par.parts[1].data );
            }
          }
        }
        else if( par.parts.length == 1 ) {
          vars.push( par.parts[0].data );
        }

      }
      else {
        sys.log( "PARS["+i+"]", pars[i] );
        if( pars[i].parts[0].type != "var" ) {

          this.erh.throwError( "not a var", "parameter " + i);
        }
        vars.push( pars[i].parts[0].data );
      }
    }

    this.runtime.startConsoleDataInput( vars );

  }

  _stat_restore( pars ) {
    this.runtime.restoreDataPtr();
  }

  _stat_load( pars ) {
    var runtime = this.runtime;
    var result;

    runtime.printLine("");

    if( pars.length == 0) {
      runtime.printLine("searching");
    }
    else {
      runtime.printLine("searching for " + pars[0].value);
    }

    if( pars.length == 0) {
        result = runtime.load( false );
    }
    else {
      result = runtime.load( pars[0].value );
    }

    if( !result ) {
      runtime.printLine("?not found error");
    }
    else  {

      if( !result[1] ) {  //only print when not a snapshot

        if( pars.length == 0) {
          runtime.printLine("found default");
        }
        else {
          runtime.printLine("found "+pars[0].value);
        }
        runtime.printLine("loading");
      }

    }
  }

  _stat_save( pars ) {
    var runtime = this.runtime;

    if( pars.length == 0) {
        runtime.save( false );
    }
    else {
      runtime.save( pars[0].value );
    }
  }

  _stat_sys( pars ) {
    this.erh.throwError( "not supported" );
  }

  _stat_wait( pars ) {
    this.erh.throwError( "not supported" );
  }

  _stat_verify( pars ) {
    this.erh.throwError( "not supported" );
  }

  _stat_run( pars ) {
    var runtime = this.runtime;

    runtime.runPGM();
  }

  _if_print() {
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

  _stat_print( pars ) {

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
        con.write( this.normalizeIfNumber( value ) );
      }
      else {
        con.write( "" + value );
      }
      if( newLine ) { con.nl(); }

    }

  }


  _stat_clr( pars ) {
    return this.runtime.clrPGM();
  }

  /************************ functions ************************/

  _fun_chr_DLR_( pars ) {
    return String.fromCharCode( pars[0].value );
  }

  _fun_str_DLR_( pars ) {
    if(pars[0].value>=0) {
      return " " +  pars[0].value;
    }
    return "" +  pars[0].value;
  }

  _fun_abs( pars ) {
    if( pars[0].value < 0 ) {
      return -pars[0].value;
    }
    return pars[0].value;
  }

  _fun_len( pars ) {
    return pars[0].value.length;
  }

  _fun_asc( pars ) {
    return pars[0].value.charCodeAt(0);
  }

  _fun_val( pars ) {
    return parseInt( pars[0].value );
  }

  _fun_exp( pars ) {
    return Math.exp( pars[0].value );
  }

  intGetNextRand() {
    this.randIndex = (this.randIndex + this.randStep) % this.randnrs.length;
    return this.randnrs[ this.randIndex ];
  }

  intSeedRand( x0 ) {

    if( x0 < 0) {
      var x = -x0;
      var base = Math.floor( x * 11 );
      this.randIndex= base % this.randnrs.length;
      this.randStep = 1+(base % 7);

      /* Also reseed random buffer */
      this.randnrs = [];
      for(var i=0; i<10000;i++) {
        this.randnrs.push( Math.random() );
      }
    }
    else {

      const minute = 1000 * 60;
      const hour = minute * 60;
      const day = hour * 24;
      const year = day * 365;

      const d = new Date();
      let seedModifier = Math.round(d.getTime() / year);

      x = -x;
      var base = Math.floor( seedModifier * 11 );
      this.randIndex= base % this.randnrs.length;
      this.randStep = 1+(base % 7);

      /* Also reseed random buffer */
      this.randnrs = [];
      for(var i=0; i<10000;i++) {
        this.randnrs.push( Math.random() );
      }
    }

  }


  _fun_rnd( pars ) {

    if( pars.length >1) {
      this.erh.throwError( "syntax", "rnd takes one parameter" );
    }

    if( pars.length == 1) {

      if( pars[0].value == 0 ) {
        return Math.random();
      }
      this.intSeedRand( pars[0].value );
    }

    return this.intGetNextRand();
  }

  _fun_sqr( pars ) {
    return Math.sqrt( pars[0].value);
  }

  _fun_log( pars ) {
    return Math.log( pars[0].value);
  }

  _fun_pos( pars ) {
    return this.runtime.getLinePos();
  }

  _fun_left_DLR_( pars ) {
      //? LEFT$(A$,8)
      var s = pars[0].value;

      if( (typeof s) != "string") {
        throw "@type mismatch";
      }
      return s.substr(0,pars[1].value);
  }

  _fun_right_DLR_( pars ) {
      //? RIGHT$(A$,8)
      var s = pars[0].value;

      if( (typeof s) != "string") {
        throw "@type mismatch";
      }
      return s.substr( s.length - pars[1].value );
  }

  _fun_mid_DLR_( pars ) {
      //? RIGHT$(A$,8)
      var s = pars[0].value;

      if( (typeof s) != "string") {
        throw "@type mismatch";
      }
      if( pars.length == 3) {
        return s.substr( pars[1].value-1, pars[2].value );
      }
      else if( pars.length == 2) {
        return s.substr( pars[1].value-1 );
      }
  }

  _fun_fre( pars ) {
    return -26627;
  }

  _fun_sin( pars ) {
    return Math.sin( pars[0].value);
  }

  _fun_tan( pars ) {
    return Math.tan( pars[0].value);
  }

  _fun_atn( pars ) {
    return Math.atan( pars[0].value);
  }

  _fun_cos( pars ) {
    return Math.cos( pars[0].value);
  }

  _fun_spc( pars ) {
    var out="";
    for( var i=0; i<pars[0].value; i++) {
      out+=" ";
    }
    return out;
  }

  _max(x,m) {
    if( x<m ) {  return x; }
    return m;
  }

  _fun_usr() {
    return 0;
  }

  _fun_int( pars ) {
    return Math.floor( pars[0].value );
  }

  _fun_tab( pars ) {
    var runtime = this.runtime;

    if( pars.length <1) {
      this.erh.throwError( "syntax", "missing parameter 0" );
    }
    var p = pars[0].value;
    if( p<0 || p > 255 ) {
      this.erh.throwError( "illegal quantity", "value must be in-between 0 and 255" );
    }

    for( var i=0; i<pars[0].value ; i++) {
        this.output.write( " " );
    }

    return "";
  }

  _fun_sgn( pars ) {
    var x = pars[0].value;

    if( x<0 ) { return -1; }
    else if( x>0 ) { return 1; }
    return 0;
  }


  _fun_jiffies( pars ) {
    return this.runtime.getJiffyTime( );
  }
}
