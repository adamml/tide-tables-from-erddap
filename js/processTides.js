(function processTides(config){
  moment.locale(config.locale);
  document.getElementById("headLocation").innerText = document.getElementById("headLocation").innerText + " " + concatLocation(config);
  document.getElementById("title").innerText = concatLocation(config) + " | " + document.getElementById("title").innerText;
  var currentTime = new Date();
  document.getElementById("dateHeading").innerText = currentTime.toLocaleDateString(config.location.locale,config.dateOptions);
  
  console.log(buildErddapUrl(config));
  
  function concatLocation(config){
    return config.location.town + ", " + config.location.countyOrState + ", " + config.location.country;
  }
  
  function buildErddapUrl(config){
    var tableOrGrid = "tabledap";
    if(!config.erddapServer.isTabledap){
      tableOrGrid = "griddap";
    }
    
    return config.erddapServer.baseURL + "/" + tableOrGrid;
  }
  
}(config));
