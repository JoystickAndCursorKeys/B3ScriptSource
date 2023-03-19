class FILESYSMODULE {

  /* QFS - Qualified file system */
  /* Qualified paths can be used to find files on other file system*/
  constructor( sys, dependencies ) {
    if(!sys) {
      throw "sys expected";
    }
    if(!dependencies) {
      throw "dependencies expected";
    }

    this.dependencies = dependencies;
    this.initialized = false;
    this.sys = sys;
    this.defaultFS = sys.bootCfg.fs.default;
    this.currentFS = this.defaultFS;

    this.validCharacters =
      "abcdefghijklmnopqrstuvwxyz" +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "0123456789+-._";

  }

  init() {
    this.initialize();
  }

  initialize() {

    this.fsList = [];
    var dependencies = this.dependencies;

    for( var i=0; i< dependencies.length; i++) {
        var fsToken = dependencies[i];
        var fs = {
          token: fsToken,
          fs: this.sys.m[ fsToken ],
          prefix: fsToken + "://",
          device: this.sys.m[ fsToken ].deviceId
        }
        this.fsList.push( fs );
    }

     this.initialized = true;
  }

  matcher( matchString, fileName ) {
    if( matchString.endsWith( "*" ) ) {
      var newMatchString = matchString.substr( 0, matchString.length - 1 );
      if( fileName.startsWith( newMatchString )) {
        return true;
      }
    }
    else if( matchString.startsWith( "*" ) ) {
      var newMatchString = matchString.substr( 1 );
      if( fileName.endsWith( newMatchString )) {
        return true;
      }
    }

    return false;
  }

  getCurrent() {
    return this.currentFS;
  }

  getFSByDevId(deviceId) {

      var fsList = this.fsList;

      for( var i=0; i< fsList.length; i++) {
          var fs = fsList[i];
          if( fs.device == deviceId ) {
            return fs;
          }
      }
      return null;
  }

  checkFS( qpath0 ) {

    if( (typeof qpath0 ).toLowerCase() == "number" ) {
        return this.getFSByDevId(qpath0);
    }

    var qpath = qpath0;
    var fsList = this.fsList;

    if( qpath.split("://").length == 1 ) { //no prefix
      qpath = qpath0 + "://";
    }

    for( var i=0; i< fsList.length; i++) {
        var fs = fsList[i];
        if( qpath.startsWith( fs.prefix ) ) {
          return fs;
        }
    }
    return null;
  }

  setFS( path ) {

    var fs;

    fs = this.checkFS(path);

    if( ! fs ) {
      return false;
    }
    this.currentFS = fs.token;
    return true;
  }

  listFS() {
    var list = [];
    var fsList = this.fsList;

    for( var i=0; i< fsList.length; i++) {
        var fs = fsList[ i ];
        list.push( {
          name: fs.prefix,
          device: fs.device

        } ) ;
    }

    list.sort((a, b) => (a.device > b.device) ? 1 : -1)

    return list;
  }

  ready() {
    return this.initialized;
  }

  getFS( qpath ) {

    if( (typeof qpath ).toLowerCase() == "number" ) {
        return this.getFSByDevId(qpath);
    }

    var fsList = this.fsList;

    if( qpath.split("://").length == 1 ) { //no prefix
      for( var i=0; i< fsList.length; i++) {
          var fs = fsList[i];
          if( (this.currentFS + "://") == fs.prefix ) {
            return fs;
          }
      }
    }

    for( var i=0; i< fsList.length; i++) {
        var fs = fsList[i];
        if( qpath.startsWith( fs.prefix ) ) {
          return fs;
        }
    }

    //this.currentFS

    return null;
  }

  getLPath( qpath ) {
    if( (typeof qpath ).toLowerCase() == "number" ) {
      return "";
    }
    var parts = qpath.split("://");
    if( parts.length <2 ) { return qpath; }
    return parts[ 1 ];
  }

  getDir( qpath ) {

    if( !this.initialized ) {
      return {
        files: [],
        title: "null",
        free: -1,
        fs: "?"
      };
    }

    var fsRecord = this.getFS( qpath );

    if( !fsRecord ) {
      return {
        files: [],
        title: "null",
        free: -1,
        fs: "?"
      };
    }
    var result = fsRecord.fs.getDir( this.getLPath( qpath), this.matcher );
    result.fs = fsRecord.prefix;
    return result;
  }

  existsFile( qpath ) {

    if( !this.initialized ) {
      return false;
    }

    return false;
  }

  checkFileName( f ) {
    for( var i=0; i<f.length; i++ ) {
      var c = f.charAt(i);
      if( this.validCharacters.indexOf( c ) < 0 ) {
        return false;
      }
    }
    return true;

  }

  doCallBack( callback, callBackResponse ) {

    if( callback.clazz )  {

        if( callback.data ) {
          callBackResponse.cbData = callback.data;
        }
        callback.clazz[ callback.method ]( callBackResponse );

    }
    else {
        callback( callBackResponse );
    }


  }

  saveFile(
      /*mandatory*/ qpath0, data, callRecord,
      /*optional*/ type, length ) {

    if( !this.initialized ) {
      return null;
    }

    var qpath = qpath0.toLowerCase();

    var fsRecord = this.getFS( qpath );
    if( !fsRecord ) {
      throw { message: qpath + " has unknown file system" };
    }

    var lpath = this.getLPath( qpath );
    if( !lpath ) {
      throw { message: "QPath '" + qpath + "' has no local path" };
    }

    if( !this.checkFileName( lpath ) ) {
      throw { message: "path '" + lpath + "' has invalid characters" };
    }

    var result = fsRecord.fs.saveFile( lpath, data, type, length );

    var args = {};
    args.qpath = qpath;
    args.type = type;
    args.length = length;


    var callBackResponse = { result: result, args: args, origCallBackRecord: callRecord };

    this.doCallBack( callRecord, callBackResponse );

    return null;

  }

  makeError( reason, details ) {
    return {
      success: false,
      reason: reason,
      details: details,
      fsErrorSignature: true,
    }
  }


  loadFile( qpath0 , callRecord  ) {

    var qpath = qpath0.toLowerCase();

    var cbRec = callRecord;
    var makeError = this.makeError;

    if( !this.initialized ) {

      cbRec.clazz[ cbRec.method ]( qpath, cbRec , makeError("Not Initialized") );

      return;
    }

    var fsRecord = this.getFS( qpath );

    if( !fsRecord ) {

      cbRec.clazz[ cbRec.method ]( qpath, cbRec , makeError(qpath + " has unknown file system") );

      return;
    }

    var lpath = this.getLPath( qpath );
    if( !lpath ) {

      cbRec.clazz[ cbRec.method ]( qpath, cbRec , makeError( "QPath '" + qpath + "' has no local path" ) );

      return;
    }

    if( !this.checkFileName( lpath ) ) {
      throw { message: "path '" + lpath + "' has invalid characters" };
    }
    //original calling callrecord looks like this
    //var callRecord = { clazz: this, method: "loadedApp" }

    var wrappedCallBackRecord = {
        origCallBackRecord: callRecord,
        qpath: qpath,
        clazz: this,
        method: "loadedFile"
    };

    try {
      fsRecord.fs.loadFile( lpath, wrappedCallBackRecord );
    }
    catch( e ){
      if( e.fsErrorSignature ) {
        cbRec.clazz[ cbRec.method ]( qpath, cbRec , makeError( e.reason ) );
        return;
      }
      else {
        cbRec.clazz[ cbRec.method ]( qpath, cbRec , makeError( "Internal error", e ) );
        return;
      }
    }

  }

  loadedFile( path, cbWrapRec, response ) {
    var cbRec = cbWrapRec.origCallBackRecord;
    cbRec.clazz[ cbRec.method ]( cbWrapRec.qpath, cbRec , response );
  }


  /*

    loadFile( path, cb )
    loadedFile( path, cb, data )
  */

  deleteFile( qpath0, callRecord ) {

    if( !this.initialized ) {
      return null;
    }

    var qpath = qpath0.toLowerCase();

    var fsRecord = this.getFS( qpath );
    if( !fsRecord ) {
      throw { message: qpath + " has unknown file system" };
    }

    var lpath = this.getLPath( qpath );
    if( !lpath ) {
      throw { message: "QPath '" + qpath + "' has no local path" };
    }

    if( !this.checkFileName( lpath ) ) {
      throw { message: "path '" + lpath + "' has invalid characters" };
    }

    //TODO asynch delete
    var result = fsRecord.fs.deleteFile( lpath );

    var args = {};
    args.qpath = qpath;

    var callBackResponse = { result: result, args: args, origCallBackRecord: callRecord };

    this.doCallBack( callRecord, callBackResponse );

    return null;
  }

  formatDisk( qpath ) {

    if( ! this.existsFile( fileName ) ) {
      return "no such file";
    }

    return "error";

  }
}

export { FILESYSMODULE as default};
