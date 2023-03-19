class DATA {

	constructor() {

		//opt: "name", means use as suffix string call a handler in basicmenu/apps main class
		//opt: "@name", means, call a handler in basic/apps main class

		this.options = {};

		var opts = [];
    opts.push({opt: "file", display: "File" });
    opts.push({opt: "copy", display: "Copy" });
		opts.push({opt: "basic", display: "Basic" });
		opts.push({opt: "screeneditor", display: "Screen" });
		opts.push({opt: "help", display: "Help" });

    this.options["main"] = opts;

    opts = [];
    opts.push({opt: "@requestClipboardCopy", display: "Copy program" });
		if( navigator.clipboard.readText ) {
			opts.push({opt: "pasteFromClip", data: "pgm", display: "Paste program" });
		} else {
			opts.push({opt: "pasteBox", data: "pgm", display: "Paste program" });
		}
    opts.push({opt: "@requestClipboardCopyScreen", display: "Copy screen data" });
    if( navigator.clipboard.readText ) {
			opts.push({opt: "pasteFromClip", data: "txt", display: "Paste text" });
		} else {
			opts.push({opt: "pasteBox", data: "txt", display: "Paste text" });
		}
    this.options["copy"] = opts;

    opts = [];
		opts.push({opt: "@requestRun", display: "Run" });
		opts.push({opt: "@requestStop", display: "Stop" });
    opts.push({opt: "@requestList", display: "List Program" });
		opts.push({opt: "@requestVars", display:  "Debug: List Variables" });
		opts.push({opt: "@requestDataBlocks", display:  "Debug: List Data-blocks" });
		opts.push({opt: "@requestRenumber", display:  "Renumber Program" });
		opts.push({opt: "@requestNew", display:  "New Program" });
    this.options["basic"] = opts;

    opts = [];
		opts.push({opt: "@requestListDirectory", display: "List directory" });
		opts.push({opt: "@requestFileSystems", display: "List file systems" });
		opts.push({opt: "@requestListScripts", display: "List embedded scripts" });
    opts.push({opt: "@requestExport", display: "Export Basic Program" });
    this.options["file"] = opts;

		opts = [];
		opts.push({opt: "@requestResetConsole", display: "Reset Console" });
		opts.push({opt: "@requestColorReset", data: { fg: 1, bg:0, border: 10 }, display: "Dark Mode 1" });
		opts.push({opt: "@requestColorReset", data: { fg: 14, bg:0, border: 0 },display: "Dark Mode 2" });
		opts.push({opt: "@requestColorReset", data: { fg: 5, bg:0, border: 10 },display: "Dark Mode 3" });
		opts.push({opt: "@requestColorReset", data: { fg: 0, bg:8, border: 0 },display: "Light Mode 1" });
		opts.push({opt: "@requestColorReset", data: { fg: 0, bg:8, border: 10 },display: "Light Mode 2" });
		opts.push({opt: "@requestColorReset", data: { fg: 0, bg:1, border: 10 },display: "Light Mode 3" });
		opts.push({opt: "@requestColorReset", data: { fg: 15, bg:4, border: 15 },display: " C64 Theme" });
		opts.push({opt: "@requestColorReset", data: { fg: 14, bg:10, border: 14 },display: "C128 Theme" });
		opts.push({opt: "@requestColorReset", data: { fg: 4, bg:1, border: 6 },display: "Vic20 Theme" });
		opts.push({opt: "@requestColorReset", data: { fg: 0, bg:9, border: 9 },display: "ZX-Spectrum Theme" });
		opts.push({opt: "@requestColorReset", data: { fg: 1, bg:4, border: 4 },display: "MSX Theme" });
		opts.push({opt: "@requestColorReset", data: { fg: 1, bg:0, border: 0 },display: "BBC Theme" });
		opts.push({opt: "@requestColorReset", data: { fg: 3, bg:0, border: 0 },display: "Apple2 Theme" });
    this.options["screeneditor"] = opts;

		opts = [];
		opts.push({opt: "@requestHelp", display: "Basic Commands" });
		opts.push({opt: "@requestAbout", display: "About" });
    this.options["help"] = opts;

	}

	getOptions() {
		return this.options;
	}
}

export { DATA as default};
