const staticLoading = false;

import  BootSys   from        './bootsys.js';
boot = new BootSys( staticLoading );
var sys = boot.getSys();


try {
  boot.folder = BOOT_FOLDER;

}
catch {
  try {
    boot.folder = boot.rootScript.getAttribute('src');
    boot.folder = boot.folder.substr(0,boot.folder.lastIndexOf( "/" ))
    sys.folder = boot.folder;
  }
  catch ( e ) {
    alert( "HALT: Boot folder not found!!");
    throw "HALT - Neither root-script-attribute 'boot' or constant 'BOOT_FOLDER' defined.";
  }
}

/* Get the boot script */

try {
  boot.onReady = BOOT_ONREADY;
}
catch {
  try {
    var script = boot.rootScript.dataset.script;
    if( script == null ) { script = "autorun.bas"; }
    boot.onReady = "script://" + script;
  }
  catch ( e ) {
    alert( "HALT: Boot-Onready Handler not found!!");
    throw "HALT - Neither root-script-attribute 'basScript' or constant 'BOOT_ONREADY' defined.";
  }
}

sys.getModuleHTMLAssetFolder = ( folder ) => {

  var last = folder.lastIndexOf('/');
  if( last == -1 ) { return null }

  return boot.folder + "/" + folder.substr(0,last);
}

boot.panic = ( moduleName, modulePath, lineNumber, exception, message0, pid ) => {

  console.log( "KERNEL PANIC", exception );
  var message = message0;
  if( (typeof exception ).toLowerCase() == "string") {
     message = exception;
  }

  boot.log( "Kernel module FATAL '"+ message + "': [" + moduleName + "] path: " + modulePath + ":" + lineNumber );
  boot.log( "Kernel PANIC, code=" + pid );
  boot.log( "BOOT HALT" );
  throw "HALT";
}

boot.errorDump = ( moduleName, modulePath, lineNumber, exception, message, edid ) => {

  console.log( "KERNEL MODULE ERROR DUMP", exception );

  boot.log( "Kernel module FATAL'"+ message + "': [" + moduleName + "] path: " + modulePath + ":" + lineNumber );
  boot.log( "Kernel ERRDUMP, code=" + edid );

}

boot.functionDump = ( f ) => {

    console.log("Function Dump",f);
    boot.log( "Function detail typeof: "+(typeof f)+"." );
    boot.log( "Function more detail see console");

}

boot.loadScript = (name, url0, loadedHandler, destination, dependencies ) => {

   boot.log( "Loading "+name+" on " + url0 + " as " + destination );

   console.log("LOADSCRIPT: " + destination );
   var instance = null;

   var url = "./modules/" + url0 ;
   import(url)
   .then((module) => {
     try {
        console.log("LOADED SCRIPT: " + destination );
        boot.log( "Initializing "+name+"." );

        instance = new module.default( sys, dependencies );

        boot.log( "Initialized "+name+"." );

        boot.log( "destination=" + destination );
        if( destination ) {
          boot.m[destination] = instance;
        }
        if( loadedHandler ) {
            loadedHandler( "loaded", instance );
        }

        if( destination ) {
          sysInit( destination + "#after" );
        }


        boot.log( "Initialized "+name+"." );

        console.log(
            "nextFromSequence -> (whatever comes after '" +
            destination +
            "')" );

        boot.nextFromSequence();

     }
     catch ( e ) {
      boot.panic(
        name, url, e.lineNumber, e,
        "Cannot start module-script: " + e.message,
        "B001"
      );

      return;
     }



   })
   .catch( err => {
      if( err == "HALT" ) { return; }

      boot.panic(
        name, url, err.lineNumber, err,
        "Cannot load module-script: " + err.message,
        "B002"
      );
   });

  return;
};


function sysInit( stage ) {

  console.log("SYSINIT:" + stage );
  if( stage == "tablecon#after" || stage == "canvas#after"  ) {

    if( !boot.bootDebug ) {
      sys.nulcon = [];
    }

  }
  else if( stage == "final" ) {

      sys.init.queuedMessages = sys.nulcon;
      sys.init.displayMode = boot.displayMode;
      sys.init.queuedMessages = sys.nulcon;

      sys.m.displaymodes.setMode( boot.displayMode );

      var con = sys.m.displaymodes.getDriver();
      boot.out = con;
      sys.out =  con;
      sys.input = boot.m.domelinput;
      boot.input = boot.m.domelinput;
      sys.nulcon = undefined;

      var mods = Object.getOwnPropertyNames( boot.m );
      console.log(mods);
      for( var i=0;i<mods.length;i++) {
        console.log("init " + mods[ i ] );
        boot.m[ mods[i] ].init();
      }

      //boot.m.domelinput.init( boot.out.getElement() );
      console.log( "boot.basic=",boot.basic );
      boot.m.basic.setInput( boot.input );
      boot.m.basic.loadApp(  boot.onReady );
  }
}







boot.nextFromSequence = function() {

  var curSeqId = boot.seqIx;
  console.log(" nextFromSequence: " + curSeqId );
  var step = { name: "Unknown"};

  try {
    if( boot.seqIx >= boot.sequence.length ) {
      boot.log( "Core Boot sequence completed.");
      sysInit("final");
      return;
    }

    step = boot.sequence[ boot.seqIx ];

    if( step.destination ) {
      sysInit( step.destination + "#before" );
    }

    console.log( typeof f );
    if( (typeof step) == "object") {
      console.log("BOOT MODULE");
      var o = step;
      boot.loadScript(o.name, o.url, null, o.destination, o.dependencies );
      console.log( "DEP",o.dependencies );
    }
    else {
        console.log("BOOT FUNCTION");
        step();
        if( step.destination ) {
          sysInit( step.destination + "#after" );
        }
    }
    boot.seqIx++;
  }
  catch ( e ) {
    boot.logerr( "Core Boot sequence interupted at: " + curSeqId  + " (" + step.name + ")" );
    boot.logerr( "Exception: " +
      e.message
      + " at "+ e.lineNumber  );

    console.log( e );

  }
}

/*
var taout = {
  name: "TA-OUT Device", url: "taout.js",  destination: "taout"
};
*/

var tablecon = {
  name: "TableCon Device", url: "tablecon.js",  destination: "tablecon"
};

var canvas = {
  name: "Canvas Device", url: "canvas.js",  destination: "canvas"
};

var simplewarning = {
  name: "Warning Device", url: "simplewarning.js",  destination: "simplewarning"
};

var priv = {
  name: "Privacy Policy", url: "privwarning.js",  destination: "priv"
};

var sfs = {
  name: "SESSION Device", url: "sessionfs.js",  destination: "sfs"
};

var lfs = {
  name: "LFS Device", url: "lfs.js",  destination: "lfs"
};

var ramfs = {
  name: "RAMFS Device", url: "ramfs.js",  destination: "ramfs"
};

var scripturl = {
  name: "SCRIPTURL Device", url: "scripturl.js",  destination: "script"
};

var qfs = {
  name: "QFS Device", url: "qfs.js",  destination: "qfs", dependencies: [ "ramfs", "lfs", "sfs", "script" ]
};

var mutedinput = {
  name: "Muted Input Handler", url: "mutedinput.js",  destination: "mutedinput"
}

var domelinput = {
  name: "DOM-Element Input Handler", url: "domelinput.js",  destination: "domelinput"
}

var htmlwrapper = {
  name: "HTML-Wrapper", url: "htmlwrapper.js",  destination: "htmlwrapper"
}

var displaymodes = {
  name: "Display-Modes", url: "displaymodes.js",  destination: "displaymodes"
}

var apps = {
  name: "App Handler", url: "apps/apps.js",  destination: "apps"
}

var basicapps = {
  name: "BASIC App Handler", url: "basic/apps.js",  destination: "basic"
}

boot.sequence = [
    displaymodes,
    //taout,
    tablecon,
    canvas,
    simplewarning,
    mutedinput,
    domelinput,
    priv,
    lfs,
    sfs,
    ramfs,
    scripturl,
    qfs,//
    htmlwrapper,
    basicapps
  ];

var basic = {};
basic.go = function(x) {
  console.log("Basic" + x)
}

boot.seqIx = 0;
boot.initSimpleLogging();
boot.nextFromSequence();
