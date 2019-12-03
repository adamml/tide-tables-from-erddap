// TODO: Add temperature data

(function processTides(config){
  moment.locale(config.locale);
  
  document.getElementById("headLocation").innerText = 
	(document.getElementById("headLocation").innerText + " " + 
	concatLocation(config));
  document.getElementById("title").innerText = concatLocation(config) + 
	" | " + document.getElementById("title").innerText;
  document.getElementById("dateHeading").innerText = 
	new Date().toLocaleDateString(config.location.locale,config.dateOptions);
  document.getElementById("acknowledgement").innerHTML = 
	(config.acknowledgement.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, 
	'<a href="$2" target="_blank" title="$4">$1</a> <i class="material-icons">open_in_new</i>'));
  document.getElementById("datum").innerText = 
	config.datum;
  
  buildErddapUrl(config);
  
  function concatLocation(config){
    return (config.location.town + ", " + config.location.countyOrState + 
		", " + config.location.country);
  }
  
  function buildErddapUrl(config){
    var tableOrGrid = "tabledap";
    if(!config.erddapServer.isTabledap){
      tableOrGrid = "griddap";
    }
    
    var getVariables = config.erddapServer.returnFields.time +
		"%2C" + config.erddapServer.returnFields.height;
	
	var erddapQuery = (config.erddapServer.baseURL + "/" + tableOrGrid + "/" + 
		config.erddapServer.dataset + ".json?" + getVariables + "&" + 
		config.erddapServer.location.field + "=%22" + 
		config.erddapServer.location.value + "%22") +
		'&' + getDateRange();
	
	$.getJSON(erddapQuery, function(data){
			var tideTable;
			var lastTide;
			var today = moment().utc().year() + "-" + 
				("00" + (moment().utc().month()+1)).slice(-2) + "-" + ("00" + (moment().utc().date())).slice(-2);
			var yesterday = moment().utc().subtract(1, 'days').year() + "-" + 
				("00" + (moment().utc().subtract(1, 'days').month()+1)).slice(-2) + 
				"-" + ("00" + moment().utc().subtract(1, 'days').date()).slice(-2);
			var oddEven = "odd";
			var materialArrow;
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
										document.getElementById("tideTable").innerHTML = 
											document.getElementById("tideTable").innerHTML +
											'<div class="' + oddEven + '">' +
											'<div class="tideArrow">' + materialArrow + '</div>' +
											'<div class="tideTime">' + 
											('00' + time.toString()).slice(-2) + 
											':' + data.table.rows[index-1][0].substring(14,16) + '</div>' +
											'<div class="tideHeight">' + data.table.rows[index-1][1] + '</div>' +
											'</div>';
										if(oddEven == 'odd'){oddEven = 'even'; } else {oddEven = 'odd'; }
								}
							}
							else{
								if(data.table.rows[index-1][0].search(today) > -1){
									document.getElementById("tideTable").innerHTML = 
										document.getElementById("tideTable").innerHTML +
										'<div class="' + oddEven + '">' +
										'<div class="tideArrow">' + materialArrow + '</div>' +
										'<div class="tideTime">' + data.table.rows[index-1][0].substring(11,16) + '</div>' +
										'<div class="tideHeight">' + data.table.rows[index-1][1] + '</div>' 
										'</div>';
									if(oddEven == 'odd'){oddEven = 'even'; } else {oddEven = 'odd'; }
								}
							}
					}
					if(item[1] - data.table.rows[index-1][1] != 0){
						lastTide = Math.sign(item[1] - data.table.rows[index-1][1]);
					}
				}
			});
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
  
}(config));
