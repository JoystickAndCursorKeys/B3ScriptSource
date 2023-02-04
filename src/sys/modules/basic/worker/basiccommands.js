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

    this.keyLabelCodes = {};

    this.randnrs = [];
    for(var i=0; i<10000;i++) {
      this.randnrs.push( Math.random() );
    }
    this.randIndex = 0;
    this.randStep = 1;

  }

  getStatements( raw ) {

    //TODO, why is it called so often?
    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

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
    var stats = Object.getOwnPropertyNames( BasicCommands.prototype );

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

  getCategories() {

    return new CommandHelp().getCategoriesIntermediate( [{},{}], this );

  }


  /************************ commands ************************/

  _stat_info_new() { return "program:Delete the current program from memory:"; }
  _stat_new( pars ) {

    this.runtime.new();
  }

  _stat_info_list() { return "program:List the basic program"; }
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
          if( l[1][0].type == "control" && l[1][0].controlKW == "sub" ) {
              list.push( "" );
          }
          list.push( l[2] );
        }
      }

      this.runtime.enterListMode( list );
  }


  _if_get() {
      var EXPR = 0, PAR = 1, RAW=2;
      return [PAR];
  }

  _if_getkey() {
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

  _stat_info_read() { return "io:Read a value from the data::<Data$ or Data>"; }
  _stat_read( pars ) {
    var p0 = pars[ 0 ];
    if( p0.type != "var" ) {
      this.erh.throwError( "not a var", "parameter 0" );
    }

    var data = this.runtime.readData();
    if( data === undefined ) { this.erh.throwError( "out of data" ); }

    if( p0.varType == "num" && (typeof data).toLowerCase() == "number" ) {
          this.runtime.setVar(
            p0.value,  data  );
    }
    else if( p0.varType == "str" && (typeof data).toLowerCase() == "string" ) {
          this.runtime.setVar(
            p0.value,  data  );
    }
    else if( p0.varType == "num" && (typeof data).toLowerCase() == "string" ) {

          data = parseInt ( data );

          if( isNaN( data ) ) {
            this.erh.throwError( "expected number" );
          }
          this.runtime.setVar(
            p0.value, data );
    }
    else if( p0.varType == "str" && (typeof data).toLowerCase() == "number" ) {
          this.runtime.setVar(
            p0.value,  "" + data  );
    }

  }

  _stat_info_get() { return "io:Retrieve the last key pressed::<Key$>"; }
  _stat_get( pars ) {
    var p0 = pars[ 0 ];

    if( p0.type != "var" ) {
      this.erh.throwError( "not a var", "parameter 0" );
    }

    var k = this.input.getKey();
    if( k == null ) { this.runtime.setVar(p0.value, ""); }
    else {
      if( k.key != null ) {
        this.runtime.setVar(p0.value, k.key );
      }
      else {
        this.runtime.setVar(p0.value, "???" );
      }
    }

    this.runtime.flagInputCommand();
  }

  _stat_info_getkey() { return "io:Retrieve the last key pressed::<Key$>"; }
  _stat_getkey( pars ) {
    var p0 = pars[ 0 ];

    if( p0.type != "var" ) {
      this.erh.throwError( "not a var", "parameter 0" );
    }

    var k = this.input.getKey();
    if( k == null ) { this.runtime.setVar(p0.value, "" ); }
    else {
      if( k.key != null ) {
        this.runtime.setVar(p0.value, k.key );
      }
      else {
        this.runtime.setVar(p0.value, k.keyLabel );
      }
    }

    this.runtime.flagInputCommand();
  }

  _stat_info_input() { return "io:Waits for the user to type in a value::<Value>"; }
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

  _stat_info_restore() { return "io:Set the READ-pointer, to the beginning:"; }
  _stat_restore( pars ) {
    this.runtime.restoreDataPtr();
  }

  _stat_info_waitms() { return "program:Wait a certain time:<MilliSeconds>"; }
  _stat_waitms( pars ) {
    this.runtime.setWaiting( pars[0].value );
  }

  _stat_info_load() { return "program:Load a program in memory:<FileName>"; }
  _stat_load( pars ) {
    var runtime = this.runtime;
    var result;

    runtime.printLine("");

    if( pars.length == 0) {
      runtime.printLine("searching");
    }
    else {
      runtime.printLine("searching for \"" + pars[0].value + "\"" );
    }

    if( pars.length == 0) {
        result = runtime.load( "*", false, -1 );
    }
    else {
      if( pars.length == 1) {
        result = runtime.load( pars[0].value, false, -1 );
      }
      else if( pars.length == 2) {
        result = runtime.load( pars[0].value, false, pars[1].value );
      }
    }
    this.aSync = true;

  }

  _stat_info_setdata() { return "experimental:Set data pointer:[<Label>]"; }
  _stat_setdata( pars ) {

    var runtime = this.runtime;
    var label = null;

    if( pars.length > 1  ) {
      this.erh.throwError( "parameters", "Setdata takes one optional parameter" );
    }

    if( pars.length == 1 ) {
      label = pars[0].value ;
    }

    var list = runtime.setData( label );

  }

  _stat_info_datablocks() { return "experimental:Dump data blocks in memory"; }
  _stat_datablocks( pars ) {

    var runtime = this.runtime;
    var result;

    if( pars.length != 0 ) {
      this.erh.throwError( "parameters", "Listdata takes no parameterss" );
    }

    var list = runtime.getDataBlocks();
    runtime.enterListMode( list );

  }

  _stat_info_loaddata() { return "experimental:Load data in memory:<Filename> [, <Type>, <Label>]"; }
  _stat_loaddata( pars ) {

    var runtime = this.runtime;
    var result;
    var label = null;
    var type = "I:CSV";
    runtime.printLine("");

    if( pars.length != 1 && pars.length != 2 && pars.length != 3 ) {
      this.erh.throwError( "parameters", "loaddata takes one mandatory and two optional parameters" );
    }

    if( pars.length >= 2 ) {
      type = pars[1].value ;
    }

    if( type.indexOf(":") < 0) {
      this.erh.throwError( "invalid type specification", "Expected <Type>:<FileSyntax>. Example: \"I:CSV\"" );
    }

    if( pars.length == 3 ) {
      label = pars[2].value ;
    }

    result = runtime.loaddata( pars[0].value, type, label );

    this.aSync = true;

  }


  _stat_info_dir() { return "program:List a files on the current file system:[<Path> [,<Device>]]"; }
  _stat_dir( pars ) {
    var runtime = this.runtime;
    var result;

    runtime.printLine("");

    if( pars.length == 0) {
      runtime.dir( "" );
      return;
    }

    if( pars.length == 1) {
      runtime.dir( pars[0].value, -1 );
      return;
    }
    else if( pars.length == 2) {
      runtime.dir( pars[0].value, pars[1].value );
      return;
    }

    this.erh.throwError( "parameter", "dir takes 0,1 or 2 parameter(s)"  );

    this.aSync = true;

  }

  _stat_info_fs() { return "program:Set or List (the) filesystem(s):[<FileSystem$>]"; }
  _stat_fs( pars ) {
    var runtime = this.runtime;

    if( pars.length == 0) {
      runtime.listfs();
    }
    else if( pars.length == 1) {
      runtime.setfs( pars[0].value );
    }


    this.aSync = true;

  }


  _stat_info_renumber() { return "program:Renumber the current program"; }
  _stat_renumber( pars ) {

    var runtime = this.runtime;
    runtime.renumberProgram( 10,10 );

  }

  _stat_info_vars() { return "program:List all variables to the screen"; }
  _stat_vars( pars ) {


    var runtime = this.runtime;

    var varList = runtime.getFullVarList();
    this.runtime.enterListMode( varList );

  }


  _stat_info_tracevar() { return "program:Trace variable changes:[<VariableName$>]"; }
  _stat_tracevar( pars ) {

    var runtime = this.runtime;

    if( pars.length == 0) {
      var traceList = runtime.getTraceList();
      this.runtime.enterListMode( traceList );

      return;
    }

    if( pars.length == 1) {
      runtime.setTraceVar( pars[0].value );
      return;
    }

  }

  _stat_info_clrtracevar() { return "program:Stop tracing variables"; }
  _stat_clrtracevar( pars ) {

    var runtime = this.runtime;

    if( pars.length == 0) {
      var traceList = runtime.resetTraceVar();
    }
  }


  _stat_info_boot() { return "program:Load and run a program:<FileName>"; }
  _stat_boot( pars ) {
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
        result = runtime.load( "*", true, -1 );
    }
    else {
      result = runtime.load( pars[0].value, true, -1 );
    }
    this.aSync = true;

  }

  _stat_info_save() { return "program:Save the current program:<FileName>"; }
  _stat_save( pars ) {
    var runtime = this.runtime;

    if( pars.length == 0) {
        runtime.save( null );
    }
    else if ( pars.length == 1 ){
      runtime.save( pars[0].value, -1 );
    }
    else if( pars.length == 2) {
      runtime.save( pars[0].value, pars[1].value );
    }
  }

  _stat_info_delete() { return "program:Delete a file:<FileName>"; }
  _stat_delete( pars ) {
    var runtime = this.runtime;

    if( pars.length != 1 && pars.length != 2) {
        this.erh.throwError( "parameter", "delete without filename" );
    }
    else if ( pars.length == 1 ){
      runtime.deleteFile( pars[0].value, -1 );
    }
    else if( pars.length == 2) {
      runtime.deleteFile( pars[0].value, pars[1].value );
    }
  }




  _stat_info_run() { return "program:Run the current program"; }
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

  _stat_info_print() { return "print:Print text or values to the console:<Value>[<Value>;][;]"; }
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
      if( newLine ) { con.nl(); runtime.setWaiting( 1 ); }

    }

  }

  _stat_info_clr() { return "program:Clear all variables"; }
  _stat_clr( pars ) {
    return this.runtime.clrPGM();
  }

  /************************ functions ************************/

  _fun_info_datalen() { return "experimental:Return length of current datablock"; }
  _fun_datalen( pars ) {
    var runtime = this.runtime;
    return runtime.getDataLength();
  }

  _fun_info_chr_DLR_() { return "string:Return ascii character:<Ascii Code>"; }
  _fun_chr_DLR_( pars ) {
    return String.fromCharCode( pars[0].value );
  }

  _fun_info_str_DLR_() { return "string:Converts number to string: <Number>[,<Base>[,<Trim>]]"; }
  _fun_str_DLR_( pars ) {

    if( pars.length <1 || pars.length >3  ) {
      this.erh.throwError( "parameter", "str$() takes 1,2 or 3 parameters"  );
    }

    var number = pars[0].value;
    var base = 10;
    var trim = false;

    if( pars.length>=2  ) {
      base = pars[1].value;
    }

    if( pars.length==3  ) {
      trim = ( pars[1].value > 0);
    }

    var numberStr = number.toString(base);

    if( number >=0 && !trim) {
      return " " +  numberStr;
    }

    return numberStr;
  }

  _fun_info_abs() { return "math:Absolute value"; }
  _fun_abs( pars ) {
    if( pars[0].value < 0 ) {
      return -pars[0].value;
    }
    return pars[0].value;
  }

  _fun_info_len() { return "string:Length of a string"; }
  _fun_len( pars ) {
    return pars[0].value.length;
  }

  _fun_info_asc() { return "string:ASCII value of a character"; }
  _fun_asc( pars ) {
    if( (typeof pars[0].value).toUpperCase() == "STRING" ) {

      if ( pars[0].value.length > 0) {
          return pars[0].value.charCodeAt(0);
      }
    }
    return 0;
  }

  _fun_info_val() { return "string:Retrieve number from string"; }
  _fun_val( pars ) {
    var base = 10;

    if( pars.length==2  ) {
      base = pars[1].value;
    }

    if(base < 2 || base > 16) {
      this.erh.throwError( "base", "base should be inbetween 2 and 16" );
    }

    var val = parseInt( pars[0].value, base );

    if( isNaN( val ) ) {
      this.erh.throwError( "invalid number syntax", "Could not parse " + pars[0].value+ " with base" + base  );
    }

    return val;
  }

  _fun_info_hex2dec() { return "string:Retrieve number from hexadecimal string"; }
  _fun_hex2dec( pars ) {
    var base = 16;

    if( pars.length != 1  ) {
      this.erh.throwError( "parameter", "HEX2DEC() needs one parameter" );
    }

    var val = parseInt( pars[0].value, base );

    if( isNaN( val ) ) {
      this.erh.throwError( "invalid number syntax", "Could not parse " + pars[0].value+ " with base" + base  );
    }

    return val;
  }


  _fun_info_hex_DLR_() { return "string:Format a number as a hexadecimal string"; }
  _fun_hex_DLR_( pars ) {
    var base = 16;

    if( pars.length != 1  ) {
      this.erh.throwError( "parameter", "HEX$() needs one parameter" );
    }

    var hexString = (pars[0].value * 1).toString(16);

    return hexString;
 }




  _fun_info_exp() { return "math:Exponent"; }
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


  _fun_info_pad_DLR_() { return "string:Add string padding:<String>, <padChar>,<Length>[,<PadLeft>]"; }
  _fun_pad_DLR_( pars ) {

    if( pars.length < 3 || pars.length >4 ) {
      this.erh.throwError( "syntax", "pad$() takes 3 or 4 parameters" );
    }

    var str = pars[0].value;
    var ch = pars[1].value;
    var len = pars[2].value;
    var left = true;

    if( pars.length == 4 ) {
      left= pars[3].value;

      if( left !== 0 ) {
        left = true;
      }
      else { left = false; }
    }

    var dest = "";

    var strLen = str.length;
    var toPad = len-strLen;
    for( var i = 0; i<toPad ; i++) {
      dest += ch;
    }

    if( left ) {
      dest = dest + str;
    }
    else {
      dest = str + dest;
    }

    return dest;
  }


  _fun_info_rnd() { return "math:Random number between 0 and 1:<SeedOrMode> (0=JS, 1=Seed, NoValue=Default)"; }
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

  _fun_info_sqr() { return "math:Square Root"; }
  _fun_sqr( pars ) {
    return Math.sqrt( pars[0].value);
  }

  _fun_info_log() { return "math:Logaritm"; }
  _fun_log( pars ) {
    return Math.log( pars[0].value);
  }

  _fun_info_pos() { return "print:Position"; }
  _fun_pos( pars ) {
    return this.runtime.getLinePos();
  }

  _fun_info_left_DLR_() { return "string:Left part of the string"; }
  _fun_left_DLR_( pars ) {
      //? LEFT$(A$,8)
      var s = pars[0].value;

      if( (typeof s) != "string") {
        throw "@type mismatch";
      }
      return s.substr(0,pars[1].value);
  }

  _fun_info_right_DLR_() { return "string:Right part of the string"; }
  _fun_right_DLR_( pars ) {
      //? RIGHT$(A$,8)
      var s = pars[0].value;

      if( (typeof s) != "string") {
        throw "@type mismatch";
      }
      return s.substr( s.length - pars[1].value );
  }

  _fun_info_mid_DLR_() { return "string:A substring"; }
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

  _fun_info_sin() { return "math:Sinus"; }
  _fun_sin( pars ) {
    return Math.sin( pars[0].value);
  }

  _fun_info_tri() { return "math+:Triangle"; }
  _fun_tri( pars ) {
    var v = Math.abs( pars[0].value) % 1;

    if( v<=0.5 ) {
        return v*2;
    }
    else if( v<=1 ) {
        return 1-((v-0.5) * 2);
    }
  }

  _fun_info_saw() { return "math+:Saw Tooth"; }
  _fun_saw( pars ) {
    var v = Math.abs( pars[0].value) % 1;

    return v;

  }

  _fun_info_tan() { return "math:Tangent"; }
  _fun_tan( pars ) {
    return Math.tan( pars[0].value);
  }

  _fun_info_atn() { return "math:ATan function"; }
  _fun_atn( pars ) {
    return Math.atan( pars[0].value);
  }

  _fun_info_cos() { return "math:Cosinus"; }
  _fun_cos( pars ) {
    return Math.cos( pars[0].value);
  }

  _fun_info_spc() { return "string:Spaces for padding:<SizeOfPadding>"; }
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



  _fun_info_int() { return "math:Convert to Integer"; }
  _fun_int( pars ) {
    return Math.floor( pars[0].value );
  }

  _fun_info_range() { return "math+:Keep in range:<V>,<MIN>,<MAX>"; }
  _fun_range( pars ) {

    if( pars.length <3) {
      this.erh.throwError( "parameter", "expected 3 parameters" );
    }
    var v = pars[0].value ;
    var min = pars[1].value ;
    var max = pars[2].value ;

    if( v<min ) { return min; }
    if( v>max ) { return max; }
    return v;
  }


  _fun_info_tab() { return "print:Tab cursor Xpos to the right:<NumberOfTabs>"; }
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

  _fun_info_sgn() { return "math:Sign of number"; }
  _fun_sgn( pars ) {
    var x = pars[0].value;

    if( x<0 ) { return -1; }
    else if( x>0 ) { return 1; }
    return 0;
  }

  _fun_info_millis() { return "time:Current time in milliseconds"; }
  _fun_millis( pars ) {
    return this.runtime.getMillis( );
  }

  _fun_info_jiffies() { return "time:Current time in 'jiffies'"; }
  _fun_jiffies( pars ) {
    return this.runtime.getJiffyTime( );
  }
}
