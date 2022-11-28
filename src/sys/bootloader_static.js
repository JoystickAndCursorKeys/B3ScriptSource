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
import sessionfs  from       './modules/sessionfs.js';
import lfs  from             './modules/lfs.js';
import ramfs  from           './modules/ramfs.js';
import qfs  from             './modules/qfs.js';
import scripturl  from       './modules/scripturl.js';
import basic from           './modules/basic/apps.js';

boot = new BootSys( staticLoading );
var sys = boot.getSys();


boot.dep = {};
boot.i = {}
boot.i.displaymodes = displaymodes;
boot.i.tablecon = tablecon;
boot.i.canvas = canvas;
boot.i.simplewarning = simplewarning;
boot.i.priv = privwarning;
boot.i.mutedinput = mutedinput;
boot.i.domelinput = domelinput;
boot.i.htmlwrapper = htmlwrapper;
boot.i.basic = basic;
boot.i.sfs = sessionfs
boot.i.lfs = lfs;
boot.i.ramfs = ramfs;
boot.i.script = scripturl;
boot.i.qfs = qfs;
boot.dep.qfs = [ "ramfs", "lfs", "sfs", "script" ];
boot.dep.basic = [ "canvas", "tablecon", "displaymodes", "qfs", "htmlwrapper" ];

boot.initSimpleLogging();

/* Instantiate modules */
var mods = Object.getOwnPropertyNames( boot.i );

for( var i=0;i<mods.length;i++) {
  console.log("construct " + mods[ i ] );
  boot.m[ mods[i] ] = new boot.i[ mods[i] ]( sys, boot.dep[ mods[i] ] );
}



sys.init.queuedMessages = sys.nulcon;
sys.init.conStyle = boot.conStyle;
sys.init.displayMode = boot.displayMode;
sys.m = boot.m;

sys.m.displaymodes.setMode( boot.displayMode );
var con = sys.m.displaymodes.getDriver();
boot.out = con;
sys.out =  con;

/* Initialize modules */
for( var i=0;i<mods.length;i++) {
  console.log("init " + mods[ i ] );
  boot.m[ mods[i] ].init();
}

/* Get the boot script */

try {


  var script = boot.rootScript.dataset.script;
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
