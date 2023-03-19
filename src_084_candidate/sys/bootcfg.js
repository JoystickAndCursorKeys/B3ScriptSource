class BOOTCFG {

  constructor() {

    this.fs = {};
    this.fs.default = "cache";

    this.display = {}
    this.display.mode = 100;

    this.warnings = {};
    this.warnings.privacyMute = true;

    this.subSys = "S3";

    this.keyboard = {};
    this.keyboard.allowDefault = {};
    var allowDefault = this.keyboard.allowDefault;
    allowDefault.all = false;
    allowDefault.events = [];

    var adEvents = allowDefault.events;
    adEvents.push("F5");
    adEvents.push("F12");

  }

}

export { BOOTCFG as default};
