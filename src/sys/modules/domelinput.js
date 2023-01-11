class KERNALMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;
    this.evtQueueKeyPress = [];
    this.handler = null;
    this.prefix = "";
    this.cfg = sys.bootCfg.keyboard;
  }

  init() {
    var target = this.init.inputElement;

    if( target ) {
        this.target = window;
    }
    else {
      this.target = window;
    }
  }

  getKey() {

    if( this.handler ) {
      return null;
    }
    if( this.evtQueueKeyPress.length == 0 ) {
      return null;
    }

    return this.evtQueueKeyPress.shift();
  }


  unsetInputHandler() {
    if( this.elFun ) {
      this.target.removeEventListener("keydown", this.elFun  );
      this.elFun = null;
    }
  }

  checkIfAllowDefault( e ) {
    var tmp = 1;
    var ad = this.cfg.allowDefault;
    if( ! ad ) {
      return true;
    }

    if( ad.all ) { return true }

    var l = ad.events;
    for( var i=0; i<l.length; i++) {
      var e2 = l[i];
      if( e2 == e.key ) {
        return true;
      }
    }
    return false;
    //98//77/88(8(88999==007777////iiii(889[]{})))
  }

  setInputHandler( clazz, prefix ) {
    this.handler = clazz;
    this.prefix = prefix;

    if( this.elFun ) {
      this.target.removeEventListener("keydown", this.elFun  );
      this.elFun = null;
    }

    var queuekp = this.evtQueueKeyPress;
    var con = this.sys.out;
    var handler = this.handler;
    var prefix = this.prefix;
    var _this = this;

    var f = function(event) {

    //console.log( event ) ;

    var kEvent =
      {
          type: "keydown",
          key: event.key,
          keyLabel: event.key,
          shiftKey: event.shiftKey,
          ctrlKey: event.ctrlKey
      };


      if( event.key.length > 1) {
        kEvent.key = null;
        kEvent.keyLabel = event.key;
        if( event.key == "Enter" ) {
          kEvent.key = "\n";
        }
      }

      if( !_this.checkIfAllowDefault( event )) {
        event.preventDefault();
      }

      if( handler ) {
        handler[ prefix + "KeyHandler" ]( kEvent );
      } else {
        queuekp.push( kEvent );
      }
    };

    this.elFun = f;

    this.target.inputMode = "text";
    this.target.addEventListener("keydown", f);
  }

}


export { KERNALMODULE as default};
