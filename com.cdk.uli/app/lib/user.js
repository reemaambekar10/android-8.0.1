var user;

var PUBLIC = {
  getId: function() { return user.id; }

, set: function(u) { user = u; return u; }

, get: function() { return user; }
}

module.exports = PUBLIC;

