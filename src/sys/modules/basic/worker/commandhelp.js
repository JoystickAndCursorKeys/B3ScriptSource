class CommandHelp {

	constructor() {}


  getCategoriesNormalize(  categoryIndexesInt ) {
    var categoryIndexes = [
      Object.getOwnPropertyNames( categoryIndexesInt[0] ),
      categoryIndexesInt[1]
    ];
    return categoryIndexes;
  }

  getCategoriesIntermediate(  categoryIndexes, clazz ) {


    var stats = clazz.getStatements( true );
    var funs = clazz.getFunctions( true );

    var cat = categoryIndexes[ 0 ];
    var catLists = categoryIndexes[ 1 ];

    if( cat[ "general" ] === undefined ) { cat[ "general" ] = 0; catLists[ "general" ] = []; }

    for( var i=0;i<stats.length;i++) {
      var rname = stats[i];
      var si = rname.replace("_stat_","_stat_info_");

      var catlabel;
      if( !( clazz[ si ] === undefined ) )  { 
          catlabel = clazz[ si ](); 
          var tmp=12;
      }
      else { 
        catlabel = "general"; 
      }

      var f_attribs = {};
      if( catlabel.indexOf(":") >0 ) {

        var partsLen = catlabel.split(":" ).length;

        f_attribs.description =  catlabel.split(":" )[1];
        f_attribs.input =   catlabel.split(":" )[2];
        f_attribs.output =  catlabel.split(":" )[3];

        catlabel=catlabel.split(":")[0];
      }

      rname = rname.replace("_stat_","").toUpperCase();

      if( cat[ catlabel ] === undefined ) { cat[ catlabel ] = 0; catLists[ catlabel ] = []; }
      cat[ catlabel ]++;
      catLists[ catlabel ].push( {name: rname, attribs: f_attribs } );
    }

    for( var i=0;i<funs.length;i++) {
      var rname = funs[i];
      var si = rname.replace("_fun_","_fun_info_");

      var catlabel;
      if( !( clazz[ si ] === undefined ) ) { catlabel = clazz[ si ](); }
      else { catlabel = "general"; }
      var f_attribs = {};

      if( catlabel.indexOf(":") >0 ) {

          var partsLen = catlabel.split(":" ).length;

          f_attribs.description =  catlabel.split(":" )[1];
          f_attribs.input =   catlabel.split(":" )[2];
          f_attribs.output =  catlabel.split(":" )[3];

          catlabel=catlabel.split(":")[0];
      }

      rname = rname.replace("_fun_","").replace("_DLR_","$").toUpperCase() + "()";

      if( cat[ catlabel ] === undefined ) { cat[ catlabel ] = 0; catLists[ catlabel ] = []; }
      cat[ catlabel ]++;
      catLists[ catlabel ].push( {name: rname, attribs: f_attribs } );
    }

    //var cats = Object.getOwnPropertyNames( cat );

    return [cat,catLists];
  }
}
