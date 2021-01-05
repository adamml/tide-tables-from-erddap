// TODO: Add temperature data

(function processTides(config, beaches){
  moment.locale(config.locale);
	
  var thisBeach = null;
  const queryParameters = new URLSearchParams(window.location.search);
  if(queryParameters.get('beachID')){
	  thisBeach = beaches.beaches.find(beach=> beach.epaID === queryParameters.get('beachID'));
  } else {
	  thisBeach = beaches.beaches.find(beach=> beach.epaID === 'IEWEBWC170_0000_0200');
  }
  console.log(thisBeach);
  
  document.getElementById("headLocation").innerText = 
	(document.getElementById("headLocation").innerText + " " + 
	thisBeach.beachName);
  document.getElementById("title").innerText = thisBeach.beachName + 
	" | " + document.getElementById("title").innerText;
  document.getElementById("dateHeading").innerText = 
	new Date().toLocaleDateString(config.location.locale,config.dateOptions);
  document.getElementById("acknowledgement").innerHTML = 
	(config.acknowledgement.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, 
	'<a href="$2" target="_blank" title="$4">$1</a> <i class="material-icons">open_in_new</i>'));
  document.getElementById("datum").innerText = 
	config.datum;
  
  buildErddapUrl(config, thisBeach);
  
  var daylight = SunCalc.getTimes(new Date(), thisBeach.latitude, thisBeach.longitude);
  document.getElementById("valueDawn").innerText = `${String(daylight.dawn.getHours()).padStart(2, '0')}:${String(daylight.dawn.getMinutes()).padStart(2, '0')}`;
  document.getElementById("valueSunrise").innerText = `${String(daylight.sunrise.getHours()).padStart(2, '0')}:${String(daylight.sunrise.getMinutes()).padStart(2, '0')}`;
  document.getElementById("valueSunset").innerText = `${String(daylight.sunset.getHours()).padStart(2, '0')}:${String(daylight.sunset.getMinutes()).padStart(2, '0')}`;
  document.getElementById("valueDusk").innerText = `${String(daylight.dusk.getHours()).padStart(2, '0')}:${String(daylight.dusk.getMinutes()).padStart(2, '0')}`;
  console.log(daylight);
  
  	var p =  Promise.all([
	  fetch(`https://api.beaches.ie/odata/beaches?$filter=Code%20eq%20%27${thisBeach.epaID}%27`),
	  fetch(`https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction_epa.json?time%2Csea_surface_height&stationID=%22${thisBeach.miID}%22&time%3E=2021-01-4T21%3A00%3A00Z&time%3C=2021-01-6T03%3A00%3A00Z`)
	  //fetch(`https://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=${thisBeach.latitude};long=${thisBeach.longitude}`,{
	  //		headers: {'X-Requested-With': 'fetch'}
	  //	}),
	  // fetch('https://cors-anywhere.herokuapp.com/https://www.met.ie/warningsxml/rss.xml')
	]).
	then((responses) => {
		return Promise.all(responses.map(function (response) {
			var retVal;
			try{
				retVal = response.json();
			} catch {
				retVal = response.text();
			}
			return retVal;
		}));
	}).
	then(writer => {
		document.getElementById("waterQualityValue").innerText = writer[0].value[0].WaterQualityName;
		document.getElementById("waterQualityLastUpdated").innerText = `Water quality data last updated on ${writer[0].value[0].LastUpdatedOn}`;
		return writer;
	}).
	then(report => console.log(report));
  
  function buildErddapUrl(config, thisBeach){
    var tableOrGrid = "tabledap";
    if(!config.erddapServer.isTabledap){
      tableOrGrid = "griddap";
    }
    
    var getVariables = config.erddapServer.returnFields.time +
		"%2C" + config.erddapServer.returnFields.height;
	
	var erddapQuery = (config.erddapServer.baseURL + "/" + tableOrGrid + "/" + 
		config.erddapServer.dataset + ".json?" + getVariables + "&" + 
		config.erddapServer.location.field + "=%22" + 
		thisBeach.miID + "%22") +
		'&' + getDateRange();
	
	//getLocation();
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', erddapQuery);
	
	xhr.onload = function(){
			
    if (xhr.status === 200) {
        data = JSON.parse(xhr.responseText);
		var tideTable = new Array();;
		var lastTide;
		var today = moment().utc().year() + "-" + 
			("00" + (moment().utc().month()+1)).slice(-2) + "-" + ("00" + (moment().utc().date())).slice(-2);
		var yesterday = moment().utc().subtract(1, 'days').year() + "-" + 
			("00" + (moment().utc().subtract(1, 'days').month()+1)).slice(-2) + 
			"-" + ("00" + moment().utc().subtract(1, 'days').date()).slice(-2);
		var oddEven = "odd";
		var materialArrow;
		var tideTableIdx = 0;
		data.table.rows.forEach(function(item, index) {
			if(index > 0){
				if(index > 1 &&
						Math.sign(item[1] - data.table.rows[index-1][1]) != lastTide && 
						item[1] - data.table.rows[index-1][1] != 0){
					if(lastTide == 1){
						materialArrow = '<i class="material-icons">arrow_upward</i>'
					} else {
						materialArrow = '<i class="material-icons">arrow_downward</i>'
					}
					if(moment().isDST()){
						if((data.table.rows[index-1][0].search(today) > -1 &&
								parseInt(data.table.rows[index-1][0].substring(11,13)) < 23) ||
								(data.table.rows[index-1][0].search(yesterday) > -1) &&
								parseInt(data.table.rows[index-1][0].substring(11,13)) > 22) {
										
							time = parseInt(data.table.rows[index-1][0].substring(11,13))+1;
							document.getElementById('tideArrow'+tideTableIdx).innerHTML = materialArrow;
							document.getElementById('tideTime'+tideTableIdx).innerText = ('00' + time.toString()).slice(-2) + ':' + data.table.rows[index-1][0].substring(14,16);
							document.getElementById('tideHeight'+tideTableIdx).innerText = data.table.rows[index-1][1];
							tideTableIdx += 1;
						}
					}
					else{
						if(data.table.rows[index-1][0].search(today) > -1){
							document.getElementById('tideArrow'+tideTableIdx).innerHTML = materialArrow;
							document.getElementById('tideTime'+tideTableIdx).innerText = data.table.rows[index-1][0].substring(11,16);
							document.getElementById('tideHeight'+tideTableIdx).innerText = data.table.rows[index-1][1];
							tideTableIdx += 1;
						}
					}
				}
				if(item[1] - data.table.rows[index-1][1] != 0){
					lastTide = Math.sign(item[1] - data.table.rows[index-1][1]);
				}
			}
		});
		plotTideToday(data.table.rows,config, thisBeach);
	}
    else {
        console.log('Request failed.  Returned status of ' + xhr.status);
    }};
	xhr.send();
	
  }

  function jsonp(url) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement('script')
        const name = "_jsonp_" + Math.round(100000 * Math.random());
        //url formatting
        if (url.match(/\?/)) url += "&.jsonp="+name
        else url += "?.jsonp="+name
        script.src = url;
		console.log(script);
        window[name] = function(data) {
            console.log(data);
			resolve(data);
            document.body.removeChild(script);
            delete window[name];
        }
        document.body.appendChild(script);
    });
}
  
  function getDateRange(){
	  moment();
	  var erddapTime = 'time>=' + moment().subtract(1, 'days').year() + 
		'-' + ("00"+(moment().subtract(1, 'days').month()+1)).slice(-2) + 
		'-' + moment().subtract(1, 'days').date() + 'T21%3A00%3A00Z';
	  moment().add(2, 'days');
	  return erddapTime + '&time<=' + moment().add(1, 'days').year() + '-' + 
		("00"+(moment().add(1, 'days').month()+1)).slice(-2) + 
		'-' + moment().add(1, 'days').date() + 'T03%3A00%3A00Z';
  }
  
  function getLocation(){
	  var nav;
	  if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(function(position){
			  console.log(position.coords.longitude);
			  nav.longitude = position.coords.longitude;
		  });
	  }
	  else{
		  nav.latitude = -999;
		  nav.longitude = -999;
	  }
	  console.log(nav);
  }
  
  function plotTideToday(data, config, thisBeach){
	moment();
	
	var margin = {top: 20, right: 50, bottom: 20, left: 50},
		width = 600 - margin.left - margin.right,
		height = 150 - margin.top - margin.bottom;
	
	/* Trim the data array to only display today's tides */
	
	var startTime = new String();
	var endTime = new String();
	var idxStartTime = new Number();
	var idxEndTime = new Number();
	
	if(moment().isDST()){
		startTime = moment().utc().subtract(1, 'days').year() + "-" + 
			("00" + (moment().utc().subtract(1, 'days').month()+1)).slice(-2) + 
			"-" + ("00" + moment().utc().subtract(1, 'days').date()).slice(-2) + 'T23:00:00Z';
		endTime = moment().utc().year() + "-" + 
			("00" + (moment().utc().month()+1)).slice(-2) + "-" + ("00" + (moment().utc().date())).slice(-2) + 'T23:00:00Z';
	} else {
		startTime = moment().utc().year() + "-" + 
			("00" + (moment().utc().month()+1)).slice(-2) + "-" + ("00" + (moment().utc().date())).slice(-2) + 'T00:00:00Z';
		endTime = moment().utc().add(1, 'days').year() + "-" + 
			("00" + (moment().utc().add(1, 'days').month()+1)).slice(-2) + 
			"-" + ("00" + moment().utc().add(1, 'days').date()).slice(-2) + 'T00:00:00Z';
	}
	
	for(var i=0; i < data.length; i++){
		if(data[i][0] === startTime){
			idxStartTime = i;
		} else if (data[i][0] === endTime) {
			idxEndTime = i;
		}
	}
	
	data = data.slice(idxStartTime,idxEndTime);
	console.log(data);
	
	/* Plot the data */
	
	var x = d3.scaleTime()
		.domain([Date.parse(data[0][0]), Date.parse(data[(data.length)-1][0])])
		.range([margin.left, width - margin.right]);
	
	var y = d3.scaleLinear()
		.domain([thisBeach.tidalMinimum,thisBeach.tidalMaximum])
		.range([height - margin.bottom, margin.top]);
			
	var svg = d3.select("#plotTides")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
		
	var vLine = d3.line()
		.x(d => x(Date.parse(d[0])))
		.y(d => y(d[1]));
		
	svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft().scale(y));
		
	svg.append("svg:path")
		.attr("d", vLine(data));
	svg.append("g").call(d3.axisBottom().scale(x));
		
  };
}(config, beaches));
