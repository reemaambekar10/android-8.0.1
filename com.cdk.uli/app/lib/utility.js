var toTitleCase = function(str) {
      if(!str) return '';
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
    // Function to test if device is iOS 7 or later
    , isIos7 = (function () {
        // iOS-specific test
        if (Ti.Platform.name == 'iPhone OS')
        {
            var version = Ti.Platform.version.split(".");
            var major = parseInt(version[0],10);

            // Can only test this support on a 3.2+ device
            if (major >= 7)
            {
                return true;
            }
        }
        return false;
    }())
    , digitsOnly = function(e) {    	
    	if(e && e.source && e.source.value && e.source.value.length > 0 && e.source.value != e.source.value.replace(/[^0-9]/g,"")){  
			e.source.value = e.source.value.replace(/[^0-9]/g,"");
			if ( Ti.Platform.osname == 'android') {	
        			e.source.setSelection(e.source.value.length,e.source.value.length);  
    	    }
		}
    };
    

module.exports = {
  toTitleCase: toTitleCase,
  isIos7: isIos7,
  digitsOnly: digitsOnly
};
