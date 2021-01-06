const config={
  "location": {
    "locale": "en-ie"
  },
  "dateOptions": {
    "weekday": "long",
    "month": "long",
    "day": "numeric"
  },
  "datum": "Sea surface height relative to modelled mean (average) sea level.",
  "erddapServer": {
    "baseURL": "https://erddap.marine.ie/erddap",
    "dataset": "IMI-TidePrediction_epa",
    "isTabledap": true,
    "location":{
      "field": "stationID"
     },
    "returnFields":{
      "time": "time",
      "height": "sea_surface_height"
    }
  },
  "acknowledgement": "Data supplied by the [Environmental Protection Agency](https://www.epa.ie/), Ireland; the [Marine Institute](https://www.marine.ie), Ireland and [Met Eireann](https://www.met.ie/), Ireland.",
  "optional": {
	  "temperature": {
		  "title": "Water temperature at Spiddal"
	  }
  }
}
