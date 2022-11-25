
importScripts("sys.js");

sys.log("Starting");

try {
  importScripts(
    "../rwbuffers/worker/textarea.js",
    "../rwbuffers/worker/bitmap.js",    
    "processes.js",
    "basictokenizer.js",
    "basicparser.js",
    "basicerrorhandler.js",
    "basiccommands.js",
    "extendedcommands.js",
    "basicarray.js",
    "nulleditor.js",
    "basicruntime.js",
    "input.js",
    "pgmmanager.js"
  );
}
catch ( e ) {
  sys.logerr("INIT ERROR: Could not import dependencies");
  sys.logerr( e.message + " at " + e.filename + ":" + e.lineNumber  );
}

start_sys();
