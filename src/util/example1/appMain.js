
class APPLICATIION {
  constructor( sys ) {
    this.sys = sys;
    sys.appName = "Example de uno";
    sys.log("Function logging from " + sys.appName);

    import("./lib/dummy.js")
    .then((module) => {
      sys.log( "###################");
      sys.log( "Imported sub module => " + module.message );
    });
  }

  nocycle() {
    var sys = this.sys;
    var proc = sys.proc;
    sys.log( "cycling " + proc.getTicks() );
  }
}

export { APPLICATIION as app };
