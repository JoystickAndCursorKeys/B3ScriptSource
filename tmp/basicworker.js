//src/sys/modules/basic/worker/sys.js
//src/sys/modules/basic/worker/basicarray.js
//src/sys/modules/basic/worker/basicerrorhandler.js
//src/sys/modules/basic/worker/coding/codingeditor.js
//src/sys/modules/basic/worker/basicruntime.js
//src/sys/modules/basic/worker/extendedcommands.js
//src/sys/modules/basic/worker/pgmmanager.js
//src/sys/modules/basic/worker/basiccommands.js
//src/sys/modules/basic/worker/basicparser.js
//src/sys/modules/basic/worker/basictokenizer.js
//src/sys/modules/basic/worker/input.js
//src/sys/modules/basic/worker/processes.js
//src/sys/modules/basic/worker/commandhelp.js
//src/sys/modules/basic/worker/../../rwbuffers/worker/textarea.js
//src/sys/modules/basic/worker/../../rwbuffers/worker/playfields.js
//src/sys/modules/basic/worker/../../rwbuffers/worker/bitmap.js
//src/sys/modules/basic/worker/../../rwbuffers/worker/audio.js
//src/sys/modules/basic/worker/workerbootstrap_static.js
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

  sys.post = post;

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

  sys.load = function( rt, path, device ) {

      post("load", { processId: rt.processId, path:path, device: device } );

  }

  sys.loaddata = function( rt, path, type, label ) {

      post("loaddata", { processId: rt.processId, path:path, type: type, label: label } );

  }

  sys.save = function( rt, path, device, data ) {

      post("save", { processId: rt.processId, path:path, device: device , data: data } );

  }

  sys.delete = function( rt, path, device ) {

      post("delete", { processId: rt.processId, path:path, device: device  } );

  }

  sys.dir = function( rt, path, device ) {

      post("dir", { processId: rt.processId, path:path, device: device } );

  }


  sys.setcfg = function( cfg ) {
      this.cfg = cfg;
  }

  sys.listfs = function( rt  ) {

      post("listfs", { processId: rt.processId } );

  }

  sys.postsynchrequest = function( procId  ) {

    post("synch", { procId: procId } );

  }

  sys.poststatus = function( procId, status  ) {

      post("status", { procId: procId, status: status } );

  }

  sys.setfs = function( rt, path  ) {

      this.fs = path;
      post("setfs", { path: path, processId: rt.processId } );

  }

  sys.setDisplayMode = function( rt, m ){
    post( "displaymode", { processId: rt.processId, m:m } );
  }

  sys.blinkMode = function( m ){
    post( "blinkMode", { m:m } );
  }

  sys.html = {}

  sys.html.executeFunction = function() {

      var args = Array.prototype.slice.call(arguments);
      post( "htmldofun",args );

  }

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

  sys.export = function( code, destination ) {
    post( "export", { code: code, destination: destination } );
  }

  sys.signalHideMenu = function( flag ) {
    post( "signalHideMenu", { hide: flag } );
  }

}

function start_sys() {
  sys.log("Starting wsys");

  sys.processes = new processes( sys );
  sys.input = new Input( sys );
  sys.out = new TextArea( sys );
  sys.bout = new BitMap( sys );
  sys.pfields = new Playfields( sys );
  sys.audio = new Audio( sys );
  sys.rootProcId = -1;

  /* APPLICATION */

  /* HANDLERS */
  self.onmessage = function( obj ) {

      try {
        var data = obj.data;

        if( data.type == "keydown" ) {

          sys.input.inputKeyHandler( data );
          sys.audio.flagUserInput();

        }
        else if( data.type == "message") {
          var id = data.processId;
          var runtime = sys.processes.get( id );

          runtime.receiveMessage( data.message, data.messageObject );

        }
        else if( data.type == "synchreply" ) {

          var id = sys.processes.synch( data.processId );

        }
        else if( data.type == "interrupt") {
          var runtime = sys.processes.get( sys.rootProcId );

          runtime.interrupt( 0, data.sub, data.data );

          //TODO, index of runtime.
        }
        else if( data.type == "loadpgm" ) {

          sys.log("Received 'loadpgm' message. Loaded " + data.pgmData.length + " bytes.." );

          var editor = new Editor( sys );
          var runtime = new BasicRuntime( sys, editor );
          sys.log("Context created, parsing program");

          var ok = runtime.bootPGM( data.pgmData, data.QPath  );
          sys.log("Parsed program => RUN");

          if( ok ) {
            runtime.runPGM();
            sys.log("Program started...");
          }
          else {
            runtime.stop();
          }

          var id = sys.processes.register( runtime );
          sys.log("Basic program registered as process " + id + ".");

          if( sys.rootProcId == -1 ) {
            sys.rootProcId = id;
          }
          pgmman.addRuntime( runtime );


        }
        else if( data.type == "inittxtarea" ) {

          sys.log( "init with: " + JSON.stringify( data ) )

          sys.out.attach( data.w, data.h );


        }
        else if( data.type == "initcolors" ) {

          sys.log( "init colors with: " + JSON.stringify( data ) )

          sys.out.setDefault( data.colors.fg, data.colors.bg );
          sys.out.control( 18, data.colors.border );
          sys.out.reset();

        }
        else if( data.type == "systeminfo" ) {

          sys.log( "systeminfo with: " + JSON.stringify( data ).substr(0,50) + "..." );
          sys.screenModes = data.modes;
          sys.displayMode = data.mode;
          sys.windowWidth = data.windowWidth;
          sys.windowHeight = data.windowHeight;

        }
        else if( data.type == "setcfg" ) {

          sys.log( "init with: " + JSON.stringify( data ) );

          sys.setcfg( data.cfg );

        }
        else if( data.type == "initbitmap" ) {

          sys.log( "init with: " + JSON.stringify( data ) );
          sys.bout.attach( data.w, data.h );

        }
        else if( data.type == "clipboardCopy" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          var code = runtime.getProgramAsText();

          sys.export( code, "clipboard" );

          if( runtime.isReady() ) {
            runtime.printLine("(!)Copied program to clipboard");
            runtime.printReady();
          }
          sys.log( "clipboard copy" )

        }
        else if( data.type == "export" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          var code = runtime.getProgramAsText();

          sys.export( code, "disk" );

          if( runtime.isReady() ) {
            runtime.printLine("(!)Export program to disk");
            runtime.printReady();
          }
          sys.log( "Export to disk" )

        }
        else if( data.type == "showList" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          var list = data.list;

          runtime.enterListMode(list);

        }
        else if( data.type == "list" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          var list = ["LIST",""];
          for (const l of runtime.program)
            {

              var lineNr = parseInt(l[0]);

              list.push( l[2] );
            }

          runtime.enterListMode(list);

        }
        else if( data.type == "renumber" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          runtime.renumberProgram( 10,10 );

          var list = ["RENUMBER"];
          runtime.enterListMode(list);

        }
        else if( data.type == "new" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( !runtime.isRunning() ) {
            runtime.new();

            var output = ["NEW", ""];
            runtime.enterListMode( output );
          }
        }
        else if( data.type == "pastpgm" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( !runtime.isRunning() ) {
            runtime.new();
            runtime.resetConsole();

            var result = runtime.textLinesToBas( data.data.split("\n") );
            var pgm = result.pgm;
            runtime.setProgram( pgm );

            if( result.exception ) {
              throw result.exception;
            }

          }
        }
        else if( data.type == "vars" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          var varList = runtime.getFullVarList();
          varList.unshift( "" );
          varList.unshift( "VARS" );

          runtime.enterListMode( varList );

        }
        else if( data.type == "datablocks" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          var list = runtime.getDataBlocks();
          var blockList = ["DATABLOCKS",""];

          for( var i=0;i<list.length;i++) {
            blockList.push( list[i] );
          }

          runtime.enterListMode( blockList );

        }
        else if( data.type == "stopMenu" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isRunning() ) {
            runtime.stop();
            runtime.toggleMenu();
          }
          else {
            runtime.toggleMenu();
          }

        }
        else if( data.type == "toggleMenu" ) {

          var runtime = sys.processes.get( sys.rootProcId );
          runtime.toggleMenu();

        }
        else if( data.type == "help" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isReady() ) {
            runtime.clearScreen();
            runtime.printLine("HELP");
            runtime.printHelp();
            runtime.printLine("");
            runtime.printLine("For more help type:");
            runtime.printLine("HELP <option>");
            runtime.printLine("");
            runtime.printReady();
          }

        }
        else if( data.type == "run" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isReady() ) {
            runtime.clearScreen();
            runtime.printLine("RUN");
            runtime.runPGM();
          }
        }
        else if( data.type == "stop" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isRunning() ) {
            runtime.stop();
          }
        }
        else if( data.type == "resetConsole" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isReady() ) {
            runtime.resetConsole();
          }
        }
        else if( data.type == "colorReset" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isReady() ) {
            runtime.colorReset( data.colors );
          }
        }
        else if( data.type == "clearScreen" ) {

          var runtime = sys.processes.get( sys.rootProcId );

          if( runtime.isReady() ) {
            runtime.clearScreen();
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
          sys.out.writeln( "?" + e.clazz + " error at " + e.lineNr );
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
      throw "BasicArray:00:index dimension mismatch:For array " + this.name;
    }
    for( var i=0; i<indices.length; i++) {
      if ( indices[i] > this.indices[ i ]) {
        var detail = "\"" + this.name + "[" + indices[i] + "]"+"\" does not exist";
        if( indices.length > 1) {
          detail = "\"" + this.name + "\" with index " + indices[i] + " does not exist";
          detail += " for index dimension " + i;
        }
        throw "BasicArray:01:index out of bounds:" + detail;
      }
      else if ( indices[i] < 0) {
        throw "BasicArray:02:index smaller then zero:For array " + this.name;
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


  fromSimpleExternalError( s, context, lineNr0 ) {

    var lineNr = lineNr0;
    if( lineNr === undefined ) {
      lineNr = -1;
    }

    var parts = s.split(":");
    if( !parts.length == 3) {
      return undefined;
    }

    var err = this.newError( parts[2], parts[3], context, lineNr );

    err.extCode0 = parts[0];
    err.extCode1 = parts[1];

    return err;

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

// ## coding/codingeditor.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/coding/codingeditor.js
//  BY packworkers.js -- src/sys/modules/basic/worker/coding/codingeditor.js

class Editor {

  constructor( sys ) {
    this.sys = sys;
    this.output = sys.out;
    this.keyMode = "insert";

    //this.lineMarkers = [ 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ];
  }


  addRunTime( rt ) {
    this.runTime = rt;
  }

  keyHandlerForCLE( e ) {

      if( e.keyLabel == "Enter"  && !e.shiftKey ) {
        var command = sys.out.getCurrentLine();
        this.output.writeln("");

        this.runTime.executeInteractiveLine( command );

      }
      else if( e.keyLabel == "Enter" && e.shiftKey ) {

        this.output.ScrollDownByCurrentLine();

      }
      else if( e.keyLabel == "Backspace" ||
              e.keyLabel == "Delete"  ) {

        if( e.keyLabel == "Delete" ) {
              this.output.delete();
        }
        else {
            this.output.backspace();
        }

      }
      else if( e.keyLabel == "ArrowUp" && !e.ctrlKey) {
        this.output.cursorMove("up");
      }
      else if( e.keyLabel == "ArrowDown" && !e.ctrlKey) {
        this.output.cursorMove("down");
      }
      else if( e.keyLabel == "ArrowUp" && e.ctrlKey ) {
        this.output.cursorMove("up");
        this.output.cursorMove("up");
        this.output.cursorMove("up");
        this.output.cursorMove("up");
      }
      else if( e.keyLabel == "ArrowDown" && e.ctrlKey ) {
        this.output.cursorMove("down");
        this.output.cursorMove("down");
        this.output.cursorMove("down");
        this.output.cursorMove("down");
      }
      else if( e.keyLabel == "ArrowLeft" && !e.ctrlKey ) {
        this.output.cursorMove("left");
      }
      else if( e.keyLabel == "ArrowRight" && !e.ctrlKey) {
        this.output.cursorMove("right");
      }
      else if( (e.keyLabel == "ArrowRight" && e.ctrlKey) ) {
        this.output.jumpTo("text-end");
      }
      else if( (e.keyLabel == "ArrowLeft" && e.ctrlKey) ) {
        this.output.jumpTo("text-start");
      }
      else if( e.keyLabel == "Home" && !e.ctrlKey && !e.shiftKey ) {
        this.output.jumpTo("line-start");
      }
      else if( e.keyLabel == "Home" && e.shiftKey && !e.ctrlKey ) {
        this.output.clear();
      }
      else if( e.keyLabel == "End" && !e.ctrlKey ) {
        this.output.jumpTo("line-end");
      }
      else if( e.keyLabel == "Home" && e.ctrlKey && !e.shiftKey ) {
        this.output.jumpTo("home");
      }
      else if( e.keyLabel == "End" && e.ctrlKey ) {
        this.output.jumpTo("end");
      }
      else if( e.keyLabel == "Tab" ) {
        if( this.keyMode == "insert") {
          this.output.insert(  "        " );
        }
        else {
          this.output.write(  "        " );
        }

      }
      else if( e.keyLabel == "Insert" ) {

        if( this.keyMode == "insert") {
          this.keyMode = "overwrite";
        }
        else {
          this.keyMode = "insert";
        }
        this.output.setCursorMode( this.keyMode )
      }
      else {
        if( e.key != null ) {
          if( this.keyMode == "insert") {
            this.output.insert( e.key );
          }
          else {
            this.output.write( e.key );
          }
        }
      }

  }


  interactiveKeyHandler( e ) {
    this.keyHandlerForCLE( e );
  }
}

//--EOC 

// ## basicruntime.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/basicruntime.js
//  BY packworkers.js -- src/sys/modules/basic/worker/basicruntime.js

class BasicRuntime {

  constructor( sys, editor ) {

    this.debugFlag = false;
    this.sys = sys;
    this.editor = editor;
    this.editor.addRunTime( this );
    this.listSpeed = 15;

    this.output = sys.out;
    this.bitmap = sys.bout;
    this.playfields = sys.pfields;    
    this.input = sys.input;
    this.audio = sys.audio;
    this.input.setHandler( this );
    this.input.setInterActive( false);
    this.html = sys.html;
    this.menuEnable = false;

    this.program = [];
    this.runFlag = false;
    this.isWaitingFlag = false;
    this.isSynchingFlag = false;
    this.waitingTime = 0;
    this.immediate = 0; 
    this.printWaitSynchCounter= 0;

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


  setImmediate( immediate ) {
    this.immediate = immediate;
    if( this.immediate == 0 ) {
      this.printWaitSynchCounter = 0;
    }

    this.output.setPokeFlush( immediate != 0 );
  }


  synchPrint() {
    if( this.immediate == 0) {
      this.printWaitSynchCounter++;
      if( this.printWaitSynchCounter > 100 ) {
        this.enableSynching(); 
        this.printWaitSynchCounter = 0;          
      }
    }
  }

  printNewLine() {
    this.output.nl();
    if( this.immediate == 0) {
      this.enableSynching(); 
      this.printWaitSynchCounter = 0;
    }
  }

  enableSynching( ) {  
    this.isSynchingFlag = true;
    this.synchingTime0=new Date().getTime();
  }

  clearSynching() {  
    this.isSynchingFlag = false;
    this.synchingTime= ( new Date().getTime() ) - this.synchingTime0;
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

    if( _message.startsWith( "displaymode:" )) {
        this.output.reInit( _data.textW, _data.textH );
        this.bitmap.reInit( _data.bitmapW, _data.bitmapH );
        //this.playfields.reInit( _data.playfields );
        this.sys.displayMode = _data.mode;    
        this.playfields.enable( _data.pfEnabled ); 
        this.playfields.set( _data.playfields ); 
        

    }
    else if( _message.startsWith( "pfinit:current:" )) {
        /*
            Reinit current playfield
            Other ones are only stored in webworker

        */
        
        this.output.set( _data.textW, _data.textH, _data.cells );
        this.playfields.set( _data.playfields );

    }
    else if( _message.startsWith( "pfinit:other:" )) {
        
        this.playfields.set( _data.playfields );
    
    }
    else if( _message.startsWith( "pfselect:" )) {
        
        this.output.set( _data.textW, _data.textH, _data.cells );
    
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
      if(p.data.startsWith("STI")) {
        val = this.synchingTime;
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
    var WAIT_SYNCH = 60;

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
          else if( rv[0] == WAIT_SYNCH ) {

            this.runPointer2 = af;
            if(this.debugFlag) console.log("CYCLE PAUSE 4 SYNCH" + this.runPointer + "," + this.runPointer2);
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
    else if( this.isSynchingFlag  ) { cstate = pi.STATE_SYNCHING ;  sys.log("RT:Synch" );}
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
      this.isSynchingFlag = false;
      this.runPointer = 0;
      this.runPointer2 = 0;
      this.waitForMessageFlag = false;
      this.interruptFlag0 = false;
      this.interruptFlag1 = false;
      this.setImmediate( 0 );

    }
    else {
      this.runFlag = false;
      this.inputFlag = false;
      this.waitingTime = 0;
      this.isWaitingFlag = false;
      this.isSynchingFlag = false;
      this.runPointer = 0;
      this.runPointer2 = 0;
      this.waitForMessageFlag = false;
      this.interruptFlag0 = false;
      this.interruptFlag1 = false;
      this.setImmediate( 0 );
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
    var WAIT_SYNCH = 60;

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
              else if ( this.isSynchingFlag )  {
                return [WAIT_SYNCH,i+1,cnt+1];
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

//--EOC 

// ## extendedcommands.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/extendedcommands.js
//  BY packworkers.js -- src/sys/modules/basic/worker/extendedcommands.js

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
      return  "playfield:(re)Initialize of playfield buffer: <pfIndex>, <Cols>, <Rows>"; 
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

  _stat_info_playfield() { return "playfield:Select current playfield:<Nr> ; 0 to 3"; }
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
      return  "playfield:Set scroll pos of playfield view: <pfIndex>, <sX>, <sY>"; 
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
      return  "playfield:Initialize size of playfield view: <pfIndex>, <X>, <Y>, <W>, <H>"; 
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
      return  "playfield:Enable  a playfield to be visible: <pfIndex>, <OnOfFlag>"; 
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

  _stat_info_rsynch() { return "program:Synch with the renderer thread"; }
  _stat_rsynch( pars ) {
    //sys.log( "CMDS.Synch" );
    this.runtime.enableSynching();
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


  _stat_info_immediate() { return "program:Set flag to flush the render pipeline after each print or poke:<RenderImmediateFlag>"; }
  _stat_immediate( pars ) {

    var row = -1, col = -1;

    if( pars.length != 1) {
      this.erh.throwError( "parameters", "expected 1 parameters, not " + pars.length );
      return;
    }

    this.runtime.setImmediate( pars[0].value );
  }


  _stat_info_print() { return "print:Print text or values to the console:<Value>[;<Value>][;]"; }
  _stat_print( pars ) {

    var runtime = this.runtime;
    var con= this.output;

    if( pars.length == 0 ) {

      this.runtime.printNewLine();      
      return;
    }
    else if( pars.length == 1 ) {
      if( pars[0].parts.length == 0 ) {
        this.runtime.printNewLine();  
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
      if( newLine ) { 
        this.runtime.printNewLine();  
        return;
      }
      this.runtime.synchPrint();  

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

	  this.CTRL_KW = ["IF","THEN","GOTO","AND", "NOT", "OR",  "GOSUB", "RETURN", "FOR", "TO", "NEXT", "STEP", "DATA", "REM", "GOSUB", "DIM", "END", "LET", "STOP", "DEF", "FN", "ON", "SUB", "INTERRUPT0", "INTERRUPT1" ];
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
					this.throwError( context, "Expected ',' or ')', got '" + token.data + "'");
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
			this.throwError( context, "parsing subexpression, expected \"bracket\", not '" + token.data + "'");
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
      //str = str + "'" + token.type + "/" + token.data + "'";
      str = str + "'" + token.data + "'";
    }

    return str;
  }

  endTokensToString( endTokenArray )  {
    var str = "";

    for( var et=0; et<endTokenArray.length; et++) {
      var endToken = endTokenArray[et];

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
        this.throwError( context, "Empty simple expression end expected");
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
					this.throwError( context, "Expected \"number\", \"string\", \"symbol\" or \"bracket\", not " + token.data);
				}
        op = null;
			}
			else {

				if( token.type == "op" || token.type == "comp" || token.type == "eq" || token.type == "bop" ) {
					op = token.data;
				}
				else {
					this.throwError( context, "Expected \"operator\" or one of ("+
          this.endTokensToString(endTokens)+
          "), not '" + token.data + "'");
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
    newParts = this.groupParts( newParts, "+" );
    newParts = this.groupParts( newParts, "-" );

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

  parseControlStructure(  context, preTokens, commands, command, handlers, nameToken, token0  ) {

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
          this.throwError( context, "Unexpected data after 'LET': '" + token.data + "'" );
        }

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
          this.throwError( context, "GOTO/GOSUB expects linenumber or label", "undef'd statement");
        }

        if( token.type != "num") {
          //this.throwError( context, "GOTO/GOSUB expects number", "undef'd statement");

          if( token.type != "name") {
              this.throwError( context, "GOTO/GOSUB expects linenumber or label", "undef'd statement");
          }

          var label = token.data;

          token = tokens.shift();
          if( token !== undefined ) {
            if( token.type != "cmdsep") {
              this.throwError( context, "Expected \"command separator\", instead of '"+token.data+"'");
            }
          }

          command.params=[];
          command.params[0] = label;
          command.label = true;
          commands.push( command );
          return;

        }
        num = parseInt(token.data);
        token = tokens.shift();
        if( token !== undefined ) {
          if( token.type != "cmdsep") {
            this.throwError( context, "Expected \"command separator\", instead of '"+token.data+"'");
          }
        }

        command.params=[];
        command.params[0] = num;
        command.label = false;
        commands.push( command );

      }
      else if( controlToken == "ON" ) {
        var nums = [];
        var onInterrupt = false;

        endTokens = [];
        endTokens.push( { type: "name", data: "GOTO" });
        endTokens.push( { type: "name", data: "GOSUB" });

        token = tokens.shift();
        var onExpr = null;

        if( token.type == "name" && (token.data == "INTERRUPT0" || token.data == "INTERRUPT1")) {
          onInterrupt = true;
          onExpr = {
            type: "control",
            data: token.data
          }
        }
        else {
          tokens.unshift( token );
          onExpr = this.parseBoolExpression( context, endTokens );
        }

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "ON expects GOTO/GOSUB");
        }

        if( !onInterrupt ) {
          if( !( token.data == "GOTO" || token.data == "GOSUB" )) {
            this.throwError( context, "ON expects GOTO/GOSUB");
          }
        }
        else {
          if( !( token.data == "GOTO" )) {
            this.throwError( context, "ON INTERRUPT expects GOTO");
          }
        }

        var onType = token.data;

        token = tokens.shift();

        var labelFlag = false;
        var label = "";
        var num0;

        if( token.type != "num") {

            if( token.type != "name") {
                this.throwError( context, "GOTO/GOSUB expects linenumber or label", "undef'd statement");
            }

            labelFlag = true;
            label = token.data;

        }
        else {
          num0  = parseInt(token.data);
        }

        nums.push( num0 );

        if( !onInterrupt ) {
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

          if( nums.length > 1 ) {
            this.throwError( context, "ON INTERUPT GOTO expects only a single line number");
          }

          command.params=[];
          command.params[0] = onType.toLowerCase();
          command.params[1] = onExpr;
          command.params[2] = nums;
          commands.push( command );
        }
        else {

          command.params=[];
          command.params[0] = onExpr.data.toLowerCase();
          if ( labelFlag ) {
              command.params[1] = label;
          }
          else {
              command.params[1] = num0;
          }
          command.label = labelFlag;

          commands.push( command );

        }

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
              throw "FOR: unexpected token '" + token.data +"'";
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
            throw "Next expected variable, not '" +token.data+ "'";
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
            throw "Expected comma, found '" + token.data + "'";
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

        //var block = this.parseLineCommands( context );
        var result = this.parseLineCommands( context );
        var block = result.commands;

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
              throw "DATA: expected data";
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
      else if( controlToken == "SUB") {

        var label = "";
        token = tokens.shift();
        if( token == null ) { throw "SUB expected label"; }

        if( token.type != "name" ) {
          throw "SUB expected label not '" +token.data+ "'";
        }

        label = token.data.toUpperCase();

        token = tokens.shift();
        if( token != null ) { throw "SUB unexpected data after label"; }

        command.label = label;
        commands.push( command );

      }
      else if( controlToken == "REM" ) {

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
            this.throwError( context, "Unexpected characters in statement call: '" + token.data +"'");
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
    var handlers = {};

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
				if( token.type != "trash" ) {
          this.throwError( context, "Unexpected token, expected symbolname, got '" + oken.data +"'") ;
        }
        else {
          this.throwError( context, "Unexpected character, expected \"symbolname\", got " + token.detail ) ;
        }
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

        this.parseControlStructure( context, preTokens, commands, command, handlers, nameToken, token );

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
            this.throwError( context, "no such command: " + nameToken );
          }
          this.parseStatementCall( context, preTokens, commands, command, nameToken, token );

      }

		}

    var result = {
        commands: commands,
        handlers: handlers
      };

    return result;
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




  parseErrorLine( line ) {

    var lineRecord = {
      lineNumber: -1,
      commands: []
    };

    var errContext, detail, lineNr=-1;

    errContext="tokenizer";
    detail="init";
		var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );

    detail="parsing tokens";
    var tokens = toker.tokenize();
    if( this.debugFlag ) {
      console.log("Tokens after tokenizer");
    }
    this.logTokens( tokens );

    detail="internal";
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
      var lineRest = line.substr( lineNr.length );
      return this.parseLine( lineNr + " REM[ERROR] " + lineRest  );
    }
    else {
      throw "Expected line number, when reparsing line with error";
    }

  }

  parseLine( line ) {

    var lineRecord = {
      lineNumber: -1,
      commands: []
    };

    var errContext, detail, lineNr=-1;
    try {
      errContext="tokenizer";
      detail="init";
  		var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );

      detail="parsing tokens";
      var tokens = toker.tokenize();
      if( this.debugFlag ) {
        console.log("Tokens after tokenizer");
      }
      this.logTokens( tokens );

      detail="internal";
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

      errContext = "parser";
      detail="parsing commands";
      var result = this.parseLineCommands( context );
      var commands = result.commands;
      lineRecord.commands = commands;
      lineRecord.raw = line;
      lineRecord.handlers = result.handlers;
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
      this.throwError( null, errContext + " error (" +e+ ") while " + detail );
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
			this.greedy = false;
	}

	isOpChar( ctx ) {

		var rv = ctx.c.match("[+]|[-]|[*]|[/]|[\\%]|[\\^]|[;]") != null;

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

		if( ctx.c== "%" ) {
				rv = false;
				if( ctx.prev != null ) {
					var varNameChar = ctx.prev.match("[a-zA-Z0-9]") != null;
					if( varNameChar ) {
						ctx.endFound = true;
						rv = true;
					}
				}
		}


		if( ctx.c=="$" ) {
			ctx.endFound = true;
		}

		if( this.greedy ) {
			if( this.keywords.indexOf( ctx.seq.toUpperCase() ) >-1 ) {
				ctx.endFound = true;
			}
			else if( ! (ctx.seq === undefined )) {
				var trappedKW = false;
				var trapped = null;
				for( var i=0; i<this.keywords.length; i++) {
					var kw = this.keywords[i];
					if( ctx.seq.toUpperCase().indexOf( kw ) > 0 )  {
						trappedKW = true;
						trapped = kw;
						return [rv, kw.length ];
					}
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

						if( tok.type == "name") {
							tok.data = tok.data.toUpperCase();
						}

						if( tok.type == "trash") {
							tok.detail = "'" + tok.data + "' (ASCII-code=" + tok.data.charCodeAt(0) + ")";
						}

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

  constructor( sys ) {
    this.keyPress = [];
    this.interactive = false;
    this.sys = sys;
  }

  setHandler( hc ) {
    this.handlerClazz = hc;
  }

  setInterActive( flag ) {

    this.interactive = flag;
    this.sys.blinkMode( flag  );

  }


  getInterActive() {

    return this.interactive;

  }


  flush() {
    this.keyPress = [];
  }

  inputKeyHandler( e )  {

    var hc = this.handlerClazz;

    if( e.keyLabel == "Escape" ) {
        hc["stop"]();
        return;
    }

    hc["keyInterrupt"]( "keypress", e );

    if( !this.interactive ) {
        this.keyPress.push( e );
    }
    else {
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

		const STATE_NULL 		= 9660;
		const STATE_LASTSTATE = 9661;
		const STATE_CLI = 		9670;
		const STATE_RUNNING = 9671;
		const STATE_INPUT 	= 9672;
		const STATE_WAITING = 9673;
		const STATE_SYNCHING = 9674;

		this.STATE_NULL 			= STATE_NULL;
		this.STATE_LASTSTATE 	= STATE_LASTSTATE;
		this.STATE_CLI 				= 		STATE_CLI;
		this.STATE_RUNNING 		= STATE_RUNNING;
		this.STATE_INPUT 			= STATE_INPUT;
		this.STATE_WAITING 		= STATE_WAITING;
		this.STATE_SYNCHING 		= STATE_SYNCHING;		

		this.sys = sys;
		this.processes = [];

		var _this = this;
    	var processes = _this.processes;

		this.idlerInterval = null;
		this.runInterval = null;
		this.waitTimeOut = null;

		var lastState = STATE_NULL;
		var state = STATE_NULL;

		this.avgIdlerTime = 10;

		var changeState = function( newState, data ) {

			if( newState == STATE_INPUT ) {
				_this.killRuntimeInterval();
			}
			else if( newState == STATE_WAITING ) {
				_this.killRuntimeInterval();
				_this.startWaitingTimeOut( data );
			}
			else if( newState == STATE_SYNCHING ) {
				_this.killRuntimeInterval();
				_this.killWaitingTimeOut();
				
				_this.sys.postsynchrequest( 0 );
			}
			else if( newState == STATE_CLI ) {
				_this.killRuntimeInterval();
				_this.killWaitingTimeOut();
			}
			else if( newState == STATE_RUNNING ) {
				_this.killWaitingTimeOut();
				_this.startRuntimeInterval( data );
			}

			lastState = state;
			state = newState;
		}

		var flags, pstate, update, wtime, p;

		this.idlerFunction = function()  {
			var m1 = new Date().getTime();

			if( state == STATE_RUNNING  || state == STATE_WAITING || state == STATE_SYNCHING) {
				return; //don't steal cycles from running or waiting timer, or synching process
			}

			p = processes[0];

			var running = p.cpuNeeded();
			if( running>.1 ) { //we do not get this from cycle.  At least not in good time.
				var stat = p.getStatus();
				_this.sys.poststatus( 0, stat );

				changeState( STATE_RUNNING, running );
				return;
			}

			flags = p.cycle();

			update = flags[ 0 ];
			pstate = flags[ 1 ];
			wtime = flags[ 2 ];

			if( update ) {
				var stat = p.getStatus();
				_this.sys.poststatus( 0, stat );
			}

			if( pstate != state ) {
				changeState( pstate, wtime );
			}

			var m2 = new Date().getTime();
			var m3 = m2-m1;

			_this.avgIdlerTime = ((_this.avgIdlerTime * 99) + m3) / 100; 
		}

		this.runningFunction = function()  {

			if( state != STATE_RUNNING ) {
				return; //should never get here
			}

			//p = processes[0];
			flags = p.cycle();

			pstate = flags[ 1 ];
			wtime = flags[ 2 ];

			if( pstate != state ) {
				changeState( pstate, wtime );
			}

		}

		this.waitingFunction = function()  {

			_this.runInterval = null;
			p.clearWaiting();
			changeState( lastState, 0 );

			if( state == STATE_RUNNING ) {
				_this.runningFunction();
			}
		}

		this.synch = function( id )  {

			_this.runInterval = null;
			p.clearSynching();

			changeState( lastState, 0 );

			if( state == STATE_RUNNING ) {
				_this.runningFunction();
			}
		}

		changeState( STATE_CLI );
}

	startIdlerInterval()  {
		if( this.idlerInterval == null ) {
				 //this.sys.log("Starting process interval (first register)");
				 this.idlerInterval = setInterval( this.idlerFunction, 200) ;
		}
	}

	startRuntimeInterval( cpu )  {
		if( this.runInterval == null ) {
				 //this.sys.log("Starting running interval " + cpu);

				 var iv = Math.floor( 220 - (200*cpu) );
				 //this.sys.log("Starting running interval# " + iv);

				 this.runInterval = setInterval( this.runningFunction, iv) ;
		}
	}

	killRuntimeInterval()  {
		if( this.runInterval != null ) {
				 //this.sys.log("Stopping running interval");
				 clearInterval( this.runInterval ) ;
				 this.runInterval = null;
		}
	}

	startWaitingTimeOut( t )  {
		if( this.waitTimeOut == null ) {
				 //this.sys.log("Starting waiting timeout " + t);
				 this.waitTimeOut = setTimeout( this.waitingFunction, t, t ) ;
		}
	}

	killWaitingTimeOut()  {
		if( this.waitTimeOut != null ) {
				 //this.sys.log("Stopping running wait timeout!!");
				 clearTimeout( this.waitTimeOut ) ;
				 this.waitTimeOut = null;
		}
	}

	getTicks() {
		return this.count;
	}

	get( id ) {
		return this.processes[ id ];
	}

	register( obj ) {

		var newId = this.processes.length;

		this.processes.push( obj );
		//this.processesSleep.push( 0 );
		//this.fastProcesses.push( false );

		obj.processId = newId;
		obj.procIf = this;

		this.startIdlerInterval();

		return newId;
	}


	getRoot() {

		return this.processes[ 0 ];
	}
}

//--EOC 

// ## commandhelp.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/commandhelp.js
//  BY packworkers.js -- src/sys/modules/basic/worker/commandhelp.js

class CommandHelp {

	constructor() {}


  getCategoriesNormalize(  categoryIndexesInt ) {
    var categoryIndexes = [
      Object.getOwnPropertyNames( categoryIndexesInt[0] ),
      categoryIndexesInt[1]
    ];
    return categoryIndexes;
  }

  getCategoriesIntermediate(  categoryIndexes, clazz ) {


    var stats = clazz.getStatements( true );
    var funs = clazz.getFunctions( true );

    var cat = categoryIndexes[ 0 ];
    var catLists = categoryIndexes[ 1 ];

    if( cat[ "general" ] === undefined ) { cat[ "general" ] = 0; catLists[ "general" ] = []; }

    for( var i=0;i<stats.length;i++) {
      var rname = stats[i];
      var si = rname.replace("_stat_","_stat_info_");

      var catlabel;
      if( !( clazz[ si ] === undefined ) )  { 
          catlabel = clazz[ si ](); 
          var tmp=12;
      }
      else { 
        catlabel = "general"; 
      }

      var f_attribs = {};
      if( catlabel.indexOf(":") >0 ) {

        var partsLen = catlabel.split(":" ).length;

        f_attribs.description =  catlabel.split(":" )[1];
        f_attribs.input =   catlabel.split(":" )[2];
        f_attribs.output =  catlabel.split(":" )[3];

        catlabel=catlabel.split(":")[0];
      }

      rname = rname.replace("_stat_","").toUpperCase();

      if( cat[ catlabel ] === undefined ) { cat[ catlabel ] = 0; catLists[ catlabel ] = []; }
      cat[ catlabel ]++;
      catLists[ catlabel ].push( {name: rname, attribs: f_attribs } );
    }

    for( var i=0;i<funs.length;i++) {
      var rname = funs[i];
      var si = rname.replace("_fun_","_fun_info_");

      var catlabel;
      if( !( clazz[ si ] === undefined ) ) { catlabel = clazz[ si ](); }
      else { catlabel = "general"; }
      var f_attribs = {};

      if( catlabel.indexOf(":") >0 ) {

          var partsLen = catlabel.split(":" ).length;

          f_attribs.description =  catlabel.split(":" )[1];
          f_attribs.input =   catlabel.split(":" )[2];
          f_attribs.output =  catlabel.split(":" )[3];

          catlabel=catlabel.split(":")[0];
      }

      rname = rname.replace("_fun_","").replace("_DLR_","$").toUpperCase() + "()";

      if( cat[ catlabel ] === undefined ) { cat[ catlabel ] = 0; catLists[ catlabel ] = []; }
      cat[ catlabel ]++;
      catLists[ catlabel ].push( {name: rname, attribs: f_attribs } );
    }

    //var cats = Object.getOwnPropertyNames( cat );

    return [cat,catLists];
  }
}

//--EOC 

// ## ../../rwbuffers/worker/textarea.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/../../rwbuffers/worker/textarea.js
//  BY packworkers.js -- src/sys/modules/basic/worker/../../rwbuffers/worker/textarea.js

class TextArea {

	constructor( sys ) {
		this.sys = sys;
		this.cursorOn = false;
		this.cols = 80;
		this.rows = 30;
		this.x = 0;
		this.y = 0;
		this.hidden = false;

		this.dc = false;
		this.dcCmd = false;

		this.colors ={};
		this.reverse = false;

		this.defaultFG = 5;
		this.defaultBG = 0;

		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		this.initialized = false;

		this.changes = { all: false, list: [] };
		this.pokeFlush = true;

		//this.textArea( this.cols , this.rows , -1, -1 );
	}

	isActive() {
    	return this.initialized && !this.hidden;
  	}

	reInit( w, h ) {
		this._int_initMode( w, h );
	}

	set( w, h, cells ) {
		this._int_initMode( w, h );
		this._int_setCells( cells );

	}

	destroy() {
		this.cellel = undefined;

		this.changes = { all: false, list: [] };
		this.initialized = false;
	}


  /* Adding changes, to be posted to MT throught flush */
	_int_addChangeAll() {

		this.changes.all = true;
		this.changes.list = [];

	 }



	changeCount() {
		 if( this.changes.all ) { return 65535; }
		 return this.changes.list.length;
	 }

	/* Adding single change, to be posted to MT throught flush */
	_int_addChange( area ) {

		if(  this.changes.all ) {
			if( this.changes.list.length > 0 ) {
					this.changes.list = [];
			}
			return;
		}

		var clist = this.changes.list;
		if( clist.length > 0 ) {
			var lc = clist[ clist.length -1 ];
			var nc = area;
			if( lc.y1 == lc.y2 && nc.y1 == nc.y2 && lc.y1 == nc.y1) {
				if( nc.x1 == lc.x2 +1 ) {
						var x2 = lc.x2;
						var temp=1;
						var changesTargetArray = lc.cells[0];
						for( var i=0; i<area.cells[0].length; i++) {
							var cell = area.cells[0][i];
							changesTargetArray.push( cell );
						}
						lc.x2 = nc.x2;
						return;
				}
			}
		}

		this.changes.list.push( area );

	 }

	 /* Force flush to MT the whole buffer */
	_int_flushAll() {
		this.changes.all = true;
		this.changes.list = [];

		this._int_flush();
	}

  	/* Utility function to prepare input for addChange (which itself prepares for flush )*/
	_int_getArea( x1, y1, x2, y2 ) {

	var cells = [];

	for( var y=y1; y<=y2; y++) {
			var row = [];
			for( var x=x1; x<=x2; x++) {
				row.push( this.cellel[ y][ x] );
			}
			cells.push( row );
		}

		var area =
		{
			 cells: cells,
			 x1: x1,
			 y1: y1,
			 x2: x2,
			 y2: y2
		};

		return area;

	}

   /* Flush local changes to Main Thread for actual display updates*/
	 _int_flush() {

			if( this.changes.all ) {
				this.sys.post( "textupdate-all",
						{
 							fg: this.colors.txtColor,
							bg: this.colors.txtBgColor,
							cx: this.x,
							cy: this.y,
							cells: this.cellel,
							cursorMode: this.cursorMode
						} );

				this.changes.all = false;


			}
			else if( this.changes.list.length > 0 ) {

				this.sys.post( "textupdate",
					{
						fg: this.colors.txtColor,
						bg: this.colors.txtBgColor,
						cx: this.x,
						cy: this.y,
						areasList:  this.changes.list,
						cursorMode: this.cursorMode
					}  );
				this.changes.list = [];
			}
			else {
				this.sys.post( "textupdate",
					{
						fg: this.colors.txtColor,
						bg: this.colors.txtBgColor,
						cx: this.x,
						cy: this.y,
						areasList:  [],
						cursorMode: this.cursorMode
					}  );

			}

		}

	attach( w, h ) {
		this._int_initMode( w, h);
	}

	setPokeFlush( flag ) {
	  this.pokeFlush = flag;
	}


	peekc( x, y ) {

		var cell = this.cellel[y][x];
     	return cell.txt.codePointAt(0);

	}

	peekcl( x, y, m ) {

		var cell = this.cellel[y][x];

		if( m== 0 ) {
			return cell.fg;
		}
		else if( m== 1 ) {
			return cell.bg;
		}
		else  {
			return cell.fg + (16*cell.bg);
		}
	}

	pokec( x, y , c ) {

			try {
				var cell = this.cellel[y][x];
				cell.txt = String.fromCodePoint( c );

				var area = this._int_getArea( x, y, x, y );
				this._int_addChange( area );

				if( this.pokeFlush ) {
					this._int_flush();
				}
			}
			catch( e ) {
				throw "Cannot pokec to adress (" + x + "," + y + ")";
			}

	}

	pokecl( x, y , fg, bg ) {

			try {
				var cell = this.cellel[y][x];
				if( !(fg === undefined )) {
					cell.fg = fg;
				}
				if( !(bg === undefined )) {
					cell.bg = bg;
				}
				var area = this._int_getArea( x, y, x, y );
				this._int_addChange( area );

				if( this.pokeFlush ) {
					this._int_flush();
				}

			}
			catch( e ) {
				throw "Cannot pokec to adress (" + x + "," + y + ")";
			}
	}


	pokeccl( x, y , c, fg, bg ) {

		try {
				var cell = this.cellel[y][x];

				cell.txt = String.fromCodePoint( c );
				if( !(fg === undefined )) {
					cell.fg = fg;
				}
				if( !(bg === undefined )) {
					cell.bg = bg;
				}

				var area = this._int_getArea( x, y, x, y );
				this._int_addChange( area );

				if( this.pokeFlush ) {
					this._int_flush();
				}

		}
		catch( e ) {
				throw "Cannot pokec to adress (" + x + "," + y + ")";
		}
	}


	triggerFlush() {

		this._int_flush();
	}


	_int_initMode( w, h ) {

		if( this.initialized ) {
				this.destroy();
		}
		var sys = this.sys;
		//var msgs = sys.init.queuedMessages; TODO, what to do with queued messages
		this.x = 0;
		this.y = 0;

		this.rows = h;
		this.cols = w;

		this.textArea( this.cols, this.rows, -1, -1 );
		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		this.cellel = [];
		for( var y=0; y<this.rows; y++) {
			var rowArray = [];
			for( var x=0; x<this.cols; x++) {
					var cell = {
						txt: " ",
						fg: this.colors.txtColor,
						bg: this.colors.txtBgColor
					}
					rowArray.push( cell );
				}
				this.cellel.push( rowArray );
		}

		this.changes = { all: true, list: [] };
		  var _this = this;

		this._int_flushAll();

		this.sys.log("TEXTAREA w Ready.");

		this.initialized = true;
		this.pokeFlush = true;
		/* if true then all pokes in "character memory" will be flushed immediately to the */
		/*main browswer process */
	}

	_int_setCells( srcCells ) {

		this.cellel = [];
		for( var y=0; y<this.rows; y++) {
				var rowArray = [];
				for( var x=0; x<this.cols; x++) {
					var cell = {
						txt: srcCells[ y ][ x ].txt,
						fg:  srcCells[ y ][ x ].fg,
						bg:  srcCells[ y ][ x ].bg
					}
					rowArray.push( cell );
				}
				this.cellel.push( rowArray );
			}

		this.changes = { all: false, list: [] };
	}


	getDimensions() {
			return [this.cols, this.rows ];
	}

	getCurrentLine() {
		var y = this.y;
		var str = "";
		for( var i = 0; i< this.acols; i++) {
			var xi = i + this.ax0;
			str += this.cellel[ y ][ xi ].txt;
		}
		return str;
	}

	getLineFrom( x0, y ) {

		var str = "";
		var x2 = this.acols + this.ax0 - 1;

		for( var i = x0; i< x2; i++) {
			str += this.cellel[ this.ay0 + y ][ i ].txt;
		}
		return str;
	}

	/* Commands and functions to modify the text area buffer */


	setDefault( fg, bg ) {
		this.defaultBG = bg;
		this.defaultFG = fg;

	}


	colorReset() {

		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		//this.cellel = [];
		var fg = this.defaultFG;
		var bg = this.defaultBG;

		for( var ay=0; ay<this.rows; ay++) {
			//var rowArray = [];

			var y = ay;
			for( var ax=0; ax<this.cols; ax++) {

				var x = ax;

				var cell = this.cellel[ y ][ x];

				cell.fg = fg;
				cell.bg = bg;
			}
			//this.cellel.push( rowArray );
		}

		this.changes = { all: true, list: [] };

		this._int_flushAll();
	}

	reset() {
		this.textArea( this.cols, this.rows, -1, -1 );

		this.colors.txtBgColor= this.defaultBG;
		this.colors.txtColor = this.defaultFG;

		this.pokeFlush = true;
		this.clear();

	}

	textArea( w, h, xo, yo ) {
		var divx = this.cols - w;
		var divy = this.rows - h;

		if( xo < 0 ) {
				this.ax0 = Math.floor(divx / 2);
		}
		else {
			this.ax0 = xo;
		}

		if( yo < 0 ) {
				this.ay0 = Math.floor(divy / 2);
		}
		else {
			this.ay0 = yo;
		}

		this.acols = w;
		this.arows = h;
		this.x = this.ax0;
		this.y = this.ay0;
	}

	clear() {

		//this.cellel = [];
		for( var ay=0; ay<this.arows; ay++) {
			//var rowArray = [];

			var y = this.ay0 + ay;
			for( var ax=0; ax<this.acols; ax++) {

				var x = this.ax0 + ax;

				var cell = {
					txt: " ",
					fg: this.colors.txtColor,
					bg: this.colors.txtBgColor
				}
				this.cellel[ y ][ x] = cell;
			}
			//this.cellel.push( rowArray );
		}

		this.changes = { all: true, list: [] };

		this.x = this.ax0;
		this.y = this.ay0;

		this._int_flushAll();
	}


	jumpTo( destination ) {
		if( destination == "home" ) {
			this.y = this.ay0;
			this.x = this.ax0;
		}
		if( destination == "end" ) {
			this.y = this.ay0 + this.arows - 1;
			this.x = this.ax0 + this.acols - 1;
		}
		else if( destination == "line-start" ) {
			this.x = this.ax0;
		}
		else if( destination == "line-end" ) {
			this.x = this.ax0 + this.acols - 1;
		}
		else if( destination == "text-end" ) {

			/* where is the last char -> maxX */
			var c = "DC";
			var oldx = this.x;
			this.x = ((this.ax0 + this.acols)-1);
			var max = ((this.ax0 + this.acols)-1);

			while( this.x >= this.ax0 ) {
						c = this.cellel[ this.y ][ this.x ].txt;
						if( c != " " ) {
							this.x++;
							if( this.x > max) {
								this.x = max;
							}
							break;
						}
						this.x--;
			}

			var maxX = this.x;
			/*-reset, and jump to end of next text area-*/
			this.x = oldx;
			var c = "DC";
			while( this.x< ((this.ax0 + this.acols)-1) && c != " ") {
						this.x++;
						c = this.cellel[ this.y ][ this.x ].txt;
			}


			/*make sure we did not jump past last char*/
			if( this.x > maxX ) {
				this.x = maxX;
			}
		}
		else if( destination == "text-end-all" ) {
			var c = "DC";
			this.x = ((this.ax0 + this.acols)-1);
			var max = ((this.ax0 + this.acols)-1);

			while( this.x >= this.ax0 ) {
						c = this.cellel[ this.y ][ this.x ].txt;
						if( c != " " ) {
							this.x++;
							if( this.x > max) {
								this.x = max;
							}
							break;
						}
						this.x--;
			}
		}
		else if( destination == "text-start" ) {
			var c = "DC";
			while( this.x> this.ax0 && c != " ") {
						this.x--;
						c = this.cellel[ this.y ][ this.x ].txt;
			}
		}

		this._int_flush();
	}

	cursorMove( dir ) {
		if( dir == "up" ) {
			if( this.y>this.ay0) {
				this.y--;
			}
		}
		else if( dir == "down" ) {
			if( this.y< ((this.ay0 + this.arows)-1)) {
				this.y++;
			}
			else if( this.y== ((this.ay0 + this.arows)-1)) {
				this.__int_scrollDown();
				this._int_addChangeAll();
			}
		}
		if( dir == "left" ) {
			if( this.x>this.ax0) {
				this.x--;
			}
		}
		else if( dir == "right" ) {
			if( this.x< ((this.ax0 + this.acols)-1)) {
				this.x++;
			}
		}
		this._int_flush();
	}

	backspace() {
		if( this.x != this.ax0 ) {
				this.x--;
		}

		this.__int_scrollLineLeftFrom( this.x, this.y );

		var area = this._int_getArea( this.x, this.y, this.cols-1, this.y, );
		this._int_addChange( area );
		this._int_flush();
	}

	delete() {

		this.__int_scrollLineLeftFrom( this.x, this.y );

		var area = this._int_getArea( this.x, this.y, this.cols-1, this.y, );
		this._int_addChange( area );
		this._int_flush();
	}

	nl() {

			this.x = this.ax0;
			this.y ++;
			var ya = this.y - this.ay0;

			if( ya >= this.arows ) {

				this.__int_scrollDown();
				this.y = this.ay0 + (this.arows -1);

				this._int_flushAll();
				return;
			}

			this._int_flush();

	}

	__int_nl() {
			this.x = this.ax0;
			this.y ++;
			var ya = this.y - this.ay0;
			if( ya >= this.arows ) {
				this.__int_scrollDown();
				this.y = this.ay0 + (this.arows -1);
				return { scroll: true }
			}
			return { scroll: false }

	}

	writeln( str ) {

			for( var i=0; i<str.length; i++) {
				var c = str.substr(i,1);
				this.__int_write_direct_ch( c );
			}
			var stat = this.__int_nl();
			if( stat.scroll ) {
					this._int_addChangeAll();
			}
			this._int_flush();
	}

	_int_write( str, insert ) {
		for (const c of str) {
			this.__int_write_direct_ch( c, insert );
		}
	}

	write( str ) {
			this._int_write( str );

			this._int_flush();
	}


	insert( str ) {
			this._int_write( str, true );

			this._int_flush();
	}




	__int_scrollLinesDownFrom( y  ) {

			for( var yy=this.rows-1; yy>y; yy-- ) {
				for( var xx=0; xx<this.cols; xx++ ) {

					var cell1 = this.cellel[ yy-1  ][ xx ];
					var cell2 = this.cellel[ yy  ]  [ xx];

					cell2.fg = cell1.fg;
					cell2.bg = cell1.bg;
					cell2.txt = cell1.txt;

				}
			}

			for( var xx=0; xx<this.cols; xx++ ) {

				var cell1 = this.cellel[ yy  ][ xx ];

				cell1.txt = " ";

			}

			this._int_addChangeAll();

	}


	ScrollDownByCurrentLine() {

		if( (this.y ) < (this.rows-1) ) {
			this.__int_scrollLinesDownFrom( this.y );
			this._int_flush();
		}
	}

	__int_scrollLineRightFrom( x0, y  ) {

		var x = x0;
		var x1 = this.ax0 + this.acols - 1;

		if( x0 == x1 ) {
			return;
		}

		for( var i=x1; i>x0; i--) {
			var cell1 = this.cellel[ y  ][ i-1 ];
			var cell2 = this.cellel[ y  ][ i ];

			cell2.fg = cell1.fg;
			cell2.bg = cell1.bg;
			cell2.txt = cell1.txt;
		}
	}

	__int_scrollLineLeftFrom( x0, y  ) {

		var x = x0;
		var x1 = this.ax0 + this.acols - 1;

		if( x0 == x1 ) {
			return;
		}

		for( var i=x0; i<x1; i++) {
			var cell1 = this.cellel[ y  ][ i +1 ];
			var cell2 = this.cellel[ y  ][ i ];

			cell2.fg = cell1.fg;
			cell2.bg = cell1.bg;
			cell2.txt = cell1.txt;
		}


	}

	__int_write_direct_ch( ch, insert ) {

		var code = ch.codePointAt(0);

		if( this.dc && this.dcCmd ) {

			this.dc = false;
			this.dcCmd = false;
			this._int_control( this.dcCmdCode, code );

			return;
		}

		if( this.dc && !this.dcCmd ) {
			this.dcCmd = true;
			this.dcCmdCode = code;
			return;
		}

		if( code == 17 ) {
			//DC1
			this.dc = true;
			this.dcCmd = false;
			return;
		}

		var cell = this.cellel[ this.y ][ this.x ];

		if( cell == null ) {
			console.log( "cell at " + this.x + "," + this.y +" == null ");
			return;
		}

		var area;

		if( insert ) {
			this.__int_scrollLineRightFrom( this.x, this.y );

			area = this._int_getArea( this.x, this.y, this.ax0 + this.acols-1, this.y );
			this._int_addChange( area );

		}

		cell.txt = ch;

		if( !this.reverse  ) {
			cell.fg = this.colors.txtColor;
			cell.bg = this.colors.txtBgColor;
		}
		else {
			cell.bg = this.colors.txtColor;
			cell.fg = this.colors.txtBgColor;
		}

		var oldx = this.x;
		var oldy = this.y;

		this.x++;
		var ax = this.x - this.ax0;
		if( ax > (this.acols-1) ) {
			this.x = this.ax0;
			var stat = this.__int_nl();
			if( stat.scroll ) {
				this._int_addChangeAll();
				return;
			}
		}

		area = this._int_getArea( oldx, oldy, oldx, oldy );
		this._int_addChange( area );
		//this._int_addChangeAll();

	}

	writec( chr ) {

		if( chr == "\n" ) {
			var stat = this.__int_nl();
			if( stat.scroll ) {
					this._int_addChangeAll();
			}

			return;
		}
		this.__int_write_direct_ch( chr );
		this._int_flush();
	}


	setFilter( f ) {
		this.sys.post( "gfilter", { d: f }  );
	}

	_int_control( chr, data ) {

		if( chr == 16 ) {
			this.colors.txtColor = data;
		}
		else if( chr == 17 ) {
			this.colors.txtBgColor = data;
		}
		else if( chr == 18 ) {
			this.sys.post( "border", { d: data }  );
		}
		else if( chr == 24 ) {  //CANCEL -> (we map it to) Clear Screen
			this.clear();
		}
		else if( chr == 12 ) {  //FORMFEED -> (we map it to) RESET SCREEN
			this.reset();
		}
		else if( chr == 25 ) {  //End of Medium -> (we map it to) Hide
			//this.hide();   TODO
		}
		else if( chr == 64 ) {
			this.reverse = false;
		}
		else if( chr == 65 ) {
			this.reverse = true;
		}
		else {
			this.__int_write_direct_ch( "?" );
		}
	}


	setPos( x, y ) {

		this._int_setPos( x,y );

		this._int_flush();
	}

	setCursorMode( mode ) {
		this.cursorMode = mode;
		this._int_flush();
	}

	setCursorPos( x, y ) {
		if( x<0 || y<0 ) { throw "pos("+x+","+y+") < 0" ; }

		if( x>=this.acols || y>= this.arows ) { throw "pos("+x+","+y+") > max" ; }

		if( ! ( x === undefined ) ) { this.x = x + this.ax0; }
		if( ! ( y === undefined ) ) { this.y = y + this.ay0; }


		this._int_flush();
	}

	getCursorPos() {
			return [this.x - this.ax0, this.y - this.ay0 ];
	}

	control( chr, data ) {

		this._int_control( chr, data );
		this._int_flush();

	}


	_int_setPos( x, y ) {

		if(x >= 0) {
				this.x = x + this.ax0;
				if( (this.x - this.ax0) >= this.acols ) { this.x = this.acols-1;}
		}
		if(y >= 0) {
				this.y = y + this.ay0;
				if( (this.y - this.ay0)>= this.arows ) { this.y = this.arows-1;}
		}

		
		
	}

	center( str, inhibitNewLine ) {

			if( str.length > this.cols ) {
				return;
			}

			var l = str.length;
			var l2 = l/2;

			var wh = [ this.acols, this.arows ];

			var x = Math.floor( (wh[0] / 2)-l2 );
			this._int_setPos( x, -1 );
			this._int_write( str );

			if( !inhibitNewLine ) {

				var stat = this.__int_nl();
				if( stat.scroll ) {
						this._int_addChangeAll();
						return;
				}
			}

						
			var area = this._int_getArea( this.ax0, this.y, this.acols-1, this.y );
			this._int_addChange( area );
			this._int_flush();

	}

	__int_scrollDown() {

		var ax0 = this.ax0;
		var ay0 = this.ay0;

		for( var ax=0; ax<this.acols; ax++) {

			var x = ax + ax0;
			for( var ay=0; ay<this.arows-1; ay++) {

				var y = ay + ay0;

				var cell = this.cellel[ y ][ x ];
				var cellyp1 = this.cellel[ y+1 ][ x ];

				cell.txt = cellyp1.txt;
				cell.fg = cellyp1.fg;
				cell.bg = cellyp1.bg;
			}
		}

		//fill last row
		var y2 = ay0 + (this.arows-1);
		for( var ax=0; ax<this.acols; ax++) {

			var x = ax + ax0;

			var cell = this.cellel[ y2 ][ x ];
			cell.txt = " ";
			if( !this.reverse  ) {
				cell.fg = this.colors.txtColor;
				cell.bg = this.colors.txtBgColor;
			}
			else {
				cell.fg = this.colors.txtBgColor;
				cell.bg = this.colors.txtColor;
			}
		}

	}
}

//--EOC 

// ## ../../rwbuffers/worker/playfields.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/../../rwbuffers/worker/playfields.js
//  BY packworkers.js -- src/sys/modules/basic/worker/../../rwbuffers/worker/playfields.js

class Playfields {

	constructor( sys ) {
		this.sys = sys;

		this.current = 0;
		this.enabledFlag = false;
		this.list = null;
  	}

  	enable( flag )  {
  		this.enabledFlag = flag;
  	}

  	set( list )  {
  		this.list = list;
  	}

  	enabled() {
  		return this.enabledFlag;
  	}

  	setEnable( pid, ix, flag ) {
		this.sys.post( "pfenable",
			{
				processId: pid,
				ix: ix,
				flag: flag
			}  );	  		
  	}


	select( pid, ix ) {
		if( ix >= this.list.length ) {
			throw "No such playfield " + ix;
		}

		if( this.list[ ix ] == null ) {
			throw "Playfield not active";
		}	

		this.sys.post( "pfselect",
			{
				processId: pid,
				ix: ix
			}  );		

		this.current = ix;
	}


	scrollpos( pid, ix, x, y ) {
		if( ix >= this.list.length ) {
			throw "No such playfield " + ix;
		}

		if( this.list[ ix ] == null ) {
			throw "Playfield not active";
		}	

		this.sys.post( "pfscrollpos",
			{
				processId: pid,
				ix: ix,
				x: x,
				y: y
			}  );		

	}
	

	viewdefine( pid, ix, x, y, w, h ) {
		if( ix >= this.list.length ) {
			throw "No such playfield " + ix;
		}

		if( this.list[ ix ] == null ) {
			throw "Playfield not active";
		}	

		this.sys.post( "pfviewsize",
			{
				processId: pid,
				ix: ix,
				x: x,
				y: y,
				w: w,
				h: h
			}  );		

	}

	init( pid, pfIx, bcwC, brhC ) {

		/* If current we also need to update our 
			worker text area buffers when done */

		this.sys.post( "pfinit",
			{
				processId: pid,
				ix: pfIx,
				bcwC: bcwC, brhC: brhC,
				fgColor: 1, bgColor: 0
			}  );
	}

	old_init( pid, pfIx, xo, yo, cwC, rhC, bcwC, brhC ) {


		/* If current we also need to update our 
			worker text area buffers when done */

		this.sys.post( "pfinit",
			{
				processId: pid,
				ix: pfIx,
				isCurrentIx: this.current == pfIx,
				xo: xo, yo: yo,
				cC: cwC, rC: rhC,
				bcwC: bcwC, brhC: brhC,
				fgColor: 1, bgColor: 0
			}  );
	}

}

//--EOC 

// ## ../../rwbuffers/worker/bitmap.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/../../rwbuffers/worker/bitmap.js
//  BY packworkers.js -- src/sys/modules/basic/worker/../../rwbuffers/worker/bitmap.js

class BitMap {

	constructor( sys ) {
		this.sys = sys;
    this.lineColor = 1;
    this.changes = {};
    this.changes.flag = false;
    this.changes.pixels = [];

		this.origin( 0,0,1,1);
  }


	origin( ox0, oy0, odx, ody ) {
		this.ox0 = ox0;
		this.oy0 = oy0;
		this.odx = odx;
		this.ody = ody;

		var dir = ["m",undefined,"p"];
		var xdir = "x" + dir[ odx + 1 ];
		var ydir = "y" + dir[ ody + 1 ];
		var direction = xdir + ydir;

		this["_int_convertxy"] = this.getConvertFunc( direction );

	}

	reInit( w, h ) {
		this.width = w;
    this.height = h;
	}

  attach( w, h ) {
		this.reInit( w, h );
	}

  isActive() {
    return this.width > 0;
  }

  getDimensions() {
			return [this.width, this.height ];
	}

  triggerFlush() {

		if( !this.changes.flag ) {
			return;
		}

		this.sys.post( "gfxupdate",
			{
				pixels: this.changes.pixels
			}
		);

		this.changes.pixels = [];
		this.changes.flag = false;

  }

  _int_flush() {

    if( this.changes.flag ) {

      this.sys.post( "gfxupdate",
        {
          pixels: this.changes.pixels
        }
      );

			this.changes.pixels = [];
			this.changes.flag = false;
    }

  }

	setLineColor( c ) {
    this.lineColor = c;
    this.sys.post( "nativeout",{
      action: "gcolor",
      params: { c: c }
    });
  }


	setFillColor( c ) {
    this.fillColor = c;
    this.sys.post( "nativeout",{
      action: "fcolor",
      params: { c: c }
    });
  }

	getConvertFunc( direction ) {
		var __this = this;
		if( direction == "xpyp") {
			return function( x,y ) {
				return [ Math.floor(x + __this.ox0), Math.floor(y + __this.oy0)];
			}
		}
		else if( direction == "xpym") {
			return function( x,y ) {
				return [ Math.floor(x + this.ox0), Math.floor( this.oy0 - y ) ];
			}
		}
		else if( direction == "xmyp") {
			return function( x,y ) {
				return [ Math.floor( __this.ox0 - x ), Math.floor(y + __this.oy0)];
			}
		}
		else if( direction == "xmym") {
			return function( x,y ) {
				return [ Math.floor( __this.ox0 - x ), Math.floor( this.oy0 - y ) ];
			}
		}
	}

/*
	_int_convertxy_xpyp( x,y ) {
		return [ Math.floor(x + this.ox0), Math.floor(y + this.oy0)];
	}

	_int_convertxy_xpym( x,y ) {
		return [ Math.floor(x + this.ox0), Math.floor( this.oy0 - y )];
	}

	_int_convertxy_xmyp( x,y ) {
		return [ Math.floor( this.ox0 - x), Math.floor( y + this.oy0)];
	}

	_int_convertxy_xmym( x,y ) {
		return [ Math.floor( this.ox0 - x), Math.floor( this.oy0 - y )];
	}
*/

  plot( x, y ) {
		var xy2 = this._int_convertxy( x, y );

    var pixel = { x: xy2[0], y: xy2[1], c:this.lineColor };

    this.changes.pixels.push( pixel );
    this.changes.flag = true;

  }

	line( x0,y0, x1, y1 ) {

		var xy0 = this._int_convertxy( x0, y0 );
		var xy1 = this._int_convertxy( x1, y1 );

    this.sys.post( "nativeout",{
      action: "line",
      params: { x0:xy0[0], y0:xy0[1], x1:xy1[0], y1:xy1[1] }
    });
  }

  fillRect( x,y, w, h ) {

		var xy = this._int_convertxy( x, y );


    this.sys.post( "nativeout",{
      action: "fillRect",
      params: { x:xy[0], y:xy[1], w:w, h }
    });
  }

	destroy() {

	}
}

//--EOC 

// ## ../../rwbuffers/worker/audio.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/../../rwbuffers/worker/audio.js
//  BY packworkers.js -- src/sys/modules/basic/worker/../../rwbuffers/worker/audio.js

class Audio {

	constructor( sys ) {
		this.sys = sys;
		this.userInput = false;
  }

	flagUserInput() {
		this.userInput = true;
	}

  playBeep( channel, frequency, len ) {

		if( !this.userInput ) { return; }
    this.sys.post( "audio",
    {
          method: "playBeep",
					parCount: 3,
					p1: channel,
					p2: frequency,
					p3: len
    }
    );
  }

	playSound( channel, frequency, len ) {

		if( !this.userInput ) { return; }
    this.sys.post( "audio",
    {
          method: "playSound",
					parCount: 3,
					p1: channel,
					p2: frequency,
					p3: len
    }
    );
  }

	volume( volume ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "setVolume",
					parCount: 1,
					p1: volume
		}
		);
	}

	reset() {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
			{
						method: "reset",
						parCount: 0
			}
			);

	}

	attackDecayRelease( channel, attackT, decayT, releaseT ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelSetAttackDecayRelease",
					parCount: 4,
					p1: channel,
					p2: attackT,
					p3: decayT,
					p4: releaseT
		}
		);
	}

	channelVolume( channel, v ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelVolume",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}

	channelFrequency( channel, v ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelFrequency",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}


	channelSustainVolume( channel, v ) {

		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "channelSetSustainLevel",
					parCount: 2,
					p1: channel,
					p2: v
		}
		);
	}

	addEffect( channel,  type , value, time ) {
		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "addEffect",
					parCount: 4,
					p1: channel,
					p2: type,
					p3: value,
					p4: time
		}
		);
  }

  clearEffect( channel ) {
		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "clearEffect",
					parCount: 1,
					p1: channel
		}
		);

  }

	playEffect( channel, freq ) {
		if( !this.userInput ) { return; }
		this.sys.post( "audio",
		{
					method: "playEffect",
					parCount: 2,
					p1: channel,
					p2: freq
		}
		);

	}

}

//--EOC 

// ## workerbootstrap_static.js ==========---------- 
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
//  src/sys/modules/basic/worker/workerbootstrap_static.js
//  BY packworkers.js -- src/sys/modules/basic/worker/workerbootstrap_static.js

sys.log("Starting");
start_sys();

//--EOC 

