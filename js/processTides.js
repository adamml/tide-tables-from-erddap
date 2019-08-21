function processTides(config){
  document.getElementById("headLocation").value = document.getElementById("headLocation").value + " " + concatLocation(config);
  var currentTime = newDate();
}

function concatLocation(config){
  return config.location.town + ", " + config.location.countyOrState + ", " + config.location.country;
}
