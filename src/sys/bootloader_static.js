const staticLoading = true;

import  BootCfg   from        './bootcfg.js';
import  BootSys   from        './bootsys.js';

import  displaymodes   from        './modules/displaymodes.js';
import  tablecon   from        './modules/tablecon.js';
import  canvas   from        './modules/canvas.js';
import mrbeep  from       './modules/mrbeep/module.js';
import  simplewarning  from   './modules/simplewarning.js';
import  privwarning from     './modules/privwarning.js';
import  mutedinput from      './modules/mutedinput.js';
import domelinput from      './modules/domelinput.js';
import htmlwrapper from     './modules/htmlwrapper.js';
import sessionfs  from       './modules/fs/sessionfs.js';
import lfs  from             './modules/fs/lfs.js';
import ramfs  from           './modules/fs/ramfs.js';
import qfs  from             './modules/fs/qfs.js';
import scripturl  from       './modules/fs/scripturl.js';
import basic from           './modules/basic/module.js';
import basicmenu from           './modules/basicmenu/module.js';

var bootCfg = new BootCfg(  );
var boot = new BootSys( bootCfg, staticLoading );
var sys = boot.getSys();


boot.dep = {};
boot.i = {}
boot.i.displaymodes = displaymodes;
boot.i.tablecon = tablecon;
boot.i.canvas = canvas;
boot.i.mrbeepaudio = mrbeep;
boot.i.simplewarning = simplewarning;
boot.i.priv = privwarning;
boot.i.mutedinput = mutedinput;
boot.i.domelinput = domelinput;
boot.i.htmlwrapper = htmlwrapper;
boot.i.basic = basic;
boot.i.basicmenu = basicmenu;
boot.i.sfs = sessionfs
boot.i.cache = lfs;
boot.i.ramfs = ramfs;
boot.i.script = scripturl;
boot.i.qfs = qfs;
boot.dep.qfs = [ "ramfs", "cache", "sfs", "script" ];
boot.dep.basic = [ "canvas", "tablecon", "displaymodes", "mrbeepaudio", "qfs", "htmlwrapper", "basicmenu" ];

boot.initSimpleLogging();

/* Instantiate modules */
function addModule( m, toList, checkL ) {

  if( checkL >= 5 ) {
    var tmp = 1;
    console.log("HALT, probably dependency recursion detected" );
    throw "HALT, probably dependency recursion detected";
    return;
  }

  console.log(" dependencies for " + m + " checkL=" + checkL );
  if( boot.dep[ m ]) {
    console.log("FOUND DEPENDENCY LIST for " + m );
    var deps = boot.dep[ m ];
    for( var j=0;j<deps.length;j++) {
      console.log(" add dependency:  " + deps[ j ] );
      addModule( deps[j], mods, checkL + 1 );
    }
  }

  var exists = false;
  for( var ci=0;ci<toList.length;ci++) {
    if( toList[ ci ] == m ) {
      exists = true;
      return;
    }
  }

  console.log("ADD MODULE " + m );
  toList.push( m );
}

var mods0 = Object.getOwnPropertyNames( boot.i );
var mods = [];
for( var i=0;i<mods0.length;i++) {
  var m = mods0[i];
  if( mods0[ i ]  === undefined ) {
    continue;
  }


  addModule( m, mods, 0 );

}


for( var i=0;i<mods.length;i++) {
  console.log("construct " + mods[ i ] );
  boot.m[ mods[i] ] = new boot.i[ mods[i] ]( sys, boot.dep[ mods[i] ] );
}

sys.audio = sys.m.mrbeepaudio;

sys.init.queuedMessages = sys.nulcon;
sys.init.conStyle = boot.conStyle;
sys.init.displayMode = boot.displayMode;
sys.m = boot.m;
sys.fs =  sys.m.qfs;
sys.m.displaymodes.setMode( boot.displayMode, sys.m.basicmenu );
boot.out = sys.out;


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
