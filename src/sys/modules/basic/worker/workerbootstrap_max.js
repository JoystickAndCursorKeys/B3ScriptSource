
importScripts("sys.js");

sys.log("Starting");

try {
  importScripts(
    "processes.js",
    "basictokenizer.js",
    "basicparser.js",
    "basicerrorhandler.js",
    "basiccommands.js",
    "extendedcommands.js",
    "basicarray.js",
    "editor.js",
    "basicruntime.js",
    "input.js",
    "pgmmanager.js"
  );

  sys.log("Init RWBuffers");

  importScripts(
    "../../rwbuffers/worker/textarea.js"
  );
}
catch ( e ) {
  sys.logerr("INIT ERROR: Could not import dependencies");
  sys.logerr( e.message + " at " + e.filename + ":" + e.lineNumber  );
}

start_sys();
