class BasicRuntime {

  constructor( sys, editor ) {

    this.debugFlag = false;
    this.sys = sys;
    this.editor = editor;
    this.editor.addRunTime( this );
    this.listSpeed = 15;

    this.output = sys.out;
    this.bitmap = sys.bout;
    this.input = sys.input;
    this.input.setHandler( this );
    this.input.setInterActive( false);
    this.html = sys.html;

    this.program = [];
    this.runFlag = false;
    this.waitForMessageFlag = false;
    this.waitForMessageVariable = null;
    this.executeLineFlag = false;
    this.goPlayExampleFlag = false;
    this.breakCycleFlag;
    this.inputFlag = false;
    this.listFlag = false;
    this.immersiveFlag = false;
    this.gosubReturn = [];
    this.nullTime = new Date().getTime();

    this.turboMode = false;
    this.cmdCountPerCycleDefault = 10000;
    this.cmdCountPerCycleTurbo = 20000;
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

    //this.setTurbo( true );
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

  receiveMessage( _message, _data ) {

    this.vars[ this.waitForMessageVariable ] = _message;
    this.waitForMessageFlag = false;

    if( _message == "displaysize" ) {
        this.output.reInit( _data.textW, _data.textH );
        this.output.reInit( _data.bitmapW, _data.bitmapH );

        if( this.runFlag == false ) {
            this.printReady();
        }
    }
  }

  stop() {
    if( this.runFlag ) {
      this.runStop();
    }
    if( this.listFlag ) {
      this.listStop();
    }
  }

  interactiveKeyHandler( e ) {

    if( this.runFlag == true ) {
      if( e.keyLabel == "Enter" ) {

        this.output.writeln("");
        this.handleLineInput( this.lineInput, true );
        this.lineInput = "";
      }
      else if( e.keyLabel == "Backspace" ||
              e.keyLabel == "Delete"  ) {
        var x = this.output.getCursorPos()[0];
        if( x>0) {
            if( this.lineInput.length > 0 ) {
                this.output.backspace();
                this.lineInput = this.lineInput.substr(0,this.lineInput.length-1)
            }

        }
      }
      else if( e.keyLabel == "ArrowLeft" ) {
        this.output.cursorMove("left");
      }
      else if( e.keyLabel == "ArrowRight" ) {
        this.output.cursorMove("right");
      }
      else {
        if( e.key != null ) {
          this.lineInput += e.key;
          this.output.write( e.key );
        }
      }
    }
    else {
      this.editor.interactiveKeyHandler( e );
    }
  }

  HandleStopped() {

    this.input.setInterActive( true);
  }

  importPGMHandler( content, filename ) {
    var pgm = this.textLinesToBas( content.split("\n") );
    this.fileName = filename;

    this.program = pgm;
    this.sys.log( "imported program " + filename +" with " + content.length + " bytes ");
  }

  bootPGM( content, filename ) {
    try {
      var pgm = this.textLinesToBas( content.split("\n") );
      this.fileName = filename;

      this.program = pgm;
      this.setProgram( pgm );

      this.sys.log( "imported program " + filename +" with " + content.length + " bytes ");
      return true;
    }
    catch ( e ) {
      var tmp = 1;

      var pgm = this.textLinesToBas( "" );
      this.program = pgm;
      this.HandleStopped();
      this.printError("parsing syntax", false, e.lineNr, e.detail );
      this.printReady();
      return false;

    }
  }


/*  exportPGM() {
    var exportName = "program.bas";
    if( this.fileName ) {
      exportName = this.fileName;
    }

    var text = this.getProgramAsText();
    this.DESKTOP.requestDownload( text, exportName );
  }
*/

  exitProgram() {
    this.closeWindow( this.windowId );
  }


  enterListMode( list ) {
    this.listFlag = true;
    this.list = list;
    this.listPointer = 0;
    this.input.setInterActive( false );
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
      return;
    }
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;
    this.turboMode = false;
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

  printError( s, supressLine, explicitline, detail ) {

    var line1 = ("?" + s + " error" + this.onLineStr());

    if( explicitline ) {
        line1 = ( ("?" + s + " error in " + explicitline ) );
    }
    if( supressLine ) {

        line1 = ( ("?" + s + " error") );
    }

    this.output.writeln(  line1 );
    if( detail ) {
      this.output.writeln(  ">> " + detail );
    }

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
      else if(p.data == "CURRENTLINE") {
        val = this.runPointer;
        if( val != -1 ) {
          val = parseInt( this.program[ val ][0] );
        }
      }
      else if(p.data == "PI") {
        val = Math.PI;
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
        throw "@no such array@Array '"+ varIntName+"' does not exist";
      }

      if( arr.getIndexCount() != p.indices.length ) {
          throw "@bad subscript@Array index dimensions do not match";
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

            this.printError("no such function: " + p.functionName);
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
        throw "@syntax@unknown operator '"+p.op+"'";
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

      this.sys.blinkMode( false  );

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

      if( this.bitmap.isActive() ) {
        this.bitmap.triggerFlush();
      }

      if( !this.runFlag ||
            this.inputFlag ||
            this.listFlag
             ) {

        if( this.listFlag ) {
           var countdown = this.listSpeed;
           while( this.listPointer < this.list.length && countdown-- > 0 ) {
               this.listCodeLine( this.list[ this.listPointer ] );
               this.listPointer++;
           }
           if (  this.listPointer >= this.list.length ){
             this.listStop();
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
        this.printError( err.clazz, undefined, undefined, err.detail );
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

  goto( line0 ) {

    //console.log( "goto line " + line)
    var pgm = this.program;
    var len=this.program.length;
    var found = false;
    var line;

    if( (typeof line0) == "number" ) {
        line = line0;
    }
    else {
        line = this.evalExpression( line0 );
    }

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
      this.HandleStopped();
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


  printChar( c  ) {
    this.output.write( c );
  }

  listCodeLine( rawLine ) {

    var inString = false;
/*    for( var i=0; i<rawLine.length; i++ ) {

      var c = rawLine.charAt(i);

      this.printChar( c );

      if( c == "\"" ) {
        inString = !inString;
      }
    }*/
    this.printLine( rawLine );

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

    this.input.setInterActive( false);

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
    else {
      this.runFlag = false;
      this.inputFlag = false;
      this.runPointer = 0;
      this.runPointer2 = 0;
      this.input.setInterActive( true);
      this.printReady();
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
        throw "@syntax@Can't find command after 'FOR'";
      }
      else {
        if( ( this.runPointer + 1) >= linePointersLen ) {
          throw "@syntax@Can't find command after 'FOR', on next line";
        }
        ctxv.jumpTo.line++;
        ctxv.jumpTo.cmdPointer = 0;
      }
    }

  }

  doForNext( nextVarName ) {
    var ctx = this.forContext;
    if( ctx.default.length == 0 ) {
      throw "@syntax@Next without for";
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
                this.printError("type mismatch", undefined, undefined, "value not a number");
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
                this.printError("type mismatch", undefined, undefined, "value not a number");
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
    this.sys.blinkMode( true );

  }

  executeInteractiveLine( str ) {
    this.handleLineInput( str, false );
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
            this.printChar( "? ");
            return;
          }
          this.setVar( this.inputVars[ this.inputVarsPointer ], num );
        }

        this.inputVarsPointer++;
        if( this.inputVarsPointer >= this.inputVars.length ) {

          this.exitInputState();
        }
        else {
          this.printChar( "?? ");
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
        this.printError( e.clazz, true, undefined, e.detail );
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
          this.printError( err.clazz, undefined, undefined, err.detail );
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
