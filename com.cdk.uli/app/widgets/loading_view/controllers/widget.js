var args = arguments[0] || {}
  , isSmall = args.small
  ;

var show = function(arg) {
      $.view.show();
      $.view.visible = true;
      $.loading.setOpacity(1.0);
      return arg;
    }
  , hide = function(arg) {
      $.view.hide();
      $.view.visible = false;
      $.loading.setOpacity(0.0);
      return arg;
    }
  ;              

if(isSmall) {
  $.view.height = Ti.UI.SIZE;
  $.view.width = Ti.UI.SIZE;
} else {
  $.view.top = 0;
  $.view.left = 0;
}

//+ show :: * -> *
exports.show = show;

//+ hide :: * -> *
exports.hide = hide;

Ti.App.addEventListener('showLoading', show);
Ti.App.addEventListener('hideLoading', hide);

