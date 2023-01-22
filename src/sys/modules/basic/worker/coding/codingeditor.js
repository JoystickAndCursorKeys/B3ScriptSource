class Editor {

  constructor( sys ) {
    this.sys = sys;
    this.output = sys.out;
    this.keyMode = "insert";

    //this.lineMarkers = [ 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ];
  }


  addRunTime( rt ) {
    this.runTime = rt;
  }

  keyHandlerForCLE( e ) {

      if( e.keyLabel == "Enter"  && !e.shiftKey ) {
        var command = sys.out.getCurrentLine();
        this.output.writeln("");

        this.runTime.executeInteractiveLine( command );

      }
      else if( e.keyLabel == "Enter" && e.shiftKey ) {

        this.output.ScrollDownByCurrentLine();

      }
      else if( e.keyLabel == "Backspace" ||
              e.keyLabel == "Delete"  ) {

        if( e.keyLabel == "Delete" ) {
              this.output.delete();
        }
        else {
            this.output.backspace();
        }

      }
      else if( e.keyLabel == "ArrowUp" && !e.ctrlKey) {
        this.output.cursorMove("up");
      }
      else if( e.keyLabel == "ArrowDown" && !e.ctrlKey) {
        this.output.cursorMove("down");
      }
      else if( e.keyLabel == "ArrowUp" && e.ctrlKey ) {
        this.output.cursorMove("up");
        this.output.cursorMove("up");
        this.output.cursorMove("up");
        this.output.cursorMove("up");
      }
      else if( e.keyLabel == "ArrowDown" && e.ctrlKey ) {
        this.output.cursorMove("down");
        this.output.cursorMove("down");
        this.output.cursorMove("down");
        this.output.cursorMove("down");
      }
      else if( e.keyLabel == "ArrowLeft" && !e.ctrlKey ) {
        this.output.cursorMove("left");
      }
      else if( e.keyLabel == "ArrowRight" && !e.ctrlKey) {
        this.output.cursorMove("right");
      }
      else if( (e.keyLabel == "ArrowRight" && e.ctrlKey) ) {
        this.output.jumpTo("text-end");
      }
      else if( (e.keyLabel == "ArrowLeft" && e.ctrlKey) ) {
        this.output.jumpTo("text-start");
      }
      else if( e.keyLabel == "Home" && !e.ctrlKey && !e.shiftKey ) {
        this.output.jumpTo("line-start");
      }
      else if( e.keyLabel == "Home" && e.shiftKey && !e.ctrlKey ) {
        this.output.clear();
      }
      else if( e.keyLabel == "End" && !e.ctrlKey ) {
        this.output.jumpTo("line-end");
      }
      else if( e.keyLabel == "Home" && e.ctrlKey && !e.shiftKey ) {
        this.output.jumpTo("home");
      }
      else if( e.keyLabel == "End" && e.ctrlKey ) {
        this.output.jumpTo("end");
      }
      else if( e.keyLabel == "Tab" ) {
        if( this.keyMode == "insert") {
          this.output.insert(  "        " );
        }
        else {
          this.output.write(  "        " );
        }

      }
      else if( e.keyLabel == "Insert" ) {

        if( this.keyMode == "insert") {
          this.keyMode = "overwrite";
        }
        else {
          this.keyMode = "insert";
        }
        this.output.setCursorMode( this.keyMode )
      }
      else {
        if( e.key != null ) {
          if( this.keyMode == "insert") {
            this.output.insert( e.key );
          }
          else {
            this.output.write( e.key );
          }
        }
      }

  }


  interactiveKeyHandler( e ) {
    this.keyHandlerForCLE( e );
  }
}
