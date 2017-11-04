// Filename: panel.js
// Date:     November 2017
// Authors:  Thomas Binu & Nihar Patil & Kritka Sahni
// Purpose:  Defines panel UI and captures HAR request

var port = chrome.runtime.connect({
    name: "panels-page"
});

port.onMessage.addListener(function (message) {

    document.getElementById('performance').innerHTML  = JSON.stringify(message);

});
var requests = "";


// Called after a request is finished
chrome.devtools.network.onRequestFinished.addListener(function(request) {


        var urlStr = JSON.stringify( request);
        requests += urlStr + "\n\n\n";
        chrome.devtools.inspectedWindow.eval('console.log(' + urlStr + ');');
        document.getElementById('harlog').innerHTML = urlStr;
});





