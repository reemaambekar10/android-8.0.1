;(function (window, undefined) { 
  var functor = {};

  Functor = function(type, defs) {
    type.prototype.fmap = defs.fmap;
  };

  fmap = function(f, obj) {
    return obj.fmap(f);
  }.autoCurry();

  // Some default instances:

  Functor(Array, {
    fmap: function(f){
      return this.map(function(x){
        return f(x);
      });
    } // expand map function with lambda since map passes index in which messes with curried functions on applicatives
  });

  Functor(Function, {
    fmap: function(f){ return compose(f, this); }
  });


  //TODO write expose for all common requires and uncomment

  /*Functor(Maybe, {
    fmap: function(f) {
      if(!this.val) return this;
      return Maybe(f(this.val));
    }
  });

  Functor(Either, {
    fmap: function(f) {
      if(!this.right) return Either(f(this.left), this.right);
      return Either(this.left, f(this.right));
    }
  });*/

  functor.Functor = Functor;
  functor.fmap = fmap;

  functor.expose = function expose(env) {
    var fn;
    env = env || window;
    for (fn in functor) {
      if (fn !== 'expose' && functor.hasOwnProperty(fn)) {
        env[fn] = functor[fn];
      }
    }
  };

  module.exports = functor;

}(this));

