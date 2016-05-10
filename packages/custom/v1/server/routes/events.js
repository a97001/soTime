(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (V1, app, auth, database) {
    var events = require('../controllers/events')(V1);

    // app.route('/v1/events')
    //    .get(auth.requiresLogin, groups.allGroups)
    //    .post(auth.requiresLogin, groups.createGroup);
    //
    // // Setting up params
    // app.param('event_eventId', events.event);
  };
})();
