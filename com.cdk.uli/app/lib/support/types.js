;(function( window, undefined)
{
  var types = {};

  _getGlobal = function() {
  return (typeof global == 'object') ? global : this;
}

  _superInspect = function(name) {
    return function(){
      var copy = {};
      for(v in this) {
        if(this.hasOwnProperty(v)) {
          copy[v] = (this[v].inspect ? this[v].inspect() : this[v]);        
        }
      }
      return name+"(" + JSON.stringify(copy.val) + ")";
    }
  }

  Constructor = function(f) {
    var x = function(val){
      if(!(this instanceof x)){
        var inst = new x();
        f.apply(inst, arguments);
        return inst;
      }
      f.apply(this, arguments);
    };
    return x;
  }

  makeType = function(f) {
    f = f || function(v){ this.val = v; }
    return Constructor(f);
  }

  newType = function(superclass, name) {
    var constructr = superclass;
    var x = makeType();

    x.prototype = new constructr();
    x.prototype.constructor=constructr; 
    x.prototype.valueOf = function() { return this.val; }
    x.prototype.toString = function() { return this.val.toString(); }
    x.prototype.inspect = _superInspect(name);

    var globl = _getGlobal();
    globl[name] = x;
    return x;
  }

  // Some default types

  Maybe = makeType();
  Either = Constructor(function(left, right){
    this.left = left;
    this.right = right;
  });

  types.Maybe = Maybe;
  types.Either = Either;
  types.Constructor = Constructor;

  types.expose = function expose(env) {
    var fn;
    env = env || window;
    for (fn in types) {
      if (fn !== 'expose' && types.hasOwnProperty(fn)) {
        env[fn] = types[fn];
      }
    }
  };

  module.exports = types;

}(this));

