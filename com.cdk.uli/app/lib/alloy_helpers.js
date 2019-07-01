module.exports = (function() {
  var Alloy = require('alloy')

    , Utils = require('utility')

  //+ createController_ :: String -> a -> Alloy.Controller
    , createController_ = function(name, args) {
        if(OS_ANDROID) {
          return Alloy.createController('/'+name, args);
        } else {
          return Alloy.createController(name, args);
        }
      }.autoCurry()

  //+ createView :: String -> a -> Alloy.Window | Alloy.View
    , createView = function(name, args) {
        var win = Alloy.createController(name, args).getView();

        if (Utils.isIos7) {
            win.setTop('20');
        }

        return win;
      }.autoCurry()

  //+ createView :: String -> a -> Alloy.Window | Alloy.View
    , createView_ = function(name) {
        var win = Alloy.createController(name).getView();

        if (Utils.isIos7) {
            win.setTop('20');
        }

        return win;
      }

  //+ getView :: Alloy.Controller -> Ti.UI.View
    , getView = function(controller) {
        return controller.getView();
      }

  //+ openView :: String -> Action(UI)
    //TODO why doesn't invoke('open') work here?
    //, openView = compose(invoke('open'), getView, Alloy.createController)
    , openView = compose('.open()', getView, Alloy.createController)

  //+ openView_ :: String -> a -> Action(UI)
    , openView_ = function(name, args) {
        getView(Alloy.createController(name, args)).open();
      }.autoCurry()

  //+ closeView :: String -> Alloy.Controller -> Action(UI)
    , closeView = function(name, c) {
        c[name].close();
      }.autoCurry()

  //+ openEmailDialog :: EmailParams -> Action(UI)
    , openEmailDialog = function(params) {
        var emailDialog = Ti.UI.createEmailDialog({
          barColor: '#000'
        , html: !!params.body
        });

        if(!emailDialog.isSupported()) {
          return alert('Sorry, email is not available.', 'Oops');
        }
        emailDialog.setToRecipients([params.email]);
        emailDialog.setSubject(params.subject);
        (params.body && emailDialog.setMessageBody(params.body));

        emailDialog.addEventListener('complete', function(e) {
          if(!OS_ANDROID && (e.result == emailDialog.SENT)) {
            alert("Message was sent.  Thank you!");
          }
        });

        emailDialog.open();
      }

    , setRows = function(table, rows) {
        rows = isArray(rows) ? rows : [rows];
        table.setData(rows);
        return rows;
      }.autoCurry()

    , getRows = function(table) {
        return table.data[0].rows;
      }.autoCurry()

  //+ createEmptyRow :: [Ti.UI.TableViewRow]
    , createEmptyRow = function() {
          return [createView_('partials/rows/empty_row')];
      }

  //+ setHeaderView :: Ti.UI.TableView -> Ti.UI.View -> Action(UI)
    , setHeaderView = function(table, view) {
        table.setHeaderView(view);
      }.autoCurry()

  //+ show :: a -> Action(UI)
    , show = function(x) { x.show(); }

  //+ show :: a -> Action(UI)
    , hide = function(x) { x.hide(); }
    ;

  return { createController_: createController_
         , getView: getView
         , openView: openView
         , openView_: openView_
         , createView: createView
         , createView_: createView_
         , closeView: closeView
         , openEmailDialog: openEmailDialog
         , setRows: setRows
         , getRows: getRows
         , createEmptyRow: createEmptyRow
         , setHeaderView: setHeaderView
         , show: show
         , hide: hide
         };
})();
