module.exports = function(base_url) {
  //+ @deftype Url = String

	var HTTPClientWithCache = nrequire("/support/http_client/http_client_with_cache")
    , current_client
    , request_headers = { "Accept": "application/json"
                        , "Content-Type": "application/json"
                        , "rb-api-version": "0.0.1"
                        }

  //+ getClient :: _ -> HTTPClientWithCache
	  , getClient = function() {
        var options = { baseUrl: base_url
                      , retryCount: 3
                      , cacheSeconds: 0
                      };
		    current_client = new HTTPClientWithCache(options);
		    return current_client;
	    }
	
  //+ fixArgs :: a -> b -> [a, b]
    , fixArgs = function(params_or_callbacks, callbacks) {
        var params = params_or_callbacks;
        if(params_or_callbacks.success) {
          callbacks = params_or_callbacks;
          params = {};
        }
        return [callbacks, params];
      }

  //+ setHeaders :: a -> IO
    , setHeaders = function(headers) {
        request_headers = headers || { "Accept": "application/json"
                        , "Content-Type": "application/json"
                        , "rb-api-version": "0.0.1"
                        }; 
      }

  //+ resetHeaders :: undefined
    , resetHeaders = function() {
        request_headers = { "Accept": "application/json"
                        , "Content-Type": "application/json"
                        , "rb-api-version": "0.0.1"
                        };
      }

  //+ addHeader :: String -> String -> IO
    , addHeader = function(key, value) {
        request_headers[key] = value;
      }

  //+ prepareHeaders :: HTTPClientWithCache -> IO
	  , prepareHeaders = function(client) {
        var key;
        for(key in request_headers) {
          if(request_headers.hasOwnProperty(key)) {
            client.setRequestHeader(key, request_headers[key]);
          }
        }
      }

  //+ prepare :: String -> Url -> a -> HTTPClientWithCache
	  , prepare = function(method, url, callbacks) {
        client = getClient();
        var progress_bar = callbacks.progress_bar;
        client.options.preload = callbacks.preload;
        if(progress_bar) client.options.onsendstream = function(e){ progress_bar.value = e.progress };
        client.options.onload = callbacks.success;
        client.options.onerror = callbacks.error;
        client.open(method, url);
        prepareHeaders(client);
        return client;
      }
    
  //+ queryString :: a -> String
    , queryString = function(params) {
        var keys = [];
        for (var key in params) {keys.push([key, encodeURIComponent(params[key])]); };
        var qstring = reduce("y += x[0] + '=' + x[1] + '&'".lambda(), "", keys);
        if (qstring !== "") qstring = '?'+qstring;
        qstring = replace(/&$/, "", qstring);
        return qstring;
      }
		
  //+ post :: Url -> {} -> f -> Action(HTTP)
	  , post = function(url, params_or_callbacks, callbacks) {
        var fixed_args = fixArgs(params_or_callbacks, callbacks)
          , params = fixed_args[1]
          ;
        callbacks = fixed_args[0];
        params = callbacks.isData ? params : JSON.stringify(params);
        prepare("POST", url, callbacks).send({data : params});
	    }
	
  //+ get :: Url -> a -> b -> Action(HTTP)
	  , get = function(url, params_or_callbacks, callbacks) {
        var fixed_args = fixArgs(params_or_callbacks, callbacks)
          , params = fixed_args[1]
          ;
        callbacks = fixed_args[0];
        url = url + queryString(params);
        prepare("GET", url, callbacks).send();
      }
	
  //+ destroy :: Url -> a -> b -> Action(HTTP)
	  , destroy = function(url, params_or_callbacks, callbacks) {
        var fixed_args = fixArgs(params_or_callbacks, callbacks)
          , params = fixed_args[1]
          ;
        callbacks = fixed_args[0];
        url = url + queryString(params);
        prepare("DELETE", url, callbacks).send();
      }

  //+ expireCache :: IO
	  , expireCache = function() {
        (current_client || getClient()).prune_cache(1);
      }
    ;

	return { post: post
         , get: get
         , destroy: destroy
         , expireCache: expireCache
         , setHeaders: setHeaders
         , resetHeaders: setHeaders
         , addHeader: addHeader
         };
};
