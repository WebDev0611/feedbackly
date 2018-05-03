"use strict";
var page = require('webpage').create(),
    system = require('system'),
    address, output, size, pageWidth, pageHeight;

    address = system.args[1];
    output = system.args[2];
    page.viewportSize = { width: 1200, height: 800 };
    // page.clipRect = { top: 0, left: 0, width: 1200, height: 800 };
    page.paperSize = {width: 1364, height: 1929};
    page.zoomFactor = 1;

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(1);
        } else {
            window.setTimeout(function () {
                page.render(output);
                phantom.exit();
            }, 2000);
        }
    });
