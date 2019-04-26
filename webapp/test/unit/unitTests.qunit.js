/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"capseat/AA_CapSeat/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});