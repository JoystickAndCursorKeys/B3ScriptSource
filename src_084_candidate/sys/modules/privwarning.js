class KERNALMODULE {

  /* QFS - Qualified file system */
  /* Qualified paths can be used to find files on other file system*/
  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }

    this.sys = sys;
    this.disable = sys.bootCfg.warnings.privacyMute;
    this.key = sys.SIG + "__LSConfirmed" ;
    this.verified = false;
    this.denied = false;

    console.log("PrivWarning initialized");

  }

  init() {}

  confirmLocalStorage() {

    if( this.denied ) {
      return false;
    }

    var confirmed = localStorage.getItem( this.key );
    if( confirmed == "true" ) { return true; }

    if( this.disable ) {
      return true;
    }


    var ok = confirm("!! Do you allow "+
      this.sys.SIG +
      " to write to local browser storage !!\n"+
      "This is needed to simulate a local harddisk.\n" +
      " If you do not agree, you can still use the system,\n"+
      " but you won't be able to save any files, or session information.\n\n"+
      "All information will only be stored on the local storage,\n"+
      " and will not be shared with any server, unless you will give explicit permission.\n\n"+
      "Thank you!"
    );

    if( !ok ) { this.denied = true; return false; }

    localStorage.setItem( this.key, "true" );

    return true;
  }


}

export { KERNALMODULE as default};
