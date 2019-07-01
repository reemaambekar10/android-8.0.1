// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
//
// Alloy.Globals.someGlobalFunction = function(){};

nrequire = require;
nrequire('common_requires');

try {
    var GitHash = require('githash');
    if (GitHash) {
        Alloy.Globals.githash = GitHash.githash;
    }
} catch (e) {
    Ti.API.info('Warning: githash not found!');
}

//needed for SAML 
base_url_web = 'https://www.adplotmanagement.com/';
console.log('base_url_web : '+base_url_web);

getBaseUrlForWeb = function(){
	return base_url_web;
};
getCurrentUser = function() {
  var Remember = require('/remember');
  return Remember.get('current_user')();
};

getCurrentDealership = function() {
  var Remember = require('/remember');
  return Remember.get('current_dealership')();
};

getCurrentDealershipId = function() {
  var Remember = require('/remember');
  return Remember.get('current_dealership')().rbId;
};

makeCrossPlatformRow = function(params) {
  var widg = Alloy.createWidget('picker_table')
    , row
    ;
  if(OS_ANDROID) {
    row = widg.makeRow(params);
  } else {
    row = Ti.UI.createPickerRow(params);
  }
  return row;
};

getRbObjDefault = function(coll) {
  var isTrue = function(obj) { return obj.additionalInfo == 'True' || obj.additionalInfo == true || obj.additionalInfo == 'true'; };
  var default_obj = filter(isTrue, coll);
  return first(default_obj) || first(coll) || {additionalInfo: '', code: '', description: ''};
};

thread = function(fun, time) {
  setTimeout(fun, time || 10);
};

(function() {
  var db = Titanium.Database.install('/test.db', 'mydb')
    , User = require('user')
    ;
    	console.log("openApp function is called!!");
 if (OS_IOS)
db.file.remoteBackup = false;
db.close();
var Repo = require('/repo')
    , Remember = require('remember')
    ;
  if(Remember.get('current_saml_token')()) {
  	
    Repo.Http.setCredentials();
 } 

  var user = Remember.get('current_user')();
  if(user) { User.set(user); }
})();
getIntentUrl = function(){
	var Remember = require('/remember');
	var uri = '';
	if(OS_ANDROID){
		var activity = Ti.Android.currentActivity;	
		var intent = activity.getIntent();	
		uri = intent.getData();	
	}else{
		//For IOS 
		console.log("Existing arguments : "+Ti.App.getArguments());
		uri = Ti.App.getArguments().url;
	}
	Remember.set('current_url', uri);
	var getUrl =  Remember.get('current_url')();
	Ti.API.info("start url " + getUrl);
	if(getUrl){
		var paramsUrl=getUrl.split('?');
		var params=paramsUrl[1].split('&');
		Remember.forget('crm_dealerId');
		Remember.forget('crm_leadId');
		Remember.forget('crm_consumerId');
		for(var i=0;i<params.length;i++){
			var item=params[i].split('=');
			var key=item[0] ? item[0].toLowerCase() : '';
			if(key=='dealerid'){
				Remember.set('crm_dealerId', item[1]);
			}else if(key=='consumerid'){
				Remember.set('crm_consumerId', item[1]);
			}else if(key=='leadid'){
				Remember.set('crm_leadId', item[1]);
			}else{
				//Do Nothing
			}
		}
	}
}();

Ti.App.addEventListener( 'resumed', function(e) {
	var App = require('core');
	var uri = App.getLaunchUrl();
	if(uri && uri.indexOf('cdklotmanagement') == 0){
    	App.redirectToDeeplink(uri);
   	}
});
Alloy.Globals.palette = require('palette').palette;
Alloy.Globals.fa = require('fa');