var port = chrome.runtime.connect({
    name: "panels-page"
});

port.onMessage.addListener(function (message) {

    document.getElementById('performance').innerHTML  = JSON.stringify(message);

});

var requests = "";

chrome.devtools.network.getHAR(function(harlog) {

    var str = JSON.stringify( harlog );
    chrome.devtools.inspectedWindow.eval('console.log(' + str + ');');

});

chrome.devtools.network.onRequestFinished.addListener(function(request) {


        var urlStr = JSON.stringify( request);
        requests += urlStr + "\n\n\n";
        chrome.devtools.inspectedWindow.eval('console.log(' + urlStr + ');');
        document.getElementById('harlog').innerHTML = urlStr;
});





