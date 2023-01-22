class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;

    this.files = [];
    this.data  = {};
    this.deviceId = 1;

  }

  init() {}

  ready() {
    return true;
  }

  exists( fileName ) {

    var el = document.getElementById( fileName );

    if( el ) {
      return true;
    }
  }

  saveFile( fileName, data, type, size ) {

    throw { message: "saveFile '"+fileName+"' - SCRIPTURL is readonly" }

  }

  makeDataContainer( data ) {
    return {
      success: true,
      data: data
    }
  }

  loadTextFromURL( url, cb ){
      // read text from URL location
      var request = new XMLHttpRequest();
      var _this = this;

      request.onreadystatechange = function () {
          if (request.readyState === 4 && request.status === 200) {

              _this.loadedFile( url, cb, _this.makeDataContainer( request.responseText ) );
          }
      }
      request.overrideMimeType("text/plain");
      request.open('GET', url, true);
      request.send(null);
  }


  makeError( reason, details ) {
    return {
      success: false,
      reason: reason,
      details: details,
      fsErrorSignature: true,
    }
  }

  loadFile( fileName, cbRec ) {

    if( ! this.exists( fileName ) ) {
      throw makeError("File not found");
    }

    var el = document.getElementById( fileName );

    if( el.innerText.trim() == "" ) {

      var found = false;
      if( el.src ) {
        if( el.src != "" ) {
          found = true;
        }
      }
      if(! found ) {
          return { type: "bas", data: "10 print \"?program not found error\"" };
      }

      this.loadTextFromURL( el.src, cbRec );


    }
    else {

      var lines = el.innerText.split("\n");
      var data = "";
      for( var i=0; i<lines.length; i++) {
        if( data != "") { data += "\n"; }
        data+= lines[ i ].trim();
      }

      cbRec.clazz[ cbRec.method ]( fileName, cbRec, this.makeDataContainer( data ) );

      /*

        loadFile( path, cb )
        loadedFile( path, cb, data )
      */

    }

  }

  loadedFile( fileName, cbRec, data) {
    cbRec.clazz[ cbRec.method ]( fileName, cbRec, data );
  }

  getDir( path, defaultMatcherFunction ) {
    var scriptsDom = document.getElementsByTagName("script");
    var scripts = [];

    for( var i=0; i<scriptsDom.length; i++) {
      var item = scriptsDom.item(i);
      //if(item.type == "text/basic" ) {
        console.log( item.attributes.id );
        var id = item.attributes.id.nodeValue;

        scripts.push(  { fname: id } );
    }

    if( path != "*" && path != "" ) {

      var files2 = [];

      for( var i=0; i<scripts.length; i++) {
        if( defaultMatcherFunction (  path, scripts[i].fname ) ) {
          files2.push( scripts[ i ] );
        }
      }

      scripts = files2;
    }

    return {files:  scripts, title: "page scripts", free: 0 };

  }

  deleteFile( fileName ) {

    throw { message: "SCRIPTURL is readonly" }

  }

  formatDisk() {

    throw { message: "formatDisk '"+fileName+"' - SCRIPTURL is readonly" }

  }

}

export { FILESYSMODULE as default};
