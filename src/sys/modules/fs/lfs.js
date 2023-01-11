class FILESYSMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.initialized = false;
    this.sys = sys;
    this.prefix = sys.SIG + "_" + sys.SUBSYS + "__" ;

    console.log( "FILESYSMODULE lfs: " + this.prefix );

  }

  makeDataContainer( data ) {
    return {
      success: true,
      data: data
    }
  }

  init() {
    this.initialize();
  }

  initialize() {

    this.privacy = this.sys.m.priv;

    this.disks = [];
    this.currentDisk = null;
    var defaultDisk = "0001"

    var json = localStorage.getItem( this.prefix + "disks_list" );
    if( json == null ) {

      var diskId = "0001";
      var diskName = "Default";
      this.disks = [ diskId ];
      this.currentDisk = diskId;
      this.lastDisk = 1;
      this.disksNotInitialized = true;

      if( this.privacy.confirmLocalStorage() == true ) {
        localStorage.setItem( this.prefix + "disks_list", JSON.stringify( this.disks ) );
        localStorage.setItem( this.prefix + "0001_dir", JSON.stringify( {files:[], title: diskName, readOnly: false } ) );
        localStorage.setItem( this.prefix + "disk_current", diskId );

        this.formatDisk();
      }
    }
    else {
      this.disks = JSON.parse( json );
      this.currentDisk = localStorage.getItem( this.prefix + "disk_current" );

      var last = -1;
      for( var i=0; i<this.disks.length; i++) {
        if( parseInt( this.disks[i] ) > last ) {
          last = parseInt( this.disks[ i ] );
        }
      }
      this.lastDisk = last;
    }


    this.initialized=true;

  }


  selectDisk( diskId ) {
    this.currentDisk = diskId;

    if( this.privacy.confirmLocalStorage() == true ) {
      localStorage.setItem( this.prefix + "disk_current", diskId );
    }
  }

  ready() {
    return this.initialized;
  }


  getDisks() {

    if( !this.initialized ) {
      return [];
    }

    var storageName =  this.prefix + "disks_list";
    var json = localStorage.getItem( storageName );
    var disks = JSON.parse( json );

    return disks;

  }

  getEmptyDirStructure(name) {
    return {files:[], title: "null" };
  }

  getDir( path, defaultMatcherFunction ) {

    if( !this.initialized ) {
      return this.getEmptyDirStructure(null);
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_dir";
    var json = localStorage.getItem( storageName );
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

    if( !this.initialized ) {
      return;
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_dir";

    if( this.privacy.confirmLocalStorage() == true ) {
      localStorage.setItem(storageName, JSON.stringify( dir ) );
    }

  }

  existsFile( fileName ) {

    if( !this.initialized ) {
      return false;
    }

    var dir = this.getDir("", null );

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
      return;
    }

    var fileName = fileName0;
    if( fileName0.length > 32) {
        fileName = fileName0.substr(0,32);
    }

    if( fileName.startsWith("$/") ) {
      fileName = fileName.substr( 2 );
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_" + fileName;

    //save pgm
    var container = JSON.stringify( { type: type, data: data} );
    if( this.privacy.confirmLocalStorage() == true ) {
      localStorage.setItem(storageName, container );
      this.updateDir( fileName, length, type );

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

  loadFile( fileName0, cbRec ) {

    var makeError = this.makeError;

    if( !this.initialized ) {
      throw makeError("Filesystem not initialized");
    }

    var fileName = fileName0;

    if( fileName == "*" )  {
        var dir = this.getDir("",null);
        if( dir.files ) {
          if( dir.files.length > 0) {
            if( dir.files[0]) {
              fileName = dir.files[0].fname;
            }
          }
        }
    }

    var storageName =  this.prefix + "" + this.currentDisk + "_" + fileName;

    var json = localStorage.getItem( storageName );
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

    cbRec.clazz[ cbRec.method ]( fileName0, cbRec, this.makeDataContainer( data ) );

  }

  deleteFile( fileName ) {
    if( ! this.existsFile( fileName ) ) {
      throw "no such file";
    }

    try {
      this.removeFromDir( fileName );
      this._removeFile( fileName );
    }
    catch ( e ) {
      throw "unexpected ("+e.message+")";
    }
    return true;
  }

  _removeFile( fileName ) {

    var storageName =  this.prefix + "" +
      this.currentDisk + "_" +
      fileName;

    localStorage.removeItem( storageName );

  }

  formatDisk() {

    var dir = this.getDir("", null);

    for( var i=0; i<dir.files.length; i++) {

        var fileName = dir.files[i].fname;
        this._removeFile( fileName );

    }

    dir.files = [];
    dir.title = "Empty"
    this.setDir( );

  }

  createDiskFromImage( name, image ) {

    this.createDiskFromImage2( name, image, false );

  }

  createSysDiskFromImage( image ) {

    this.createDiskFromImage2( "SYS", image, true );

  }

  createDiskFromImage2( name, image, sysDisk ) {

    if( this.privacy.confirmLocalStorage() == false ) { return ; }

    var labl;
    if( !sysDisk ) {
      this.lastDisk++;
      labl = "" + this.lastDisk;
    }
    else {
      labl = "" + 1;
    }

    labl = labl.padStart( 4,"0");
    var dir = image.dir;
    var content = image.outtent;

    var storageName =  this.prefix + "" + labl + "_dir";


    localStorage.setItem(storageName, JSON.stringify( dir ) );


    for( var i=0; i<content.length; i++) {
        var fileName = content[i].fname;
        var storageName =  this.prefix + "" + labl + "_" + fileName;
        localStorage.setItem( storageName, content[i].outtent );
    }

    this.disks.push( labl );
    localStorage.setItem( this.prefix + "disks_list", JSON.stringify( this.disks ) );

  }

  createDisk() {

    if( this.privacy.confirmLocalStorage() == false ) { return ; }
    var existingDisks = this.getDisks();
    this.lastDisk ++;
    var labl = "" + this.lastDisk;
    labl = labl.padStart( 4,"0");

    var newDir = this.getEmptyDirStructure("NEW DISK");

    var storageName =  this.prefix + "" + labl + "_dir";
    localStorage.setItem(storageName, JSON.stringify( newDir ) );

    this.disks.push( labl );
    localStorage.setItem( this.prefix + "disks_list", JSON.stringify( this.disks ) );

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
        var json = localStorage.getItem( storageName );
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
