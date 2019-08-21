const config={
  "location": {
    "town": "Salthill",
    "countyOrState": "Galway",
    "country": "Ireland",
    "locale": "en-ie"
  },
  "dateOptions": {
    "weekday": "long",
    "month": "long",
    "day": "numeric"
  },
  "erddapServer": {
    "baseURL": "https://erddap.marine.ie/erddap",
    "dataset": "IMI-TidePrediction_epa",
    "isTabledap": true,
    "location":{
      "field": "stationID",
      "value": "IEWEBWC170_0000_0200_MODELLED"
     },
    "returnFields":[
      "time",
      "stationID",
      "seasurfaceHeight"
    ]
  },
  "acknowledgment": "Data supplied by the [Marine Institute](https://www.marine.ie), Ireland."
}
