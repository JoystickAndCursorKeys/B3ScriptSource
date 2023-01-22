class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.initialized = false;
    this.sys = sys;
    this.prefix = sys.SIG + sys.SUBSYS  + "__" ;

    this.deviceId = 6;
  }

  init() {
    this.initialize();
  }

  initialize() {
    this.currentDisk = "SYS";
    this.initialized=true;
    this.privacy = this.sys.m.priv;

  }

  ready() {
    return this.initialized;
  }

  getEmptyDirStructure(name) {
    return {files:[], title: "temporary session" };
  }

  getDir( path, defaultMatcherFunction ) {

    if( !this.initialized ) {
      return getEmptyDirStructure(null);
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_dir";
    var json = sessionStorage.getItem( storageName );

    if(!json) {
      return {files:[], title: "temporary session" };
    }

    var dir = JSON.parse( json );
    if(!dir) {
      return {files:[], title: "temporary session" };
    }

    var title = dir.title;

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

    if( path != "*" && path != "" ) {

      var files2 = [];

      for( var i=0; i<dir.files.length; i++) {
        if( defaultMatcherFunction (  path, dir.files[i].fname ) ) {
          files2.push( dir.files[ i ] );
        }
      }

      dir.files = files2;
      dir.free = 32-dir.files.length;
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

    var dir = this.getDir( "", null );

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

    var dir = this.getDir("", null);

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

    var dir = this.getDir( "", null );

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

  makeError( reason, details ) {
    return {
      success: false,
      reason: reason,
      details: details,
      fsErrorSignature: true,
    }
  }

  loadFile( fileName, cbRec ) {

    if( !this.initialized ) {
      throw makeError("Filesystem not initialized");
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_" + fileName;

    var json = sessionStorage.getItem( storageName );

    if(!json) {
      throw makeError("File not found");
    }

    var data;
    try {
      data = JSON.parse( json ).data;
    }
    catch( e ) {
      throw makeError("File corrupt", e);
      return;
    }

    cbRec.clazz[ cbRec.method ]( fileName, cbRec, data );

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

    var dir = this.getDir( "", null );

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

      var dir = this.getDir( "", null);

      var disk = {
        dir: dir,
        content: []
      };

      var diskStr = JSON.stringify( disk );

      return diskStr;
    }

    var dir = this.getDir("", null);
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
