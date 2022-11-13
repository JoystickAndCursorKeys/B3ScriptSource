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
    this.prefix = sys.SIG + "__" ;
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
          prefix: fsToken + "://"
        }
        this.fsList.push( fs );
    }

     this.initialized = true;
  }

  ready() {
    return this.initialized;
  }

  getFS( qpath ) {

    var fsList = this.fsList;

    for( var i=0; i< fsList.length; i++) {
        var fs = fsList[i];
        if( qpath.startsWith( fs.prefix ) ) {
          return fs;
        }
    }

    return null;
  }

  getLPath( qpath ) {
    var parts = qpath.split("://");
    if( parts.length <2 ) { return null; }
    return parts[ 1 ];
  }

  getDir( qpath ) {

    if( !this.initialized ) {
      return false;
    }

    return [];
  }

  existsFile( qpath ) {

    if( !this.initialized ) {
      return false;
    }

    return false;
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
      /*mandatory*/ qpath, data, callRecord,
      /*optional*/ type, length ) {

    if( !this.initialized ) {
      return null;
    }

    var fsRecord = this.getFS( qpath );
    if( !fsRecord ) {
      throw { message: qpath + " has unknown file system" };
    }

    var lpath = this.getLPath( qpath );
    if( !lpath ) {
      throw { message: "QPath '" + qpath + "' has no local path" };
    }

    if( ! fsRecord.fs.isASynch() ) {
      var result = fsRecord.fs.saveFile( lpath, data, type, length );

      var args = {};
      args.qpath = qpath;
      args.type = type;
      args.length = length;

      var callBackResponse = { result: result, args: args };

      this.doCallBack( callRecord, callBackResponse );

    }

    return null;


  }

  loadFile( qpath , callRecord  ) {

    if( !this.initialized ) {
      return null;
    }

    var fsRecord = this.getFS( qpath );
    if( !fsRecord ) {
      throw { message: qpath + " has unknown file system" };
    }

    var lpath = this.getLPath( qpath );
    if( !lpath ) {
      throw { message: "QPath '" + qpath + "' has no local path" };
    }

    if( ! fsRecord.fs.isASynch() ) {
      var data = fsRecord.fs.loadFile( lpath );

      var callBackResponse = {
        data: data,
        cbData: callRecord.data,
        args: { qpath: qpath }
      };
      callRecord.clazz[ callRecord.method ]( callBackResponse );
    }

    return null;
  }

  deleteFile( qpath ) {

    if( ! this.existsFile( fileName ) ) {
      return "no such file";
    }

    return "error";
  }

  formatDisk( qpath ) {

    if( ! this.existsFile( fileName ) ) {
      return "no such file";
    }

    return "error";

  }


}

export { FILESYSMODULE as default};
