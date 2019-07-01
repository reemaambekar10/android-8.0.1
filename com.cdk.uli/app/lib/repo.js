module.exports = (function() {
  var Values = require('values')
    , Args = require('args')
    , Promise = require('/support/promise')
    ;
  //+ @deftype Url = String;
  //+ @deftype AccountCredentials = { "UserName": String, "Password": String }
  //+ @deftype Contact = { "Email": String
  //+                    , "Phone": String
  //+                    , "AddressLine1": String
  //+                    , "AddressLine2": String
  //+                    , "State": String
  //+                    , "Zip": Int
  //+                    }
  //+ @deftype Dealership = { "RbId": Int
  //+                       , "DmsId": Int
  //+                       , "Name": String
  //+                       , "Contact": Contact
  //+                       , "ThirdPartyAccount": Array
  //+                       , "MarketIqMiles": Int
  //+                       }
  //+ @deftype AuthParams = { "AccountCredentials": AccountCredentials
  //+                       , "UniqueDeviceId": String
  //+                       , "ClientIP": String
  //+                       , "Dealership": Dealership
  //+                       , "DeviceInfo": String
  //+                       }

  //var BASE_URL = "http://64.183.197.59/rbapi/api"
  //var BASE_URL = "http://apistage.redbumper.com/rbapi/api"
  //var BASE_URL = "https://192.168.0.233/rbapi-87/api"
   var BASE_URL = "https://api.redbumper.com/api"
   //var BASE_URL = "https://saml.dev.api.cdklotmanagement.com.8083/api"
  // var BASE_URL = "http://c03dfolotm42.dslab.ad.adp.com/Redbumper.WebApi/api"
  //var BASE_URL = "https://beta2api.redbumper.com/api"

    , Http = require("http")(BASE_URL)

  //+ expireCache :: undefined
    , expireCache = function(args) {
        Http.expireCache();
        return args;
      }

  //+ getUrl :: Url -> {} -> Promise
    , getUrl = function(url, params) {
    	console.log("WebApi URL : "+url);
    	console.log("passed params : "+params);
        //log2(url, params);
        return Http.get(url, params);
      }.autoCurry()

  //+ postUrl :: Url -> {} -> Promise
    , postUrl = function(url, params, opt) {
        //log2(url, params);
        return Http.post(url, params, opt);
      }.autoCurry(2)

    , Auth = {
    //+ authenticate :: AccountCredentials -> Promise(User)
        authenticate: compose( postUrl('/auth/authenticate')
                              , Args.Auth.authenticate
                              , Http.setCredentials)
      }
    , User = {
    	resetPasswordRequest : compose( postUrl('/User/ResetPasswordRequest')
                               		    , Args.User.resetPasswordRequest
                               		   )
        ,getAppVersion : compose( getUrl('/MobileAppVersion/GetAppVersion'),function(){return "";}) 
    }
    , Vehicle = {
        description: compose( Values.refreshVehicleInfo
                            , postUrl('/vehdesc/describe')
                            , Args.Vehicle.description
                            , expireCache
                            )

      , validateVin: compose( postUrl('/vinvalidator/validate')
                              , Args.Vehicle.validateVin
                              )
      , getCheckInList: function(){return "";}
      }

    , Books = {
        nada: compose( getUrl('/activity/getNadaValues')
                      , Args.Books.nada
                      )

      , blackBook: compose( getUrl('/activity/getblackbookvalues')
                          , Args.Books.blackBook
                          , expireCache
                          )

      , kbb: compose( getUrl('/activity/getKbbValues')
                    , Args.Books.kbb
                    )

      , galves: compose( getUrl('/activity/getGalvesValues')
                       , Args.Books.galves
                       )

      , kbbAuction: compose( getUrl('/activity/getKbbAuctionValues')
                           , Args.Books.kbbAuction
                           )

      , saveBlackBookOptions: compose( postUrl('/activity/saveBlackbookOptions')
                              , Args.Books.saveBlackBookOptions
                              )

      , saveGalvesOptions: compose( postUrl('/activity/saveGalvesOptions')
                              , Args.Books.saveGalvesOptions
                              )

      , saveNadaOptions: compose( postUrl('/activity/saveNadaOptions')
                                , Args.Books.saveNadaOptions
                                )

      , saveKbbOptions: compose( postUrl('/activity/updateGetKbbValues')
                                , Args.Books.saveKbbOptions
                                , expireCache
                                )

      , saveKbbAuctionOptions: compose( postUrl('/activity/updateKbbAuctionValues')
                                      , Args.Books.saveKbbAuctionOptions
                                      )

      , sendADFInfo: compose( postUrl('/activity/sendadf')  //ADF
      									,Args.Books.sendADFInfo
      									)
      }

    , Activity = {
        create: compose( postUrl('/activity/create')
                       , Args.Activity.create
                       )

      , retrieve: compose( Values.refresh
                         , getUrl('/activity/retrieve')
                         , Args.Activity.retrieve
                         , expireCache
                         )
	, addressLookup: function(params) {
		var promise = new Promise();
        var url = "https://expressentry.melissadata.net/jsonp/ExpressAddress?callback=JSON_CALLBACK&format=jsonp&id=98894461&maxRecords=10&line1="+ params.address1
        +"&city="+ params.city +"&state="+params.state +"&postalCode=" + params.zip;
		 var client = Ti.Network.createHTTPClient({
		     // function called when the response data is available
		     onload : function(e) {
		         var response = this.responseText.substring(this.responseText.indexOf("(") + 1, this.responseText.lastIndexOf(")"));
		         promise.resolve(response);
		     },
		     // function called when an error occurs, including a timeout
		     onerror : function(e) {
		         promise.reject(e);
		     },
		     timeout : 5000  // in milliseconds
		 });
		 // Prepare the connection.
		 client.open("GET", url);
		 // Send the request.
		 client.send();
		 return promise;
      }
      //FIXME Maybe return only pending or completed instead of filtering client side and create pendingAppraisals/completedAppraisals
      , listAppraisals: compose( getUrl('/activity/list')
                               , Args.Activity.listAppraisals
                               )

      , saveVehicleInfo: compose( postUrl('/activity/saveVehicleInfo')
                                , Args.Activity.saveVehicleInfo
                                )

      , saveCustomerInfo: compose( postUrl('/activity/saveCustomerInfo')
                                 , Args.Activity.saveCustomerInfo
                                 )

      , saveLenderInfo: compose( postUrl('/activity/saveLenderInfo')
                               , Args.Activity.saveLenderInfo
                               )

      , uploadToRetail: compose( postUrl('/activity/uploadToRetail')
                               , Args.Activity.uploadToRetail
                               )

      , naaaAuctionData: compose( getUrl('/activity/getNaaaAuctionData')
                                , Args.Activity.naaaAuctionData
                                )

      , conditionReport: compose( getUrl('/activity/retrieveWebViewUrl')
                                , Args.Activity.conditionReport
                                )

      , appraisalSheet: compose( getUrl('/activity/retrieveWebViewUrl')
                               , Args.Activity.appraisalSheet
                               )

      , lenderBookoutSheet: compose( getUrl('/activity/retrieveWebViewUrl')
                                   , Args.Activity.lenderBookoutSheet
                                   )
      , equityReport: compose(getUrl('/activity/retrieveWebViewUrl')
                               , Args.Activity.equityReport
                               )
      , marketIq: compose( getUrl('/activity/getMarketIq')
                  , Args.Activity.marketIq
                  )

      , saveAppraisalInput: compose( postUrl('/activity/saveAppraisalInput')
                                   , Args.Activity.saveAppraisalInput
                                   )

      , completeAppraisal: compose( postUrl('/activity/setAppraisalComplete')
                                  , Args.Activity.completeAppraisal
                                  )

      , getImages: compose( getUrl('/activity/retrieveImages')
                          , Args.Activity.getImages
                          , expireCache
                          )

          //return postUrl('/activity/uploadFile', params, {isData: true});
      //FIXME check if {isData: true} is necessary
      , uploadImage: compose( postUrl('/activity/uploadFileTest')
                            , Args.Activity.uploadImage
                            )

      , deleteImage: compose( postUrl('/activity/deleteImage')
                            , Args.Activity.deleteImage
                            )

      , setDefaultImage: compose( postUrl('/activity/setImageDefault')
                                , Args.Activity.setDefaultImage
                                )

      , sendVehicleInfo: compose( postUrl('/activity/sendVehicleInfo')
                                , Args.Activity.sendVehicleInfo
                                )

      , saveTrims: compose( postUrl('/activity/saveTrims')
                          , Args.Activity.saveTrims
                          )

      , autocheck: compose( getUrl('/activity/getAutocheckReport')
                          , Args.Activity.autocheck
                          )

      , carfax: compose( getUrl('/activity/getCarfaxReport')
                       , Args.Activity.carfax
                       )

      , minicarfax: compose( getUrl('/activity/minicarfax')
                       , Args.Activity.miniCarfax
                       )

      , minicarFaxForce: compose( getUrl('/activity/minicarfax')
      					, Args.Activity.miniCarfaxForce
      				)

      , saveMileage: compose( postUrl('/activity/saveOdo')
                            , Args.Activity.saveMileage
                            )

      , trimPerformance: compose( getUrl('/activity/getMyPerformance')
                                , Args.Activity.trimPerformance
                                )

      , similarPerformance: compose( getUrl('/activity/getSimilarPerformance')
                                   , Args.Activity.similarPerformance
                                   )
      , similarPerformanceDetail: compose( getUrl('/activity/getSimilarPerformanceDetails')
                                         , Args.Activity.similarPerformanceDetail
                                         )

      , trimPerformanceDetail: compose( getUrl('/activity/getTrimLevelPerf')
                                      , Args.Activity.trimPerformanceDetail
                                      )
      , sendCheckInListInfo:  compose( postUrl('/activity/checkin')
                                      , Args.Activity.sendCheckInListInfo
                                      )

      }

    , Reports = {
        agingSummary: compose( getUrl('/reports/agingReportSummary')
                             , Args.Reports.agingSummary
                             )

      , agingDetail: compose( getUrl('/reports/agingReportDetails')
                            , Args.Reports.agingDetail
                            )

      , water: compose( getUrl('/reports/waterReport')
                      , Args.Reports.water
                      )

      , sellList: compose( getUrl('/reports/sellList')
                         , Args.Reports.sellList
                         )

      , buyList: compose( getUrl('/reports/buyList')
                        , Args.Reports.buyList
                        )

      , hotList: compose( getUrl('/reports/hot100')
                        , Args.Reports.hotList
                        )

      , bookoutList: compose( getUrl('/activity/list')
                            , Args.Reports.bookoutList
                            )

      , consumerLeads: compose( getUrl('/reports/consumerLeads')
                              , Args.Reports.consumerLeads
                              )

      , search: compose( getUrl('/reports/search')
                       , Args.Reports.search
                       )
      , searchByVinOrStockNo: compose( getUrl('/reports/getVehiclesByVinOrStockNo')
                       , Args.Reports.search
                       )
      , resolvezipcode: compose( getUrl('/reports/resolvezipcode')
                       , Args.Reports.resolvezipcode
                       )
	  , serviceAppointments: compose (getUrl ('/reports/svc-appts'), Args.Reports.serviceAppointments)
      }
	, CheckIn ={
	   retrieveCheckInHistory:compose(getUrl('/checkin/GetVehicleCheckInHistory')
                         , Args.CheckIn.retrieveCheckinHistory
                         , expireCache)

       ,retrieveCheckInList: compose(getUrl('/activity/RetrieveCheckin')
                         , Args.CheckIn.retrieveCheckin
                         , expireCache
                         )
	}
    , CustomerService = {
        getPhone: compose( getUrl('/activity/getCustPhoneNum')
                         , Args.CustomerService.getPhone
                         )

      , postEmail: compose( postUrl('/activity/postToCustSupport')
                          , Args.CustomerService.postEmail
                          )
      }

    , Messages = {
        retrieve: compose( getUrl('/reports/retrieveMessages')
                          , Args.Messages.retrieve
                          )
      }

    , BumpRequest = {
        create: compose( postUrl('/activity/saveBumpRequest')
                       , Args.BumpRequest.create
                       )

      , approve: compose( postUrl('/activity/approveBump')
                        , Args.BumpRequest.approve
                        )

      , decline: compose( postUrl('/activity/declineBump')
                        , Args.BumpRequest.decline
                        )
      }

    , Inventory = {
        stats: compose( getUrl('/reports/dealerStats')
                      , Args.Inventory.stats
                      , expireCache
                      )

      , makes: compose( getUrl('/reports/inventoryMakeList')
                      , Args.Inventory.makes
                      , expireCache
                      )
      , models: compose( getUrl('/reports/inventoryModelList')
                       , Args.Inventory.models
                       , expireCache
                      )

      , list: compose( getUrl('/reports/inventoryList')
                     , Args.Inventory.list
                     , expireCache
                     )
      }
    ;

  return {  Auth: Auth
  		  ,	User:User
          , Vehicle: Vehicle
          , Http: Http
          , Books: Books
          , Activity: Activity
          , Reports: Reports
          , CustomerService: CustomerService
          , Messages: Messages
          , BumpRequest: BumpRequest
          , Inventory: Inventory
          , CheckIn: CheckIn
         };

})();