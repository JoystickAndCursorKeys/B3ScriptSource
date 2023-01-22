class KERNALMODULE {

  constructor( sys ) {

    this.apps = [];
    this.sys  = sys;
    this.audioInitFlag = false;

  }

  audioInit() {

    if( this.audioInitFlag ) {
      return;
    }

    var sys = this.sys;
    var audio = sys.audio;
    this.audio = audio;

    audio.channelVolume( 0, 1  );
    audio.setVolume(1);

    this.audioInitFlag = true;
  }

  init() {
    var sys = this.sys;
    var con = sys.out;

    this.cfg = this.sys.bootCfg;
    this.settings = {}; //settings set by the user, ex: the theme of the screen editor

    var htmlwrapper = sys.m.htmlwrapper;
    var display = sys.m.displaymodes;

    this.out = con;

    this.menu = sys.m.basicmenu;

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
    }

    this.sys.m.qfs.loadFile( "cache://settings.cfg", { clazz: this, method: "initMore" } );

  }

/*
  loadedApp( path, cbMessage, response ) {

    var sys = this.sys;
    sys.log("BSYS:","Loaded", cbMessage.url );
    this.out.blinkMode( false );
    this.worker.postMessage({ type: "loadpgm", pgmData: response.data, QPath: path });

  }
  */

  initMore( settingsPath, cbMessage, settingsLoadResponse ) {

    var sys = this.sys;
    var con = sys.out;
    var audio = sys.audio;
    var htmlwrapper = sys.m.htmlwrapper;
    var display = sys.m.displaymodes;
    var colors = undefined;
    if( settingsLoadResponse.success ) {
      colors = settingsLoadResponse.data.colors;
    }

    this.worker.postMessage(
        {
          type: "inittxtarea",
          w: con.getColumCount(),
          h: con.getRowCount()
        }
    );

    this.worker.postMessage(
        {
          type: "initcolors",
          colors: colors
        }
    );

    this.worker.postMessage(
        {
          type: "systeminfo",
          modes: display.getModes(),
          mode: display.getCurrentMode(),
          windowWidth: window.innerWidth,
  				windowHeight: window.innerHeight
        }
    );

    this.worker.postMessage(
        {
          type: "setcfg",
          cfg: this.cfg
        }
    );

    var hasPixels = con.hasPixels();
    var bWH = [-1,-1];
    if( hasPixels ) {
       bWH = con.getBitmapDimensions();
    }

    this.worker.postMessage(
         {
           type: "initbitmap",
           w: bWH[ 0 ],
           h: bWH[ 1 ]
         }
    );

    var _parent = this;
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
        else if( t == "border" ) {

          document.body.style.backgroundColor = con.htmlColor( m.d );

        }
        else if( t == "audio" ) {

          _parent.audioInit();

          //var audio = this.audio;
          var method = m.method;
          var parCount = m.parCount;
          if( parCount == 1 ) {
            audio[method]( m.p1 );
          }
          else if( parCount == 2 ) {
            audio[method]( m.p1, m.p2 );
          }
          else if( parCount == 3 ) {
            audio[method]( m.p1, m.p2, m.p3 );
          }
          else if( parCount == 4 ) {
            audio[method]( m.p1, m.p2, m.p3, m.p4 );
          }
          else if( parCount == 0 ) {
            audio[method]();
          }

        }
        else if( t == "blinkMode" ) {
          con.blinkMode( m.m );
        }
        else if( t == "signalHideMenu" ) {
          if( sys.m.basicmenu ) {
            console.log("signalHideMenu hideFlag=" , m.hide )
            sys.m.basicmenu.showMenu( !m.hide );
          }
        }
        else if( t == "locate" ) {
          con.setPos( m.c, m.r );
        }
        else if( t == "load" ) {
          _parent.loadAppFromProgram( this, m );
        }
        else if( t == "loaddata" ) {
          _parent.loadDataFromProgram( this, m );
        }
        else if( t == "save" ) {
          _parent.saveProgram( this, m );
        }
        else if( t == "delete" ) {
          _parent.deleteFile( this, m );
        }
        else if( t == "dir" ) {
          _parent.dir( m.path, m );
        }
        else if( t == "setfs" ) {
          _parent.setfs( m.path, m );
          _parent.menu.setStatus( null );
        }
        else if( t == "listfs" ) {
          _parent.listfs( m );
        }
        else if( t == "html" ) {
          htmlwrapper.execute( m );
        }
        else if( t == "htmlnode" ) {
          htmlwrapper.setnode( m[0].value );
        }
        else if( t == "htmldofun" ) {
          htmlwrapper.executeFunction( m );
        }
        else if( t == "displaymode" ) {
          display.setMode( m.m, _parent.menu );
          display.cursor
          con = display.getDriver();
          sys.out =  con;

          var wh = con.getDimensions();
          var hasPixels = con.hasPixels();
          var bWH = [-1,-1];

          if( hasPixels ) {
            bWH = con.getBitmapDimensions();
          }
          this.postMessage(
            {
            type: "message",
            processId: m.processId,
            message: "displaysize:done",
            messageObject:
              {
                mode: m.m,
                textW: wh[0], textH: wh[1],
                bitmapW: bWH[0], bitmapH: bWH[1],
              }
            }
            );

        }
        else if( t == "textupdate" ) {

          var properties = {
            cx: m.cx,
            cy: m.cy,
            fg: m.fg,
            bg: m.bg,
            cursorMode: m.cursorMode
          };
          sys.out.update( properties, m.areasList );
        }
        else if( t == "textupdate-all" ) {

          var properties = {
            cx: m.cx,
            cy: m.cy,
            fg: m.fg,
            bg: m.bg,
            cursorMode: m.cursorMode
          };

          sys.out.updateAll( properties, m.cells );
        }
        else if ( t == "gfxupdate" ) {
          sys.out.gfxUpdate( m );
        }
        else if ( t == "export" ) {
          if(m.destination == "disk") {
            var callback = {
              clazz: _parent,
              method: "nullHandler",
              data: ""
            }
            sys.m.qfs.saveFile("export://myprogram.bas", m.code, callback);
          }
          else {
            navigator.clipboard.writeText( m.code )
          }
        }
        else if ( t == "nativeout" ) {
          sys.out.native( m );
        }
        else if ( t == "status" ) {
          //update menu
          _parent.menu.setStatus( m.status );
        }

      }

      var _this = this;
      window.addEventListener("resize", function(event) {
        _this.windowResizeEvent( event );

      });

  }

  windowResizeEvent( event ) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    this.worker.postMessage(
      {
      type: "interrupt",
      sub: "resize",
      data:
        {
          w: w,
          h: h
        }
      }
      );

  }

  nullHandler( data )  {
    console.log( "nullhandler " + data );
  }

  loadApp( url0 ) {
    var sys = this.sys;

    sys.log("BSYS:","Load", url0 );
    sys.m.qfs.loadFile( url0, { clazz: this, method: "loadedApp" } );

  }

  pasteTextFromClipboard( block, type ) {

    if( type == "txt" ) {

      var kEvent = {
        keyLabel: "",
        shiftKey: false,
        ctrlKey: false,
        key: "",
        type: "keydown"

      }

      for ( var i = 0; i<block.length; i++) {
        var c = block.charAt( i );
        kEvent.key = c;
        if( block.charCodeAt( i ) == 10) {
          kEvent.keyLabel = "Enter";
        }
        else {
          kEvent.keyLabel = "";
        }

        this.worker.postMessage( kEvent );
      }
    }
    else {
      this.worker.postMessage(
        {
        type: "pastpgm",
        data: block
        }
        );
    }

  }

  requestClipboardCopy() {

    this.worker.postMessage({ type: "clipboardCopy" });

  }

  requestClipboardCopyScreen() {

    this.worker.postMessage({ type: "clipboardCopyScreen" });

  }

  requestColorReset( colors ) {
    this.worker.postMessage({ type: "colorReset", colors: colors });

    var callback = {
      clazz: this,
      method: "nullHandler",
      data: ""
    }
    this.settings.colors = colors;
    this.sys.fs.saveFile("cache://settings.cfg", this.settings, callback);

  }

  requestExport() {
    this.worker.postMessage({ type: "export" });
  }


  requestFileSystems() {
    var list =  this.sys.fs.listFS();
    var list2 = ["FS", ""];

    for( var i=0; i<list.length; i++) {
        var f = list[i];
        list2.push( f );
    }

    this.requestShowList( list2 );
  }

  requestListDirectory() {
    var list =  this.sys.fs.getDir( this.sys.fs.getCurrent() );
    var list2 = ["DIR", ""];

    for( var i=0; i<list.files.length; i++) {
        var f = list.files[i].fname;
        list2.push( f );
    }

    this.requestShowList( list2 );
  }

  requestListScripts() {
		console.log("I am handler_listScripts", this);

		var list =  this.sys.m.script.getDir();
		var list2 = [];

		for( var i=0; i<list.files.length; i++) {
				var f = list.files[i].fname;
				list2.push( f );
		}

		this.requestShowList( list2 );

	}


  requestAbout() {

    this.worker.postMessage({ type: "resetConsole" });

		var list = [];

    list.push( "" );
    list.push( "---------------------------" );
	  list.push( "  B3 Basic" );
    list.push( "  Version 0.9" );
    list.push( "  Copyright: " );
    list.push( "    CursorKeys Retro, 2022" );
    list.push( "---------------------------" );
    list.push( "" );


		this.requestShowList( list );

	}


  requestList() {
    this.worker.postMessage({ type: "list" });
  }

  requestRenumber() {
    this.worker.postMessage({ type: "renumber" });
  }

  requestNew() {
    this.worker.postMessage({ type: "new" });
  }

  requestVars() {
    this.worker.postMessage({ type: "vars" });
  }

  requestDataBlocks() {
    this.worker.postMessage({ type: "datablocks" });
  }

  requestHelp() {
    this.worker.postMessage({ type: "help" });
  }

  requestClearScreen() {
    this.worker.postMessage({ type: "clearScreen" });
  }

  requestResetConsole() {
    this.worker.postMessage({ type: "resetConsole" });
  }

  requestShowList( l ) {
    this.worker.postMessage({ type: "showList", list: l });
  }


  requestRun() {
    this.worker.postMessage({ type: "run" });
  }

  requestStop() {
    this.worker.postMessage({ type: "stop" });
  }

  deleteFile( worker, m ) {
    var sys = this.sys;
    var path = this.devicePath( m.device, m.path );

    try {
      sys.log("BSYS:","delete", m.path );
      sys.m.qfs.deleteFile( path,
        { clazz: this, method: "deletedFile", path: m.path, processId: m.processId })

    }
    catch ( e ) {
      console.log ( e )

      this.worker.postMessage(
        {
        type: "message",
        processId: m.processId,
        message: "delete:error",
        messageObject:
          {
            reason: e.message
          }
        }
        );

    }
  }

  deletedFile( cbMessage ) {

    var sys = this.sys;
    sys.log("BSYS:","Deleted", cbMessage.args.qpath );

    var result = "ok";
    var message = "delete:completed";
    var reason = undefined;
    if( !cbMessage.result ) {
      result = "error";
      message = "delete:error";
    }

    this.worker.postMessage(
      {
      type: "message",
      processId: cbMessage.origCallBackRecord.processId,
      message: message,
      messageObject:
        {
          status: result,
          reason: reason
        }
      }
      );

  }

  saveProgram( worker, m ) {
      var sys = this.sys;
      var path = this.devicePath( m.device, m.path );

      try {
        sys.log("BSYS:","Load", m.path );
        sys.m.qfs.saveFile( path, m.data,
          { clazz: this, method: "savedProgram", processId: m.processId })

      }
      catch ( e ) {
        console.log ( e )

        this.worker.postMessage(
          {
          type: "message",
          processId: m.processId,
          message: "save:error",
          messageObject:
            {
              reason: e.message
            }
          }
          );

      }
  }

  savedProgram( cbMessage ) {

    var sys = this.sys;
    sys.log("BSYS:","Saved", cbMessage.url );
    //this.out.blinkMode( false );

    //this.worloadAppFromProgramker.postMessage({ type: "loadpgm", pgmData: data, QPath: path });

    var result = "ok";
    if( !cbMessage.result ) {
      result = "error";
    }

    this.worker.postMessage(
      {
      type: "message",
      processId: cbMessage.origCallBackRecord.processId,
      message: "save:completed",
      messageObject:
        {
          status: result
        }
      }
      );


  }


  loadDataFromProgram( worker, m ) {

    var sys = this.sys;

    try {
      sys.log("BSYS:","Load", m.path );
      sys.m.qfs.loadFile( m.path,
        { clazz: this, method: "loadedDataFromProgram",
        processId: m.processId,
        label: m.label ,
        type: m.type
      } );
    }
    catch ( e ) {
      console.log ( e )

      this.worker.postMessage(
        {
        type: "message",
        processId: m.processId,
        message: "loaddata:error",
        messageObject:
          {
            error: e.message
          }
        }
        );

    }
  }

  devicePath( dev, path ) {

    var sys = this.sys;

    if( dev > -1 ) {
      var fs = sys.m.qfs.getFS( dev );
      if(!fs) {
        throw "No such device";
      }

      var parts = path.split("://");
      if( parts.length >1 ) {
        throw "Double device indicators";
      }
      return fs.prefix + path;
    }
    return path;
  }

  loadAppFromProgram( worker, m ) {

    var sys = this.sys;
    var path = this.devicePath( m.device, m.path );
    try {
      sys.log("BSYS:","Load", m.path );

      sys.m.qfs.loadFile( path, { clazz: this, method: "loadedAppFromProgram", processId: m.processId } );
    }
    catch ( e ) {
      console.log ( e )

      this.worker.postMessage(
        {
        type: "message",
        processId: m.processId,
        message: "load:error",
        messageObject:
          {
            reason: e.message
          }
        }
        );

    }

  }

  loadedApp( path, cbMessage, response ) {

    var sys = this.sys;
    sys.log("BSYS:","Loaded", cbMessage.url );
    this.out.blinkMode( false );
    this.worker.postMessage({ type: "loadpgm", pgmData: response.data, QPath: path });

  }


  loadedDataFromProgram( path, cbMessage, response ) {

    var sys = this.sys;
    sys.log("BSYS:","Loaded", cbMessage.url );

    if( response.success ) {
      this.worker.postMessage(
        {
        type: "message",
        processId: cbMessage.processId,
        message: "loaddata:completed",
        messageObject:
          {
            data: response.data,
            label: cbMessage.label,
            type: cbMessage.type
          }
        }
        );
      }
      else {
        this.worker.postMessage(
          {
          type: "message",
          processId: cbMessage.processId,
          message: "loaddata:error",
          messageObject:
            {
              pgmData: null,
              reason: response.reason
            }
          }
          );
      }

  }


  loadedAppFromProgram( path, cbMessage, response ) {

    var sys = this.sys;
    sys.log("BSYS:","Loaded", cbMessage.url );
    //this.out.blinkMode( false );

    //this.worloadAppFromProgramker.postMessage({ type: "loadpgm", pgmData: data, QPath: path });

    if( response.success ) {
      this.worker.postMessage(
        {
        type: "message",
        processId: cbMessage.processId,
        message: "load:completed",
        messageObject:
          {
            pgmData: response.data
          }
        }
        );
      }
      else {
        this.worker.postMessage(
          {
          type: "message",
          processId: cbMessage.processId,
          message: "load:error",
          messageObject:
            {
              pgmData: null,
              reason: response.reason
            }
          }
          );
      }

  }


  listfs( m ) {

    var list = this.sys.fs.listFS();

    this.worker.postMessage(
      {
      type: "message",
      processId: m.processId,
      message: "listfs:completed",
      messageObject:
        {
          fs: list,
          currentFs: this.sys.fs.getCurrent()
        }
      }
      );
  }

  setfs( path, m ) {

    var result = this.sys.fs.setFS( path );
    if( result ) { result = "ok"; }
    else {  result = "error" ; }

    this.worker.postMessage(
      {
      type: "message",
      processId: m.processId,
      message: "setfs:completed",
      messageObject:
        {
          status: result
        }
      }
      );
  }

  dir( path0, m ) {

    try {
      var path = this.devicePath( m.device, path0 );
      var list = this.sys.fs.getDir( path );


      this.worker.postMessage(
        {
        type: "message",
        processId: m.processId,
        message: "dir:completed",
        messageObject:
          {
            files: list.files,
            title: list.title,
            free: list.free,
            fs: list.fs
          }
        }
        );
      }
      catch ( e ) {
        console.log ( e )

        this.worker.postMessage(
          {
          type: "message",
          processId: m.processId,
          message: "dir:error",
          messageObject:
            {
              reason: e.message
            }
          }
          );

      }
  }

  setInput( input ) {

    this.sys.log("BSYS: Setting input on BAPPS.." );
    this.input = input;
    this.input.setInputHandler( this, "input" );

  }

  inputKeyHandler( kEvent ) {



    if( this.sys.m.basicmenu ) {
      /*close menu on any keppress*/
      this.sys.m.basicmenu.clearMenu();

      if( kEvent.key == "v" && kEvent.ctrlKey) {
        console.log( kEvent );
        this.sys.m.basicmenu.doAction("paste", "txt" );
        return;
      }
    }

    if( kEvent.keyLabel == "Backspace" && kEvent.ctrlKey ) {
      this.worker.postMessage({ type: "toggleMenu" });

    }
    else {
      this.worker.postMessage( kEvent );
    }
  }

}

export { KERNALMODULE as default};
