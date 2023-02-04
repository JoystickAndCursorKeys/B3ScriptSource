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
    this.audio = sys.audio;
    this.input.setHandler( this );
    this.input.setInterActive( false);
    this.html = sys.html;
    this.menuEnable = false;

    this.program = [];
    this.runFlag = false;
    this.isWaitingFlag = false;
    this.waitingTime = 0;

    this.waitForMessageFlag = false;
    this.waitForMessageVariable = null;
    this.executeLineFlag = false;
    this.goPlayExampleFlag = false;

    this.inputFlag = false;
    this.inputCommand = false;
    this.listFlag = false;
    this.immersiveFlag = false;
    this.statusChanged = false;

    this.gosubReturn = [];
    this.nullTime = new Date().getTime();

    this.turboMode = false;
    this.cmdCountPerCycleDefault = 20000;
    this.cmdCountPerCycleTurbo = 20000;
    this.cmdCountPerCycle = this.cmdCountPerCycleDefault ;

    var c = this.output;
    this.commands = new BasicCommands( this );
    this.extendedcommands = new ExtendedCommands( this.commands, this );

    this.erh = new ErrorHandler();
    this.vars = {};
    this.functions = [];
    this.data = [];
    this.loadedData = { default: [] };
    this.loadedLabel = null;

    this.kbBuffer = [];

    this.yPos = -1;

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

  flagStatusChange() {
    this.statusChanged = true;
  }

  clearInputCommand() {  /* for GET and GETKEY, for input we use something else */
    this.inputCommand = false;
  }

  flagInputCommand() {  /* for GET and GETKEY, for input we use something else */
    this.inputCommand = true;
  }

  setWaiting( time ) {  /* for GET and GETKEY, for input we use something else */
    this.isWaitingFlag = true;
    this.waitingTime = time;
  }

  clearWaiting() {  /* for GET and GETKEY, for input we use something else */
    this.isWaitingFlag = false;
  }


  getScopeVars( s ) {
    return s.vars;
  }

  getFullVarList() {
    var scopes = this.getFullScopes();
    var varList = [];

    for( var si = 0; si< scopes.length; si++ ) {

      var fullscope = scopes[si];
      var vars = this.getScopeVars( fullscope.scope );
      var names = Object.getOwnPropertyNames( vars );

      for( var i=0;i<names.length;i++) {
        var name = names[i];
        var value = vars[ name ];
        var path = fullscope.path;
        if( path == "" ) { path = ""; }
        else { path += "/"; }
        if( ! name.startsWith( "@array_" ) ) {
            if( name.endsWith("$") ) {
                varList.push( path + name + " = \"" + value + "\"" );
            }
            else {
                varList.push( path + name + " = " + value );
            }
        }
        else {
            var descr = "";
            for( var ii=0; ii<value.indices.length; ii++ ) {
              if( ii>0 ) { descr += ","; }
              descr += value.indices[  ii ];

            }
            varList.push( name.substr(7) + " = array with dim(" + descr + ")" );
        }
      }
    }

    return varList;
  }

  getFullScopes() {
    var scopes = [];
    var path = "";
    for( var si = 0 ; si < this.scopes.length; si++ ) {
      var scope = this.scopes[si].name;

      if( si > 0) {
        if( path != "" ) {
          path += "/";
        }
        path += scope;
      }

      scopes.push( { path: path, scope: this.scopes[si]  } );
    }

    return scopes;
  }

  cpuNeeded() {
    if (this.runFlag ) { return 1; }
    else if (this.listFlag ) { return .8; }
    return .1;

  }

  getStatus() {

    var status = "";
    var lineNr;
    if( this.runFlag ) {
      lineNr = this.program[ this.runPointer ][0];
      status = "running[" + lineNr + "]";
    }
    else {
      status = "stopped";
    }

    if( this.runFlag && this.inputFlag ) {
      status = "running[" + lineNr + "]/input";
    }
    else if( !this.runFlag && this.listFlag ) {
      status = "stopped/listing";
    }

    var vlen = Object.getOwnPropertyNames( this.getVars() ).length;


    this.statusChanged = false;

    return {
      status: status,
      pgmLen: this.program.length,
      varLen: vlen,
      displayMode: this.sys.displayMode
    }
  }

  dir( path, device ) {
    this.sys.dir( this, path, device );
    this.startWaitForMessage( "dir" )
  }

  listfs() {
    this.sys.listfs( this );
    this.startWaitForMessage( "listfs" )
  }

  setfs( path ) {
    this.sys.setfs( this, path );
    this.startWaitForMessage( "path" )
  }

  load( path, start, device ) {
    this.sys.load( this, path, device );
    this.startWaitForMessage( "load" )
    this.autoStartAfterLoad = start;

  }

  loaddata( path, type, label ) {
    this.sys.loaddata( this, path, type, label );
    this.startWaitForMessage( "loaddata" )

  }

  save( path0, device ) {

    var data = this.getProgramAsText();
    var path = path0;
    if( path0 == null ) {
      path = "default.bas";
    }
    this.sys.save( this, path, device, data );
    this.startWaitForMessage( "save" )
  }

  deleteFile( path, device ) {

    this.sys.delete( this, path, device );
    this.startWaitForMessage( "delete" )
  }


  startWaitForMessage( variable ) {
    this.waitForMessageFlag = true;
    this.waitForMessageVariable = variable;
  }


  keyInterrupt( _type, _data ) {
    this.interrupt( 0, _type, {} );
  }

  interrupt( _ix, _type, _data ) {



    if( _ix == 0 && this.interruptFlag0 ) {
        return; //allready in an interrupt0
    }

    if( _ix == 1 && this.interruptFlag1 ) {
        return; //allready in an interrupt1
    }


    var line, useLabel;
    if( _ix == 0 ) {

      line = this.handlers.interrupt0;
      if( line === undefined ) {
        return;
      }
      this.interruptFlag0 = true;
      useLabel = this.handlers.interrupt0ParamIsLabel;
    }
    else {

      line = this.handlers.interrupt1;
      if( line === undefined ) {
        return;
      }
      this.interruptFlag1 = true;
      useLabel = this.handlers.interrupt1ParamIsLabel;
    }


    this.newScope( "interrupt" + _ix,
      { runPointer: this.runPointer, runPointer2: this.runPointer2 } );

    var variables = Object.entries( _data );
    this.setVar( "itr0$".toUpperCase(), _type.toUpperCase() );
    for( var i=0; i<variables.length; i++) {
      this.setVar( variables[i][0].toUpperCase(), variables[i][1] );
    }

    var pgm = this.program;
    var len=this.program.length;
    var found = false;

    if( useLabel ) {

      line = this.labels[line];
      if( line == undefined ) {
        throw "@undef'd label";
      }
    }

    for( var i=0; i<len; i++) {
      var l = pgm[i];

      if( l[0] == line ) {
        this.runPointer = i;
        this.runPointer2 = 0;
        found = true;
        break;
      }
    }

    if(!found ) {
      throw "@invalid interrupt handler";
    }

  }

  receiveMessage( _message, _data ) {

    this.vars[ this.waitForMessageVariable ] = _message;
    this.waitForMessageFlag = false;

    if( _message.startsWith( "displaysize:" )) {
        this.output.reInit( _data.textW, _data.textH );
        this.bitmap.reInit( _data.bitmapW, _data.bitmapH );
        this.sys.displayMode = _data.mode;

    }
    else if( _message == "load:error" ) {

      if( this.runFlag == false ) {
          this.printError("load", false, undefined, _data.reason );
      }
    }
    else if( _message == "load:completed" ) {

      sys.log("Received 'load:completed' message. Loaded " + _data.pgmData.length + " bytes.." );

      var ok = this.bootPGM( _data.pgmData, _data.path  );
      sys.log("Parsed program => RUN");

      if( ok && this.autoStartAfterLoad ) {
        this.output.control( 24 )
        this.runPGM();
        sys.log("Program started...");
      }
      else {
        this.stop();
      }
    }
    else if( _message == "loaddata:completed" ) {

      sys.log("Received 'loaddata:completed' message. Loaded " + _data.data.length + " bytes.." );

      this.insertData( _data.data, _data.type, _data.label  );

    }
    else if( _message == "loaddata:error" ) {

      sys.log("Received 'loaddata:error' message. Error " + _data.reason );

      this.printError("loaddata", false, undefined, _data.reason );
      this.stop();
    }
    else if( _message == "delete:completed" ) {

      sys.log("Received 'delete:completed' message." );

    }
    else if( _message == "delete:error" ) {

      sys.log("Received 'delete:error' message. Error " + _data.reason );

      this.printError("delete", false, undefined, _data.reason );
      this.stop();
    }
    else if( _message == "save:completed" ) {

      sys.log("Received 'save:completed' message." );

      if( !this.isRunning() ) {
      }
    }
    else if( _message == "save:error" ) {

      sys.log("Received 'save:error' message. Error " + _data.reason );

      this.printError("save", false, undefined, _data.reason );
      this.stop();
    }
    else if( _message == "dir:completed" ) {

      sys.log("Received 'dir:completed' message." );

      var list = ["","Directory of: \"" + _data.title + "\" on " + _data.fs, "" ];

      for( var i=0; i<_data.files.length; i++) {
          list.push( _data.files[i].fname );
      }

      list.push( _data.files.length + " files");

      this.enterListMode( list );

    }
    else if( _message == "dir:error" ) {

      sys.log("Received 'dir:error' message. Error " + _data.reason );

      this.printError("dir", false, undefined, _data.reason );
      this.stop();
    }
    else if( _message == "listfs:completed" ) {

      sys.log("Received 'listfs:completed' message." );

      var list = ["", "Default Filesystem: \"" + _data.currentFs + "\"", "", "Devices:", "" ];

      //var fs = fsList[i];


      for( var i=0; i<_data.fs.length; i++) {

          var fs = _data.fs[i];
          var str = "\"" + fs.name + "\"";
          var deviceNumberLen = (fs.device + "").length;
          str = str + "                  ".substr( 0,(18-str.length-deviceNumberLen) ) + fs.device;


          list.push("     " + str );
      }

      list.push( "" );
      list.push( _data.fs.length + " Filesystem Devices Found");

      this.enterListMode( list );

    }
    else if( _message == "setfs:completed" ) {

      if( !this.isRunning() ) {
        if( _data.status == "ok" ) {
        }
        else {
          this.printError("file system", false, undefined, "Could not select file system" );
        }

      }
      else {
        if( _data.status != "ok" ) {

          this.printError("file system", false, undefined, "Could not select file system" );
          this.stop();
        }
      }
    }

    if( this.stopAfterMessage ) {
      this.stopAfterMessage = false;
      this.runFlag = false;
      this.HandleStopped( false );

    }

    if( !this.isRunning() && this.listFlag == false ) {
      this.printReady();
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

        var cxy = this.output.getCursorPos();

        var string = this.output.getLineFrom( this.inputStartInputPosX, cxy[1]);
        this.output.writeln("");

        this.handleLineInput( string, true );

      }
      else if( e.keyLabel == "Backspace" ||
              e.keyLabel == "Delete"  ) {
        var x = this.output.getCursorPos()[0];

        if( e.keyLabel == "Delete" ) {
              this.output.delete();
        }
        else {
            if( x > this.inputStartInputPosX ) {
                this.output.backspace();
            }
            else {
              this.output.delete();
            }
        }

      }
      else if( e.keyLabel == "ArrowLeft" && !e.ctrlKey) {
        var cx = this.output.getCursorPos();
        if( cx[0] > this.inputStartInputPosX ) {
          this.output.cursorMove("left");
        }
      }
      else if( e.keyLabel == "ArrowRight" && !e.ctrlKey) {
        this.output.cursorMove("right");
      }
      else if( e.keyLabel == "Home" && !e.ctrlKey ) {
        var xy = this.output.getCursorPos();

        this.output.setCursorPos( this.inputStartInputPosX, xy[1]);
      }
      else if( (e.keyLabel == "ArrowRight" && e.ctrlKey)) {
        this.output.jumpTo("text-end");
      }
      else if( e.keyLabel == "End" ) {
        this.output.jumpTo("text-end-all");
      }
      else if( (e.keyLabel == "ArrowLeft" && e.ctrlKey) ) {
        this.output.jumpTo("text-start");
        var xy = this.output.getCursorPos();
        if( xy[0]< this.inputStartInputPosX ) {
          this.output.setCursorPos( this.inputStartInputPosX, xy[1] );
        }
      }
      else {
        if( e.key != null ) {
          this.output.write( e.key );
        }
      }
    }
    else {
      this.editor.interactiveKeyHandler( e );
    }
  }

  toggleMenu()  {
    this.menuEnable = !this.menuEnable;

    if( this.menuEnable ) {
      this.sys.signalHideMenu( false );
    }
    else {
      this.sys.signalHideMenu( true );
    }
  }

  HandleStopped( startingProgram ) {

    this.clearWaiting();
    this.input.setInterActive( true);
    this.input.flush();
    if( !startingProgram && this.menuEnable ) {
      this.sys.signalHideMenu( false );
    }

    this.flagStatusChange();
  }

  importPGMHandler( content, filename ) {
    var pgm = this.textLinesToBas( content.split("\n") ).pgm;
    this.fileName = filename;

    this.program = pgm;
    this.sys.log( "imported program " + filename +" with " + content.length + " bytes ");
  }

  bootPGM( content, filename ) {
    try {
      var pgm = this.textLinesToBas( content.split("\n") ).pgm;
      this.fileName = filename;

      this.program = pgm;
      this.setProgram( pgm );

      this.sys.log( "imported program " + filename +" with " + content.length + " bytes ");
      return true;
    }
    catch ( e ) {
      var tmp = 1;

      var pgm = this.textLinesToBas( "" ).pgm;
      this.program = pgm;
      this.HandleStopped( false );
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
    this.printLine("");
    this.listFlagBakInteractive = this.input.getInterActive();
    this.input.setInterActive( false );
    this.flagStatusChange();
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
    this.HandleStopped( true );

    this.inputFlag = false;
    this.listFlag = false;

    this.flagStatusChange();

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
    this.HandleStopped( false );

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
      this.HandleStopped( false );
      this.inputFlag = pgmState.inputFlag;
      this.vars = pgmState.vars;
      this.functions = pgmState.functions;
      this.forContext = pgmState.forContext;
      this.runPointer = pgmState.runPointer;
      this.runPointer2 = pgmState.runPointer2;
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

  upperFirst( s ) {
    if( s ) {
      if ( s.length > 1 ) {
          return s.substr(0,1).toUpperCase() + s.substr( 1 );
      }
    }
    return s;
  }

  printError( s, supressLine, explicitline, detail ) {

    var line1 = ("?" + this.upperFirst( s ) + " error" + this.onLineStr());

    if( explicitline ) {
        line1 = ( ("?" + this.upperFirst( s ) + " error in " + explicitline ) );
    }
    if( supressLine ) {
        line1 = ( ("?" + this.upperFirst( s ) + " error") );
    }

    this.output.writeln(  line1 );
    if( detail ) {
      this.output.writeln(  ">> " + detail );
    }

  }

  printInfo( s ) {

    this.sys.log(  ( s + this.onLineStr()).toUpperCase() );

  }

  printHelp() {
    this.extendedcommands["_stat_help"]([]);
  }

  printLine( s ) {
    this.output.writeln(s);
    this.reverseOn = false;
  }


  print( s ) {
    this.output.writeln(s);
    this.reverseOn = false;
  }


//{ fg: 5, bg:1, border: 7 }
  colorReset( colors ) {
    this.output.setDefault( colors.fg, colors.bg );
    this.output.control( 18, colors.border );
    this.output.colorReset();
  }

  resetConsole() {
    var wh = this.output.getDimensions();

    //this.output.textArea(  wh[0], wh[1], -1, -1 );

    this.output.reset();
    //this.output.setPos(0,0);
  }

  clearScreen() {
    this.output.clear();
    this.output.setPos(0,0);
  }

  getMillis() {
    var millis=new Date().getTime() - this.nullTime;
    return millis;
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
    this.output.writel("Ready.");

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

  getProgramSize() {
    return this.program.length;
  }

  getProgramAsText() {
    var text = "";
    for (const l of this.program)
      {
        if( text != "") {
          text += "\n";
        }
        //text +=  this.prepareLineForExport( l[2].trim() );
        if( l[1][0].type == "control" && l[1][0].controlKW == "sub" ) {
            text += "\n";
        }
        text += l[2].trim();
      }
    return text;
  }

  prepareLineForExport( txt0 ) {
    var txt;
    txt = txt0.trim();
    var dst = "";

    for( var i=0; i<txt.length; i++) {
      var c = txt.charCodeAt( i );
      if( c<31 || c==92 || c>=126 ) {
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
        val = this.getMillis();
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
        if( this.scopes[0].vars[ p.data ] ) {
          val = this.scopes[0].vars[ p.data ];
        }
      }
    }
    else if( p.type=="array" ) {
      var varIntName = "@array_" + p.data;
      var arr = this.vars[ varIntName ];

      if( arr === undefined ) {
        if( this.scopes[0].vars[ varIntName ] ) {
          arr = this.scopes[0].vars[ varIntName ];
        }
        if( arr === undefined ) {
          throw "@no such array@Array '"+ varIntName+"' does not exist";
        }
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
      else if( p.op == "%" ) {
        val %= this.evalExpressionPart( p );
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
    var con = this.output;
    var p = this.program;

    this.inputFlag = false;


    var l = this.program[ this.runPointer ];
    var cmds = l[1];

    this.input.setInterActive( false);

    this.runPointer2++;

    if( this.runPointer2 >=  cmds.length ) {

      this.runPointer2 = 0;
      this.runPointer++;

      if( this.runPointer >=  p.length ) {

        this.runFlag = false;

        this.HandleStopped( false );

        this.printLine("");
        this.printReady();

      }

    }


  }

  cycle() {

    /*return values*/
    var END_W_ERROR = 0;
    var TERMINATE_PROGRAM = -1;
    var LINE_FINISHED = 10;
    var MIDLINE_INTERUPT = 20;
    var TERMINATE_W_JUMP = 30;
    var PAUSE_F_INPUT = 40;
    var WAIT_SPECIFIC_TIME = 50;

    var c = this.output;

    var cmdCount = this.cmdCountPerCycle;
    var lineNumber = -1;
    try {

      if( this.bitmap.isActive() ) {
        this.bitmap.triggerFlush();
      }
      if( this.output.isActive() && this.output.changeCount() > 0) {
        this.output.triggerFlush();
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
             this.flagStatusChange();
           }

        }
      }
      else {

        if(this.debugFlag) console.log("START CYCLE------------------------------" );

        var p = this.program;

        while (true) {


          if( this.waitForMessageFlag ) {
              break;
              //return this.statusChanged;
          }

          if(this.debugFlag) console.log("START CYCLE LOOP-------------" );
          var l = p[ this.runPointer ];
          lineNumber = l[0];

          if( l === undefined ) {
            var t=1;
          }
          var bf = this.runPointer2;
          if(this.debugFlag) console.log(" this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );
          if(this.debugFlag) console.log(" cmdCount = " + cmdCount);
          var rv = this.runCommands( l[1], cmdCount );

          if(! ( this.traceVars === undefined )) {
              for( var tvi=0; tvi<this.traceVars.length; tvi++) {
                var thisVar = this.traceVars[ tvi ];
                var thisValue = this.vars[ thisVar ];
                var oldValue = this.traceOldValues[ thisVar ];

                if( ! ( thisValue === undefined )) {
                  if( oldValue != thisValue ) {
                    this.traceList.push(
                      "TRC(" + lineNumber + ") " + thisVar + "=" + thisValue
                    );

                    this.traceOldValues[ thisVar ] = thisValue;
                  }

                }
              }
          }

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
            this.printReady();
            this.HandleStopped( false );
            if( rv[0] == END_W_ERROR ) {

              this.setVar("LINE", lineNumber );
              console.log("ERROR: ", e, " LINE ", this.retreiveRuntimeLine() );
              console.log("PARAMETER DUMP:", this.vars );
              console.log("FUNCTION DUMP:", this.functions );
            }
            if(this.debugFlag) console.log("CYCLE RETURN END");
            //return this.statusChanged;
            break;
          }
          else if( rv[0] == LINE_FINISHED ) {
            this.runPointer ++;
            this.runPointer2 = 0;
            if(this.debugFlag) console.log(" new this.runPointer = " + this.runPointer, " this.runPointer2 = " + this.runPointer2 );

            if( this.runPointer >=  p.length ) {
              if(this.debugFlag) console.log( "end program");

              this.setVar("LINE", lineNumber );

              if( !this.waitForMessageFlag ) {
                this.runFlag = false;
                this.HandleStopped( false );
                this.printReady();
              }
              else {
                this.stopAfterMessage = true;
              }
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
          else if( rv[0] == WAIT_SPECIFIC_TIME ) {

            this.runPointer2 = af;
            if(this.debugFlag) console.log("CYCLE PAUSE 4 SPECIFIC TIME" + this.runPointer + "," + this.runPointer2);
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

      sys.log("DEBUG: ", typeof e );

      this.setVar("LINE", lineNumber );


      if( this.erh.isError( e ) ) {
        var err = e;

        this.setVar("ERR", err.clazz );
        this.setVar("ERRDETAIL", err.detail  );

        this.printError( err.clazz, undefined, undefined, err.detail );
      }
      else if( this.erh.isSerializedError( e ) ) {
        var err = this.erh.fromSerializedError( e );

        this.setVar("ERR", err.clazz );
        this.setVar("ERRDETAIL", err.detail  );

        this.printError( err.clazz, undefined, undefined, err.detail );
      }
      else {
        var err = this.erh.fromSimpleExternalError( e, undefined, undefined );

        if( err ) {

            this.setVar("ERR", err.clazz );
            this.setVar("ERRDETAIL", err.detail  );
            this.printError( err.clazz, undefined, undefined, err.detail );
        }
        else {

            this.setVar("ERR", "unexpected" );
            this.setVar("ERRDETAIL", "unexpected"  );
            this.printError( "unexpected", undefined, undefined, e );
        }

      }

      this.printReady();
      this.runFlag = false;
      this.HandleStopped( false );

      sys.log("ERROR: ", e, " LINE ", this.retreiveRuntimeLine() );
      sys.log("PARAMETER DUMP:", this.vars );
      sys.log("FUNCTION DUMP:", this.functions );

    }

    var pi = this.procIf;

    var cstate = pi.STATE_CLI;

    if( this.isWaitingFlag  ) { cstate = pi.STATE_WAITING ;}
    else if( this.inputFlag  ) { cstate = pi.STATE_INPUT ;}
    else if( this.runFlag | this.listFlag ) { cstate = pi.STATE_RUNNING; }

    return [ this.statusChanged, cstate, this.waitingTime ];
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


  doInterruptReturn() {

    if( this.scope.name == "interrupt0" ) {
      this.interruptFlag0 = false; // TODO interrupt, take from scope which flag
    }
    else {
      this.interruptFlag1 = false; // TODO interrupt, take from scope which flag
    }

    this.runPointer = this.scope.data.runPointer;
    this.runPointer2 = this.scope.data.runPointer2;

    this.closeScope();

  }




  gosub( line0, runPointer2 ) {


    var pgm = this.program;
    var len=this.program.length;
    var retLine = null;
    var retCmd = null;

    var line = line0;
    if( (typeof line0).toLowerCase() == "string" ) {
      line = this.labels[line0];
      if( line == undefined ) {
        throw "@undef'd label";
      }
    }

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

    line = line0;
    if( (typeof line0).toLowerCase() == "string" ) {
      line = this.labels[line0];
      if( line == undefined ) {
        throw "@undef'd label";
      }
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
      if( this.runFlag ) {
        this.listFlag = false;
        this.input.setInterActive( this.listFlagBakInteractive );
      }
      else {
        var c = this.output;
        this.listFlag = false;
        this.HandleStopped( false );
        this.printLine( "" );
        this.printReady();
      }
    }
  }


  runStop() {
    if( this.runFlag ) {
      var c = this.output;
      this.runFlag = false;
      this.handlers.interrupt0 = undefined;
      this.handlers.interrupt1 = undefined;

      this.HandleStopped( false );

      console.log( "break in " + this.program[ this.runPointer ][0] );

      this.setVar( "LINE", this.program[ this.runPointer ][0] );
      this.setVar("ERR", "BREAK" );

      this.printLine("");
      this.printLine( "break in " + this.program[ this.runPointer ][0]);
      this.printReady();
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

  isReady() {
    return !this.runFlag && !this.listFlag && ! this.executeLineFlag;
  }


  getDataBlocks() {
    var list = [];

    var mapInfo = Object.entries( this.loadedData );
    for( var i=0; i<mapInfo.length; i++) {
      if( mapInfo[i][1].length > 0) {
        list.push( mapInfo[i][0] + ": " + mapInfo[i][1].length  );
      }

    }

    return list;

  }

  readData() {

    if( this.dataPointer >= this.data.length ) {
      return undefined;
    }

    var result = this.data[ this.dataPointer ];
    this.dataPointer++;

    return result;
  }


  getDataLength() {

    return this.data.length;

  }

  setData( label0 ) {
    var label = label0;
    if( ! label ) {
      label = "default";
    }

    this.data = this.loadedData[ label ];
    this.dataPointer = 0;

  }

  insertData( data, type, label0 ) {

    //this.loadedData = { default: [] };
    var label = label0;
    if( ! label ) {
      label = "default";
    }
    this.loadedLabel = label;
    this.dataPointer = 0;

    var arr = [];
    this.loadedData[label ] = arr;

    var typeParts = type.split(":");
    var typeData = typeParts[0].toUpperCase();
    var dataSyntax = typeParts[1].toUpperCase();

    this["parseSimpleData" + typeData + "_" + dataSyntax]( data, arr );

    this.data = arr;
  }


  parseSimpleDataI_CSV( data, toArr ) {
    var data2 = data.replaceAll(" ","").replaceAll("\t","").replaceAll("\r","").replaceAll("\n","");
    data2 = data2.split(",");
    for( var i=0; i<data2.length; i++) {
      toArr.push( data2[ i ] );
    }

  }


  parseSimpleDataS_CSV( data, toArr ) {
    var data2 = data.replaceAll(" ","").replaceAll("\t","").replaceAll("\r","").replaceAll("\n","");
    data2 = data2.split(",");
    for( var i=0; i<data2.length; i++) {
      toArr.push( data2[ i ] );
    }

  }

  parseSimpleDataS_LINES( data, toArr ) {
    var data2;
    data2 = data.split("\n");
    for( var i=0; i<data2.length; i++) {
      toArr.push( data2[ i ] );
    }

  }

  printChar( c  ) {
    this.output.write( c );
  }

  listCodeLine( rawLine ) {
    if( rawLine === undefined ) {
        this.printLine( "???" );
        return;
    }

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



      var nopadTokens = [];
      for( i = 0; i<tokens.length; i++) {
        if( tokens[i].type != "pad") {
          nopadTokens.push( tokens[ i ] );
        }
      }

      var foundGoto = false;
      var foundGotoParIndex = -1;

      for( i = 0; i<nopadTokens.length; i++) {

          if( i>1 ) {
            if( nopadTokens[i].type == "num" &&
                nopadTokens[i-1].type == "name" && nopadTokens[i-1].data == "THEN" ) {
              foundGoto = true;
              foundGotoParIndex = i;
            }
            else if( nopadTokens[i].type == "num" &&
                  nopadTokens[i-1].type == "name" &&
                  ( nopadTokens[i-1].data == "GOTO" || nopadTokens[i-1].data == "GOSUB" )) {
              foundGoto = true;
              foundGotoParIndex = i;
            }
        }

        if( nopadTokens[i].type == "num" && foundGoto &&  i == foundGotoParIndex ) {
          var newLine = renumbering[ "old_" + nopadTokens[i].data ];
          if( newLine == undefined ) { newLine = 99999;}
          nopadTokens[i].data =newLine;
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

  lineIsSub( line ) {
    console.log( line );
    if( line[1].length == 1 ) {
      if( ! ( line[1][0].controlKW === undefined) ) {
        if( line[1][0].controlKW.toUpperCase() == "SUB" ) {
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

    var method = "sub";

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
    else if( method  == "sub" ) {
      // non data
      for( var i=0; i<p.length; i++) {
          var line = p[ i ];
          var rem = this.lineIsSub( line );

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
    this.vars = {};
    this.functions = [];
    this.restoreDataPtr();
  }

  restoreDataPtr() {
    this.dataPointer = 0;
    this.data = this.loadedData[ "default" ];
  }

  normalizeData( dataRec ) {
    var data = dataRec.data;

    if( dataRec.type == "num" ) {
      if( (typeof data).toLowerCase() == "string" ) {
        data = parseInt( data );
      }
    }
    else {
      if( (typeof data).toLowerCase() == "number" ) {
        data = "" + data ;
      }
    }

    return data;
  }

  runPGM() {

    this.executeLineFlag = false;
    this.stopAfterMessage = false;

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
    this.input.flush();

    var c = this.output;
    var p = this.program;

    this.loadedData[ "default" ] = [];
    this.restoreDataPtr();

    this.gosubReturn = [];
    this.scopes = [];
    this.newScope( "global", {} );
    this.functions = [];
    this.handlers = {}
    this.labels = {};
    this.traceList = [];
    this.traceOldValues = {};

    var normalize = this.normalizeData;

    for( var i=0; i<p.length; i++) {

        var line = p[ i ];
        var commands = line[1];

        for( var j=0; j<commands.length; j++) {

          var command = commands[j];

          if( command.type  == "control" && command.controlKW == "data") {
            for( var k=0; k<command.params.length; k++) {
              this.loadedData[ "default" ].push( normalize( command.params[k] ) );
            }
          }
          else if( command.type  == "control" && command.controlKW == "on") {
            if( command.params[0] == "interrupt1") {
              this.handlers.interrupt1 = command.params[1];
              this.handlers.interrupt1ParamIsLabel = command.label;
            }
            else if( command.params[0] == "interrupt0") {
              this.handlers.interrupt0 = command.params[1];
              this.handlers.interrupt0ParamIsLabel = command.label;
            }
          }
          else if( command.type  == "control" && command.controlKW == "sub") {
            var label = command.label;
            this.labels[ label ] = parseInt(line[0]);
          }
        }
    }

    if( this.debugFlag ) {
      console.log("data dump:",this.data);
    }


    if( this.program.length > 0) {
      this.runFlag = true;
      this.inputFlag = false;
      this.waitingTime = 0;
      this.isWaitingFlag = false;
      this.runPointer = 0;
      this.runPointer2 = 0;
      this.waitForMessageFlag = false;
      this.interruptFlag0 = false;
      this.interruptFlag1 = false;

    }
    else {
      this.runFlag = false;
      this.inputFlag = false;
      this.waitingTime = 0;
      this.isWaitingFlag = false;
      this.runPointer = 0;
      this.runPointer2 = 0;
      this.waitForMessageFlag = false;
      this.interruptFlag0 = false;
      this.interruptFlag1 = false;
      this.input.setInterActive( true);
    }

    this.flagStatusChange();
  }

  getVars() {
    return this.vars;
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
    var WAIT_SPECIFIC_TIME = 50;

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


      var cmd=cmds[i];

      var l=this.program[this.runPointer];
      if( l ) {
        if(parseInt(l[0]) == 3155 ) {
          console.log("bump");
        }
      }

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

          if( onCommand != "interrupt0"  && onCommand != "interrupt1" ) {
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
          }

          //if not jumping, do nothing
        }
        else if( cn == "return" ) {

          if( this.interruptFlag0 || this.interruptFlag1) {

            this.doInterruptReturn();

          }
          else {
            this.doReturn();
          }

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
        else if( cn == "sub" ) {
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
            var varType0 = cmd.params[j].parts[0].type;

            if( varType0 == "array" ) {

              var varType = "num";
              if( varName.indexOf("$") > -1) {
                varType = "str";
              }

              values.push( { type: "var", value: varName, varType: varType0 + ":" + varType } );


            }
            else {
              var varType = "num";
              if( varName.indexOf("$") > -1) {
                varType = "str";
              }

              values.push( { type: "var", value: varName, varType: varType } );

            }

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

              this.inputCommand  = false;

              mycommands[ "_stat_" + cmd.statementName.toLowerCase()]( values );

              if( this.inputFlag ) {  //}|| this.inputCommand ) {
                return [PAUSE_F_INPUT,i+1,cnt+1];
              }
              else if ( this.isWaitingFlag )  {
                return [WAIT_SPECIFIC_TIME,i+1,cnt+1];
              }
          }

        }
        catch ( e ) {
          console.log(e);

          if( this.erh.isSerializedError( e ) ) {
            var err = this.erh.fromSerializedError( e );
            this.printError( err.clazz, false, false, err.detail );
          }
          else if( this.erh.isError( e ) ) {
            var err = e;
            this.printError( err.clazz, false, false, err.detail );
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
            this.printError("bad subscript",false, false, "No such Array");
            //printError( s, supressLine, explicitline, detail ) {
            return [END_W_ERROR,i+1,cnt];
          }

          var arr = this.vars[ varIntName ];
          if( cmd.indices.length != arr.getIndexCount() ) {
            this.printError("bad subscript",false, false, "Wrong dimensions");
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

  newScope( name, data ) {
    var scope = { name: name, vars: {}, data: data };
    this.scopes.push( scope );
    this.vars = scope.vars;
    this.scope = scope;
  }

  closeScope() {
    this.scopes.pop();
    this.vars = this.scopes[ this.scopes.length - 1 ].vars;
  }


  getArray( a ) {
   return this.vars[  "@array_" + a ];
  }

  setVar( a, b ) {
    this.vars[ a ] = b;
  }

  getTraceList() {
    if( this.traceList === undefined ) {
      return [];
    }

    return this.traceList;
  }

  setTraceVar( v ) {
    if( this.traceVars === undefined ) {
        this.traceVars = [];
    }
    this.traceVars.push( v.toUpperCase() );

  }

  resetTraceVar( v ) {
    this.traceVars = undefined;
  }


  old( ) {
    this.program = this.oldProgram;
  }

  new( ) {
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


  insertPgmLine( linenr, commands, handlers, raw ) {

    this.insertPgmLineLocal( linenr, commands, handlers, raw, this.program );
  }

  insertPgmLineLocal( linenr, commands, handlers, raw, myProgram ) {

    for( var i=0; i<myProgram.length; i++) {
      var pl=myProgram[i];
      if( pl[0] == linenr ) {
        myProgram[i] = [linenr, commands, raw.trim() ];
        return;
      }
    }

    myProgram.push( [linenr, commands, raw.trim(), handlers ]);

    var sortF = function compare( a, b ) {
      return a[0] - b[0];
    }

    myProgram.sort( sortF );

  }

  textLinesToBas( lines ) {

    var myProgram = [];
    var exception = undefined;

    if( this.debugFlag ) {
      console.log( "textLinesToBas" );
    }
    for( var i = 0; i<lines.length; i++ ) {

      var line = this.prepareLineForImport( lines[ i ] );
      var p = new Parser( this.commands, this.extendedcommands );
      p.init();

      var l = null;

      try {
          l = p.parseLine( line );
      }
      catch ( e ) {
        if( exception === undefined ) {
            exception = e;
        }

        try {
          l = p.parseErrorLine( line );
        }
        catch ( e ) {
            this.printError( "unexpected text (at "+i+")", true );
            console.log("Illegal Line: ", line );
        }
      }

      if( l == null ) {
        continue;
      }
      if( l.lineNumber != -1 ) {
        if( l.commands.length > 0) {
          this.insertPgmLineLocal( l.lineNumber, l.commands, l.handlers, l.raw,  myProgram);
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
    return { pgm: myProgram, exception: exception };
  }

  printReady() {
    this.printLine("Ready.");
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
    this.inputStartInputPosX = this.output.getCursorPos()[0];

    this.flagStatusChange();

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
      this.printReady();
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
        this.insertPgmLine( l.lineNumber, l.commands, l.handlers, l.raw);
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

      if( ! this.runFlag && ! this.listFlag && !this.waitForMessageFlag) {
        this.printReady();
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
