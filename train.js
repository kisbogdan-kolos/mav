function init()
{
	setInterval(waitMinuteChange, 60000);
	requestData();
}

function waitMinuteChange()
{
	var time = new Date();
        var secondsRemaining = 60000 - (time.getSeconds() * 1000 + time.getMilliseconds());
        setTimeout(requestData, secondsRemaining);
}

function requestData() {
	var requestStartTime = new Date();
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var data = {};
			var parseOk = true;
			data.requestStartTime = requestStartTime;
			try {
				data.trains = JSON.parse(this.responseText);
			} catch(error)
			{
				alert("Hiba történt az adatok feldolgozása közben!\nHiba leírása: " + error);
				parseOk = false;
			}
			if (parseOk) processData(data);
		}
	};
	xhttp.open("GET", "http://apiv2.oroszi.net/elvira/maps", true);
	xhttp.send();
}

function processData(data)
{
	var trains = data.trains;
	var requestStartTime = data.requestStartTime;
	var displayNames = {MAV: "MÁV", HEV: "HÉV", GYSEV: "GYSEV"};
	var sortedTrains = {MAV: {list: [], delaySum: 0, maxDelay: 0},
			    HEV: {list: [], delaySum: 0, maxDelay: 0},
			    GYSEV: {list: [], delaySum: 0, maxDelay: 0}};
	trains.forEach(function(train) {sortedTrains[train.company].list.push(train);});
	Object.keys(sortedTrains).forEach(function(companyName) {
		var company = sortedTrains[companyName];
		company.list.forEach(function(train) {
			if(isNaN(train.delay)) train.delay = 0;
			company.delaySum += train.delay;
			if(company.maxDelay < train.delay) company.maxDelay = train.delay;
		});
	});
	Object.keys(sortedTrains).forEach(function(companyName) {
		var company = sortedTrains[companyName];
		company.avgDelay = company.delaySum / company.list.length;
		company.avgDelay = parseFloat(company.avgDelay.toFixed(1));
		if(isNaN(company.avgDelay)) company.avgDelay = 0;
		if(isNaN(company.maxDelay)) company.maxDelay = 0;
		document.getElementById(companyName.toLowerCase() + "-avg-delay").innerHTML = "Átlagos késés: " + company.avgDelay + " perc";
		document.getElementById(companyName.toLowerCase() + "-max-delay").innerHTML = "Maximális késés: " + company.maxDelay + " perc";
		document.getElementById(companyName.toLowerCase() + "-count").innerHTML = displayNames[companyName] + " (" + company.list.length + " db)";
	});
	document.getElementById("lastupdate").innerHTML = requestStartTime.toLocaleString("hu-HU", {year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit"});
}
