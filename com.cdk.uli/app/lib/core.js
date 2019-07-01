var Aly = require('alloy_helpers');
var Repo = require('repo');
var Remember = require('/remember');
var User = require('user');
var App = {

	windowStack : [],

	init : function(params){
		var params = params || {};
	},

	open : function(win) {
         if (OS_ANDROID) {
               win.addEventListener('android:back', function(e) {
                if (!win.isHome) {
                    App.close(win);
                    App.resetHeader();
                } else {
                    //If home window then force the app in background
                    var intent = Ti.Android.createIntent({
                        action : Ti.Android.ACTION_MAIN
                    });
                    intent.addCategory(Ti.Android.CATEGORY_HOME);
                    Ti.Android.currentActivity.startActivity(intent);
                }
            });
        }
        App.windowStack.push(win);
        win.open();
    }
,

	close : function(win){
		App.windowStack.pop();
		win.close();
	},
     
    getDeepLinkCredentials:function(){
        return { "username": Remember.get('user_login')()
            , "password": Remember.get('user_password')()
        };
    },
    
    rememberDeepLinkUser: function(u) {
        Remember.set('profile_options', u.permissions.profileOptions);
        Remember.set('current_user', u);
        User.set(u);
        Remember.set('current_dealership', getCurrentUser().defaultDealership);
        var deeplink = Remember.get('deeplink')();
        App.redirectToDeeplink(deeplink);
    },
    
    checkDeeplinkAuthorizationResponse:function(resp){
        if(resp) {
            checkDeeplinkAuthSuccess(resp);
        }else{
            //Failed Authorization on deeplink -> redirect to login
            Aly.openView('login');
        }
    },
	redirectToDeeplink: function(deepLink){
		if(getCurrentUser()==undefined){
			App.redirectToLoginPage();
			return;
		}
		var userHasAccessToDealership=false;
		var defaultDealership=null;
		var dealerships=getCurrentUser().dealershipsAssociated;
		for(index=0;index < dealerships.length;index++){
			if(dealerships[index].rbId==Remember.get('crm_dealerId')())
			{
				defaultDealership=dealerships[index];
				userHasAccessToDealership=true;
			}				
		}
		if(userHasAccessToDealership && defaultDealership){
			Remember.set('current_dealership', defaultDealership);
		}else{
			alert("Unauthorized!. You don't have access to the dealership.");
			App.redirectToLoginPage();
			return;
		}
		if(deepLink.indexOf('appraisal') > -1){
            Remember.set('deeplink', deepLink);
            if(App.isLoggedIn()){
                Remember.forget('deeplink');
                App.redirectToAppraisalPage();
            }else{
                deeplinkAuthenticate();
            }
		}else{
			//unknown deeplink - redirect to login
            App.redirectToLoginPage();
		}
	},
	 redirectToAppraisalPage : function(){
        Aly.openView('activity/start_appraisal');
    },
    
    redirectToLoginPage : function(){
        Aly.openView('login');
    },
	getLaunchUrl : function(){
		var uri;
		if(OS_ANDROID){
			var activity = Ti.Android.currentActivity;	
			var intent = activity.getIntent();	
			uri = intent.getData();	
		}else{
			//For IOS 
             uri = Ti.App.getArguments().url;
		}
		Remember.set('current_url', uri);
		return uri;
	},
	
	isCurrentUrl : function(){
  		var url = Remember.get('current_url')();
  		Ti.API.info('In isCurrentUrl '+ url);
  		return url;
  	},
    
	home : function(){
		// Aly.openView('start');
		if (App.windowStack.length > 1) {
	        var stack = App.windowStack.slice(0);
	        for (var i=1, len=stack.length; i < len; i++) {
				    App.close(stack[i]);
	        }
	    }
	},

  lastWin: function() {
            return App.windowStack[App.windowStack.length - 2];
           }

  , resetHeader : function() {
      require('repo').Http.addHeader("rb-api-version", "0.0.1");
    }
  
  , logoutUser : function() {    
          var Remember=require('remember');
          Remember.forget('current_user');
          Remember.forget('user_login');
          Remember.forget('user_password');
          require('repo').Http.resetHeaders();
          if (App.windowStack.length >= 1) {
            var stack = App.windowStack.slice(0);
            for (var i=0, len=stack.length; i < len; i++) {
                    App.close(stack[i]);
            }
          }
    }
 , isLoggedIn : function() { return (require('remember').get('current_user')()); }      
};

var deeplinkAuthenticate = compose(fmap(App.checkDeeplinkAuthorizationResponse),Repo.Auth.authenticate,App.getDeepLinkCredentials);

var checkDeeplinkAuthSuccess = ifelse('.id', compose(App.rememberDeepLinkUser), compose(App.redirectToLoginPage));

module.exports = App;

