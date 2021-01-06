const fetch = require("node-fetch");

const erddapBase = 'https://erddap.marine.ie';
const tidePredictions = 'IMI-TidePrediction_epa';
const modelGrid = 'IMI_NEATL';
const modelGridParameter = 'sea_surface_temperature';
const erddapLatitude = 'latitude';
const erddapLongitude = 'longitude';
const erddapStationId = 'stationID';
const erddapSeaSurfaceHeight = 'sea_surface_height';

const epaApiBaseUrl = 'https://api.beaches.ie/odata/beaches';

const todayDateString = new Date().toISOString().slice(0,10);

// TODO: Add in getting tidal ranges for each beach
// TODO: Map FIPS code to county beach for weather warnings

const fips = {
	Carlow: 'EI01',
	Cavan: 'EI02',
	Clare: 'EI03',
	Cork: 'EI04',
	Donegal: 'EI06',
	Dublin: 'EI07',
	Galway: 'EI10',
	Kerry: 'EI11',
	Kildare: 'EI12',
	Kilkenny: 'EI13',
	Leitrim: 'EI14',
	Laois: 'EI15',
	Limerick: 'EI16',
	Longford: 'EI18',
	Louth: 'EI19',
	Mayo: 'EI20',
	Meath: 'EI21',
	Monaghan: 'EI22',
	Offaly: 'EI23',
	Roscommon: 'EI24',
	Sligo: 'EI25',
	Tipperary: 'EI26',
	Waterford: 'EI27',
	Westmeath: 'EI29',
	Wexford: 'EI30',
	Wicklow: 'EI31' 
};

function getTidalRanges(beaches){
		fetch(`${erddapBase}/erddap/tabledap/${tidePredictions}.json?${erddapStationId},${erddapSeaSurfaceHeight}&orderByMinMax(%22${erddapStationId},${erddapSeaSurfaceHeight}%22)`).
		then(response => response.json()).
		then(data => {
			data.table.rows.map(row =>{
				var thisBeach = beaches.beaches.findIndex(beach => beach.miID === row[0]);
				if(thisBeach > -1){
					if(row[1] < 0){
						beaches.beaches[thisBeach].tidalMinimum = row[1];
					} else {
						beaches.beaches[thisBeach].tidalMaximum = row[1];
					}
				}
				return true;
			});
		}).
		then(report => console.log('var beaches = ' + JSON.stringify(beaches)));
};

function mapModel(beaches){
	fetch(erddapBase + '/erddap/griddap/' + modelGrid + '.json?' + modelGridParameter +  '[(' + todayDateString + 'T00:00:00Z):1:(' + todayDateString + 'T00:00:00Z)][(' + String(beaches.latMin - 0.5) + '):1:(' + String(parseFloat(beaches.latMax) + parseFloat(0.5)) + ')][(' + String(beaches.lonMin - 0.5) + '):1:(' + String(parseFloat(beaches.lonMax) + parseFloat(0.5)) + ')]').
	then(response => response.json()).
	then(removeNulls => removeNulls.table.rows.filter(value => value[3] !== null)).
	then(gridPoints => {
		beaches.beaches.map(beach => {
			var distance = null;
			gridPoints.forEach(gridPoint =>{
				if(distance === null | distance > Math.pow(Math.pow(beach.latitude - gridPoint[1],2) + Math.pow(beach.longitude-gridPoint[2],2),0.5)){
					distance = Math.pow(Math.pow(beach.latitude - gridPoint[1],2) + Math.pow(beach.longitude-gridPoint[2],2),0.5);
					beach.modelGridLatitude = gridPoint[1];
					beach.modelGridLongitude = gridPoint[2];
				}
			});
			return beach;
		});
		return beaches;
	}).
	then(beaches => getTidalRanges(beaches));
};

function getBeaches() {
	Promise.all([
		fetch(erddapBase + '/erddap/tabledap/' + tidePredictions + '.json?' + erddapLatitude + ',' + erddapLongitude + ',' + erddapStationId + '&distinct()'),
		fetch(epaApiBaseUrl),
		fetch(erddapBase + '/erddap/tabledap/' + tidePredictions + '.json?' + erddapLatitude + '&distinct()&orderByMinMax("' + erddapLatitude + '")'),
		fetch(erddapBase + '/erddap/tabledap/' + tidePredictions + '.json?' + erddapLongitude + '&distinct()&orderByMinMax("' + erddapLongitude + '")')
	]).
	then((responses) => {
		return Promise.all(responses.map(function (response) {
			return response.json();
		}));
	}).
	then((buildMap) => {
		var beaches = buildMap[0].table.rows.map(mapItem => {
			var thisBeach = buildMap[1].value.filter(
				obj => {
  				return obj.Code === mapItem[2].replace('_MODELLED','')
			});
			thisBeach = thisBeach[0];
			try{
    			return {
					beachName: thisBeach.Name + ', ' + thisBeach.CountyName,
    				epaID: mapItem[2].replace('_MODELLED',''),
					fipsCode: fips[thisBeach.CountyName],
					miID: mapItem[2],
        			latitude: Number(mapItem[0]),
        			longitude: Number(mapItem[1])
 				};
			} catch(err){
				return null;
			}
		});
		return {	
			'beaches': beaches,
			'latMax': buildMap[2].table.rows[1],
			'latMin': buildMap[2].table.rows[0],
			'lonMax': buildMap[3].table.rows[1],
			'lonMin': buildMap[3].table.rows[0]
		};
	}).
	then(removeNulls => {
		removeNulls.beaches = removeNulls.beaches.filter(function (element) {
			return element != null;
		});
		return removeNulls;
	}).
	then(sortBeaches => {
		sortBeaches.beaches = sortBeaches.beaches.sort(function(a, b) {
    		return ('' + a.beachName).localeCompare(b.beachName);
		});
		return sortBeaches;
	}).
	then(report => mapModel(report)).
	catch((error) => console.error(error));
}
					
getBeaches();