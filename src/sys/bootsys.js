class COMMONBOOTLOADER {

  constructor( staticFlag ) {

    var sys = {};
    this.m = {};
    sys.m = this.m;
    this.sys = sys;
    sys.init = {};
    sys.staticTarget = staticFlag;

    sys.domContainer = document.createElement("div");
    document.body.appendChild( sys.domContainer );

    sys.SIG = "boss64";
    sys.VERSION = "0.1";
    sys.CODENAME = "Papa Smurf";

    sys.nulcon = [];
    sys.nulcon.push("Starting BOSS...");
    sys.nulcon.push("BOS version " + sys.VERSION);
    sys.nulcon.push("BOS signature " + sys.SIG);
    sys.nulcon.push("BOS release name \"" + sys.CODENAME + "\"");
    sys.nulcon.push("Starting Boot Sequence...");


    var rootScript = document.getElementById("boot");
    this.rootScript = rootScript;


    this.displayMode = parseInt( rootScript.dataset.mode );

    this.bootMode = rootScript.dataset.boot;

    this.dynamicMinTarget = (this.bootMode.indexOf("min") >= 0);
    sys.dynamicMinTarget = this.dynamicMinTarget;

    this.bootDebug = (this.bootMode.indexOf("debug") >= 0);

    if( this.bootDebug ) {
      sys.nulcon.push("Enabled debug mode");
    }

    if( this.dynamicMinTarget ) {
      sys.nulcon.push("Enabled minimal target settings for dynamic mode");
    }

    document.body.style.backgroundColor = "#444444";
  }

  getSys() {
    return this.sys;
  }

  initSimpleLogging() {

    /*primitive logging, before it is setup fully*/

    var sys = this.sys;

    sys.out = {
      buf: ""
    };

    var out = sys.out;

    sys.out.getAll = function() {
      return out.buf;
    }

    sys.out.writeln = function( txt ) {
      var s = "$" + txt +"\n";
      out.buf += s;
      console.log( s );
    }

    out.writeln( "$Init logging..." );

    sys.rawlog = function( type, array ) {

      var line = array;
      var txt = "";

      txt +=  ( type + ": " );

      for( var j=0; j<line.length; j++) {
          var sep = " ";
          if( j==0 ) { sep = "" };
          txt += ( sep + line[j] );
      }

      sys.out.writeln( txt );

    }

    sys.rawlogcon = function( type, array ) {

      var line = array;
      var txt = "";

      txt +=  ( type + ": " );

      for( var j=0; j<line.length; j++) {
          var sep = " ";
          if( j==0 ) { sep = "" };
          txt += ( sep + line[j] );
      }

      console.log( txt );

    }

    sys.log = function() {
      var args = Array.prototype.slice.call(arguments);
      sys.rawlog( "info", args );
      console.log.apply(console, args);
    }

    sys.logwarn = function() {
      var args = Array.prototype.slice.call(arguments);
      sys.rawlog( "warn", args );
      console.warn(args);
    }

    sys.logerr = function() {
      var args = Array.prototype.slice.call(arguments);
      sys.rawlog( "error", args );
      console.error.apply(console, args);
    }

    this.logerr = sys.logerr;
    this.logwarn = sys.logwarn;
    this.log = sys.log;

    if( !this.bootDebug ) {
      sys.rawlog = sys.rawlogcon;
    }
  }


}

export { COMMONBOOTLOADER as default};
