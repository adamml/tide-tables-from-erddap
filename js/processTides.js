function processTides(config){
  document.getElementById("headLocation").innerText = document.getElementById("headLocation").innerText + " " + concatLocation(config);
  var currentTime = new Date();
}

function concatLocation(config){
  return config.location.town + ", " + config.location.countyOrState + ", " + config.location.country;
}
