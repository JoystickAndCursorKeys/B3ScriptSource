class KERNALMODULE {

  constructor( sys ) {

    this.apps = [];
    this.sys  = sys;

  }

  init() {
    var sys = this.sys;
    var con = sys.out;
    var htmlwrapper = sys.m.htmlwrapper;
    var display = sys.m.displaymodes;

    this.out = con;

    if( sys.staticTarget ) {
      this.worker = new Worker( "basicworker.js"   );
    }
    else {
      if( sys.dynamicMinTarget ) {
        this.worker = new Worker( "sys/modules/basic/worker/workerbootstrap_min.js"   );
      }
      else {
        this.worker = new Worker( "sys/modules/basic/worker/workerbootstrap_max.js"   );
      }

      this.worker.postMessage(
          {
            type: "inittxtarea",
            w: con.getColumCount(),
            h: con.getRowCount()
          }
       );
    }


    this.worker.onmessage = function(e) {

        var m = e.data.message;
        var t = e.data.type;

        if( t == "syslog" ) {
           sys.log("BWSYS:", e.data.message );
        }
        else if( t == "syserr" ) {
           sys.logerr("BWERR:", e.data.message );
        }
        else if( t == "write" ) {
           for( var i =0; i<m.length; i++) {
             con.write( m[i] );
           }
        }
        else if( t == "writeln" ) {
          for( var i =0; i<m.length; i++) {
            con.writeln( m[i] );
          }
        }
        else if( t == "writec" ) {
          con.writec( m );

        }
        else if( t == "control" ) {
          con.control( m );
        }
        else if( t == "control2" ) {
          con.control( m.c, m.d );
        }
        else if( t == "blinkMode" ) {
          con.blinkMode( m.m );
        }
        else if( t == "locate" ) {
          con.setPos( m.c, m.r );
        }
        else if( t == "html" ) {
          htmlwrapper.execute( m );
        }
        else if( t == "htmlnode" ) {
          htmlwrapper.setnode( m[0].value );
        }
        else if( t == "displaymode" ) {
          display.setMode( m.m );
          con = display.getDriver();
          sys.out =  con;
        }
        else if( t == "textupdate" ) {

          var properties = {
            cx: m.cx,
            cy: m.cy,
            fg: m.fg,
            bg: m.bg,
          };
          sys.out.update( properties, m.areasList );
        }
        else if( t == "textupdate-all" ) {

          var properties = {
            cx: m.cx,
            cy: m.cy,
            fg: m.fg,
            bg: m.bg,
          };

          sys.out.updateAll( properties, m.cells );
        }

      }
  }

  loadApp( url0 ) {
    var sys = this.sys;

    sys.log("BSYS:","Load", url0 );
    var cb = { clazz: this, method: "loadedApp", data: null }
    this.sys.m.qfs.loadFile( url0, cb );

  }

  loadedApp( cbMessage ) {

    var sys = this.sys;
    sys.log("BSYS:","Loaded", cbMessage.args.url );
    this.out.blinkMode( false );
    this.worker.postMessage({ type: "loadpgm", pgmData: cbMessage.data.data, QPath: cbMessage.args.qpath });

  }

  setInput( input ) {

    this.sys.log("BSYS: Setting input on BAPPS.." );
    this.input = input;
    this.input.setInputHandler( this, "input" );

  }

  inputKeyHandler( kEvent ) {
    this.worker.postMessage( kEvent );
  }

}

export { KERNALMODULE as default};
