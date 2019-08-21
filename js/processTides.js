function processTides(config){
  var h2 = document.getElementById("headLocation")
  h2.value = h2.value + " " + concatLocation(config);
}

function concatLocation(config){
  return config.location.town + ", " + config.location.countyOrState + ", " + config.location.country;
}
