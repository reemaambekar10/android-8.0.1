var APPRAISAL = 1
  , BOOKOUT = 2
  , SERVICE_RIDE = 3
  , PENDING_APPRAISAL = 0
  , COMPLETED_APPRAISAL = 1
  ;
  

/***********
  All Values items are reset when calling /activity/retrieve from the repo.
  All Values items are reset when visiting the star_appraisal page.
  Based on navigation throughout the app this ensures that we are always working with consistent data related to an Activity.
  *********/

var vin = ''
  , miles = 0
  , trims = {}
  , trim_descs = {}
  , year
  , make
  , model
  , trim
  , chrome = 0
  , vehicle_info
  , vehicle_desc
  , book_configs
  , vehicle_id = 0
  , activity_type = APPRAISAL
  , title = ''
  , retrieved
  , carfaxURL
  ;

var _setBookConfigs = function(json) {
      book_configs = json;
    }

  , _setVehicleDescription = function(json) {
      vehicle_desc = json;
    }

  , _setVehicleTitle = function(json) {
          year = json.year || ''
        , make = json.make.description || ''
        , model = json.model.description || ''
        , trim = json.trim.description || ''
        ;
      title = year+ ' ' + make + ' ' + model + ' ' + trim;
    }
  ;

var PUBLIC = {
    APPRAISAL: 1

  , BOOKOUT: 2

  , SERVICE_RIDE: 3

  , PENDING_APPRAISAL: 0

  , COMPLETED_APPRAISAL: 1

  , getVin:  function() { return vin; }

  , getMiles: function() { return miles; }

  , getYear: function() { return year; }

  , getMake: function() { return make; }

  , getModel: function() { return model; }

  , getYMM: function() { return year +' '+ make +' '+ model;}

  , getTrimCode:  function(book) { return trims[book]; }
  , getTrimCodes: function() { return trims; }

  , getTrimDesc: function(book) { return trim_descs[book]; }

  , getTrimDescs: function() { return trim_descs; }

  , getChrome: function() { return chrome; }

  , getActivityType:  function() { return activity_type; }

  , getActivityId: function() { return vehicle_id; }

  , getUserVehicleId: function() { return vehicle_id; }
  
  , getVehicleInfo: function() { return vehicle_desc; }

  , getBookConfigs: function() { return book_configs; }

  , getVehicleDescription: function() { return vehicle_desc; }

  , getTrimCollection: function() { return vehicle_desc.trimCollection || []; }

  , setActivityId : function(activityId){ vehicle_id = activityId;}
  
  , setVehicleInfo: function(json) {
      if(!(json && json.bookVehicleConfigs && json.vehicleDescription)) return;
      vehicle_info = json;
      var a_id = (first(filter('.vehicleConfigProvider == "BlackBook"', json.bookVehicleConfigs)) || {}).activityId;
      if(a_id > 0) { vehicle_id = a_id; }
      if(json.vehicleDescription.trimCollection && json.vehicleDescription.trimCollection.length > 0) {
        chrome = first(json.vehicleDescription.trimCollection).code;
      }

      _setBookConfigs(json.bookVehicleConfigs);
      _setVehicleDescription(json.vehicleDescription);
      _setVehicleTitle(json.vehicleDescription);
    }

  , setVin: function(str) { vin = str; }

  , setMiles: function(odo) { miles = odo; }

  , setVehicleId: function(str) { vehicle_id = str; }

  , setActivityType: function(num) { activity_type = num; }

  , isAppraisal:function() { return activity_type == APPRAISAL; }

  , isBookout: function() { return activity_type == BOOKOUT; }

  , isServiceRide: function() { return activity_type == SERVICE_RIDE; }

  , setRetrieved: function(json) { retrieved = json; }

  , getRetrieved: function() { return retrieved; }

  , setChrome: function(num) { chrome = num; }

  , setTrimCode: function(book, code) { trims[book] = code; }

  , setTrimDesc: function(book, desc) { trim_descs[book] = desc; }

  , setTrims: function(trims_obj) {
      trims = trims_obj;
    }

  , getTrims: function() {
      return trims;
    }

  , setTrimDescs: function(trims_obj) {
      trim_descs = trims_obj;
    }
  
  , setCarFaxURL: function(url) {
  	  carfaxURL = url;
  }
  
  , getCarFaxURL: function() {
  	  return carfaxURL;
  }
  
  , getVehicleTitle: function() { return title; }

  , isPending: function() { return retrieved.appraisalStatus == PUBLIC.PENDING_APPRAISAL; }

  , isComplete: function() { return retrieved.appraisalStatus == PUBLIC.COMPLETED_APPRAISAL; }

  , setAppraisalStatus: function(status) {
      retrieved.appraisalStatus = status;
    }

  , setBookTrims: function(veh) {
      trims = {};
      if(veh.blackBookUvc) trims.BlackBook = veh.blackBookUvc;
      if(veh.nadaVid) trims.NADA = veh.nadaVid;
      if(veh.kbbVehicleId) trims.KBB = veh.kbbVehicleId;
      if(veh.galvesId) trims.Galves = veh.galvesId; // currently null from server
    }

  , setNewValues: function(json) {
	  if (!json) return;
      vin = json.vehicle.vin;
      miles = json.vehicle.odo;
      chrome = json.vehicle.chromeStyleId;
      vehicle_id = json.userVehicleId;
      activity_type = json.activityType;
      _setVehicleTitle(json.vehicle);
      //PUBLIC.setBookTrims(json.vehicle);
      retrieved = json;
    }
    
  , setCustomerPhone: function(phone) {
  	  retrieved.customerInfo.phone = phone; 
    }
  
  , setCustomerEmail: function(email) {
  	  retrieved.customerInfo.email = email;
  }
  
  , setCustomerLastname: function(lastName) {
  	  retrieved.customerInfo.lastName = lastName;
  }

  , reset: function(args) { 
      vin = '';
      miles = 0;
      trims = {};
      trim_descs = {};
      chrome = 0;
      vehicle_info = null;
      vehicle_desc = null;
      book_configs = null;
      vehicle_id = 0;
      activity_type = APPRAISAL;
      title = '';
      retrieved = {};
      return args;
    }

  , getBlackBookTrim: function() {
      return retrieved.vehicle.blackBookUvc;
    }

  , getNadaTrim: function() {
      return retrieved.vehicle.nadaVid;
    }

  , getKbbTrim: function() {
      return retrieved.vehicle.kbbVehicleId;
    }

  , getGavlesTrim: function() {
      return retrieved.vehicle.galvesId;
    }

  , refresh: function(p) {
      fmap(PUBLIC.setNewValues, p);
      return p;
    }

  , refreshVehicleInfo: function(p) {
      fmap(PUBLIC.setVehicleInfo, p);
      return p;
    }

  , getBumpValue: function() {
      return retrieved.appraisalPriceBump.bumpValue;
    }

  , getAppraisalPrice: function() {
      return retrieved.appraisalInputs.appraisalValue || '';
    }

  , getColor: function() {
      return retrieved.vehicle.exteriorColor.description || '';
    }

  , getStock: function() {
      return retrieved.vehicle.stock
    }

  , getInternetPrice: function() {
      return retrieved.internetPrice
    }

  , getListPrice: function() {
      return retrieved.listPrice
    }
  };

module.exports = PUBLIC;

