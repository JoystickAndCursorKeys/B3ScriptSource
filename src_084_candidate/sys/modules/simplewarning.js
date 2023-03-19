class KERNALMODULE {

  /* QFS - Qualified file system */
  /* Qualified paths can be used to find files on other file system*/
  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }

    this.sys = sys;
    this.key = sys.SIG + "__LSConfirmed" ;

    this.warningOngoing = false;

    console.log("simplewarning initialized");

    sys.notify = this;
  }

  init() {

  }

  simpleWarning() {
      if( this.warningOngoing ) {
        return;
      }

      this.oldBGColor = document.body.style.backgroundColor;
      document.body.style.backgroundColor = "#ffffff";

      var __this = this;
      function clearWarning() {
        document.body.style.backgroundColor = __this.oldBGColor;
        __this.warningOngoing = false;
      }

      var myTimeout = setTimeout(clearWarning, 200);

  }



}

export { KERNALMODULE as default};
