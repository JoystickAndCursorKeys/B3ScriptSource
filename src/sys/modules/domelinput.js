class KERNALMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;
    this.evtQueueKeyPress = [];
    this.handler = null;
    this.prefix = "";
  }

  init() {
    var target = this.init.inputElement;

    if( target ) {
        this.target = document.body;
    }
    else {
      this.target = document.body;
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

  setInputHandler( clazz, prefix ) {
    this.handler = clazz;
    this.prefix = prefix;

    var queuekp = this.evtQueueKeyPress;
    var con = this.sys.out;
    var handler = this.handler;
    var prefix = this.prefix;
    this.target.inputMode = "text";
    this.target.addEventListener("keydown", (event) => {

      var kEvent =
      {
          type: "keydown",
          key: event.key,
          keyLabel: event.key
      };

      if( event.key.length > 1) {
        kEvent.key = null;
        kEvent.keyLabel = event.key;
        if( event.key == "Enter" ) {
          kEvent.key = "\n";
        }
      }

      event.preventDefault();
      
      if( handler ) {
        handler[ prefix + "KeyHandler" ]( kEvent );
      } else {
        queuekp.push( kEvent );
      }
    });
  }

}


export { KERNALMODULE as default};
