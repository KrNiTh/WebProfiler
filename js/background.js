// Filename: background.js
// Date:     November 2017
// Authors:  Thomas Binu & Nihar Patil & Kritka Sahni
// Purpose:  Collects performance data and sends back to panel

chrome.runtime.onConnect.addListener(function (port) {

    var perfData = window.performance;
    var str = JSON.stringify(perfData);
    port.postMessage(str);
});

