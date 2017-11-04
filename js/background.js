chrome.runtime.onConnect.addListener(function (port) {

    var perfData = window.performance;
    var str = JSON.stringify(perfData);
    port.postMessage(str);
});

