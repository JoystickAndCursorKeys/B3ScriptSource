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

  sys.download = function( rt, path, device ) {

    post("download", { processId: rt.processId, path:path, device: device } );

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
