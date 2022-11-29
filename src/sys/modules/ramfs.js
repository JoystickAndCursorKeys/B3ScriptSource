class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;

    this.files = [];
    this.data  = {};

  }

  init() {}

  isASynch() {
    return false;
  }

  ready() {
    return true;
  }

  getDir() {
    return this.files;
  }

  exists( fileName ) {

    var files = this.getDir();

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

  loadFile( fileName ) {

    if( ! this.exists( fileName ) ) {
      return null;
    }

    return this.data[ fileName ];

  }

  deleteFile( fileName ) {

    if( ! this.existsFile( fileName ) ) {
      return false;
    }

    try {
      var files = this.files;

      for( var i=0; i<files.length; i++) {
        if( files[i].fname == fileName ) {
          files[ i ] = undefined;
          break;
        }
      }

      this.data[ fileName ] = undefined;
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