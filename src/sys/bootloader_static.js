const staticLoading = true;

import  BootSys   from        './bootsys.js';

import  displaymodes   from        './modules/displaymodes.js';
import  tablecon   from        './modules/tablecon.js';
import  canvas   from        './modules/canvas.js';
import  simplewarning  from   './modules/simplewarning.js';
import  privwarning from     './modules/privwarning.js';
import  mutedinput from      './modules/mutedinput.js';
import domelinput from      './modules/domelinput.js';
import htmlwrapper from     './modules/htmlwrapper.js';
import basic from           './modules/basic/apps.js';
import sessionfs  from       './modules/sessionfs.js';
import lfs  from             './modules/lfs.js';
import ramfs  from           './modules/ramfs.js';
import qfs  from             './modules/qfs.js';
import scripturl  from       './modules/scripturl.js';

boot = new BootSys( staticLoading );
var sys = boot.getSys();
var con = canvas;

boot.dep = {};
boot.m.displaymodes = displaymodes;
boot.m.tablecon = tablecon;
boot.m.canvas = canvas;
boot.m.simplewarning = simplewarning;
boot.m.priv = privwarning;
boot.m.mutedinput = mutedinput;
boot.m.domelinput = domelinput;
boot.m.htmlwrapper = htmlwrapper;
boot.m.basic = basic;
boot.m.sfs = sessionfs
boot.m.lfs = lfs;
boot.m.ramfs = ramfs;
boot.m.script = scripturl;
boot.m.qfs = qfs;
boot.dep.qfs = [ "ramfs", "lfs", "sfs", "script" ];

boot.initSimpleLogging();

/* Instantiate modules */
var mods = Object.getOwnPropertyNames( boot.m );

for( var i=0;i<mods.length;i++) {
  console.log("construct " + mods[ i ] );
  boot.m[ mods[i] ] = new boot.m[ mods[i] ]( sys, boot.dep[ mods[i] ] );
}

sys.init.queuedMessages = sys.nulcon;
sys.init.conStyle = boot.conStyle;
sys.init.displayMode = boot.displayMode;

boot.out = con;
sys.out =  con;
sys.m = boot.m;

/* Initialize modules */
for( var i=0;i<mods.length;i++) {
  console.log("init " + mods[ i ] );
  boot.m[ mods[i] ].init();
}


/* Get the boot script */

try {
  var script = boot.rootScript.getAttribute('basScript');
  if( script == null ) { script = "autorun.bas"; }
  boot.onReady = "script://" + script;
}
catch ( e ) {
  alert( "HALT: Boot-Onready Handler not found!!");
  throw "HALT - Neither root-script-attribute 'basScript' or constant 'BOOT_ONREADY' defined.";
}


sys.nulcon = undefined;
boot.input = boot.m.domelinput;
console.log( "boot.basic=",boot.basic );
boot.m.basic.setInput( boot.input );
boot.m.basic.loadApp(  boot.onReady );
