var fs = require('fs');

var data = JSON.parse(fs.readFileSync('worker.bundle.json', 'utf8'));

for( var wix=0; wix<1; wix++) {
  var worker = data.workers[wix];
  var dir = worker.dir;

  console.log( dir );
  var wdata = "";
  var data;
  var index = "";
  var target = worker.target;

  for( var i=0; i<worker.files.length; i++) {
    var f = worker.files[i];
    var fname = dir + "/" + f ;
    index += "//" + fname + "\n";

    console.log( fname );

     wdata += "// ## " + f + " ==========---------- \n"+
        "// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -\n"+
        "//  " +  fname + "\n"+
        "//  BY packworkers.js -- " + fname + "\n\n";

     data = fs.readFileSync( fname, 'utf8');
     //data = data.replace(/[\r\n]/gm, '');
     wdata += data + "\n//--EOC \n\n"


  }

  index += "// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -\n\n";

  fs.writeFile( target, index + wdata , function (err) {
    if (err) return console.log(err);
  });

}
