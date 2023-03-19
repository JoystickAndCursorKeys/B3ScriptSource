class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;
    this.domCtr = this.sys.domContainer;

    this.deviceId = 10;
  }

  init() {


		this.link = document.createElement("a");
    this.link.style.display = "none";
    this.domCtr.appendChild( this.link );

  }

  makeError( reason, details ) {
    return {
      success: false,
      reason: reason,
      message: details,
      fsErrorSignature: true,
    }
  }

  ready() {
    return true;
  }

  getDir() {
    throw this.makeError( "getDir", "Not Supported");

  }

  exists( fileName ) {
    return false;
  }

  saveFile( fileName, data, type, size ) {

    if( fileName.indexOf("/") >-1 ) {
      throw {
        message: "saveFile: '"+fileName+"' - invalid path, TRANSFERFS device only supports flatdir"
      }
    }

    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);

    this.link.download = fileName;
    this.link.href = url;
    this.link.click();


  }

  loadFile( fileName ) {
    return null;
  }

  deleteFile( fileName ) {
    return false;
  }

  formatDisk() {
  }

}

export { FILESYSMODULE as default};
