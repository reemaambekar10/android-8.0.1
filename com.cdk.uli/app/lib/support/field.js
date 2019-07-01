Field = makeType();

Functor(Field, {
  fmap: function(f) {
    return Field(f(this.val));
  }
});

Monoid(Field, {
  mempty: function(){ return Field({}) },
  mappend: function(f1, f2) {
    var x = f1.val,
        y = f2.val;

    x[y.id] = y.value;
    return Field(x);
  }
});
