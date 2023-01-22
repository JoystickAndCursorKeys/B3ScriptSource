class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;

    this.files = [];
    this.data  = {};

    this.deviceId = 7;
  }

  init() {}

  ready() {
    return true;
  }

  getDir( path, defaultMatcherFunction ) {

    var files = this.files;

    if( path != "*" && path != "" ) {

      var files2 = [];

      for( var i=0; i<this.files.length; i++) {
        if( defaultMatcherFunction (  path, this.files[i].fname ) ) {
          files2.push( this.files[ i ] );
        }
      }

      files = files2;
    }

    return {
      title: "Ram Disk",
      files: files,
      free: 0
    }
  }

  exists( fileName ) {

    var dir = this.getDir("",null);
    var files = dir.files;

    var found = -1;
    for( var i=0; i<files.length; i++) {
      if( files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      return true;
    }
    return false;
  }

  makeError( reason, details ) {
    return {
      success: false,
      reason: reason,
      details: details,
      fsErrorSignature: true,
    }
  }

  saveFile( fileName, data, type, size ) {

    if( fileName.indexOf("/") >-1 ) {
      throw {
        message: "saveFile: '"+fileName+"' - invalid path, RAMFS device only supports flatdir"
      }
    }
    if( ! this.exists( fileName ) ) {
      var fEntry = {
        fname: fileName,
        type: type,
        size: size
      }

      this.data[ fileName ] = { type: type, data: data};
      this.files.push( fEntry );
    }

  }


  makeDataContainer( data ) {
    return {
      success: true,
      data: data
    }
  }


  loadFile( fileName, cbRec ) {

    if( ! this.exists( fileName ) ) {
      throw makeError("File not found");
    }

    var response =
      this.makeDataContainer(
        this.data[ fileName ].data
      );

    cbRec.clazz[ cbRec.method ]( fileName, cbRec, response );

    //return this.data[ fileName ];

  }

  deleteFile( fileName ) {

    if( ! this.exists( fileName ) ) {
      return false;
    }

    try {
      var files = this.files;
      var files2 = [];

      for( var i=0; i<files.length; i++) {
        if( files[i].fname != fileName ) {
          files2.push( files[i] );
        }
      }

      this.data[ fileName ] = undefined;
      this.files = files2;
    }
    catch ( e ) {
      throw {
        message: "deleteFile: '" + fileName + "' - " + e.message
      }
    }
    return true;
  }

  formatDisk() {

    this.files = [];
    this.data  = {};

  }

}

export { FILESYSMODULE as default};
