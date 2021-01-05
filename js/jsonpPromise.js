function jsonp(url, timeout){
	function urlJoinChar(url) {
        return url.indexOf('?') >= 0 ? '&' : '?'
    }

    return new Promise( function (resolve, reject) {
        var timeout = timeout || 10000; // default timeout
        var callbackName = 'jsonp_callback_' + Date.now();
        var head = document.getElementsByTagName('head')[0] || document.documentElement;
        var script = document.createElement('script');
        script.src = url +  urlJoinChar( url ) + 'callback=' + callbackName;
        script.async = "true";

        window[callbackName] = function(data) {
            cleanUp();
            resolve( JSON.stringify(data) );
        }

        script.onerror = function() {
            cleanUp();
            reject( Error("Network error loading " + script.src) );
        }

        head.appendChild(script);
        var timeoutFunction = setTimeout(function() {
            cleanUp();
            reject( Error("Request to " + url + " failed to execute callback after " + timeout + "ms.") )  
        }, timeout);
  
        function cleanUp() {
            timeoutFunction && clearTimeout(timeoutFunction);
            window[callbackName] && delete window[callbackName];
            script && head.removeChild(script);
        }

    } );
};

function getJSON(url) {
    return jsonp(url).then(JSON.parse).catch(error => console.log(error));
};

console.log(getJSON('https://api.beaches.ie/odata/beaches'));