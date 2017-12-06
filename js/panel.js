// Filename: panel.js
// Date:     November 2017
// Authors:  Thomas Binu & Nihar Patil & Kritka Sahni
// Purpose:  Defines panel UI and captures HAR request

var performance;
var gotData = false;
var winPerf;

var port = chrome.runtime.connect({
    name: "panels-page"
});

port.onMessage.addListener(function (message) {

   // document.getElementById('performance').innerHTML  = JSON.stringify(message);
	console.log("Inside Message");
   	console.log(message);
   	winPerf = message;

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

firstRequestStartTime =0;
totalPageLoadTime = 0
prevEndTime = 0


firstRequestStartTime =0;

function requestAccumulator(startTime, endTime,request){
	if(requestAccumulator.count == 1){
		firstRequestStartTime = startTime;
		totalPageLoadTime = endTime - startTime;
	}
	else{

		if (prevEndTime > startTime)
			totalPageLoadTime += (endTime - prevEndTime);
		else{
			totalPageLoadTime += (endTime - startTime);
		}

	}
	prevEndTime = endTime;


	requestAccumulator.requests.push(request);
	startTime = (startTime - firstRequestStartTime);
	endTime = (endTime-firstRequestStartTime+2);
	requestAccumulator.startTimes.push(startTime);
	requestAccumulator.endTimes.push(endTime);
	// chrome.devtools.inspectedWindow.eval('console.log('+requestAccumulator.startTimes+')');
	// chrome.devtools.inspectedWindow.eval('console.log('+requestAccumulator.endTimes+')');
	requestAccumulator.graphCount =0;
	var documentType = request.response.content.mimeType;

	plotName = request.response.content.mimeType;
	buildGraph();
	// console.log(request);
	var trace = {
  		x: [startTime, endTime],
  		y:  [requestAccumulator.count,requestAccumulator.count],
  		type: 'scatter',
  		name: plotName
  		// marker:{
    // 		color: plotColor
  		// }
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
			if(requestAccumulator.endTimes[i] <= requestAccumulator.startTimes[j]){
				if(hash[requestAccumulator.requests[i].response.content.mimeType] == undefined){
					hash[requestAccumulator.requests[i].response.content.mimeType] = new Set();
				}
				hash[requestAccumulator.requests[i].response.content.mimeType].add(requestAccumulator.requests[j].response.content.mimeType);
			}
		}
	}
	plotGraph(hash);
	
	// console.log(hash);
}

function plotGraph(hash){
	
	var graph = new Springy.Graph();

	var k;
	var l;
	
	Object.keys(hash).forEach(function(key) {
		var m = graph.newNode({label:key});
		hash[key].forEach(function(key1){
			var n = graph.newNode({label:key1});
			graph.newEdge(m,n);
		}); 
	});
	jQuery(function(){
  		var springy = window.springy = jQuery('#my_canvas').springy({
    		graph: graph,
    		nodeSelected: function(node){
    	}
  	});
});
	// console.log(hash);
	
	// $('#my_canvas').springy({ graph: graph });

}

function plotTimings(){
	Plotly.newPlot('timings', requestAccumulator.traces);
	pageLoadTime();
}


function pageLoadTime(){
	console.log("Page Load Called");

    var endTime = requestAccumulator.endTimes[requestAccumulator.count - 1];
    var displayString = endTime;

    
    var domLoadingComplete = winPerf.timing.domComplete -  winPerf.timing.domLoading ;
	var domParsingTime = winPerf.timing.domContentLoadedEventEnd -  winPerf.timing.domLoading ;
	displayString += "dom parsing time:" + domParsingTime + 'end time:' + domLoadingComplete;

    document.getElementById('pageload').innerHTML = Math.round((domParsingTime / (domParsingTime+totalPageLoadTime)) * 100) + "%";
}
