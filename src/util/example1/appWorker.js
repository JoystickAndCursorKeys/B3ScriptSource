var fileTest;

function init() {
  sys.log( "Initiated. Home=" + sys.getAppHome() );
  sys.log( "Initiated. Name=" + sys.getAppName() );

  fileTest = sys.load("test.bas");
  sys.log("Save now");
  sys.save("test2.bas","print hello world", "bas");
  sys.log("Save message sent");

}


function handleLFSEvent( event, eventReason, fId, data ) {

  if( event == "loaded" ) {
    sys.log("Loaded" + fId + " data=" + data);
  }
  else if( event == "loaderror" ) {
    sys.log("Load Error: " + eventReason);
  }
  if( event == "saved" ) {
    sys.log("Saved" + fId + " data=" + data);
  }
  else if( event == "saveerror" ) {
    sys.log("Saved Error: " + eventReason);
  }

}
