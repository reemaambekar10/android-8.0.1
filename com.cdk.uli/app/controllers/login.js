//@ deftype AuthResponse = {id: Integer}
//@ deftype User = {}
var Repo = require('repo')
  , Remember = require('remember')
 , Aly = require('alloy_helpers')
 , App = require('core')
 , User = require('user')
 , Loading = $.loading_view
 , rbToken
 , iamLogoutUrl
 , rememberedCurrentSamlToken
 , ssoLoginUrl = getBaseUrlForWeb() + 'SSOLogin.aspx'
 , errorMsg,
 webLoginUrl = getBaseUrlForWeb() + 'Loginmobile.aspx',
 webLogoutUrl = getBaseUrlForWeb() + 'Logout.aspx';

$.samlWebView.url = webLoginUrl;
$.samlWebView.addEventListener ('load', function(){	
	 if($.samlWebView.url === ssoLoginUrl){	 	
	 	rbToken = $.samlWebView.evalJS("document.getElementById('rbToken').innerText"); 	
		Remember.set('current_saml_token', rbToken);
		rememberedCurrentSamlToken = Remember.get('current_saml_token')();
		
		errorMsg = $.samlWebView.evalJS("document.getElementById('errorMessage').innerText"); 	

		iamLogoutUrl = $.samlWebView.evalJS("document.getElementById('iamLogoutUrl').innerText"); 
		Remember.set('iamLogoutUrl', iamLogoutUrl);
	 	
	 	if(errorMsg){
	 		$.dialog.message = errorMsg;
			$.dialog.show();
			logoutUser();
			redirectToLogin();
	 	} 
	 	else if(rememberedCurrentSamlToken){
	 		authenticate();
	 	}
	}	 
	 redirectToLogin();
});

var redirectToLogin = function(){	
	if($.samlWebView.url === Remember.get('iamLogoutUrl', iamLogoutUrl)()){
	 		$.samlWebView.url = webLoginUrl;		
	 }
};

var logoutUser = function(){		
	$.samlWebView.url = webLogoutUrl;
	Remember.forget('current_saml_token');
};

Ti.App.addEventListener('logout', function(){
	//if(OS_IOS){
		$.winLogin.open();
	//}	
	logoutUser();
	
});

//+ getCredentials :: _ -> AccountCredentials
  var getCredentials = function() {
      return { "username": ''
             , "password": ''
             };
    }

 //+ openStartWin :: Action(UI)
 , openStartWin = compose(App.open, Aly.createView_.p('start'))
 
 , openStartWinIos = compose(App.open, Aly.createView_.p('start'), App.close.p($.winLogin))
   
 , openApp = function(){
 	if(OS_IOS){ 		
 		openStartWinIos(); 
 	}
 	 else{ 		
 	     openStartWin();
 	 }
 }

	
 //+ setUserCreds :: User -> Action(IO)
  , setUserCreds = function() {
      Remember.set('user_login', '');
      Remember.set('user_password', '');
    }

 //+ rememberUser :: User -> Action(IO)
  , rememberUser = function(u) {
      Remember.set('current_user', u);
      User.set(u);
      return u;
  }
 
   , rememberDefaultDealership = function() {
       Remember.set('current_dealership', getCurrentUser().defaultDealership);
    }
   , rememberProfileOptions = function(resp){
   Remember.set('profile_options', resp.permissions.profileOptions);
   return resp; 
   }


 //+ rememberCreds :: User -> Action(IO) | _
   , rememberCreds = ifelse(setUserCreds, I)

 //+ alertAuthFail :: Action(UI)
   , alertAuthFail = function(){
   			$.dialog.message = 'Please contact your dealership administrator for the required authorization.';			
   			$.dialog.show();
   			logoutUser();
			redirectToLogin();
   }
 
 , checkAuthResp = function(resp){
		if(resp) {
			checkSuccess(resp);
		}else{			
			alertAuthFail();			
		}
	}
	
 //+ authenticate :: Action(UI) 
  , authenticate = compose( fmap(compose(Loading.hide, checkAuthResp))
                         , Repo.Auth.authenticate
                         , getCredentials
                         , Loading.show
                       )
,doClick=function(){
  	if (Ti.Platform.osname === 'android') {
  	Ti.Platform.openURL('market://details?id=com.adplotmanagement');
  	}
  	else{
  		Ti.Platform.openURL('https://itunes.apple.com/us/app/cdk-front-office-edge-lot/id594100682?mt=8&uo=4');
  	}
  	$.dialog.show();
  }
, validateAppVersion = function(data) {
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
	openApp(); 		
	}
  ,checkAppVersion=compose(fmap(compose(Loading.hide,validateAppVersion))
                            , Repo.User.getAppVersion
                            , Loading.show
                           )
  ,

	check_network = ifelse(function check_network() {
		return Titanium.Network.online;
	}, function(){}, function() {
		alert("Could not establish internet connection.");
	})
	
	//+ checkSuccess : AuthResponse -> Action(UI)
   , checkSuccess = ifelse('.id', compose(checkAppVersion, rememberDefaultDealership, rememberCreds, rememberUser, rememberProfileOptions), alertAuthFail)
 	;
 
check_network();