class  BasicArray {

  constructor( name, indices, defaultValue  ) {
    this.name = name;
    this.indices = indices;
    this.buffer = null;
    this.defaultValue = defaultValue;
  }

  getIndexCount() {
    return this.indices.length;
  }

  _check( indices ) {
    if( indices.length != this.indices.length ) {
      throw "BasicArray:00:index dimension mismatch:For array " + this.name;
    }
    for( var i=0; i<indices.length; i++) {
      if ( indices[i] > this.indices[ i ]) {
        var detail = "\"" + this.name + "[" + indices[i] + "]"+"\" does not exist";
        if( indices.length > 1) {
          detail = "\"" + this.name + "\" with index " + indices[i] + " does not exist";
          detail += " for index dimension " + i;
        }
        throw "BasicArray:01:index out of bounds:" + detail;
      }
      else if ( indices[i] < 0) {
        throw "BasicArray:02:index smaller then zero:For array " + this.name;
      }

    }
  }

  set( indices, val ) {
    this._check( indices );
    if( this.buffer == null ) {
      this.buffer = [];
    }
    var ptr = this.buffer;
    var last = indices.length - 1;
    for( var i=0; i<=last; i++) {

      if( i == last ) {
        ptr[ indices[ i ]] = val;
      }
      else {
        if( (ptr [ indices[i] ] === undefined )) {
          ptr[ indices[ i ]] = [];
        }
        ptr = ptr[ indices[ i ]];
      }
    }
  }

  get( indices ) {
    this._check( indices );

    if( this.buffer == null ) {
      return this.defaultValue;
    }
    var ptr = this.buffer;
    var last = indices.length - 1;
    for( var i=0; i<=last; i++) {

      if( i == last ) {
        return ptr[ indices[ i ]];
      }
      else {
        if( (ptr [ indices[i] ] === undefined )) {
          return this.defaultValue;
        }
        ptr = ptr[ indices[ i ]];
      }
    }
  }

}
