;(function (window, undefined) { 
  var applicative = {};

  Applicative = function(type, defs) {
    type.prototype.pure = defs.pure;
    type.prototype.ap = defs.ap.autoCurry();
  }

  pure = function(f) {
    f = f.toFunction();
    f.ap = fmap(f);
    return f;
  }

  liftA = function(f) {
    f = f.toFunction();
    var rest = arguments.length-1
      , r = pure(f);
    for(var i = 1; i <= rest; i++) r = r.ap(arguments[i]);
    return r;
  }

  applicative.Applicative = Applicative;
  applicative.pure = pure;
  applicative.liftA = liftA

  applicative.expose = function expose(env) {
    var fn;
    env = env || window;
    for (fn in applicative) {
      if (fn !== 'expose' && applicative.hasOwnProperty(fn)) {
        env[fn] = applicative[fn];
      }
    }
  };

  module.exports = applicative;
}(this));
