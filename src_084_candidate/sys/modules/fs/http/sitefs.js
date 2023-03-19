import  HTTPLib   from        './httplib.js';

class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }

    this.lib = new HTTPLib( sys );
    this.deviceId = 2;
  }

  init() {}

  ready() {
    return true;
  }

  exists( fileName ) {

    return this.lib.exists( fileName );

  }

  saveFile( fileName, data, type, size ) {

    this.lib.saveFile( fileName, data, type, size );

  }


  loadFile( fileName, cbRec ) {

    this.lib.loadFile( fileName, cbRec );

  }

  getDir() {
    return this.lib.getDir();
  }

  deleteFile( fileName ) {
    this.lib.deleteFile( fileName );
  }

  formatDisk() {

    this.lib.formatDisk();
  }

}

export { FILESYSMODULE as default};
