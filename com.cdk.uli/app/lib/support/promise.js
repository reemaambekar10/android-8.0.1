var Promise = nrequire('/support/node-promise/promise').Promise;
var p = new Promise();

Functor(p.constructor, {
  fmap: function(f) {
    var promise = new Promise();
    this.then(function(response){
      promise.resolve(f(response));
    });
    return promise;
  }
});

module.exports = Promise;
