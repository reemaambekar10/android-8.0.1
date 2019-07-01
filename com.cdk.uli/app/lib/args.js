var Values = require('values'),
    User = require('user'),
    Remember = require('remember');

var ARGS = {
	Auth : {
		authenticate : function(params) {
			var deviceId = null;
			try {
				deviceId = Ti.Platform.macaddress;
			} catch(e) {
				Ti.API.warn('Error fetching device id');
			}

			return {
				DealershipId : params.DealershipId,
				UniqueDeviceId : deviceId,
				DeviceInfo : Ti.Platform.osname + ' ' + Ti.Platform.version,
				TotalMemory : '',
				AppVersion : Ti.App.version,
				OSVersion : Ti.Platform.version,
				RamFree : Ti.Platform.availableMemory,
				Architecture : Ti.Platform.architecture,
				DeviceModel : Ti.Platform.model,
				AccountCredentials : params
			};
		}
	},

	User : {
		resetPasswordRequest : function(params) {
			return {
				UserName : params
			};
		}
	},

	Reports : {

		agingSummary : function() {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		},
		agingDetail : function(params) {
			if (params.bstart === params.bend) {
				delete params.bend;
			}
			return merge({
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		bookoutList : function(params) {
			return merge({
				activityType : Values.BOOKOUT,
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		buyList : function() {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		},
		hotList : function() {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		},
		sellList : function() {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		},
		water : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		consumerLeads : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		search : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		resolvezipcode : function(params) {
			return {
				Zip : params.Zip
			};
		},
		serviceAppointments : function(params) {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		}
	},
	CheckIn : {
		retrieveCheckinHistory : function(activity_id) {
			return {
				rbUserVehicleId : activity_id
			};
		},

		retrieveCheckin : function(activity_id) {
			return {
				rbUserVehicleId : activity_id,
				rbDealershipId : getCurrentDealershipId()
			};
		}
	},
	Activity : {
		retrieve : function(activity_id) {
			return {
				activityId : activity_id,
				rbDealershipId : getCurrentDealershipId()
			};
		},

		listAppraisals : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId(),
				activityType : Values.APPRAISAL
			}, params);
		},
		naaaAuctionData : function(params) {
			return merge({
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		appraisalSheet : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId(),
				page : 'appraisalsheet'
			};
		},
		lenderBookoutSheet : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId(),
				page : 'lbsheet'
			};
		},
		conditionReport : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId(),
				page : 'conditionreport'
			};
		},
		equityReport : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId(),
				page : 'equityreport'
			};
		},
		autocheck : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		create : function(crmParams) {
			var user = getCurrentUser(),
			    params = {
				activityType : Values.getActivityType(),
				crmLeadId:Remember.get('crm_leadId')(),
    			crmConsumerId:Remember.get('crm_consumerId')(),
				createdBy : user,
				vehicle : Values.getVehicleDescription(),
				rbDealershipId : getCurrentDealershipId()
			};

			if (Values.isAppraisal()) {
				params.appraisalStatus = Values.PENDING_APPRAISAL;
			}

			params.vehicle.trimCollection = null;
			params.vehicle.trim.code = Values.getTrimCode('BlackBook');
			params.vehicle.trim.description = Values.getTrimDesc('BlackBook');
			params.vehicle.vin = params.vehicle.vin || Values.getVin();
			params.vehicle.chromeStyleId = Values.getChrome();
			params.vehicle.odo = Values.getMiles();
			params.vehicle.blackBookUvc = Values.getTrimCode('BlackBook');
			params.vehicle.nadaVid = Values.getTrimCode('NADA');
			params.vehicle.kbbVehicleId = Values.getTrimCode('KBB');
			params.vehicle.galvesId = Values.getTrimCode('Galves');
			return params;
		},
		carfax : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		miniCarfax : function() {
			return {
				vin : Values.getVin(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		miniCarfaxForce : function() {
			return {
				vin : Values.getVin(),
				force : 'true',
				rbDealershipId : getCurrentDealershipId()
			};
		},
		saveMileage : function(odo) {
			return {
				rbDealershipId : getCurrentDealershipId(),
				userVehicleId : Values.getUserVehicleId(),
				vehicle : {
					odo : odo
				}
			};
		},
		saveCustomerInfo : function(params) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				customerInfo : params
			};
		},
		saveLenderInfo : function(params) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				lenderInfo : params
			};
		},
		saveVehicleInfo : function(params) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				vehicle : params
			};
		},
		uploadToRetail : function(params) {
			return params;
			/*return {
			 userVehicleId: Values.getUserVehicleId()
			 , vehicle: {
			 vin: Values.getVin()
			 , odo: Values.getMiles()
			 , stock: Values.getStock()
			 }
			 , internetPrice: Values.getInternetPrice()
			 , listPrice: Values.getListPrice()
			 };*/
		},
		saveAppraisalInput : function(params) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				appraisalInputs : params
			};
		},
		marketIq : function(params) {
			return {
				activityId : (params) ? params.activity_id : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		completeAppraisal : function() {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		getImages : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		uploadImage : function(img) {
			return {
				rbDealershipId : getCurrentDealershipId(),
				activityId : Values.getActivityId(),
				chunk : 20,
				fileContent : Ti.Utils.base64encode(img).toString(),
				fileExtension : 'jpg'
			};
		},
		deleteImage : function(n) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				imageId : n
			};
		},
		setDefaultImage : function(n) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				imageId : n
			};
		},
		sendVehicleInfo : function(params) {
			return merge({
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		saveTrims : function() {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				vehicle : {
					chromeStyleId : Values.getChrome(),
					blackBookUvc : Values.getTrimCode('BlackBook'),
					nadaVid : Values.getTrimCode('NADA'),
					kbbVehicleId : Values.getTrimCode('KBB'),
					galvesId : Values.getTrimCode('Galves')
				}
			};
		},
		trimPerformance : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		similarPerformance : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		trimPerformanceDetail : function(params) {
			return {
				rbDealershipId : getCurrentDealershipId(),
				activityId : (params) ? params.activity_id : Values.getActivityId()
			};
		},
		similarPerformanceDetail : function() {
			return {
				rbDealershipId : getCurrentDealershipId(),
				activityId : Values.getActivityId()
			};
		},
		sendCheckInListInfo : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId(),
				activityId : Values.getActivityId()
			}, params);
		}
	},
	Books : {
		blackBook : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		kbb : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		galves : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		nada : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		kbbAuction : function() {
			return {
				activityId : Values.getActivityId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		saveBlackBookOptions : function(params) {
			return merge({
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		saveGalvesOptions : function(params) {
			return merge({
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		saveNadaOptions : function(params) {
			return merge({
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		saveKbbOptions : function(params) {
			params.odo = Values.getMiles();
			params.vin = Values.getVin();
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				vehicle : params
			};
		},
		saveKbbAuctionOptions : function(params) {
			params.odo = Values.getMiles();
			return merge({
				rbDealershipId : getCurrentDealershipId(),
				userVehicleId : Values.getActivityId(),
				userId : User.getId(),
				vehicle : params
			}, params);
		},
		sendADFInfo : function() {//ADF
			return {
				rbdealershipid : getCurrentDealershipId(),
				uservehicleid : Values.getUserVehicleId()
			};
		}
	},
	Vehicle : {
		validateVin : function(vin) {
			return {
				vin : vin
			};
		},
		description : function(params) {
			var BOOK_NAMES = {
				"KBB" : "NeedKbb",
				"NADA" : "NeedNada",
				"Galves" : "NeedGalves",
				"BlackBook" : "NeedBlackBook"
			};

			var isSubscribed = function(a, book) {
				a[BOOK_NAMES[book.description]] = true;
				return a;
			};

			var args = merge({
				NeedKbb : false,
				NeedNada : false,
				NeedGalves : false,
				NeedBlackBook : false,
				rbDealershipId : getCurrentDealershipId()
			}, params);

			return reduce(isSubscribed, args, getCurrentUser().books);
		}
	},
	CustomerService : {
		postEmail : function(msg) {
			//FIXME USER management commonjs
			return {
				userName : getCurrentUser().firstName + getCurrentUser().lastName,
				activeDealerName : getCurrentDealership().name,
				message : msg
			};
		},
		getPhone : function() {
			return {};
		}
	},
	Messages : {
		retrieve : function() {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		}
	},
	BumpRequest : {
		create : function(params) {
			return merge({
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				appraisalPrice : Values.getAppraisalPrice()
			}, params);
		},
		approve : function() {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId()
			};
		},
		decline : function(reason) {
			return {
				userVehicleId : Values.getUserVehicleId(),
				rbDealershipId : getCurrentDealershipId(),
				declineReason : reason
			};
		}
	},
	Inventory : {
		stats : function() {
			return {
				rbDealershipId : getCurrentDealershipId()
			};
		},
		makes : function(type) {
			return {
				rbDealershipId : getCurrentDealershipId(),
				stockType : type
			};
		},
		models : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId()
			}, params);
		},
		list : function(params) {
			return merge({
				rbDealershipId : getCurrentDealershipId()
			}, params);
		}
	}
};

module.exports = ARGS;
