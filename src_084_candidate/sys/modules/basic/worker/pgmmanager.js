class BasicProgramManager {

  constructor() {
    this.rt = [];
  }

  addRuntime = function( ctx ) {

    this.rt.push( ctx );

  }

}

var pgmman = new BasicProgramManager();
