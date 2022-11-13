//src/sys/modules/basic/worker/sys.js
//src/sys/modules/basic/worker/basicarray.js
//src/sys/modules/basic/worker/basicerrorhandler.js
//src/sys/modules/basic/worker/basicruntime.js
//src/sys/modules/basic/worker/extendedcommands.js
//src/sys/modules/basic/worker/pgmmanager.js
//src/sys/modules/basic/worker/basiccommands.js
//src/sys/modules/basic/worker/basicparser.js
//src/sys/modules/basic/worker/basictokenizer.js
//src/sys/modules/basic/worker/input.js
//src/sys/modules/basic/worker/processes.js
//src/sys/modules/basic/worker/workerwrapper_static.js
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -

// ## sys.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/sys.js
//  BY packworkers.js -- src/sys/modules/basic/worker/sys.js

var sys = {
  appName: "unknown",
  unique: 0

};

console = sys;

/* LOGGER */

function init_sys() {

  function post( type, message ) {
    postMessage( { type: type, message: message } );
  }

  sys.log = function() {

      var args = Array.prototype.slice.call(arguments);
      var args2 = [];

      for( var i=0; i<args.length ; i++) {
        args2.push( JSON.stringify( args[ i ]) );
      }
      post("syslog",args2 );

  }

  sys.logerr = function() {

      var args = Array.prototype.slice.call(arguments);
      post("syserr",args );

  }

  sys.out = {}
  sys.out.write = function() {

      var args = Array.prototype.slice.call(arguments);
      post( "write",args );

  }

  sys.out.writeln = function() {

      var args = Array.prototype.slice.call(arguments);
      post( "writeln",args );

  }

  sys.out.writec = function( c ) {

      post( "writec", c );
  }

  sys.out.control = function( c ) {
      post( "control", c  );

  }

  sys.out.control2 = function( c, d ) {
      post( "control2", { c:c, d:d } );

  }

  sys.out.nl = function() {
      post( "writec", "\n" );
  }


  sys.html = {}
  sys.html.html = function() {

      var args = Array.prototype.slice.call(arguments);
      post( "html",args );

  }

  sys.html.htmlnode = function() {

    var args = Array.prototype.slice.call(arguments);
    post( "htmlnode",args );

  }


  sys.html.get = function() {

    post( "htmlget", args );
    return { wait_for_result: true }

  }

}

function start_sys() {
  sys.log("Starting a bworker-wrapper");

  sys.processes = new processes( sys );
  sys.input = new Input();

  /* APPLICATION */

  /* HANDLERS */
  self.onmessage = function( obj ) {

      try {
        var data = obj.data;

        if( data.type == "loadpgm" ) {

          sys.log("Received 'loadpgm' message. Loaded " + data.pgmData.length + " bytes.." );

          var runtime = new BasicRuntime( sys );
          sys.log("Context created, parsing program");

          runtime.importPGMHandler( data.pgmData, data.QPath  );
          sys.log("Parsed program => RUN");

          runtime.runPGM();
          sys.log("Program started...");

          sys.processes.register( runtime );
          sys.log("Basic program registered as process.");

          pgmman.addRuntime( runtime );


        }
        else if( data.type == "keydown" ) {

          //sys.log("Received 'kbevent' message. " +  JSON.stringify( data ) );
          var stop = false;

          if( data.keyLabel ) {
            if( data.keyLabel == "Escape" ) {
              stop = true;
            }
          }
          if( !stop ) {
              sys.input.inputKeyHandler( data );
          }
          else {
            sys.processes.getRoot().runStop();
          }

        }
        else {
          var type = obj.data;
          if(! type ) {
            type = "????";
          }
          else {
            type=type.type;
            if(! type ) {
              type = "????";
            }
          }
          sys.logerr( "Ignored unclassified message type ("+type+") for 'APP://"+sys.appName+"':  " + JSON.stringify( obj.data ) );
          //postMessage( self.onAppMessage( obj ) );
        }
      }
      catch( e ) {
        if( e.message ) {
          sys.logerr( e.message + " at " + e.fileName + ":"+ e.lineNumber );
        }
        else if ( e.clazz ) {
          sys.logerr( e.clazz + ": " + e.detail + " at "+ e.lineNr );
        }

        sys.logerr( JSON.stringify( e ) );

      }

    }
}

init_sys();

//--EOC 

// ## basicarray.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basicarray.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basicarray.js

class  BasicArray {

  constructor( name, indices, defaultValue  ) {
    this.name = name;
    this.indices = indices;
    this.buffer = null;
    this.defaultValue = defaultValue;
  }

  getIndexCount() {
    return this.indices.length;
  }

  _check( indices ) {
    if( indices.length != this.indices.length ) {
      throw "00:index dimension mismatch for array " + this.name;
    }
    for( var i=0; i<indices.length; i++) {
      if ( indices[i] > this.indices[ i ]) {
        throw "01:index " + indices[i] + " out of bounds for array " + this.name + " for index " + i;
      }
      else if ( indices[i] < 0) {
        throw "02:index smaller then zero for array " + this.name;
      }

    }
  }

  set( indices, val ) {
    this._check( indices );
    if( this.buffer == null ) {
      this.buffer = [];
    }
    var ptr = this.buffer;
    var last = indices.length - 1;
    for( var i=0; i<=last; i++) {

      if( i == last ) {
        ptr[ indices[ i ]] = val;
      }
      else {
        if( (ptr [ indices[i] ] === undefined )) {
          ptr[ indices[ i ]] = [];
        }
        ptr = ptr[ indices[ i ]];
      }
    }
  }

  get( indices ) {
    this._check( indices );

    if( this.buffer == null ) {
      return this.defaultValue;
    }
    var ptr = this.buffer;
    var last = indices.length - 1;
    for( var i=0; i<=last; i++) {

      if( i == last ) {
        return ptr[ indices[ i ]];
      }
      else {
        if( (ptr [ indices[i] ] === undefined )) {
          return this.defaultValue;
        }
        ptr = ptr[ indices[ i ]];
      }
    }
  }

}

//--EOC 

// ## basicerrorhandler.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basicerrorhandler.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basicerrorhandler.js

class ErrorHandler {

  newError( clazz, detail, context, lineNr ) {
    return { context: context, clazz: clazz, detail: detail, lineNr: lineNr };
  }

  throwError( clazz, detail, context, lineNr ) {
    throw this.newError( clazz, detail, context, lineNr );
  }

  fromSerializedError( s, context, lineNr0 ) {

    var lineNr = lineNr0;
    if( lineNr === undefined ) {
      lineNr = -1;
    }
    if( ! this.isSerializedError( s ) ) {
      return this.newError( "unknown", null, context, lineNr );
    }
    var parts = s.substr(1).split("@");
    if( parts.length == 1 ) {
        return this.newError( parts[0], null, context, lineNr );
    }
    return this.newError( parts[0], parts[1], context, lineNr );

  }

  isSerializedError( e ) {
    if( typeof e != "string" ) {
      return false;
    }
    return e.startsWith( "@" );
  }

  isError( e ) {
    if( Object.prototype.toString.call( e ) === '[object Object]' ) {
      var ctx = e[ "context" ];
      var clss = e[ "clazz" ];
      var dtl = e[ "detail" ];

      if( !( clss === undefined ) ) {
        return true;
      }
    }
    return false;
  }
}

//--EOC 

// ## basicruntime.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basicruntime.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basicruntime.js

class BasicRuntime {

  constructor( sys ) {

    this.debugFlag = false;
    this.sys = sys;

    this.output = sys.out;
    this.input = sys.input;
    this.input.setHandler( this );
    this.input.setInterActive( false);
    this.html = sys.html;

    this.program = [];
    this.runFlag = false;
    this.waitForMessageFlag = false;
    this.waitForMessageVariable = null;
    this.message = null;
    this.executeLineFlag = false;
    this.goPlayExampleFlag = false;
    this.breakCycleFlag;
    this.inputFlag = false;
    this.listFlag = false;
    this.immersiveFlag = false;
    this.gosubReturn = [];
    this.nullTime = new Date().getTime();

    this.turboMode = false;
    this.cmdCountPerCycleDefault = 1;
    this.cmdCountPerCycleTurbo = 1000;
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;

    //var ctx = this.outtext;
    var c = this.output;
    this.commands = new BasicCommands( this );
    this.extendedcommands = new ExtendedCommands( this );
    //this.extendedcommands.getStatements = function() { return [] };
    //this.extendedcommands.getFunctions  = function() { return [] };

    this.erh = new ErrorHandler();
    this.vars = [];
    this.functions = [];
    this.data = [];
    this.kbBuffer = [];

    this.yPos = -1;
    this.lineMarkers = [ 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ];
    this.SHORTLINE = 0;
    this.LONGLINESTART = 1;
    this.LONGLINEEND = 2;

    this.forContext = { default:[] }

    this.outputCallBacksAll = {
        lineOverFlow: { clazz: this, method: "cbLineOverFlow" },
        scroll: { clazz: this, method: "cbScroll" },
        clearScreen: { clazz: this, method: "cbClearScreen" }
    }

    this.outputCallBacksClScr = {
        lineOverFlow: undefined,
        scroll: { clazz: this, method: "cbScroll" },
        clearScreen: { clazz: this, method: "cbClearScreen" }
    }

    this.setTurbo( true );
    this.synchClock( );
    this.exitMode = "stay";

    this.code2colMap = [];
    var km = this.code2colMap;

    km[0x90] = 0;
    km[0x05] = 1;
    km[0x1c] = 2;
    km[0x9f] = 3;
    km[0x9c] = 4;
    km[0x1e] = 5;
    km[0x1f] = 6;
    km[0x9e] = 7;

    km[0x81] = 8;
    km[0x95] = 9;
    km[0x96] = 10;
    km[0x97] = 11;
    km[0x98] = 12;
    km[0x99] = 13;
    km[0x9a] = 14;
    km[0x9b] = 15;

    this.symbolTable = {};

    this.symbolTable.up     = 0x91;
    this.symbolTable.down   = 0x11;
    this.symbolTable.left   = 157;
    this.symbolTable.right  = 29;
    this.symbolTable["reverse on"]  = 0x12;
    this.symbolTable["reverse off"]  = 0x92;
    this.symbolTable["clear"]  = 0x93;
    this.symbolTable["home"]  = 0x13;
    this.symbolTable.black  = 144;
    this.symbolTable.white  = 5;
    this.symbolTable.red  = 28;
    this.symbolTable.cyan  = 159;
    this.symbolTable.purple  = 156;
    this.symbolTable.green  = 30;
    this.symbolTable.blue  = 31;
    this.symbolTable.yellow  = 158;
    this.symbolTable.orange  = 129;
    this.symbolTable.brown  = 149;
    this.symbolTable.pink  = 150; // light red
    this.symbolTable.grey1  = 151;  //dark grey
    this.symbolTable.grey2  = 152;
    this.symbolTable["light green"]  = 153;
    this.symbolTable["light blue"]  = 154;
    this.symbolTable.grey3  = 155; //light grey


    var backmap = []
    var mapInfo = Object.entries(this.symbolTable);
    for( var i=0; i<mapInfo.length; i++) {
      backmap[ mapInfo[i][1]] = mapInfo[i][0];
    }
    this.symbolTableBM = backmap;

  }

  startWaitForMessage( variable ) {
    this.waitForMessageFlag = true;
    this.waitForMessageVariable = variable;
  }

  receiveMessage( _message ) {
    this.message = _message;
    this.vars[ this.waitForMessageVariable ] = _message;
    this.waitForMessageFlag = false;
  }


  interactiveKeyHandler( kbEvent ) {

    if( kbEvent.keyLabel != "Enter" ) {
      if( kbEvent.key != null ) {
        this.lineInput += kbEvent.key;
        this.output.write( kbEvent.key );
      }
    }
    else {
      this.output.writeln("");
      this.handleLineInput( this.lineInput, true );
    }

  }

  HandleStopped() {
    //old panicIfStopped
  }

  importPGMHandler( content, filename ) {
    var pgm = this.textLinesToBas( content.split("\n") );
    this.fileName = filename;

    this.program = pgm;
    this.sys.log( "imported program " + filename +" with " + content.length + " bytes ");
  }

  exportPGM() {
    var exportName = "program.bas";
    if( this.fileName ) {
      exportName = this.fileName;
    }

    var text = this.getProgramAsText();
    this.DESKTOP.requestDownload( text, exportName );
  }

  exitProgram() {
    this.closeWindow( this.windowId );
  }


  enterListMode( list ) {
    this.listFlag = true;
    this.list = list;
    this.listPointer = 0;
  }

  setExitMode( v ) {
    this.exitMode = v;
  }

  synchClock() {

    //var clock = new Date().getTime();
    var nullClock = new Date();
    nullClock.setHours(0);
    nullClock.setSeconds(0);
    nullClock.setMinutes(0);
    nullClock.setMilliseconds(0);

    this.nullTime = nullClock;

  }

  setTurbo( on ) {
    if( on ) {
      this.cmdCountPerCycle = this.cmdCountPerCycleTurbo ;
      this.turboMode = true;
      this.cursorCountMax = this.cursorCountMaxTurbo;
      return;
    }
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;
    this.turboMode = false;
      this.cursorCountMax = this.cursorCountMaxNormal;
  }

  setProgram( pgm ) {
    this.program = pgm;
    this.runFlag = false;
    this.HandleStopped();

    this.inputFlag = false;
    this.listFlag = false;
    //this.output.clearCursor();
  }

  appendProgram( pgm ) {

    for(var i=0; i<pgm.length; i++) {
      var exists = -1;

      for(var j=0; j<this.program.length; j++) {
        if( this.program[j][0] == pgm[i][0] ) {
          exists = j;
        }
      }

      if( exists>-1 ) {
        this.program[ exists ] = pgm[ i ];
      }
      else {
        this.program.push( pgm[ i ] );
      }
    }

    var sortF = function compare( a, b ) {
      return a[0] - b[0];
    }

    this.program.sort( sortF );

    this.runFlag = false;
    this.HandleStopped();

    this.inputFlag = false;
    this.listFlag = false;
    //this.output.clearCursor();
  }

  getProgram() {
    return this.program;
  }

  getProgramState() {
    return {
      runFlag: this.runFlag,
      inputFlag: this.inputFlag,
      vars: this.vars,
      functions: this.functions,
      forContext: this.forContext,
      runPointer: this.runPointer,
      runPointer2: this.runPointer2
    }
  }

  setProgramState( pgmState ) {
      this.runFlag = pgmState.runFlag;
      this.HandleStopped();
      this.inputFlag = pgmState.inputFlag;
      this.vars = pgmState.vars;
      this.functions = pgmState.functions;
      this.forContext = pgmState.forContext;
      this.runPointer = pgmState.runPointer;
      this.runPointer2 = pgmState.runPointer2;
  }


  updateEditMode() {


    if( !this.runFlag && !this.listFlag && ! this.executeLineFlag ) {
      this.setEditModeCallBacks( "edit" );
      return;
    }
    else if( this.listFlag ) {
      this.setEditModeCallBacks( "edit" );
      return;
    }
    else if( this.runFlag && this.inputFlag ) {
      this.setEditModeCallBacks( "edit" );
      return;
    }
    else if( this.runFlag || this.executeLineFlag ) {
      this.setEditModeCallBacks( "print" );
      return;
    }
  }

  _setByteBits( bits ) {

   var byte = 0b00000000;

   for( var i=0; i<8; i++) {
     if(i>0) {
       byte = byte >> 1;
     }
     if( bits[i]) {
       byte = byte | 128;
     }
   }
   return byte;
  }

  _getByteBits( byte ) {
    var masks = [
      0b00000001,0b00000010,0b00000100,0b00001000,
      0b00010000,0b00100000,0b01000000,0b10000000
    ];

   var results = [ false, false, false, false, false, false, false, false ];

   for( var i=0; i<8; i++) {

     results[ i ] = (byte & masks[i]) > 0;

   }

   return results;
  }

  printError( s, supressLine, explicitline ) {


    if( explicitline ) {
        this.output.writeln( ("?" + s + " error in " + explicitline ).toUpperCase() );
        return;
    }
    if( supressLine ) {

        this.output.writeln( ("?" + s + " error").toUpperCase(), true );
        return;
    }
    this.output.writeln(  ("?" + s + " error" + this.onLineStr()).toUpperCase(), true );

  }

  printInfo( s ) {

    this.sys.log(  ( s + this.onLineStr()).toUpperCase() );

  }

  printLine( s ) {
    this.output.writeln(s.toUpperCase());
    this.reverseOn = false;
  }

  print( s ) {
    this.output.writeln(s.toUpperCase());
    this.reverseOn = false;
  }


  clearScreen() {
    this.output.clearScreen();
    this.output.cursorHome();
  }


  getJiffyTime() {
    var millis=new Date().getTime() - this.nullTime;
    var jiffis = Math.floor(millis / (1000 / 60));

    return jiffis % 5184000;
  }

  getTime() {
    var millis=new Date().getTime() - this.nullTime;
    millis = millis % 86400000;

    var hours = Math.floor(millis / 3600000);
    millis = millis - (hours * 3600000 );
    var minutes = Math.floor(millis / 60000);
    millis = millis - (minutes * 60000 );
    var seconds = Math.floor(millis / 1000);
    //millis = millis - (seconds * 1000 );
    return [hours,minutes,seconds];
  }

  reset( hard, muteReady ) {
    this.output.clearScreen();
    this.output.writel("ready.");

    this.inputFlag = false;
    this.runFlag = false;
    this.listFlag = false;

    this.clrPGM();
    this.setTurbo( false );
  }

  passChars( chs, nl ) {

    this.hideDebug();
    var xy = this.sendChars( chs, nl );

  }

  compressPGMText( pgmTxt ) {

    var p = new Parser( this.commands, this.extendedcommands );
    p.init();
    var kws = p.getKeyWordCodes();
    var txt2 = pgmTxt;

    for( var i=0; i<kws.length; i++) {
      var kw = kws[i];
      if( !(kw===undefined || kw === null )) {
          txt2 = txt2.replaceAll( kw.toLowerCase() , String.fromCharCode(i));
      }
    }

    return txt2;
  }


  getProgramAsTextNoPETSCII() {
    var text = "";
    for (const l of this.program)
      {
        if( text != "") {
          text += "\n";
        }
        text +=  this.prepareLineForExportNoPETSCII( l[2].trim(), true );
      }
    return text;
  }


  getProgramAsText() {
    var text = "";
    for (const l of this.program)
      {
        if( text != "") {
          text += "\n";
        }
        text +=  this.prepareLineForExport( l[2].trim() );
      }
    return text;
  }

  prepareLineForExport( txt0 ) {
    var txt;
    txt = txt0.trim();
    var dst = "";

    for( var i=0; i<txt.length; i++) {
      var c = txt.charCodeAt( i );
      if( c<31 || c==92 || c>=94 ) {
        var symdef = this.symbolTableBM[ c ];
        if( ! ( symdef === undefined ) ) {
            dst += "{" + symdef + "}";
        }
        else {
            dst += "{"+c+"}"
        }

      }
      else {
        dst += txt.charAt( i );
      }
    }
    return dst.toLowerCase();
  }

  replaceAll( src, str1, str2 ) {

    var rv = src;
    while( rv.indexOf( str1 ) > -1 ) {
      rv = rv.replace( str1, str2 );
    }
    return rv;
  }


  rebuildNoPETSCIILineString( raw )
  {

    var p = new Parser( this.commands, this.extendedcommands );
    p.init();
    var noPetsciiLine = this.prepareLineForExportNoPETSCII( raw, false );
    var rec = p.parseLine( noPetsciiLine );
    return rec;
  }


  prepareLineForExportNoPETSCII( txt0, toLower ) {
    var txt;
    txt = txt0.trim();
    var dst = "";
    var last= "";

    for( var i=0; i<txt.length; i++) {
      var c = txt.charCodeAt( i );
      var cc = txt.charAt( i );
      if( c<31 || c==92 || c>=94 ) {

        var prevCharIsQuote = false, nextCharIsQuote=false;
        if( (i+1)<txt.length) {
          var cc2 = txt.charAt( i+1 );
          if( cc2 == "\"" ) {
            nextCharIsQuote = true;
          }
        }
        if( last == "\"" ) {
            prevCharIsQuote = true;
          }

        if( prevCharIsQuote && !nextCharIsQuote ) {
            dst = dst.substr( 0, dst.length-1 );
            dst += "CHR$("+c+");\"";
        }
        else if( prevCharIsQuote && nextCharIsQuote ) {
            dst = dst.substr( 0, dst.length-1 );
            dst += "CHR$("+c+")";
            i++;
        }
        else if( !prevCharIsQuote && nextCharIsQuote ) {
            dst += "\";CHR$("+c+")";
            i++;
        }

        else {
            dst += "\";CHR$("+c+");\"";
        }
      }
      else {
        dst += txt.charAt( i );
      }
      last = cc;
    }

    var dst2= this.replaceAll( dst, ";\"\";",";");

    if( toLower ) { return dst2.toLowerCase(); }
    return dst2;
  }

  ResolveStringSymbolToCode( x ) {

    if(this.symbolTable[x]) {
      return this.symbolTable[x];
    }

    return x;
  }

  prepareLineForImport( txt0 ) {
    var txt;
    txt = txt0.trim(); //.toUpperCase();
    var dst = "";

    var i=0; while( i<txt.length ) {
      var c = txt.charCodeAt( i );
      if( c == 123 ) {
        i++;
        var num = "";
        while( i < txt.length ) {
            c = txt.charCodeAt( i );
            if( c == 125 ) {
              i++;
              break;
            }
            num += String.fromCharCode( c );

            if( this.debugFlag ) {
              console.log("found ESC seq char " + String.fromCharCode( c ) );
              console.log("found ESC seq char code " + c);
            }
            i++;
        }

        if( this.debugFlag ) {
          console.log("found ESC seq " + num);
        }

        num = this.ResolveStringSymbolToCode(num.toLowerCase());

        if( this.debugFlag ) {
          console.log("found resolved ESC seq " + num);
        }

        dst += String.fromCharCode( parseInt( num, 10) );
      }
      else if( c == 8221 || c == 8220) { //looks like a double quote
        dst += "\"";
        i++;
      }
      else {
        dst += txt.charAt( i );
        i++;
      }
    }

    if( this.debugFlag ) {
      console.log("dst:" + dst);
    }

    return dst;
  }

  getProgramLines() {

    return this.program;
  }

  padZeros2( x ) {
    var s = x + "";
    for(var i=s.length; i<2; i++) {
      s="0"+s;
    }
    return s;
  }

  evalExpressionPart( p ) {
    var val=0;

    if( p.type=="num" ) {
      if( p.data == "." ) {
        val = 0;
      }
      else if( p.data == "~" ) {
        val = Math.PI;
      }
      else if((""+p.data).indexOf(".") >= 0) {
        val = parseFloat(p.data);
      }
      else {
        val = parseInt(p.data);
      }
    }
    else if( p.type=="str" ) {
      val = p.data;
    }
    else if( p.type=="var" ) {
      if(p.data.startsWith("TI")) {
        val = this.getJiffyTime();
        if(p.data.endsWith("$")) {
          val = this.getTime();
          val = "" +
            this.padZeros2(val[0]) +
            this.padZeros2(val[1]) +
            this.padZeros2(val[2]);
        }
      }
      else {
        val = this.vars[ p.data ];
      }
      if( val == undefined ) {
        val = 0;
      }
    }
    else if( p.type=="array" ) {
      var varIntName = "@array_" + p.data;
      var arr = this.vars[ varIntName ];

      if( arr === undefined ) {
        throw "@no such array";
      }

      if( arr.getIndexCount() != p.indices.length ) {
          throw "@bad subscript";
      }

      var indices = [];
      for( var ai=0; ai<p.indices.length; ai++) {
        indices[ai] = this.evalExpression( p.indices[ ai ] );
      }

      val = arr.get( indices );
      if( val === undefined ) {
        val = 0;
      }

    }
    else if( p.type=="expr" ) {
      val = this.evalExpression( p );
    }
    else if( p.type=="funCall" ) {

      var values = [];
      for( var j=0; j<p.params.length; j++) {
        var par = this.evalExpression( p.params[j] );;
        values.push( {value: par} );
      }
      try {
        var commands = this.commands;
        var ecommands = this.extendedcommands;
        var cmds = this.commands;

        var nFunName = "_fun_" + p.functionName.toLowerCase().replace("$","_DLR_");

        var stc = commands[ nFunName ];
        if( stc === undefined ) {

          stc = ecommands[ nFunName ];

          if( stc === undefined ) {

            stc = ecommands[ nFunName ];

            this.printError("no such function " + p.functionName);
            console.log("Cannot find functionName " + nFunName );

            throw "@no such function " + p.functionName;

          }
          else {
            cmds = ecommands;
          }
        }

        val = cmds[ nFunName ]( values );

      }
      catch ( e ) {
        throw e;
      }
    }
    else if( p.type=="defFnCall" ) {

      try {
        var fName = p.functionName;
        var parValue = this.evalExpression( p.params[0] );
        var restore = null;

        if( this.functions[ fName ] === undefined ) {
          throw "@undef'd function";
        }
        var functRecord = this.functions[ fName ];

        if(!(  this.vars[ functRecord.par ] === undefined )) {
          restore= this.vars[ functRecord.par ];
        }

        this.vars[ functRecord.par ] = parValue;
        val  = this.evalExpression( functRecord.expr );

        if( restore != null ) {
          this.vars[ restore.name ] = restore;
        }
        else {
          this.vars[ functRecord.par ] = 0; //TODO, actually should delete it
        }

      }
      catch ( e ) {
        throw e;
      }
    }

    return val;
  }

  evalExpression( expr ) {

    if( expr == null ) {
      return null;
    }

    if( expr.parts.length == 0 ) {
      return null;
    }

    var val = this.evalExpressionPart( expr.parts[ 0 ] );

    for( var i=1; i<expr.parts.length; i++) {
      var p = expr.parts[ i ];
      if( p.op == "+" ) {
        val += this.evalExpressionPart( p );
      }
      else if( p.op == "^" ) {
        val = Math.pow( val, this.evalExpressionPart( p ) );
      }
      else if( p.op == "-" ) {
        val -= this.evalExpressionPart( p );
      }
      else if( p.op == "*" ) {
        val *= this.evalExpressionPart( p );
      }
      else if( p.op == "/" ) {
        if( this.evalExpressionPart( p ) == 0) {
          throw "@division by zero";
        }
        val /= this.evalExpressionPart( p );
      }
      else if( p.op == ";" ) {
        val += ("" + this.evalExpressionPart( p ));
      }
      else if( p.op == "OR"  ) {
          val |= this.evalExpressionPart( p );
      }
      else if( p.op == "AND"  ) {
          val &= this.evalExpressionPart( p );
      }
      else if( p.op == "<" ) {
        if( val < (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == ">" ) {
        if( val > (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == "=" ) {
        if( val == (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == "<>" ) {
        if( val != (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == "<=" ) {
        if( val <= (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }
      else if( p.op == ">=" ) {
        if( val >= (this.evalExpressionPart( p ) ) ) {
          val = -1;
        } else {
          val = 0;
        }
      }

      else {
        throw "@unknown op '"+p.op+"'";
      }
    }

    if( expr.negate ) {
      return -val;
    }
    if( expr.binaryNegate ) {
      if( val == 0 ) {
        return -1;
      }
      return 0;
    }
    return val;
  }

  exitInputState() {
    var c = this.output;
    var p = this.program;

    this.inputFlag = false;


    var l = this.program[ this.runPointer ];
    var cmds = l[1];
    //console.log(cmds);


    if( this.runPointer > -1 ) {

        var l=this.program[this.runPointer];
        //console.log( l[0] + "after input >>(" + this.runPointer + ":"  + this.runPointer2 +")");
    }

    this.runPointer2++;

    if( this.runPointer > -1 ) {

        var l=this.program[this.runPointer];
        //console.log( l[0] + "after input >>>(" + this.runPointer + ":"  + this.runPointer2 +")");
    }

    if( this.runPointer2 >=  cmds.length ) {


      this.runPointer2 = 0;
      this.runPointer++;

      if( this.runPointer > -1 ) {

          var l=this.program[this.runPointer];
          //console.log( l[0] + "after input >>>>(" + this.runPointer + ":"  + this.runPointer2 +")");
      }


      if( this.runPointer >=  p.length ) {

        if( this.runPointer > -1 ) {

            var l=this.program[this.runPointer];
            //console.log( l[0] + "after input >>>>>(" + this.runPointer + ":"  + this.runPointer2 +")");
        }

        this.runFlag = false;

        this.HandleStopped();
        c.clearCursor();
        this.printLine("");
        this.printLine("ready.");
      }

    }


  }

  breakCycle() {
    this.breakCycleFlag = true;
  }

  cycle() {

    /*return values*/
    var END_W_ERROR = 0;
    var TERMINATE_PROGRAM = -1;
    var LINE_FINISHED = 10;
    var MIDLINE_INTERUPT = 20;
    var TERMINATE_W_JUMP = 30;
    var PAUSE_F_INPUT = 40;

    var c = this.output;

    var cmdCount = this.cmdCountPerCycle;



    try {



      if( !this.runFlag ||
            this.inputFlag ||
            this.listFlag
             ) {

        if( this.listFlag ) {
           if( this.listPointer < this.list.length ) {
               this.listCodeLine( this.list[ this.listPointer ] );
               this.listPointer++;
           }
           else {
             this.listFlag = false;
             this.printLine("ready.");
           }

        }
        if(this.cursorCount++>this.cursorCountMax) {
          this.cursorCount = 0;

          if( !this.listFlag )
            {
              c.blinkCursor();
            }
        }
      }
      else {

        if(this.debugFlag) console.log("START CYCLE------------------------------" );

        if( this.waitForMessageFlag ) {
            return;
        }

        var p = this.program;

        while (true) {

          if( this.breakCycleFlag ) {
            this.breakCycleFlag = false;
            break;
          }
          if(this.debugFlag) console.log("START CYCLE LOOP-------------" );
          var l = p[ this.runPointer ];
          var bf = this.runPointer2;
          if(this.debugFlag) console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );
          if(this.debugFlag) console.log(" cmdCount = " + cmdCount);
          var rv = this.runCommands( l[1], cmdCount );
          //console.log(" rv = ", rv);
          var af = rv[ 1 ];

          if( rv[0] == MIDLINE_INTERUPT) {
            this.runPointer2 = af;
          }

          var executedCount = rv[2];

          if(this.debugFlag) console.log(" bf = " + bf, " af = " + af);
          if(this.debugFlag) console.log(" executedCount = " + executedCount);
          if(this.debugFlag) console.log(" rv = " + rv);

          cmdCount = cmdCount - executedCount;

          if( rv[0]<=0 ) {
            if(this.debugFlag) console.log(" PGM END!!!!" );
            this.runFlag = false;
            var e = null;
            if( rv.length >= 4 ) {
              e = rv[3];
            }
            this.printLine("");
            this.printLine("ready.");
            this.HandleStopped();
            if( rv[0] == END_W_ERROR ) {
              console.log("ERROR: ", e, " LINE ", this.retreiveRuntimeLine() );
              console.log("PARAMETER DUMP:", this.vars );
              console.log("FUNCTION DUMP:", this.functions );
            }
            if(this.debugFlag) console.log("CYCLE RETURN END");
            return;
          }
          else if( rv[0] == LINE_FINISHED ) {
            this.runPointer ++;
            this.runPointer2 = 0;
            if(this.debugFlag) console.log(" new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

            if( this.runPointer >=  p.length ) {
              if(this.debugFlag) console.log( "end program");
              this.runFlag = false;
              this.HandleStopped();

              this.printLine("ready.");
              break;
            }
          }
          else if( rv[0] == TERMINATE_W_JUMP ) {

            if(this.debugFlag) console.log(" jump to new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

          }
          else if( rv[0] == PAUSE_F_INPUT ) {

            this.runPointer2 = af;
            if(this.debugFlag) console.log("CYCLE PAUSE 4 INPUT" + this.runPointer + "," + this.runPointer2);
            break;

          }

          if( cmdCount<=0 ) {
            if(this.debugFlag) console.log("Breaking cmdCount=" + cmdCount)
            break;
          }

        }

        if(this.debugFlag) console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

      }

    }
    catch (e) {
      //c.clearCursor();

      if( this.erh.isSerializedError( e ) ) {
        var err = this.erh.fromSerializedError( e );
        this.printError( err.clazz );
      }
      else {
        this.printError("unexpected");
      }

      this.printLine("ready.");
      this.runFlag = false;

      sys.log("ERROR: ", e, " LINE ", this.retreiveRuntimeLine() );
      sys.log("PARAMETER DUMP:", this.vars );
      sys.log("FUNCTION DUMP:", this.functions );

    }
  }

  doReturn() {

    var oldPointers = this.gosubReturn.pop();
    if( oldPointers === undefined ) {
      throw "@return without gosub";
    }

    this.runPointer2 = oldPointers[ 1 ];
    this.runPointer = oldPointers[ 0 ];

    //this.goto( oldLine );
  }

  gosub( line, runPointer2 ) {

    var pgm = this.program;
    var len=this.program.length;
    var retLine = null;
    var retCmd = null;

    this.runPointer2 = runPointer2;

    if( ( this.runPointer2 + 1) < this.program[ this.runPointer ][1].length ) {
      retCmd = this.runPointer2 + 1;
      retLine = this.runPointer;
    }
    else {
      if( (this.runPointer+1) < len ) {
        retCmd=0;
        retLine = this.runPointer+1 ;
      }
      else {
        retCmd=9999;
        retLine = this.runPointer;
      }
    }

    this.gosubReturn.push( [ retLine, retCmd ] );
    this.goto( line );
  }

  goto( line ) {

    //console.log( "goto line " + line)
    var pgm = this.program;
    var len=this.program.length;
    var found = false;

    for( var i=0; i<len; i++) {
      var l = pgm[i];

      if( l[0] == line ) {
        this.runPointer = i;
        this.runPointer2 = 0;
        found = true;
      }
    }

    if(!found ) {
      throw "@undef'd statement";
    }

    if(!this.runFlag ) {
      this.startAsGoto = true;
      this.runPGM();
    }
  }

  listStop() {
    if( this.listFlag ) {
      var c = this.output;
      this.listFlag = false;
      c.clearCursor();
      this.printLine( "ready.");
    }
  }

  runStop() {
    if( this.runFlag ) {
      var c = this.output;
      this.runFlag = false;
      this.HandleStopped();

      console.log( "break in " + this.program[ this.runPointer ][0] );
      this.printLine( "break in " + this.program[ this.runPointer ][0]);
      this.printLine( "ready.");
    }
  }

  isRunning() {
    return this.runFlag;
  }

  isListing() {
    return this.listFlag;
  }

  isInput() {
    return this.inputFlag;
  }

  readData() {

    if( this.dataPointer >= this.data.length ) {
      return undefined;
    }

    var result = this.data[ this.dataPointer ];
    this.dataPointer++;

    return result;
  }


  listCodeLine( rawLine ) {

    var inString = false;
    for( var i=0; i<rawLine.length; i++ ) {

      var c = rawLine.charAt(i);

      if( !inString ) {
        this.sendChars( c, false  );
      }
      else {
        this.sendCharsSimple( c, false );
      }

      if( c == "\"" ) {
        inString = !inString;
      }
    }
    this.printLine( "" );

  }

  rebuildLineString( nr, raw,
      removePadding,
      renumbering,
      addSmartPadding,
      shortenKeywords)
  {

    var p = new Parser( this.commands, this.extendedcommands );
    p.init();

    var tokens = p.getTokens( raw, false, false );

    if( ! ( renumbering === undefined )) {

      var foundGoto = false;
      for( i = 0; i<tokens.length; i++) {
        if( tokens[i].type == "name" && (tokens[i].data == "GOTO" || tokens[i].data == "GOSUB") ) {
          foundGoto = true;
        } else {
          if( i>1 ) {
            if( tokens[i].type == "num" &&
                tokens[i-1].type == "pad" &&
                tokens[i-2].type == "name" && tokens[i-2].data == "THEN" ) {
              foundGoto = true;
            }
            else if( tokens[i].type == "num" && tokens[i-1].type == "name" && tokens[i-1].data == "THEN" ) {
              foundGoto = true;
            }
          }
        }

        if( tokens[i].type == "num" && foundGoto ) {
          var newLine = renumbering[ "old_" + tokens[i].data ];
          if( newLine == undefined ) { newLine = 99999;}
          tokens[i].data =newLine;
          foundGoto = false;
        }
      }
    }
    tokens[0].data = nr;
    var newString;

    newString = nr;
    if( removePadding ) {
      newString = nr + " " ;
    }
    for( var i = 1 ; i< tokens.length; i++) {
      if( removePadding ) {
         if( tokens[i].type == "pad" ) {
           continue;
         }
       }

       if( shortenKeywords ) {
         if( tokens[i].type == "name" && tokens[i].data == "PRINT" ) {
           tokens[i].data = "?";
         }
       }
       else {
         if( tokens[i].type == "name" && tokens[i].data == "?" ) {
           tokens[i].data = "PRINT";
         }
      }

      if( tokens[i].type == "str" ) {
        newString += "\"" + tokens[i].data + "\"";
      }
      else if( tokens[i].type == "name" && addSmartPadding == true) {
        newString += tokens[i].data + " ";
      }
      else if( tokens[i].type == "num" && addSmartPadding == true) {
        if( tokens[i].data.length == 1 ) {
            newString += " " + tokens[i].data;
        }
        else {
            newString += tokens[i].data;
        }
      }
      else {
        newString += tokens[i].data;
      }

    }

    var rec = p.parseLine( newString );

    return rec;
  }

  lineIsData( line ) {
    console.log( line );
    if( line[1].length == 1 ) {
      if( ! ( line[1][0].controlKW === undefined) ) {
        if( line[1][0].controlKW.toUpperCase() == "DATA" ) {
          return true;
        }
      }
    }
    return false;
  }

  lineIsRem( line ) {
    console.log( line );
    if( line[1].length == 1 ) {
      if( ! ( line[1][0].controlKW === undefined) ) {
        if( line[1][0].controlKW.toUpperCase() == "REM" ) {
          return true;
        }
      }
    }
    return false;
  }

  renumberProgram( start, gap ) {

    var p = this.program;

    var newLineNr = start;
    var renumbering = {};
    var lineNumbers = [];

    var method = "rem";

    if( method  == "plain" ) {
      for( var i=0; i<p.length; i++) {
          var line = p[ i ];

          renumbering["old_" + line[0]] = newLineNr;
          lineNumbers.push( newLineNr );
          newLineNr += gap;
      }
    }
    else if( method  == "data" ) {
      // non data
      for( var i=0; i<p.length; i++) {
          var line = p[ i ];
          var data = this.lineIsData( line );

          if( data ) {
            continue;
          }
          else {
            renumbering["old_" + line[0]] = newLineNr;
            lineNumbers.push( newLineNr );
            newLineNr += gap;
          }
      }

      //data
      var kNumber = Math.ceil( newLineNr / 1000 );
      var newLineNr2 = 1000 * ( kNumber  );
      if( newLineNr2 - newLineNr  < 100 ) {
        newLineNr2+=1000;
      }
      newLineNr = newLineNr2;

      for( var i=0; i<p.length; i++) {
          var line = p[ i ];
          var data = this.lineIsData( line );

          if( !data ) {
            continue;
          }
          else {
            renumbering["old_" + line[0]] = newLineNr;
            lineNumbers.push( newLineNr );
            newLineNr += gap;
          }
      }

    }
    else if( method  == "rem" ) {
      // non data
      for( var i=0; i<p.length; i++) {
          var line = p[ i ];
          var rem = this.lineIsRem( line );

          if( rem ) {
            var kNumber = Math.ceil( newLineNr / 1000 );
            var newLineNr2 = 1000 * ( kNumber  );
            if( newLineNr2 - newLineNr  < 100 ) {
              newLineNr2+=1000;
            }
            newLineNr = newLineNr2;
          }
          renumbering["old_" + line[0]] = newLineNr;
          lineNumbers.push( newLineNr );
          newLineNr += gap;

      }

    }

    //newLineNr = start;
    for( var i=0; i<p.length; i++) {
        newLineNr = lineNumbers[ i ]
        var line = p[ i ];
        var lRec = this.rebuildLineString( newLineNr, line[2], true, renumbering, true );

        line[0] = newLineNr;
        line[1] = lRec.commands;
        line[2] = lRec.raw.trim();

        //newLineNr += gap;
    }
  }

  PETSCIIreplace( keywordCompress ) {
    var p = this.program;

    for( var i=0; i<p.length; i++) {
        var line = p[ i ];

        var lRec = this.rebuildNoPETSCIILineString( line[2] );

        line[1] = lRec.commands;
        line[2] = lRec.raw;

    }
  }

  compressProgram( keywordCompress ) {
    var p = this.program;

    for( var i=0; i<p.length; i++) {
        var line = p[ i ];

       var lRec = this.rebuildLineString( line[0], line[2], true, undefined, false, keywordCompress );

        line[1] = lRec.commands;
        line[2] = lRec.raw;

    }
  }

  normalizeProgram() {
    var p = this.program;

    for( var i=0; i<p.length; i++) {
        var line = p[ i ];

        var lRec = this.rebuildLineString( line[0], line[2], true, undefined, true );

        line[1] = lRec.commands;
        line[2] = lRec.raw;

    }
  }

  clrPGM() {
    this.vars = [];
    this.functions = [];
    this.restoreDataPtr();
  }

  restoreDataPtr() {
    this.dataPointer = 0;
  }

  runPGM() {

    this.executeLineFlag = false;

    if( this.startAsGoto ) {
        this.startAsGoto = false;

        var bak1 = this.runPointer;
        var bak2 = this.runPointer2;

        this.runPGM();

        this.runPointer = bak1;
        this.runPointer2 = bak2;


        return;
    }


    var c = this.output;
    var p = this.program;
    this.data = [];
    this.dataPointer = 0;
    this.gosubReturn = [];
    this.vars = [];
    this.functions = [];

    for( var i=0; i<p.length; i++) {

        var line = p[ i ];
        var commands = line[1];

        for( var j=0; j<commands.length; j++) {

          var command = commands[j];

          if( command.type  == "control" && command.controlKW == "data") {
            for( var k=0; k<command.params.length; k++) {
              this.data.push( command.params[k] );
            }
          }
        }
    }

    if( this.debugFlag ) {
      console.log("data dump:",this.data);
    }


    if( this.program.length > 0) {
      this.runFlag = true;
      this.inputFlag = false;
      //c.clearCursor();
      this.runPointer = 0;
      this.runPointer2 = 0;
    }
  }


  doForInit( from, to, step, varName, cmdPointer, cmdArrayLen, linePointersLen ) {

    var ctx = this.forContext;

    if( this.vars[ varName ] === undefined ) {
      this.vars[ varName ] = 0;
    }
    this.vars[ varName ] = this.evalExpression( from );

    ctx.default.push( varName );
    ctx[varName] = {};

    var ctxv = ctx[varName];
    ctxv.to = this.evalExpression( to );

    if( step == null ) {
        ctxv.step = 1;
    }
    else {
      ctxv.step = this.evalExpression( step );
    }

    ctxv.jumpTo =
      { line: this.runPointer,
        cmdPointer: cmdPointer+1 }
    if( ctxv.jumpTo.cmdPointer >= cmdArrayLen )  {

      if( this.runPointer == -1) {
        throw "@Cannot find command after for";
      }
      else {
        if( ( this.runPointer + 1) >= linePointersLen ) {
          throw "@cannot find command after for, on next line";
        }
        ctxv.jumpTo.line++;
        ctxv.jumpTo.cmdPointer = 0;
      }
    }

  }

  doForNext( nextVarName ) {
    var ctx = this.forContext;
    if( ctx.default.length == 0 ) {
      throw "@next without for";
    }
    var varName = ctx.default[ctx.default.length-1];
    if( nextVarName  != null ) {
      varName = nextVarName;
    }

    var ctxv = ctx[varName];

    this.vars[ varName ] += ctxv.step;
    if( ctxv.step > 0) {
      if(this.vars[ varName ]<=ctxv.to) {

        return ctxv.jumpTo;
      }
    }
    else if( ctxv.step == 0) {
      return ctxv.jumpTo;
    }
    else {
      if(this.vars[ varName ]>=ctxv.to) {
        return ctxv.jumpTo;
      }
    }

    ctx.default.pop();
    return -1;
  }

  onLineStr() {

    var line = this.retreiveLine();
    if( line == -1 || line == "") { return ""; }

    return " in " + line;

  }

  retreiveRuntimeLine() {
    if( this.runPointer > -1 ) {
      var line = this.program[this.runPointer];
      return line[0];
    }
    return -1;
  }


  retreiveLine() {
    if( this.runFlag ) {
      return this.retreiveRuntimeLine();
    }
    else {
      if( this["parseLineNumber"] === undefined ) {
        return -1;
      }
      if( this.parseLineNumber == -1) { return ""; }
      return this.parseLineNumber;
    }
    return -1;
  }


  commandToString( cmd ) {
    if( cmd.type == "control" )  {
      return cmd.controlKW.toUpperCase();
    }
    else if( cmd.type == "call" ) {
      return cmd.statementName;
    }
    else if( cmd.type == "assignment" )  {
      return "assign ->" + cmd.var;
    }
    return "????";
  }

  runCommands( cmds, limit ) {
    /* return values
      false -> error or end program
      true  -> executed ok

      should return
      end_w_error
      terminate_program
      line_finished
      goto_gosub
    */

    var commands = this.commands;
    var ecommands = this.extendedcommands;
    var EXPR = 0, PAR = 1;

    /*return values*/
    var END_W_ERROR = 0;
    var TERMINATE_PROGRAM = -1;
    var LINE_FINISHED = 10;
    var MIDLINE_INTERUPT = 20;
    var TERMINATE_W_JUMP = 30;
    var PAUSE_F_INPUT = 40;

    var end = cmds.length;
    var i=this.runPointer2;
    var cnt=0;

    if(!(limit == undefined )) {
      //nothing
    }
    else {
      limit = 9999; //reaching to infinite (max on line maybe  40)
    }



    while( i<end && cnt<limit ) {


      if( this.breakCycleFlag ) {
        if(!(limit == undefined )) {
          this.breakCycleFlag = false;
          break;
        }
      }

      var cmd=cmds[i];

      var l=this.program[this.runPointer];

      //if( this.runPointer > -1 ) {
      //  console.log( l[0] + "(" + this.runPointer + ":" + i +")" + this.commandToString( cmd ) );
      //}
      //console.log( cmd.lineNumber + ":" + cmd.type + ":" + (cmd.controlKW ? cmd.controlKW : cmd.statementName ));

      if( cmd.type == "control" )  {
        var cn = cmd.controlKW;
        if( cn == "goto" ) {
          this.goto( cmd.params[0] );
          return [TERMINATE_W_JUMP,i+1,cnt+1];
        }
        else if( cn == "end" ) {
          return [TERMINATE_PROGRAM,i+1,cnt+1];
        }
        else if( cn == "stop" ) {
          this.printInfo("break");
          return [TERMINATE_PROGRAM,i+1,cnt+1];
        }
        else if( cn == "gosub" ) {
          this.gosub( cmd.params[0], i );
          return [TERMINATE_W_JUMP,i+1,cnt+1];
        }
        else if( cn == "on" ) {
          var onCommand = cmd.params[ 0 ];
          var onExpr = cmd.params[ 1 ];
          var onLineNrs = cmd.params[ 2 ];

          var value = this.evalExpression( onExpr );
          if( (value-1)>=0 && (value-1)<onLineNrs.length ) {
            if( onCommand == "goto" ) {
              this.goto( onLineNrs[ (value-1) ] );
              return [TERMINATE_W_JUMP,i+1,cnt+1];
            }
            else if( onCommand == "gosub" ) {
              this.gosub( onLineNrs[ (value-1) ], i );
              return [TERMINATE_W_JUMP,i+1,cnt+1];
            }
          }

          //if not jumping, do nothing
        }
        else if( cn == "return" ) {
          this.doReturn();
          return [TERMINATE_W_JUMP,i+1,cnt+1];
        }
        else if( cn == "if" ) {
          var IF_ERROR = -1;
          var IF_TRUE = 1;
          var IF_FALSE = 0;

          var ifresult = this.evalExpression( cmd.params[0] );
          if( ifresult != IF_FALSE ) {
             //return [MIDLINE_INTERUPT,i+1];
          }
          else  {
             return [LINE_FINISHED,i+1,cnt+1];
          }
        }
        else if( cn == "data" ) {
          //Nothing
        }
        else if( cn == "rem" ) {
          return [LINE_FINISHED,i+1,cnt+1];
        }
        else if( cn == "for:init" ) {
          this.doForInit( cmd.params[0], cmd.params[1], cmd.params[2], cmd.variable, i, cmds.length );
        }
        else if( cn == "for:next" ) {

          var jump = this.doForNext( cmd.nextVar );

          if( !(jump === -1 ) ) {

            if( jump.line != -1 ) {
                if( this.runPointer == jump.line ) {
                  i = jump.cmdPointer;
                  cnt++;
                  continue;
                }
                else {
                  this.runPointer = jump.line;
                  this.runPointer2 = jump.cmdPointer;
                }
                return [TERMINATE_W_JUMP,i+1,cnt+1];
            }
            else {
              i = jump.cmdPointer;
              cnt++;
              continue;
            }
          }
        }
        else if( cn == "dim" ) {
          var vars = this.vars;

          for( var ix=0; ix<cmd.params.length; ix++) {

            var indices = [];
            for( var ai=0;ai<cmd.params[ix].length;ai++){
              indices[ai] = this.evalExpression( cmd.params[ix][ai] );
            }

            var arrRec = new BasicArray( cmd.arrayNames[ix], indices, 0 );

            var varIntName = "@array_" + cmd.arrayNames[ix];

            if( ! ( this.vars[ varIntName ] === undefined )) {
              this.printError( "redim'd array" );
              return [END_W_ERROR,i+1,cnt+1];
            }
            this.vars[ varIntName ] = arrRec;
          }

        }
        else if( cn == "def" ) {
          this.functions[ cmd.params[0] ] = {
            par: cmd.params[1],
            expr: cmd.params[2]
          };
        }
        else {
          this.printError( "illegal ctrl token '" + cn  +"'");
          return [END_W_ERROR,i+1,cnt+1];
        }
      }
      else if( cmd.type == "call" )  {
        var values = [];
        var pardefs = [];
        var mycommands = commands;

        var stc = mycommands[ "_stat_" + cmd.statementName.toLowerCase()];

        if( stc === undefined ) {
          //cmd.statementName.toLowerCase().startsWith("x") )
          mycommands = ecommands;

          stc = mycommands[ "_stat_" + cmd.statementName.toLowerCase()];

          if( stc === undefined ) { }
          else {
            if( mycommands.enabled == false &&
              cmd.statementName.toLowerCase() != "xon") {
                  this.printError( "extended not enabled" );
                  return [END_W_ERROR,i+1,cnt+1];
            }
          }
        }

        var intf = mycommands[ "_if_" + cmd.statementName.toLowerCase()];
        if( !( intf === undefined ) ) {
            pardefs = mycommands[ "_if_" + cmd.statementName.toLowerCase()]();
        }
        else {
          for( var j=0; j<cmd.params.length; j++) {
            pardefs[j] = EXPR;
          }
        }

        for( var j=0; j<cmd.params.length; j++) {
          if( pardefs[j] == EXPR ) {

            var p = this.evalExpression( cmd.params[j] );  //NOTE this one gets the trailing ;, from a "PRINT ;" command

            if( p != null ) {
              values.push( { type: "value", value: p } );
            }
          }
          else if( pardefs[j] == PAR ) {
            var varName = cmd.params[j].parts[0].data;
            var varType = "num";
            if( varName.indexOf("$") > -1) {
              varType = "str";
            }

            values.push( { type: "var", value: varName, varType: varType } );
          }
          else { /*RAW*/
            //values.push( cmd.params[j].parts );
            values.push( cmd.params[j] );

          }
        }
        try {
          //var stc = ;
          if( stc === undefined ) {
            this.printError("syntax");
            return [END_W_ERROR,i+1,cnt+1];
          }
          else {
              mycommands[ "_stat_" + cmd.statementName.toLowerCase()]( values );
              if( this.inputFlag ) {
                return [PAUSE_F_INPUT,i+1,cnt+1];
              }
          }

        }
        catch ( e ) {
          console.log(e);

          if( this.erh.isSerializedError( e ) ) {
            var err = this.erh.fromSerializedError( e );
            this.printError( err.clazz );
          }
          else if( this.erh.isError( e ) ) {
            var err = e;
            this.printError( err.clazz );
          }
          else {
            this.printError("unexpected " + e );
          }

          return [END_W_ERROR,i+1,cnt];
        }
      }
      else if( cmd.type == "assignment" )  {
        if( cmd.arrayAssignment ) {
          var varIntName = "@array_" + cmd.var;
          if( this.vars[ varIntName ] === undefined ) {
            this.printError("bad subscript");
            return [END_W_ERROR,i+1,cnt];
          }

          var arr = this.vars[ varIntName ];
          if( cmd.indices.length != arr.getIndexCount() ) {
            this.printError("bad subscript");
            return [END_W_ERROR,i+1,cnt];
          }

          var indices = [];
          for( var ai=0;ai<cmd.indices.length;ai++){
            indices[ai] = this.evalExpression( cmd.indices[ai] );
          }

          if( cmd.var.endsWith("%") ) {
              arr.set( indices, Math.floor( this.evalExpression( cmd.expression ) ) );
          }
          else if( ! cmd.var.endsWith("$") ) {
              var v = this.evalExpression( cmd.expression );
              if( ! (typeof v == "number") ) {
                this.printError("type mismatch");
                return [END_W_ERROR,i+1,cnt];
              }
              arr.set( indices, this.evalExpression( cmd.expression ) );
          }
          else {
              arr.set( indices, this.evalExpression( cmd.expression ) );
          }

        }
        else { //single var (not an array)
          if( this.vars[ cmd.var ] === undefined ) {
            if(cmd.var.startsWith("TI")) {
              this.printError("syntax");
              return [END_W_ERROR,i+1,cnt+1];
            }
            this.vars[ cmd.var ] = 0;
          }
          if(cmd.var.endsWith("%")) {
            this.vars[ cmd.var ] = Math.floor( this.evalExpression( cmd.expression ) );
          }
          else if( ! cmd.var.endsWith("$") ) {
              var v = this.evalExpression( cmd.expression );
              if( ! (typeof v == "number") ) {
                this.printError("type mismatch");
                return [END_W_ERROR,i+1,cnt];
              }
              this.vars[ cmd.var ] = this.evalExpression( cmd.expression );
          }
          else {
            this.vars[ cmd.var ] = this.evalExpression( cmd.expression );
          }
        }
      }
      //cnt++;
      i++;
      cnt++;
    }

    if( i== cmds.length ) {
      return [LINE_FINISHED,i,cnt];
    }

    return [MIDLINE_INTERUPT,i,cnt];

  }

  setVar( a, b ) {
    this.vars[ a ] = b;
  }

  old( linenr ) {
    this.program = this.oldProgram;
  }

  new( linenr ) {
    this.oldProgram = this.program ;
    this.program = [];
  }

  removePgmLine( linenr ) {

    var pgm2 = [];

    for( var i=0; i<this.program.length; i++) {
      var pl=this.program[i];
      if( pl[0] != linenr ) {
        pgm2.push(pl);
      }
    }
    this.program = pgm2;

  }


  padSpaces6( no ) {
    var s = no + "";
    for(var i=s.length; i<6; i++) {
      s+=" ";
    }
    return s;
  }

  padSpaces8( no ) {
    var s = no + "";
    for(var i=s.length; i<8; i++) {
      s+=" ";
    }
    return s;
  }


  insertPgmLine( linenr, commands, raw ) {

    this.insertPgmLineLocal( linenr, commands, raw, this.program );
  }

  insertPgmLineLocal( linenr, commands, raw, myProgram ) {

    for( var i=0; i<myProgram.length; i++) {
      var pl=myProgram[i];
      if( pl[0] == linenr ) {
        myProgram[i] = [linenr, commands, raw.trim() ];
        return;
      }
    }

    myProgram.push( [linenr, commands, raw.trim() ]);

    var sortF = function compare( a, b ) {
      return a[0] - b[0];
    }

    myProgram.sort( sortF );

  }

  textLinesToBas( lines ) {

    var myProgram = [];

    if( this.debugFlag ) {
      console.log( "textLinesToBas" );
    }
    for( var i = 0; i<lines.length; i++ ) {

      var line = this.prepareLineForImport( lines[ i ] );
      var p = new Parser( this.commands, this.extendedcommands );
      p.init();
      //if( line.length > 80 ) {  TODO move this check into the parser
      //  throw "Line to long " + line;
      //}
      var l = p.parseLine( line );
      if( l == null ) {
        continue;
      }
      if( l.lineNumber != -1 ) {
        if( l.commands.length > 0) {
          this.insertPgmLineLocal( l.lineNumber, l.commands, l.raw, myProgram);
          //this.program[ l.lineNumber ] = [l.commands,l.raw];
        }
        else {
          throw "Error, no commands on line " + l.lineNumber;
        }
      }
      else {
        throw "Error, command must start with number to be part of program";
      }

      if( this.debugFlag ) {
        console.log("program:",myProgram);
        console.log("Line: ", l );
      }
    }
    return myProgram;
  }

  printReady() {
    this.printLine("ready.");
  }


  startConsoleDataInput( vars ) {

    if( this.debugFlag ) {
      console.log("inputvars=",vars);
    }
    this.inputFlag = true;
    this.inputVars = vars;
    this.input.setInterActive( true);
    this.inputVarsPointer = 0;
    this.output.write( "? ");
    this.lineInput = "";
  }

  handleLineInput( str, isInputCommand ) {

    if( this.debugFlag ) {
      console.log("handleLineInput: start debug / isInputCommand=" + isInputCommand + " -------------");
    }

    if( isInputCommand ) {

        var input=str;
        var qMark = input.indexOf("?");
        while( qMark > -1 ) {
          input = input.substr(qMark+2);
          qMark = input.indexOf("?");
        }

        if( this.debugFlag ) {
          console.log("handleLineInput: start debug / input, name -------------");
          console.log( "InputVarsPointer:" , this.inputVarsPointer );
          console.log( "InputVars:" , this.inputVars );

          console.log( "Input String:" ,input );
          console.log( "Input Vars[current]:" ,this.inputVars[ this.inputVarsPointer ] );
        }


        var vName = this.inputVars[ this.inputVarsPointer ];
        if( vName.indexOf("$") >-1 ) {
            this.setVar( this.inputVars[ this.inputVarsPointer ], input.trim() );
        }
        else {
          var num = parseFloat( input.trim() );

          if( isNaN( num ) ) {
            this.printLine("?redo from start");
            this.sendChars( "? " , false);
            return;
          }
          this.setVar( this.inputVars[ this.inputVarsPointer ], num );
        }

        this.inputVarsPointer++;
        if( this.inputVarsPointer >= this.inputVars.length ) {

          this.exitInputState();
        }
        else {
          this.sendChars( "?? " , false);
        }

        if( this.debugFlag ) {
          console.log("handleLineInput: end debug -------------");
        }
        return;
    }

    this.executeLineFlag = true;

    if( this.debugFlag ) {
      console.log( str );
    }
    var p = new Parser( this.commands, this.extendedcommands );
    p.init();
    try {
      var l = p.parseLine( str );
    }
    catch( e ) {

      this.parseLineNumber = -1;
      if( this.erh.isError( e ) ) {
        this.parseLineNumber = e.lineNr;
        this.printError( e.clazz, true );
      }
      else {
        this.printError( "syntax", true );
      }
      this.printLine("ready.");
    }
    if( l == null ) {
      if( this.debugFlag ) {
        console.log("handleLineInput: end debug -------------");
      }

      this.executeLineFlag = false;
      return;
    }

    if( l.lineNumber != -1 ) {
      if( l.commands.length > 0) {
        this.insertPgmLine( l.lineNumber, l.commands, l.raw);
      }
      else {
        this.removePgmLine( l.lineNumber  );
      }
    }
    else {
      this.runPointer = -1;
      this.runPointer2 = 0;

      try {
        this.runCommands( l.commands );
      }
      catch( e ) {

        this.parseLineNumber = -1;

        if( this.erh.isSerializedError( e ) ) {
          var err = this.erh.fromSerializedError( e );
          this.parseLineNumber = err.lineNr;
          this.printError( err.clazz );
        }
        else if( this.erh.isError( e ) ) {
          var err = e;
          this.printError( err.clazz );
          this.parseLineNumber = err.lineNr;
        }
        else {
          this.printError("unexpected " + e );
        }

        this.runFlag = false;
      }

      if( ! this.runFlag && ! this.listFlag) {
        this.printLine("ready.");
      }

    }

    this.executeLineFlag = false;

    if( this.debugFlag ) {
      console.log("program:",this.program);
      console.log("Line: ", l );

      console.log("handleLineInput: end debug -------------");
    }
  }

}

//--EOC 

// ## extendedcommands.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/extendedcommands.js
//  BY packworkers.js -- src/sys/modules/basic/worker/extendedcommands.js

class ExtendedCommands {

  constructor( context ) {
    this.output = context.output;
    this.html = context.html;
    this.input = context.input;
    this.context = context;
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
      value = this.context.evalExpression( exparts2 );

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

    var col = pars[0].value;

    this.output.control2( 16, col );
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


  _fun_html_DLR_( pars ) {
    return
      this.html.get();
  }


}

//--EOC 

// ## pgmmanager.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/pgmmanager.js
//  BY packworkers.js -- src/sys/modules/basic/worker/pgmmanager.js

class BasicProgramManager {

  constructor() {
    this.rt = [];
  }

  addRuntime = function( ctx ) {

    this.rt.push( ctx );

  }

}

var pgmman = new BasicProgramManager();

//--EOC 

// ## basiccommands.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basiccommands.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basiccommands.js

class BasicCommands {

  constructor( context ) {
    this.output = context.output;
    this.input = context.input;
    this.context = context;
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
    this.context.new();
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

    var context = this.context;
    var list = [];
    for (const l of context.program)
      {

        var lineNr = parseInt(l[0]);
        if(  l[0] == null || (lineNr>= start && lineNr<= end) ) {
          list.push( l[2] );
        }
      }

      this.context.enterListMode( list );
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

    var data = this.context.readData();
    if( data === undefined ) { this.erh.throwError( "out of data" ); }
    else {
      if( data.type =="num" ) {
        this.context.setVar(
          p0.value, parseInt( data.data ) );
        }
        else {
          this.context.setVar(
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
    if( k == null ) { this.context.setVar(p0.value, ""); }
    else {
      this.context.setVar(p0.value, k.key );
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

    this.context.startConsoleDataInput( vars );

  }

  _stat_restore( pars ) {
    this.context.restoreDataPtr();
  }

  _stat_load( pars ) {
    var context = this.context;
    var result;

    context.printLine("");

    if( pars.length == 0) {
      context.printLine("searching");
    }
    else {
      context.printLine("searching for " + pars[0].value);
    }

    if( pars.length == 0) {
        result = context.load( false );
    }
    else {
      result = context.load( pars[0].value );
    }

    if( !result ) {
      context.printLine("?not found error");
    }
    else  {

      if( !result[1] ) {  //only print when not a snapshot

        if( pars.length == 0) {
          context.printLine("found default");
        }
        else {
          context.printLine("found "+pars[0].value);
        }
        context.printLine("loading");
      }

    }
  }

  _stat_save( pars ) {
    var context = this.context;

    if( pars.length == 0) {
        context.save( false );
    }
    else {
      context.save( pars[0].value );
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
    var context = this.context;

    context.runPGM();
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

    var context = this.context;
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
      value = context.evalExpression( exparts2 );

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
    return this.context.clrPGM();
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

  intSeedRand( x ) {
    var base = Math.floor( x * 11 );
    this.randIndex= base % this.randnrs.length;
    this.randStep = 1+(base % 7);
  }


  _fun_rnd( pars ) {

    if( pars.length <1) {
      this.erh.throwError( "syntax", "missing parameter 0" );
    }

    if( pars[0].value < 0) {
      this.intSeedRand( -pars[0].value );
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
    return this.context.getLinePos();
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
    var context = this.context;

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
    return this.context.getJiffyTime( );
  }
}

//--EOC 

// ## basicparser.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basicparser.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basicparser.js

class Parser {

  constructor( cmds, ecmds ) {
    this.commands = cmds;
    this.extendedcommands = ecmds;
    this.erh = new ErrorHandler();
    this.debugFlag = false;
  }

  init() {

	  this.CTRL_KW = ["IF","THEN","GOTO","AND", "NOT", "OR",  "GOSUB", "RETURN", "FOR", "TO", "NEXT", "STEP", "DATA", "REM", "GOSUB", "DIM", "END", "LET", "STOP", "DEF", "FN", "ON" ];
    this.SHORTCUT_KW = ["?"];

    this.KEYWORDS = this.commands.getStatements();

    var more = this.extendedcommands.getStatements();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

    more = this.commands.getFunctions();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

    more = this.extendedcommands.getFunctions();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

     for( var i=0; i<this.CTRL_KW.length; i++) {
       this.KEYWORDS.push( this.CTRL_KW[ i ] );
     }

     for( var i=0; i<this.SHORTCUT_KW.length; i++) {
       this.KEYWORDS.push( this.SHORTCUT_KW[ i ] );
     }
     //this.padArray( this.KWCODES, 256 );

     if( this.debugFlag ) { console.log("KEYWORDS:" , this.KEYWORDS ); }

     this.screenCodes2CTRLTable = [];
     var tab = this.screenCodes2CTRLTable;

     tab['\x93'] = '\x13';
     tab['\xd3'] = '\x93';
  }

  getKeyWordCodes() {

    this.throwError( null, "(Extended) Keywords not yet supported", "extended disabled" );
    return this.KWCODES;
  }

  padArray( arr, nr ) {
    var missing = nr - arr.length;
    while( missing > 0) {
      arr.push( null );
      missing--;
    }
  }

  throwError( ctx, detail, clazz ) {

    var clazz2 = clazz;
    if( clazz2 === undefined ) {
      clazz2 = "syntax";
    }

    if( ctx ) {
      console.log(" Exception " + clazz + " at line " + ctx.lineNumber+ " " + detail );
    }

    if( ctx ) {
      if( ! ( ctx.lineNumber == undefined ) ) {
        this.erh.throwError( clazz2, detail, ctx, ctx.lineNumber );
      }
    }

    this.erh.throwError( clazz2, detail, undefined, -1 );

  }

  upperCaseNameTokens( tokens ) {

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( token ) {
				if( token.type == "name" ) {
					token.data = token.data.toUpperCase();
				}
			}

		}

		return tokens;
	}

	removePadding( tokens ) {
		var tokens2 = [];

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( token ) {
				if( token.type != "pad" ) {
					tokens2.push( token );
				}
			}

		}

		return tokens2;
	}

  mergeCompTokens( tokens ) {
		var tokens2 = [];

    /* Convert token sequences like ("<","=")
       into single token "<=" */

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( i>0 ) {
        var token2 = tokens[i-1];
				if( ( token.type == "comp" || token.type == "eq" ) &&
            ( token2.type == "comp" || token2.type == "eq" ) ) {
					token2.type = "@@removeme";
          token.data = token2.data + token.data;
          token.type = "comp";
          if( token.data == "><" ) {
            token.data = "<>";
          }
          else if( token.data == "=<" ) {
            token.data = "<=";
          }
          else if( token.data == "=>" ) {
            token.data = ">=";
          }

  			}
			}

      if( ( token.type == "name"  && token.data == "OR" ) ||
        ( token.type == "name"  && token.data == "AND" ) ||
        ( token.type == "name"  && token.data == "NOT" )) {
          token.type = "bop";
        }

		}

    for( 	var i=0;
					i<tokens.length;
					i++)
		{
      if( tokens[i].type!="@@removeme") {
        tokens2.push( tokens[i] );
      }
    }

		return tokens2;
	}



  mergeBrokenUpTokens( tokens ) {

    var splits = [];

    //console.log("tokens",tokens)
    //standard
    splits.push( { p1: "REST", p2: "OR", p3: "E", whole: "RESTORE" } );
    splits.push( { p1: "S", p2: "TO", p3: "P", whole: "STOP" } );


    //extended
//    splits.push( { p1: "Dsk", p2: "OR", p3: "T", whole: "DXPORT" } );
//    splits.push( { p1: "LXP", p2: "OR", p3: "T", whole: "LXPORT" } );
    splits.push( { p1: "IMP", p2: "OR", p3: "T", whole: "IMPORT" } );
    splits.push( { p1: "EXP", p2: "OR", p3: "T", whole: "EXPORT" } );
    splits.push( { p1: "L", p2: "GET", p3: "URL", whole: "LGETURL" } );
    splits.push( { p1: "L", p2: "GET", p3: "NAME", whole: "LGETNAME" } );
    splits.push( { p1: "L", p2: "GET", p3: "ID", whole: "LGETID" } );
    splits.push( { p1: "GO", p2: "TO", p3: null, whole: "GOTO" } );
    splits.push( { p1: "GO", p2: "SUB", p3: null, whole: "GOSUB" } );

    splits.push( { p1: "GO", p2: "LINK", p3: null, whole: "GOLINK" } );
    splits.push( { p1: "WINDOW", p2: "S", p3: null, whole: "WINDOWS" } );
    splits.push( { p1: "UN", p2: "TAG", p3: null, whole: "UNTAG" } );
    splits.push( { p1: "LINK", p2: "S", p3: null, whole: "LINKS" } );
    splits.push( { p1: "DE", p2: "LET", p3: "E", whole: "DELETE" } );
    splits.push( { p1: "LDE", p2: "LET", p3: "E", whole: "LDELETE" } );
    splits.push( { p1: "TDE", p2: "LET", p3: "E", whole: "TDELETE" } );
    splits.push( { p1: "B", p2: "OR", p3: "DER", whole: "BORDER" } );
    splits.push( { p1: "G", p2: "COLOR", p3: "S", whole: "GCOLORS" } );
    splits.push( { p1: "CHAR", p2: "COL", p3: null, whole: "CHARCOL" } );
    splits.push( { p1: "SFRAME", p2: "CP", p3: null, whole: "SFRAMECP" } );
    splits.push( { p1: "SFRAME", p2: "FLIPX", p3: null, whole: "SFRAMEFLIPX" } );
    splits.push( { p1: "SFRAME", p2: "FLIPY", p3: null, whole: "SFRAMEFLIPY" } );
    splits.push( { p1: "SFRAME", p2: "FX", p3: null, whole: "SFRAMEFX" } );
    splits.push( { p1: "TAG", p2: "S", p3: null, whole: "TAGS" } );
    splits.push( { p1: "X", p2: "ON", p3: null, whole: "XON" } );
    splits.push( { p1: "S", p2: "POS", p3: null, whole: "SPOS" } );
    splits.push( { p1: "S", p2: "POKE", p3: null, whole: "SPOKE" } );
    splits.push( { p1: "WJ", p2: "IF", p3: "FY", whole: "WJIFFY" } );
    splits.push( { p1: "REF", p2: "OR", p3: "MAT", whole: "REFORMAT" } );


    var tokens2 = []; //tokens;

    for( var i=0; i<tokens.length; i++) {
      tokens2.push( tokens[ i ]);
    }

    for( var i=0; i<splits.length; i++) {
      var r=splits[i];
      tokens2 = this.mergeTokenRange( tokens2, r );
    }

    if( this.debugFlag ) {  console.log( tokens2 ); }
    return tokens2;
  }


  mergeTokenRange( tokens, record ) {
		var tokens2 = [];
    var tokens3 = [];

    /* Convert "S","TO","P" into "STOP" */

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
      tokens2[i] = tokens[i];
		}

    for( 	var i=1;
					i<tokens2.length;
					i++)
		{
      if( record.p3 == null ) {
        if(
           ( tokens2[i-1].type == "name" || tokens2[i-1].type == "bop" ) &&
           ( tokens2[i-0].type == "name" || tokens2[i-0].type == "bop" ) ) {
             if(
                tokens2[i-1].data == record.p1 &&
                tokens2[i-0].data == record.p2 ) {
                  tokens2[i-1].data = record.whole;
                  tokens2[i-0].type = "removeme";
                }
           }
      }
      else {
        if(i<2) {
          continue;
        }
        if(
          ( tokens2[i-2].type == "name" || tokens2[i-2].type == "bop" ) &&
           ( tokens2[i-1].type == "name" || tokens2[i-1].type == "bop" ) &&
           ( tokens2[i-0].type == "name" || tokens2[i-0].type == "bop" ) ) {

             if( tokens2[i-2].data == record.p1 &&
                tokens2[i-1].data == record.p2 &&
                tokens2[i-0].data == record.p3 ) {
                  tokens2[i-2].data = record.whole;
                  tokens2[i-1].type = "removeme";
                  tokens2[i-0].type = "removeme";
                }
           }
      }
		}

    var j=0;
    for( 	var i=0;
					i<tokens2.length;
					i++)
		{
      if( tokens2[i].type != "removeme" ) {
          tokens3[j] = tokens2[i];
          j++;
      }
		}

		return tokens3;
	}

	parseFunParList( context ) {

		var tokens = context.tokens;
		var params = [];
		var even = true;

		var endTokens = [];
		endTokens.push( { type: "sep", data: "@@@all" });
		endTokens.push( { type: "bracket", data: ")" });

		endTokens.push();

		while( true ) {

			var token;

      if( tokens.length > 0) {
        if( tokens[0].type=="bracket" && tokens[0].data==")") {
          break;
        }
      }

			if( even ) {
        var expr = this.parseBoolExpression( context, endTokens );
        expr.type = "expr";
				params.push( expr );
			}
			else {
				token = tokens.shift();

				if( token.type=="sep" ) {
					//all ok, next par
				}
				else {
					this.throwError( context, "expected comma or ), got "+token.type + " " + token.data);
				}
			}
			even = !even;
		}

		return params;
	}

	peekIfNextIsOpenBracket( context ) {

		var tokens = context.tokens;

		if( tokens.length > 0 ) {
			if( tokens[0].type == "bracket" && tokens[0].data == "(") {
				return true;
			}
		}
		return false;
	}

	parseSubExpression( context ) {

		var token = context.tokens.shift();

		if( !(token.type == "bracket" && token.data == "(")) {
			this.throwError( context, "parsing subexpression, expected bracket, not " + token.type + " - " + token.data);
		}

		var endTokens = [];
		endTokens.push( { type: "bracket", data: ")" });

		var expr = this.parseBoolExpression( context, endTokens );
		context.tokens.shift();

		expr.type = "expr";
		return expr;
	}


  tokensToString( token )  {
    var str = "";

    if(token.data == "@@@all") {
        str = str + "'" + token.type + "'";
    }
    else {
      str = str + "'" + token.type + "/" + token.data + "'";
    }

    return str;
  }

  endTokensToString( endTokenArry )  {
    var str = "";

    for( var et=0; et<endTokenArry.length; et++) {
      var endToken = endTokenArry[et];

      if( str != "") { str+= " ";}
      str += this.tokensToString( endToken );
    }
    return str;
  }

  isEndToken( token, endTokenArry ) {

    for( var et=0; et<endTokenArry.length; et++) {
      var endToken = endTokenArry[et];

      if( token.type == endToken.type && token.data == endToken.data ) {
        return true;
      }
      else if( token.type == endToken.type && endToken.data == "@@@all" ) {
        return true;
      }
    }
    return false;
  }


  parseSimpleExpression( context, endTokens ) {

    var endLoop;
		var tokens = context.tokens;

    if( tokens.length == 0) {
      return undefined;
    }

		var token, returnValue=undefined;
		token = tokens.shift();

		if( !token ) {
			this.throwError( context, "empty simple expression");
		}

    endLoop = this.isEndToken( token, endTokens );
    if( endLoop ) {
      this.throwError( context, "empty simple expression");
    }


    if( token.type == "op" && token.data == "-" ) {
				var pair = this.parseSimpleExpression( context, endTokens );
        pair[0].data = -pair[0].data;
        return pair;
		}

		if( token.type == "num" ) {
        returnValue= { type: "num", data: token.data };
		}
		else if( token.type == "str" ) {
				returnValue= { type: "str", data: token.data };
		}


    token = tokens.shift();
    if( token ) {
      endLoop = this.isEndToken( token, endTokens );
      if( ! endLoop ) {
        endLoop = context.tokens.length == 0;
      }
      if( !endLoop ) {
        this.throwError( context, "empty simple expression end expected");
      }
    }

		return [returnValue, token];
	}


  parseBoolExpression( context, endTokens0 ) {

    var endTokens = [];
    var tokens = context.tokens;

    for( var i=0; i < endTokens0.length; i++ ) {
      endTokens.push( endTokens0[ i ] );
    }

    endTokens.push( { type: "bop", data: "OR" });
    endTokens.push( { type: "bop", data: "AND" });

    var first = true;
    var eList = [];
    var op = null;
    while( true ) {

      var expr = this.parseExpression( context, endTokens );
      if( first && tokens.length == 0) {
        return expr;
      }
      first = false;

      var opData = null;
      if( op != null ) {
          opData = op.data;
      }

      //if( expr.parts.length == 1) {
      //    expr.parts[0].op = opData;
      //    expr.parts[0].dbg = "1";
      //    eList.push(  expr.parts[0] );
      //}
      //else {
          expr.op = opData;
          expr.type = "expr";
          expr.dbg = "1";
          eList.push(  expr );
      //}

      if( tokens.length > 0) {
        if( tokens[0].type == "bop" ) {
          var op = tokens.shift();
          continue;
        }
      }
      break;
    }

    if( eList.length == 1 ) {
        eList[0].dbg2 = "len=1";
        return eList[0];
    }


    var retExpr = {
      negate: false,
      binaryNegate: false,
      type: "expr",
      parts: [],
      op: null
    };

    for( i=0; i<eList.length; i++) {
      retExpr.parts.push( eList[ i ] );
    }

    return retExpr;

  }

	parseExpression( context, endTokens ) {

		var tokens = context.tokens;
    if( tokens.length == 0) {
      return null;
    }

		var expression = {
					parts: [],
          negate: false,
          binaryNegate: false
		};

		var index = 0;
		var even = true;
		var op = null;
		var parts = expression.parts;
    var first = true;
    var negate = false;

    var binaryNegate = false;


		while( true ) {
			var token, part;
			token = tokens.shift();

			if( !token ) {
				break;
			}

      var endLoop = this.isEndToken( token, endTokens );
      if( endLoop ) {

        tokens.unshift( token );
        break;
      }

			if( even ) {

				if( token.type == "num" ) {
					part = { type: "num", data: token.data, op: op };
          if( negate ) {
            part.data = -part.data;
          }
					parts.push( part );
          first = false;
          negate = false;
				}
				else if( token.type == "str" ) {
					part = { type: "str", data: token.data, op: op };
					parts.push( part );
          if( negate ) {
            this.throwError( context, "found negation on a string", "type mismatch");
          }
          first = false;
				}
				else if( token.type=="bracket" && token.data=="(") {
						tokens.unshift( token );

            var subEndTokens = [];
            subEndTokens.push( { type: "bracket", data: ")" });

						var expr = this.parseSubExpression( context, subEndTokens );
            expr.op = op;
            expr.negate = negate;
            expr.binaryNegate = binaryNegate;
						parts.push ( expr );
            first = false;
            negate = false;
				}
				else if( token.type=="name" ) {

						var name = token.data;
						var isFunctionCallOrArray = this.peekIfNextIsOpenBracket( context );
            var isUserDefinedFunctionCall = (name == "FN");

						if( isFunctionCallOrArray ) { /*We have a function or an Array */

							token = tokens.shift();
							var parameters = this.parseFunParList( context );
              tokens.shift();

              part = { type: "funCall", params: parameters, op: op, functionName: name };

              if( this.KEYWORDS.indexOf( name ) == -1 ) {
                //isArray  example: x=a(5)
                part = { type: "array", data: name, op: op, indices: parameters };

              }

              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
							else {
                parts.push ( part );
              }

						}
            else if( isUserDefinedFunctionCall ) {

              token = tokens.shift();
              name = token.data;

              token = tokens.shift();
              var parameters = this.parseFunParList( context ); //TODO limit to 1 par
              tokens.shift();

              part = { type: "defFnCall", params: parameters, op: op, functionName: name };

              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
							else {
                parts.push ( part );
              }

            }
						else { /* we have an variable*/

							part = { type: "var", data: token.data, op: op };
              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
              else {
                parts.push ( part );
              }

						}
            negate = false;
            first = false;
				}
        else if( token.type=="op" && token.data=="-" ) {
          negate = ! negate;
          continue;
        }
        else if( token.type=="bop" && token.data=="NOT" && first ) {
          binaryNegate = ! binaryNegate;
          expression.binaryNegate = binaryNegate;
          if( this.debugFlag ) {
            console.log("NOT")
          }
          continue;
        }
				else {
					this.throwError( context, "expected number, string, symbol or bracket, not " + token.data);
				}
        op = null;
			}
			else {

				if( token.type == "op" || token.type == "comp" || token.type == "eq" || token.type == "bop" ) {
					op = token.data;
				}
				else {
					this.throwError( context, "expected operator or "+
          this.endTokensToString(endTokens)+
          ", not " + token.type + " " + token.data);
				}
			}
			even = !even;

		}

    if( op != null ) {
      part = { type: "uniop", data: null, op: op };
      parts.push ( part );
    }

		if( expression.parts == null ) {
			return null;
		}

    var newParts;
    newParts = this.groupParts( expression.parts, "^" );
    newParts = this.groupParts( newParts, "/" );
    newParts = this.groupParts( newParts, "*" );

    var oldExpression = expression;
    expression = {
          parts: newParts,
          negate: oldExpression.negate,
          binaryNegate: oldExpression.binaryNegate
    };

		return expression;
	}


  groupParts( parts0 , op ) {

    var parts1=[], parts2=[];

    for( var i=0; i<parts0.length; i++ ) {
      parts1.push( parts0[ i ] );
    }

    for( var i=0; i<parts1.length; i++ ) {

      var part = parts1[ i ];
      if( i>0 && part.op == op ) {
        var prevPart = parts1[ i-1 ];

        var subExpr = {
          negate: false,
          binaryNegate: false,
          type: "expr",
          parts: [],
          op: prevPart.op
        };

        subExpr.parts[ 0 ] = prevPart;
        subExpr.parts[ 0 ].op = null;
        subExpr.parts[ 1 ] = part;

        parts1[i-1] = null;
        parts1[ i ] = subExpr;

      }
    }


    for( var i=0; i<parts1.length; i++ ) {

      var part = parts1[ i ];
      if( part != null ) {
        parts2.push( part );
      }
    }

    return parts2;
  }

  normalizeStatementName( x ) {
    if(x == "?") {
      return "print";
    }
    return x;
  }

  parseAssignment( context, preTokens, commands, command, nameToken, token0  ) {

    var token = token0;
		var tokens = context.tokens;

    command.type = "assignment";
    command.var = nameToken;
    command.arrayAssignment = false;

    var endTokens = [];
    endTokens.push( { type: "cmdsep", data: "@@@all" });

    command.expression = this.parseBoolExpression( context, endTokens );
    commands.push( command );
  }

  parseArrayAssignment( context, preTokens, commands, command, nameToken, token0  ) {

    var token = token0;
		var tokens = context.tokens;

    command.type = "assignment";
    command.var = nameToken;
    command.arrayAssignment = true;

    //token = tokens.shift();
    var indices = this.parseFunParList( context );
    command.indices = indices;

    tokens.shift();
    if( this.debugFlag ) {
      console.log("tokens after:",tokens)
    }

    token = tokens.shift();
    if( token === undefined ) {
      token = { type: "@@@notoken" };
    }

    if( token.type != "eq") {
      this.throwError( context, "Expected =");
    }

    var endTokens = [];
    endTokens.push( { type: "cmdsep", data: "@@@all" });

    command.expression = this.parseBoolExpression( context, endTokens );
    commands.push( command );

  }

  parseControlStructure(  context, preTokens, commands, command, nameToken, token0  ) {

    var token = token0;
		var tokens = context.tokens;

    if( true ) {

      command.type = "control";
      var controlToken = nameToken;
      command.controlKW = nameToken.toLowerCase();
      if( token.type != "@@@notoken") {
        tokens.unshift( token );
      }

      if( controlToken == "LET") {

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "LET expects var name");
        }
        nameToken = token.data;

        token = tokens.shift();
        if( token === undefined ) {
          token = { type: "@@@notoken" };
        }

/*        if( token.type != "bracket") { #TODO array assignments, ex: LET a(8) = 2
          this.throwError( context, "LET expects =");
        }
*/

        if( token.type == "eq") {

          this.parseAssignment( context, preTokens, commands, command, nameToken, token );
        }
        else if( token.type == "bracket" && token.data=="(" ) {

          this.parseArrayAssignment( context, preTokens, commands, command, nameToken, token );

        }
        else {
          this.throwError( context, "let, unexpected token " + token.type );
        }

/*parseAssignment( context, preTokens, commands, command, nameToken, token0  ) {
parseArrayAssignment( context, preTokens, commands, command, nameToken, token0  ) {


        if( token.type != "eq") {
          this.throwError( context, "LET expects =");
        }

        var cmdType = "assignment";
        command.type = cmdType;
        command.var = nameToken;

        var endTokens = [];
        endTokens.push( { type: "cmdsep", data: "@@@all" });

        command.expression = this.parseBoolExpression( context, endTokens );
        commands.push( command );*/
      }
      else if( controlToken == "DIM") {

        var first = true;
        command.params = [];
        command.arrayNames = [];

        while( true ) {

          token = tokens.shift();
          if(!first ) {
            if( token === undefined ) {
              break;
            }
            if( ! ( token.type == "sep" && token.data == "," )) {
              tokens.unshift( token );
              break;
            }
            token = tokens.shift();
          }

          if( token.type != "name" ) {
            this.throwError( context, "DIM expects var name");
          }

          nameToken = token.data;

          token = tokens.shift();
          if( token === undefined ) {
            token = { type: "@@@notoken" };
          }

          if( !(token.type=="bracket" && token.data=="(") ) {
            this.throwError( context, "DIM expects (");
          }

          var indices = this.parseFunParList( context );

          token = tokens.shift();
          if( token === undefined ) {
            token = { type: "@@@notoken" };
          }

          if( !(token.type=="bracket" && token.data==")") ) {
            this.throwError( context, "DIM expects )");
          }

          command.params.push( indices );
          command.arrayNames.push( nameToken );

          first = false;
        }

        commands.push( command );
      }
      else if( controlToken == "DEF") {

        token = tokens.shift();
        if( !( token.type == "name" && token.data == "FN" ) ) {
          this.throwError( context, "DEF expects FN");
        }

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "DEF FN expects function name");
        }
        var fName = token.data;

        token = tokens.shift();
        if(! ( token.type == "bracket" && token.data == "(" )) {
          this.throwError( context, "DEF FN expects function name and ->( varname )");
        }

        token = tokens.shift();
        if(! ( token.type == "name"  )) {
          this.throwError( context, "DEF FN expects function name and ( ->varname )");
        }
        var varName = token.data;

        token = tokens.shift();
        if(! ( token.type == "bracket" && token.data == ")" )) {
          this.throwError( context, "DEF FN expects function name and ( varname -> )");
        }

        token = tokens.shift();
        if(! ( token.type == "eq" && token.data == "=" )) {
          this.throwError( context, "DEF FN expects function name and ( varname ) -> =");
        }


        endTokens = [];
        var expr_fn = this.parseBoolExpression( context, endTokens );

        if( this.debugFlag ) {
          console.log("expr = " + expr_fn );
        }

        command.params=[];
        command.params[0] = fName;
        command.params[1] = varName;
        command.params[2] = expr_fn;
        commands.push( command );

      }
      else if( controlToken == "GOTO" || controlToken == "GOSUB") {
        var num = -1;

        token = tokens.shift();

        if( token === undefined ) {
          this.throwError( context, "GOTO/GOSUB expects number", "undef'd statement");
        }

        if( token.type != "num") {
          this.throwError( context, "GOTO/GOSUB expects number", "undef'd statement");
        }
        num = parseInt(token.data);
        token = tokens.shift();
        if( token !== undefined ) {
          if( token.type != "cmdsep") {
            this.throwError( context, "expected cmdsep, instead of "+token.type+"/"+token.data);
          }
        }

        command.params=[];
        command.params[0] = num;
        commands.push( command );

      }
      else if( controlToken == "ON" ) {
        var nums = [];

        endTokens = [];
        endTokens.push( { type: "name", data: "GOTO" });
        endTokens.push( { type: "name", data: "GOSUB" });

        var onExpr = this.parseBoolExpression( context, endTokens );

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "ON expects GOTO/GOSUB");
        }
        if( !( token.data == "GOTO" || token.data == "GOSUB" )) {
          this.throwError( context, "ON expects GOTO/GOSUB");
        }
        var onType = token.data;

        token = tokens.shift();

        if( token.type != "num") {
          this.throwError( context, "ON GOTO/GOSUB expects number", "undef'd statement");
        }

        if( token.type != "num") {
          this.throwError( context, "ON GOTO/GOSUB expects number",  "undef'd statement");
        }
        nums.push(  parseInt(token.data) );

        while ( true ) {

          token = tokens.shift();
          if( token == undefined ) { break; }
          if( token.type == "cmdsep") { break; }
          if( token.type == "cmdsep") { break; }
          if( !( token.type == "sep" && token.data == "," )) {
            this.throwError( context, "ON GOTO/GOSUB expects numberlist");
          }

          token = tokens.shift();
          if( token.type != "num") {
            this.throwError( context, "GOTO/GOSUB expects number");
          }
          nums.push(  parseInt(token.data) );
        }

        command.params=[];
        command.params[0] = onType.toLowerCase();
        command.params[1] = onExpr;
        command.params[2] = nums;
        commands.push( command );

      }
      else if( controlToken == "RETURN") {
        var num = -1;

        command.params=[];
        commands.push( command );

      }
      else if( controlToken == "END") {
        var num = -1;

        command.params=[];
        commands.push( command );

      }
      else if( controlToken == "STOP") {
        var num = -1;

        command.params=[];
        commands.push( command );

      }
      else if( controlToken == "FOR") {

        var variable, expr_from, expr_to, expr_step;
        var endTokens = [];

        token = tokens.shift();
        if( token.type != "name" ) {
          this.throwError( context,
                "For expects variable, no var found, found " + token.type+"/"+token.data);
        }

        variable = token.data;

        token = tokens.shift();
        if( !( token.type == "eq" && token.data == "=" )) {
          this.throwError( context,
                "For expects '=', not found, found " + token.type+"/"+token.data);
        }

        endTokens = [];
        endTokens.push( { type: "name", data: "TO" });

        expr_from = this.parseBoolExpression( context, endTokens );

        token = tokens.shift();
        if( !( token.type == "name" && token.data == "TO" ) ) {
          this.throwError( context, "For expects 'to', not found, found " + token.type+"/"+token.data);
        }

        endTokens = [];
        endTokens.push( { type: "cmdsep", data: ":" });
        endTokens.push( { type: "name", data: "STEP" });

        expr_to = this.parseBoolExpression( context, endTokens );
        expr_step = { parts: [ { data: "1", op: null, type: "num"} ] };

        token = tokens.shift();
        if( !( token === undefined ) ) {
          if( token.type == "name" && token.data == "STEP") {

              endTokens = [];
              endTokens.push( { type: "cmdsep", data: ":" });
              expr_step = this.parseBoolExpression( context, endTokens );
          }
          else {
            if(! ( token.type == "cmdsep" && token.data == ":")) {
              throw "FOR unexpected token " + token.type + "/" + token.data;
            }
          }
        }

        command.controlKW = "for:init";
        command.params=[];
        command.params[0] = expr_from;
        command.params[1] = expr_to;
        command.params[2] = expr_step;
        command.variable = variable;
        commands.push( command );
        if( this.debugFlag ) {
          console.log("command=", command);
        }

      }
      else if( controlToken == "NEXT") {

        var variable;

        var explicit = false;
        while( true ) {

          var token = tokens.shift();
          if( ! token ) {
            break;
          }
          if( token.type == "cmdsep" ) {
            break;
          }

          if( token.type != "name" ) {
            throw "next expected var or nothing";
          }

          var nextcommand = {
            controlKW: "for:next",
            nextVar: token.data,
            lineNumber: command.lineNumber,
            type: command.type
          };

          commands.push( nextcommand );
          explicit = true;

          var token = tokens.shift();
          if( ! token ) {
            break;
          }
          if( token.type == "cmdsep" ) {
            break;
          }
          if( !( token.type == "sep" && token.data == "," )) {
            throw "expected comma, found " + token.type + "/"+token.data;
          }
        }

        if( ! explicit ) {
          command.controlKW = "for:next";
          command.nextVar = null;
          commands.push( command );
        }

      }
      else if( controlToken == "IF") {

        var expr1, expr2, comp;
        endTokens = [];
        endTokens.push( { type: "name", data: "THEN" });
        endTokens.push( { type: "name", data: "GOTO" });
        var expr1 = this.parseBoolExpression( context, endTokens );
        command.params= [ expr1 ];

        token = tokens.shift();

        if( token.type == "name" && token.data == "GOTO") {
          var insert = {};
          insert.data = "GOTO";
          insert.type = "name";
          tokens.unshift( insert );
        } else {
          if( tokens.length > 0 ) {
            if( tokens[0].type == "num" ) {
              var insert = {};
              insert.data = "GOTO";
              insert.type = "name";
              tokens.unshift( insert );
            }
          }
        }

        var block = this.parseLineCommands( context );

        if( this.debugFlag ) {
          console.log( block );
        }

        commands.push( command );

        for( var bi=0; bi<block.length; bi++) {
          commands.push( block[bi] );
        }

      }
      else if( controlToken == "DATA") {

        var dataArray = [];
        var endTokens;

        endTokens = [];
        endTokens.push( { type: "cmdsep", data: ":" });
        endTokens.push( { type: "sep", data: "," });

        while ( true ) {
            var pair = this.parseSimpleExpression( context, endTokens );

            var expr1 = pair[0];


            if( expr1 === undefined ) {
              throw "data expected data";
            }

            dataArray.push( expr1 );

            token = pair[1];
            if( token === undefined ) {
              break;
            }
            if( token.type == "cmdsep" && token.data == ":" ) {
              break;
            }
            else if( token.type == "sep" && token.data ==",") {
              continue;
            }
            else {
              this.throwError( context, "data unknown token found " + token.type+"/"+token.data);
            }
        }

        command.params=dataArray;
        commands.push( command );

      }
      else if( controlToken == "REM") {

        while( true ) {

            token = tokens.shift();
            if( token == null ) { break ; }
        }

        commands.push( command );

      }
      else {
        this.throwError( context, command.controlKW + " not implemented");
      }
    }
  }

  parseStatementCall(  context, preTokens, commands, command, nameToken, token0 ) {

    var token = token0;
		var tokens = context.tokens;

    command.statementName = this.normalizeStatementName( nameToken );
    command.type = "call";


    if( token.type != "@@@notoken") {
      tokens.unshift( token );
    }

    command.params = [];

    while ( true ) {

      var endCommand = false;
      var endTokens = [];
      endTokens.push( { type: "sep", data: "@@@all" });
      endTokens.push( { type: "cmdsep", data: "@@@all" });

      var expression = this.parseBoolExpression( context, endTokens );
      if( this.debugFlag ) {
        console.log( expression );
      }

      if( expression != null ) {
        command.params.push( expression );

        token = tokens.shift();
        if( token != undefined ) {
          if( token === undefined ) {
            endCommand = true;
          }
          if( token.type == "cmdsep" ) {
            endCommand = true;
          }
          else if( token.type == "sep") {
            continue;
          }
          else {
            this.throwError( context, "unexpected chars in statement call: '" + token.data +"'");
          }
        }
        else {
          endCommand = true;
        }

      }
      else {
        endCommand = true;
      }

      if( endCommand  ) {
        commands.push( command );
        break;
      }
    }
  }

	parseLineCommands( context, preTokens ) {

		var tokens = context.tokens;
		var commands = [];

		var i=1;
		while( true ) {

			var command = {};
			var token;
      var keyword = false;
      var control = false;

			command.lineNumber = context.lineNumber;

			token = tokens.shift();
			if( token === undefined ) {
				break;
			}
			if( token.type == "cmdsep" ) {
				/* empty command */
				continue;
			}

			if( token.type != "name" ) {
				this.throwError( context, "Unexpected token, expected symbolname, got " + token.type + "/" + token.name) ;
			}

			var nameToken = token.data;
			var cmdType = "unknown";

			if( this.CTRL_KW.indexOf( token.data ) > -1) {
					control = true;
			}

      if( this.KEYWORDS.indexOf( token.data ) > -1 || token.data == "XON") {
					keyword = true;
			}
      else {
        if( this.SHORTCUT_KW.indexOf( token.data ) > -1) {
  					keyword = true;
  			}
      }

		  token = tokens.shift();
			if( token === undefined ) {
				token = { type: "@@@notoken" };
			}

      if (  control ) {

        this.parseControlStructure( context, preTokens, commands, command, nameToken, token );

      }
			else if( token.type == "eq") {

				this.parseAssignment( context, preTokens, commands, command, nameToken, token );
			}
      else if( token.type == "bracket" && token.data=="(" && !keyword ) {

				this.parseArrayAssignment( context, preTokens, commands, command, nameToken, token );

			}
      else {
          if( !keyword ) {
            console.log("Dump: ",context, preTokens, commands, command, nameToken, token);
            this.throwError( context, "statement without keyword");
          }
          this.parseStatementCall( context, preTokens, commands, command, nameToken, token );

      }

		}
    return commands;
	}

  logTokens( tokens ) {
    if( !this.debugFlag ) { return ; }

    var tokensStr = "";
    for( var i=0; i<tokens.length; i++) {
      var tok = tokens[i];
      var tokStr = tok.type + ":" + tok.data;
      if( tokensStr != "" ) {
        tokensStr += ", ";
      }
      tokensStr += tokStr;
    }

    console.log( tokensStr );


    for( var i=0; i<tokens.length; i++) {
        var tok = tokens[i];
        console.log("token: ",tok);
    }

  }

  parseLine( line ) {

    var lineRecord = {
      lineNumber: -1,
      commands: []
    };

    var errContext, detail, lineNr=-1;
    try {
      errContext="TOKENIZER";
      detail="INIT";
  		var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );

      detail="PARSING TOKENS";
      var tokens = toker.tokenize();
      if( this.debugFlag ) {
        console.log("Tokens after tokenizer");
      }
      this.logTokens( tokens );

      detail="INTERNAL";
      tokens = this.upperCaseNameTokens( tokens );
      tokens = this.removePadding( tokens );
      tokens = this.mergeCompTokens( tokens );
      tokens = this.mergeBrokenUpTokens( tokens );


      if( this.debugFlag ) {
        console.log("Tokens after merge");
      }
      this.logTokens( tokens );

      if( tokens.length == 0 ) {
  			return null;
  		}

  		if( tokens[0].type == "num" ) {
  			lineRecord.lineNumber = tokens[0].data;
        lineNr = tokens[0].data;
        tokens.shift();
      }

  		var context = {
        tokens: tokens,
        lineNumber: lineRecord.lineNumber
      }

      errContext = "PARSER";
      detail="PARSING COMMANDS";
      var commands = this.parseLineCommands( context );
      lineRecord.commands = commands;
      lineRecord.raw = line;
      return lineRecord;
    }
    catch ( e ) {

      if( this.erh.isError( e ) ) {
        if( e.lineNr == -1 ) {
          if( lineNr != -1 ) {
            e.lineNr = lineNr;
          }
        }
        throw e;
      }
      this.throwError( null, errContext + ": " + detail );
    }
  }

  getTokens( line, merge, noPadding  ) {

    try {
      var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );
      var tokens = toker.tokenize();
      if( noPadding) { tokens = this.removePadding( tokens ); }
      if( merge ) {tokens = this.mergeCompTokens( tokens ); }
      this.logTokens( tokens );
      return tokens;
    }
    catch ( e ) {
      console.log( e );
      this.throwError(null,"getTokens error","internal");
    }
  }
}

//--EOC 

// ## basictokenizer.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basictokenizer.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basictokenizer.js

class StringReader {

	constructor( strIn ) {
			this.buffer = strIn;
			this.index = 0;
			this.lineIndex = 1;
			this.line = 1;
			var a={}; a.b=strIn;

	}

	peek() {
		return this.buffer.substr( this.index,1 );
	}
	peek2() {
		return this.buffer.substr( this.index,2 );
	}


	unconsume( x ) {
		this.index -= x;
	}

	consume() {

		var c = this.buffer.substr( this.index,1 );
		this.index ++;
		if( c == "\n") {
			this.line++;
			this.lineIndex = 1;
		}

	}

	EOF() {
		var len = this.buffer.length;
		if( this.index < len ) {
			return false;
		}
		return true;
	}
}


class Tokenizer {

	constructor( reader, keywords ) {
			this.tokens = [];
			this.reader = reader;
			this.keywords = keywords;
	}

	isOpChar( ctx ) {

		var rv = ctx.c.match("[+]|[-]|[*]|[/]|[\\^]|[;]") != null;

		return [rv,0];

	}

	isCompChar( ctx ) {

		var rv =  (ctx.c == "<" || ctx.c == ">");
		return [rv,0];
	}

	isEqChar( ctx ) {
			if( ctx.c == "=" ) {
				return [true,0];
			}
			return [false,0];
	}


	isNameChar( ctx  ) {

		//console.log("SEQ: " + ctx.seq);
		if( ctx.endFound ) {
			return [false,0];
		}
		var rv = ctx.c.match("[a-zA-Z0-9$%?]") != null;

		if( ctx.c=="$" || ctx.c== "%") {
			ctx.endFound = true;
		}

		if( this.keywords.indexOf( ctx.seq ) >-1 ) {
			//console.log("Found Keyword: " + ctx.seq );
			ctx.endFound = true;
		}
		else if( ! (ctx.seq === undefined )) {
			var trappedKW = false;
			var trapped = null;
			for( var i=0; i<this.keywords.length; i++) {
				var kw = this.keywords[i];
				if( ctx.seq.indexOf( kw ) > 0 )  {
					trappedKW = true;
					trapped = kw;
					//console.log( "trapped-------------" );
					//console.log( kw );
					//console.log( ctx.seq );
					//console.log( ctx );
					return [rv, kw.length ];
				}
			}

		}
		return [rv,0];
	}

	isNumChar( ctx  ) {
		return [(ctx.c.match("[0-9\.~]") != null),0];
	}

	isPadChar( ctx  ) {
			if( ctx.c == " " || ctx.c == "\t" || ctx.c == "\n" || ctx.c == "\r") {
				return [true,0];
			}
			return [false,0];
	}

	isCommandSepChar( ctx  ) {
			if( ctx.c == ":" ) {
				return [true,0];
			}
			return [false,0];
	}


	isSepChar( ctx  ) {
			if( ctx.c == "," ) {
				return [true,0];
			}
			return [false,0];
	}

	isAnyChar( ctx  ) {
			return [true,0]; /* Will be executed last */
	}

	isBracket( ctx  ) {
		if( ctx.c == "(" || ctx.c == ")" || ctx.c == "[" || ctx.c == "]") {
			return [true,0];
		}
		return [false,0];
	}


	isStrChar( ctx ) {

		if( ctx.endFound ) {
			return [false,0];
		}

		if( ctx.index == 0) {
			if( ctx.c=="\"" ) {
				ctx.inString = true;
				return [true,0];
			}
			return [false,0];
		}
		else if( ctx.inString ) {
			if ( ctx.index > 0 && ctx.c=="\"") {
				ctx.endFound = true;
			}
			return [true,0];
		}

		return [false,0];

	}

	normalizeToken( tok0 ) {
		var tok = tok0;

		tok.type = tok0.type;

		if( tok.type == "str" ) {
				tok.data = tok0.data.substr(1,tok0.data.length-2);
		}
		return tok;
	}

	readChars( read, type0, compareF, tokenType ) {
		var tok = { type: type0, data : "" }
		var ctx = { index:0, prev: null, seq: "" };

		while(!read.EOF()) {

			var c = read.peek();

			ctx.seq += c;
			ctx.c = c;

			var rv = this[compareF ] ( ctx );
			if( rv[1] > 0 ) {
					read.unconsume( rv[1]-1 );
					ctx.seq = ctx.seq.substr(0,ctx.seq.length-rv[1]) ;
					tok.data = ctx.seq;
					break;
			}

			if( !rv[0] ) {
				return this.normalizeToken( tok );
			}
			tok.data += c;
			read.consume();

			ctx.index++;
			ctx.prev = c;

			if( tokenType == "chr") {
				break;
			}
		}

		return this.normalizeToken( tok );
	}


	tokenize() {
		var read = this.reader;

		var _this = this;
		var tokens = [];

		var parseRules = [];
		var TYPEIX = 0;
		var FUNCIX = 1;
		var STRINGTYPEIX = 2;

		parseRules.push(["pad", 		"isPadChar"		, "str"] );
		parseRules.push(["str", 		"isStrChar"		, "str"] );
		parseRules.push(["num", 		"isNumChar"		, "str"] );
		parseRules.push(["name", 		"isNameChar"	, "str"] );
		parseRules.push(["op", 			"isOpChar"   	, "chr"] );
		parseRules.push(["comp", 		"isCompChar"  , "chr"] );
		parseRules.push(["eq", 			"isEqChar"   	, "chr"] );
		parseRules.push(["bracket", "isBracket"   , "chr"] );
		parseRules.push(["sep", 		"isSepChar"   , "chr"] );
		parseRules.push(["cmdsep", 	"isCommandSepChar"   , "chr"] );
		parseRules.push(["trash", 	"isAnyChar"   , "chr"] );

		while( !read.EOF() ) {
			var c = read.peek();
			var tokenFound = false;

			for( var i=0; i<parseRules.length; i++) {
				var rule = parseRules[ i ];

				var ctx = { index: 0, c:c }
				var rv = this[rule[FUNCIX]]( ctx );
				if( rv[0] ) {
						var tok = this.readChars( read, rule[TYPEIX], rule[FUNCIX], rule[STRINGTYPEIX] );

						tokens.push( tok );
						tokenFound = true;
						break;
				}
				else {
					//do nothing
				}
			}
			if(!tokenFound) {
				throw "syntax error, unexpected character: '" + c + "' =>" + read.line + ":" + read.lineIndex;
			}
		}
		return tokens;
	}
}

//--EOC 

// ## input.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/input.js
//  BY packworkers.js -- src/sys/modules/basic/worker/input.js

class Input {

  constructor() {
    this.keyPress = [];
    this.interactive = false;
  }

  setHandler( hc ) {
    this.handlerClazz = hc;
  }

  setInterActive( flag ) {
    this.interactive = flag;
  }

  inputKeyHandler( e )  {

    if( !this.interactive ) {
        this.keyPress.push( e );
    }
    else {

        var hc = this.handlerClazz;
        hc["interactiveKeyHandler"]( e );

    }
  }

  getKey() {
    var key = this.keyPress.shift();
    if( key ) {
      return key;
    }
    return null;
  }

}

class MutedInput {

  setHandler( hc ) {}
  setActive( flag ) {}
  getKey() { return null; }
  inputKeyHandler(e) {}
  getKey() { return null;}

}

//--EOC 

// ## processes.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/processes.js
//  BY packworkers.js -- src/sys/modules/basic/worker/processes.js

class processes {

	constructor( sys ) {

		this.sys = sys;
		this.processes = [];
		this.count = 0;

		var _this = this;
    var processes = _this.processes;

		this.sys.log("Starting process interval");
		setInterval(function()  {

			for( var i=0; i<processes.length; i++ ) {
				if( processes[i] ) {
					processes[ i ].cycle();
					//_this.count++;
				}
			}
		}, 100);
	}

	getTicks() {
		return this.count;
	}

	register( obj ) {

		var newId = this.processes.length;

		this.processes.push( obj );

		return newId;
	}

	getRoot() {

		return this.processes[ 0 ];
	}
}

//--EOC 

// ## workerwrapper_static.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/workerwrapper_static.js
//  BY packworkers.js -- src/sys/modules/basic/worker/workerwrapper_static.js

sys.log("Starting");
start_sys();

//--EOC 

