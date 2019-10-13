/*
 * Sails application launcher.
 *
 */

//==============================================================================

var Sails = require("sails");
var sails;

before(function(done) {
  Sails.lift({
    log: {
      level: "silent"
    },
    paths: {
      models: require("path").join(process.cwd(), "test", "fixtures", "models")
    },
    connections: {
      default: {
        adapter: "sails-disk",
        inMemoryOnly: true
      }
    },
    models: {
      connection: "default",
      migrate: "alter"
    },
    session: {
      secret: "s.e.c.r.e.t"
    },
    multitenancy: function(req) {
      return new Promise(async (resolve) => {
        // Return a Datasource object
        resolve(new Datasource({
          identity: 'test',
          adapter: 'sails-disk'
        }));
      });
    },
    hooks: {
      grunt: false,
      session: false,
      sockets: false,
      pubsub: false
    }
  }, function(err, sailsInstance) {
    global.sails = sailsInstance;
    return done && done(err, sailsInstance);
  });
});

//------------------------------------------------------------------------------

after(function(done) {
  //-- NOTE: This is a workaround for sails.lower multiple callback calls...
  var _shutting_down = false;
  function _shutdown(err) {
    if (!_shutting_down) {
      _shutting_down = true;
      done && done(err);
    }
  }

  Sails.lower(_shutdown);
});
