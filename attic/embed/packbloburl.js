var fs = require('fs');

var data = fs.readFileSync('dist/static/basicloader.js', 'utf8');
var html = fs.readFileSync('src/index_static_embed.html', 'utf8');

var blobUrl = "data:text/javascript;base64," + Buffer.from( data ).toString('base64');
var html2 = html.replace('___EMBED_HERE___',  blobUrl )

fs.writeFileSync("dist/static_embed/index.html", html2 );
