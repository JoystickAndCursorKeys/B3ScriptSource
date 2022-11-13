class Editor {

  constructor( sys ) {
    this.sys = sys;
    this.output = sys.out;

  }

  addRunTime( rt ) {
    this.runTime = rt;
  }

  interactiveKeyHandler( e ) {
    //this.sys.log( "editor got even " + JSON.stringify( e ) );

    if( e.keyLabel == "Enter" ) {
      var command = sys.out.getCurrentLine();
      this.output.writeln("");

      this.runTime.executeInteractiveLine( command );

    }
    else if( e.keyLabel == "Backspace" ||
            e.keyLabel == "Delete"  ) {
      var x = this.output.getCursorPos()[0];
      if( x>0) {
          this.output.backspace();
      }
    }
    else if( e.keyLabel == "ArrowUp" ) {
      this.output.cursorMove("up");
    }
    else if( e.keyLabel == "ArrowDown" ) {
      this.output.cursorMove("down");
    }
    else if( e.keyLabel == "ArrowLeft" ) {
      this.output.cursorMove("left");
    }
    else if( e.keyLabel == "ArrowRight" ) {
      this.output.cursorMove("right");
    }
    else {
      if( e.key != null ) {
        this.output.write( e.key );
      }
    }

  }
}
