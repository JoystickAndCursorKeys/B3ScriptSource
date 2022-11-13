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

  exists( fileName ) {

    var el = document.getElementById( fileName );

    if( el ) {
      return true;
    }
  }

  saveFile( fileName, data, type, size ) {

    throw { message: "saveFile '"+fileName+"' - SCRIPTURL is readonly" }

  }

  loadFile( fileName ) {

    if( ! this.exists( fileName ) ) {
      return null;
    }


    var el = document.getElementById( fileName );

    var lines = el.innerText.split("\n");
    var data = "";
    for( var i=0; i<lines.length; i++) {
      if( data != "") { data += "\n"; }
      data+= lines[ i ].trim();
    }

    return { type: "bas", data: data };

  }

  deleteFile( fileName ) {

    throw { message: "deleteFile '"+fileName+"' - SCRIPTURL is readonly" }

  }

  formatDisk() {

    throw { message: "formatDisk '"+fileName+"' - SCRIPTURL is readonly" }

  }

}

export { FILESYSMODULE as default};
