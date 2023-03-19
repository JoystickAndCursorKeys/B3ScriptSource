class LIB {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;

    this.files = [];
    this.data  = {};
    this.prefix = "";

  }

  init() {}

  ready() {
    return true;
  }

  exists( fileName ) {

    throw this.makeError( "Exists error", "Not yet implemented");
  }

  saveFile( fileName, data, type, size ) {

    throw this.makeError( "saveFile error", "Not supported");
  }

  makeError( reason, details ) {
    return {
      success: false,
      reason: reason,
      message: details,
      fsErrorSignature: true,
    }
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
          else if (request.readyState === 4 && request.status != 200) {
            _this.loadedFile( url, cb,
              _this.makeError( "File not found ("+request.status+")", request.status ) );
          }
      }
      request.overrideMimeType("text/plain");
      request.open('GET', this.prefix + url, true);
      request.send(null);
  }



  loadFile( fileName, cbRec ) {

      this.loadTextFromURL( fileName, cbRec );

  }

  loadedFile( fileName, cbRec, response) {
    cbRec.clazz[ cbRec.method ]( fileName, cbRec, response );
  }

  getDir() {
    throw this.makeError( "getDir error", "Not supported");

  }

  deleteFile( fileName ) {

    throw this.makeError( "deleteFile error", "Not supported");

  }

  formatDisk() {

    throw this.makeError( "formatDisk error", "Sorry dave, but I cannot allow you to format the internet :)");

  }

}

export { LIB as default};
