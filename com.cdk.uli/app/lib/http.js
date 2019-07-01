// specific implementation wrapper of http client for our app.
module.exports = function(base_url) {
  var http_client = require("/support/http_client/http_client")(base_url)
    , Promise = require('/support/promise')
    , request_headers = { "Accept": "application/json"
                        , "Content-Type": "application/json"
                        , "rb-api-version": "0.0.1"
                        }

  //+ _makeErrorFun :: Error -> f -> g -> Int -> (HTTPResponse -> IO)
    , _makeErrorFun = function(oldError, success, retry, count) {
        return function(r) {
          log("ERROR");
          log2("r", r);
          log2('count', count);
          if(!r || !r.responseText) {
            --count;
            if(count > 0) {
              log("RETRYING "+count);
              return retry(count);
            } else {
            	switch(r.status){
            		case 0:
            			_default_error();
            		break;
            		case 401:
            		break;
            		default:
	              	alert("There seems to be a problem with data coverage now. Please contact customer service at 888-416-6161 if this continues.");		      
            	}
            }
          };

          Ti.App.fireEvent('hideLoading');

          if(r && r.status > 401) { oldError(r.responseText); }
          success(r);
        };
      }
  
  //+ _makeSuccessFun :: f -> (HttpResponse -> JSON)
    , _makeSuccessFun = function(oldSuccess) {
        return function(r) {
          if(!r || !r.responseText) return;
          try{
            var json = JSON.parse(r.responseText);
          } catch(e) {
            log("Could not parse: "+ r.responseText);
          }
          
          // if(hadServerError(json)) {
          //   log("THERE WAS AN EXCEPTION");
          //   log(json);
          //   return UI.createAlertMessage(json.ExceptionType +": "+json.Message);
          // }
          
          //log('FINISH CALL' + Date());
          //log(json);
          
          // if(statusIsFailure(json)) {
          //   log("STATUS IS FAILURE");
          //   log(json);
          //   Ti.App.fireEvent('failure');
          //   return json;
          // } else {
            return json;
          // }
        };
      }
	
  //+ _callApi :: String -> String -> a -> b -> c -> Promise
	  , _callApi = function(method, path, callbacks, params, options) {
        var promise = new Promise();
        params = params || {};
        options = options || {};
        options.success = function(r) { promise.resolve(callbacks.success(r)); };
        options.error = function(r) { promise.resolve(callbacks.error(r)); };
        
        //log('START CALL' + Date());
        //log(path);
        //log(params);
        http_client[method](path, params, options);
        return promise;
      }
	
  //+ _makeCallFun :: String -> Int -> (String -> a -> b -> Int -> Promise)
    , _makeCallFun = function(type, the_count) {
   
        return function makeCall(path, params, options, count) {
          count = count || the_count;
          params = params || {};
          options = options || {};
          var callbacks = {};
       
          var oldSuccess = callbacks.success || callbacks;
          var oldError = callbacks.error || _default_error;
      
          var success = _makeSuccessFun(oldSuccess);
          //var error = _makeErrorFun(oldError, success, makeCall.p(path, callbacks, params, options), count);
          //Fix for undefined parameters being passed in subsequent request when API request fails
          var error = _makeErrorFun(oldError, success, makeCall.p(path,params, options), count);
          return _callApi(type, path, {success: success, error: error}, params, options);
        };
      }
	
  //+ _default_error :: IO
	  , _default_error = function(resp) {
	  		if(resp) {
	  			var r = JSON.parse(resp);
	  			var msg = r.message ? r.message : (r.responseText? r.responseText:'Some error has occured, please try later');
  			alert(msg);
	  		} else {
		    	alert("We couldn't establish an internet connection");
		   }
	    }
	
  //+ get :: String -> a -> b -> Int -> Promise
	  , get = _makeCallFun('get', 5)
	
  //+ post :: String -> a -> b -> Int -> Promise
	  , post = _makeCallFun('post', 0)

  //+ expireCache :: IO
    , expireCache = http_client.expireCache

  //+ setHeaders :: IO
    , setHeaders = http_client.setHeaders

  //+ resetHeaders :: IO
    , resetHeaders = http_client.resetHeaders

  //+ addHeader :: String -> String -> IO
    , addHeader = http_client.addHeader

  //+ setCredentials :: { UserName: String, Password: String } -> IO
    , setCredentials = function(c) {      
        http_client.addHeader("Authorization", '');
        var Remember = require('/remember');
  		var samlToken = Remember.get('current_saml_token')();  		
        http_client.addHeader("rb-token", samlToken);     
        return c;
      }
    ;

  http_client.setHeaders(request_headers);

	return { get: get
         , post: post
         , expireCache: expireCache
         , setHeaders: setHeaders
         , resetHeaders: resetHeaders
         , addHeader: addHeader
         , setCredentials: setCredentials
         };	
};
