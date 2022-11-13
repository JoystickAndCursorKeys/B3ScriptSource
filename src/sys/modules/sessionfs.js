class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.initialized = false;
    this.sys = sys;
    this.prefix = sys.SIG + "__" ;
  }

  init() {
    this.initialize();
  }

  initialize() {
    this.currentDisk = "SYS";
    this.initialized=true;
  }

  ready() {
    return this.initialized;
  }

  getEmptyDirStructure(name) {
    return {files:[], title: "null" };
  }

  getDir() {

    if( !this.initialized ) {
      return getEmptyDirStructure(null);
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_dir";
    var json = sessionStorage.getItem( storageName );
    var dir = JSON.parse( json );

    //var title = "0 \u0012\""+dir.title+"          \"\u0092 00 2A";
    var title = dir.title;

    if(!json) {
      return {files:[], title: title };
    }
    dir.title = title;
    dir.free = 32-dir.files.length;

    var foundNullIx = -1;

    while( true ) {
      for( var i=0; i<dir.files.length; i++) {
        if( dir.files[i] == null) {
          foundNullIx = i;
          break;
        }
      }
      if( foundNullIx > -1) {
        dir.files.splice( foundNullIx, 1 );
        foundNullIx = -1;
      }
      else {
        break;
      }
    }
    return dir;

  }


  setDir( dir ) {


    if( this.privacy.confirmLocalStorage() == false ) { return ; }

    if( !this.initialized ) {
      return;
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_dir";

    sessionStorage.setItem(storageName, JSON.stringify( dir ) );

  }

  existsFile( fileName ) {

    if( !this.initialized ) {
      return false;
    }

    var dir = this.getDir();

    var found = -1;
    for( var i=0; i<dir.files.length; i++) {
      if( dir.files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      return true;
    }
    return false;
  }


  removeFromDir( fileName ) {

    if( !this.initialized ) {
      return;
    }

    var dir = this.getDir();

    var found = -1;
    for( var i=0; i<dir.files.length; i++) {
      if( dir.files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      dir.files.splice( i, 1 );
    }
    this.setDir(dir);
  }

  updateDir( fileName, programLen, type ) {

    if( !this.initialized ) {
      return;
    }

    var dir = this.getDir();

    var found = -1;
    for( var i=0; i<dir.files.length; i++) {
      if( dir.files[i].fname == fileName ) {
        found  = i;
        break;
      }
    }

    if( found > -1 ) {
      dir.files[i].size = programLen;
      dir.files[i].type = type;
    }
    else {
      dir.files.push( {fname: fileName, size: programLen, type: type } );
    }
    this.setDir(dir);
  }


  saveFile( fileName0, data, type, length ) {

    if( !this.initialized ) {
      return false;
    }

    if( this.privacy.confirmLocalStorage() == false ) { return false; }

    var fileName = fileName0;
    if( fileName0.length > 32) {
        fileName = fileName0.substr(0,32);
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_" + fileName;

    var container = JSON.stringify( { type: type, data: data} );
    sessionStorage.setItem(storageName, container );

    this.updateDir( fileName, length, type );

    return true;
  }

  loadFile( fileName ) {

    if( !this.initialized ) {
      return null;
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_" + fileName;

    var json = sessionStorage.getItem( storageName );

    return JSON.parse( json );
  }

  deleteFile( fileName ) {
    if( ! this.existsFile( fileName ) ) {
      return "no such file";
    }

    try {
      this.removeFromDir( fileName );
      this._removeFile( fileName );
    }
    catch ( e ) {
      return "unexpected";
    }
    return "ok";
  }

  _removeFile( fileName ) {

    var storageName =  this.prefix + "" +
      this.currentDisk + "_" +
      fileName;

    sessionStorage.removeItem( storageName );

  }

  formatDisk() {

    var dir = this.getDir();

    for( var i=0; i<dir.files.length; i++) {

        var fileName = dir.files[i].fname;
        this._removeFile( fileName );

    }

    dir.files = [];
    dir.title = "Empty"
    this.setDir( );

  }


  getFullDisk() {

    if( !this.initialized ) {

      var dir = this.getDir();

      var disk = {
        dir: dir,
        content: []
      };

      var diskStr = JSON.stringify( disk );

      return diskStr;
    }

    var dir = this.getDir();
    var content = [];

    for( var i=0; i<dir.files.length; i++) {
        var fileName = dir.files[i].fname;
        var storageName =  this.prefix + "" + this.currentDisk + "_" + fileName;
        var json = sessionStorage.getItem( storageName );
        content.push( { fname: fileName ,content: json} );
    }

    var disk = {
      dir: dir,
      content: content
    };

    var diskStr = JSON.stringify( disk );

    console.log( diskStr );

    return diskStr;
  }

}

export { FILESYSMODULE as default};
