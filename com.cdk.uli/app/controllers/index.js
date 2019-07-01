//@deftype ControllerName = String
//@deftype User = {}
var Remember = require('remember'),
    Aly = require('alloy_helpers'),
    App = require('core'),
    Repo = require('repo'),
    Loading = $.loading_view;

//+ isLoggedIn :: Bool
var isLoggedIn = function() {
	// Chose to remember password
	return (Remember.get('user_login')() && Remember.get('user_password')());
}
//+ open :: ControllerName -> Action(UI)
, 
    open = Aly.openView

//+ ifUserShowStart :: Action(UI)
,
    ifUserShowStart = ifelse(isLoggedIn, compose(App.open, Aly.createView_.p('start')), I),
    openStartForLoggedInUser = compose(App.open, Aly.createView_.p('start')),
    doClick = function() {
	if (Ti.Platform.osname === 'android') {
		Ti.Platform.openURL('market://details?id=com.adplotmanagement');
	} else {
		Ti.Platform.openURL('https://itunes.apple.com/us/app/cdk-front-office-edge-lot/id594100682?mt=8&uo=4');
	}
	$.dialog.show();
},
    validateAppVersion = function(data) {
    	console.log("isLoggedIn : "+Remember.get('user_login')() && Remember.get('user_password')());
	currentAppVersion = Titanium.App.version || 0;
	if ( typeof data !== 'undefined') {
		
		if (currentAppVersion != 0) {
			currentInstalledAppVersion = parseFloat(currentAppVersion);
			if (Ti.Platform.osname === 'android') {
				$.dialog.message = "Lot Management version " + data.androidAppVersion + " is available.\nYou are using version " + currentAppVersion + " \n Upgrade now to get the latest features!";
				if (data.androidAppVersion.trim() !== "") {
					var playstoreAppVersion = parseFloat(data.androidAppVersion.trim());
					if (playstoreAppVersion > currentInstalledAppVersion) {
						$.dialog.show();
						return "";
					};
				};
			} else {
				$.dialog.message = "Lot Management version " + data.iosAppVersion + " is available.\nYou are using version " + currentAppVersion + " \n Upgrade now to get the latest features!";
				if (data.iosAppVersion.trim() !== "") {
					var iStoreAppVersion = parseFloat(data.iosAppVersion.trim());
					if (iStoreAppVersion > currentInstalledAppVersion) {
						$.dialog.show();
						return "";
					};
				};
			};
		};
	}

	if (Remember.get('current_saml_token')()) {
		
		Alloy.createController('login');
		openStartForLoggedInUser();
	} else {
		startApplication('login');
	}
},
    checkAppVersion = compose(fmap(compose(Loading.hide, validateAppVersion)), Repo.User.getAppVersion, Loading.show),
    check_network = ifelse(function check_network() {
	return Titanium.Network.online;
}, checkAppVersion, function() {
	alert("Could not establish internet connection.");
})
//+ startApplication :: ControllerName -> Action(UI)
,
startApplication = compose(open);
if (App.isCurrentUrl() && App.isCurrentUrl().indexOf('cdklotmanagement') == 0) {
	App.redirectToDeeplink(App.isCurrentUrl());
} else {
	//startApplication('login');
	check_network();
}

//checkAppVersion();
//startApplication('login');