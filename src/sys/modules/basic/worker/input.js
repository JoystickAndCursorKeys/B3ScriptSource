class Input {

  constructor() {
    this.keyPress = [];
    this.interactive = false;
  }

  setHandler( hc ) {
    this.handlerClazz = hc;
  }

  setInterActive( flag ) {
    this.interactive = flag;
  }

  inputKeyHandler( e )  {

    var hc = this.handlerClazz;
    if( !this.interactive ) {

      if( e.keyLabel == "Escape" ) {
          hc["stop"]();
      }
      else {
        this.keyPress.push( e );
      }
    }
    else {

        hc["interactiveKeyHandler"]( e );
    }
  }

  getKey() {
    var key = this.keyPress.shift();
    if( key ) {
      return key;
    }
    return null;
  }

}

class MutedInput {

  setHandler( hc ) {}
  setActive( flag ) {}
  getKey() { return null; }
  inputKeyHandler(e) {}
  getKey() { return null;}

}
