// Filename: panel.js
// Date:     November 2017
// Authors:  Thomas Binu & Nihar Patil & Kritka Sahni
// Purpose:  Defines panel UI and captures HAR request

var port = chrome.runtime.connect({
    name: "panels-page"
});

port.onMessage.addListener(function (message) {

   // document.getElementById('performance').innerHTML  = JSON.stringify(message);
	console.log("Inside Message");
   	console.log(message);

});


// Called after a request is finished
chrome.devtools.network.onRequestFinished.addListener(function(request) {

		var urlStr = JSON.stringify(request);

        var endTime = new Date(request.startedDateTime).getTime() + request.time
        var startTime = new Date(request.startedDateTime).getTime();
        requestAccumulator(startTime,endTime,request);

        // document.getElementById('harlog').innerHTML =  urlStr;
});
requestAccumulator.requests = [];
requestAccumulator.startTimes =[];	
requestAccumulator.traces=[];
requestAccumulator.count =1;
requestAccumulator.graphCount =0;
requestAccumulator.endTimes =[];

jsColor = 'rgb(0,128,128)';
jsName = 'JS';

cssColor = 'rgb(0,0,128)';
cssName = 'CSS';

htmlColor = 'rgb(0,128,0)';
htmlName = 'html';

imageColor = 'rgb(128,128,0)';
imageName = 'image';

defaultColor = 'rgb(128,0,128)';
defaultName = 'default';
firstRequestStartTime =0;

function requestAccumulator(startTime, endTime,request){
	if(requestAccumulator.count == 1){
		firstRequestStartTime = startTime;
	}
	requestAccumulator.requests.push(request);
	startTime = (startTime - firstRequestStartTime);
	endTime = (endTime-firstRequestStartTime+2);
	requestAccumulator.startTimes.push(startTime);
	requestAccumulator.endTimes.push(endTime);
	// chrome.devtools.inspectedWindow.eval('console.log('+requestAccumulator.startTimes+')');
	// chrome.devtools.inspectedWindow.eval('console.log('+requestAccumulator.endTimes+')');
	var plotName = jsName;
	var plotColor = jsColor;
	requestAccumulator.graphCount =0;
	var documentType = request.response.content.mimeType;
	switch(documentType){
		case "text/css":
			plotName = cssName;
			plotColor = cssColor;
			break;
		case "text/html":
			plotName = htmlName;
			plotColor = htmlColor;
			break;
		case "application/javascript":
			plotName = jsName;
			plotColor = jsColor;
			break;
		case "image/png":
			plotName = imageName;
			plotColor = imageColor;
			break;
		
		default:
			plotName = defaultName;
			plotColor = defaultColor;
			
	}
	buildGraph(request);
	console.log(request);
	var trace = {
  		x: [startTime, endTime],
  		y:  [requestAccumulator.count,requestAccumulator.count],
  		type: 'scatter',
  		name: plotName,
  		marker:{
    		color: plotColor
  		}
	};
	requestAccumulator.traces.push(trace);
	plotTimings();
	requestAccumulator.count +=1;

	

}

function buildGraph(){
	var hash ={};
	var i;
	var j;
	var minEndTime = requestAccumulator.endTimes[i];
	for(i = 0; i<requestAccumulator.startTimes.length-1;i++){
		for(j = i+1;j<requestAccumulator.startTimes.length;j++){
			if(requestAccumulator.endTimes[i] < requestAccumulator.startTimes[j]){
				if(hash[requestAccumulator.requests[i].response.content.mimeType] == undefined){
					hash[requestAccumulator.requests[i].response.content.mimeType] = [];
				}
				hash[requestAccumulator.requests[i].response.content.mimeType].push(requestAccumulator.requests[j].response.content.mimeType);
				break;
			}
		}
	}
	var k;
	// for(k =0;k<hash.length;k++){
		document.getElementById('graph').innerHTML = JSON.stringify(hash);
	// }
	// console.log(hash);
}

function plotTimings(){
	console.log("Plot Graph Called");
	Plotly.newPlot('timings', requestAccumulator.traces);
}