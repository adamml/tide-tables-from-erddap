(function processTides(config){
  moment.locale(config.locale);
  document.getElementById("headLocation").innerText = document.getElementById("headLocation").innerText + " " + concatLocation(config);
  document.getElementById("title").innerText = concatLocation(config) + " | " + document.getElementById("title").innerText;
  var currentTime = new Date();
  
  function concatLocation(config){
    return config.location.town + ", " + config.location.countyOrState + ", " + config.location.country;
  }
}(config));
