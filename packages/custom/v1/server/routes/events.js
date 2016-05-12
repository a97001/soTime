(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (V1, app, auth, database) {
    var events = require('../controllers/events')(V1);
    var groups = require('../controllers/groups')(V1);

    app.route('/v1/events/:event_eventId')
        .get(auth.requiresLogin, groups.group, events.showEvent)
        .put(auth.requiresLogin, events.updateEvent)
        .delete(auth.requiresLogin, events.deleteEvent);

    // Setting up params
    app.param('event_eventId', events.event);
  };
})();
