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


  sys.setDisplayMode = function( rt, m ){
    post( "displaymode", { processId: rt.processId, m:m } );
  }

  sys.blinkMode = function( m ){
    post( "blinkMode", { m:m } );
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

  sys.export = function( code ) {
    post( "export", { code: code } );
  }

}

function start_sys() {
  sys.log("Starting wsys");

  sys.processes = new processes( sys );
  sys.input = new Input( sys );
  sys.out = new TextArea( sys );
  sys.bout = new BitMap( sys );

  /* APPLICATION */

  /* HANDLERS */
  self.onmessage = function( obj ) {

      try {
        var data = obj.data;

        if( data.type == "keydown" ) {

          sys.input.inputKeyHandler( data );

        }
        else if( data.type == "message") {
          var id = data.processId;
          var runtime = sys.processes.get( id );

          runtime.receiveMessage( data.message, data.messageObject );

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

          pgmman.addRuntime( runtime );


        }
        else if( data.type == "inittxtarea" ) {

          sys.log( "init with: " + JSON.stringify( data ) )
          sys.out.attach( data.w, data.h );

        }
        else if( data.type == "initbitmap" ) {

          sys.log( "init with: " + JSON.stringify( data ) )
          sys.bout.attach( data.w, data.h );

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
