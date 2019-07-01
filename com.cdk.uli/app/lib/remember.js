module.exports = (function() {
  //+ get :: String -> (_ -> JSON || 'undefined')
  var get = function(x) {
        return function() {
          var a =  Ti.App.Properties.getString(x);
          if(a) return JSON.parse(a);
        };
      }
  
  //+ set :: String -> JSON
    , set = function(name, x) {
        Ti.App.Properties.setString(name, JSON.stringify(x));
        return x;
      }.autoCurry()
  
  //+ forget :: String -> IO
    , forget = function(name) {
        Ti.App.Properties.setString(name, "");
      }
    ;
  
  return { get: get
         , set: set
         , forget: forget
         };
})();
