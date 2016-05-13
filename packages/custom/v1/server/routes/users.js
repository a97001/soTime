(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (V1, app, auth, database) {
    var users = require('../controllers/users')(V1);

    app.route('/v1/users/search')
      .post(auth.requiresLogin, users.searchUsers);

    app.route('/v1/users/me')
      // .get(auth.requiresLogin, users.showMe)
      .put(auth.requiresLogin, users.updateMe)
      .delete(auth.requiresLogin, users.deleteMe);

    app.route('/v1/users/me/icon')
      .get(auth.requiresLogin, users.showMyIcon)
      .put(auth.requiresLogin, users.updateMyIcon);

    app.route('/v1/users/me/events')
      .get(auth.requiresLogin, users.allMyEvents)
      .post(auth.requiresLogin, users.createMyEvent);

    app.route('/v1/users/me/friendships')
      .get(auth.requiresLogin, users.showMyFriendships);

    app.route('/v1/users/me/friendships/:user_userId')
      .post(auth.requiresLogin, users.createFriendship)
      .put(auth.requiresLogin, users.makeFriendshipDecision)
      .delete(auth.requiresLogin, users.deleteFriendship);

    app.route('/v1/users/me/friendships/:friendship_userId/events')
      .get(auth.requiresLogin, users.allFriendshipEvents)
      .post(auth.requiresLogin, users.createFriendshipEvent);

    app.route('/v1/users/:user_userId')
      .get(auth.requiresLogin, users.showUser);

    app.route('/v1/users/:user_userId/icon')
      .get(auth.requiresLogin, users.showUserIcon);

    // app.route('/v1/users/friendships')
    //   .get(auth.requiresLogin, users.allFriendship)
    //   .post(auth.requiresLogin, users.createFriendship);
    //
    // app.route('/v1/users/friends/:user_friendshipId')
    //   .get(auth.requiresLogin, users.showFriendship)
    //   .delete(auth.requiresLogin, users.deleteFriendship);



    // Setting up params
    app.param('user_userId', users.user);
    app.param('friendship_userId', users.friendship);
    // app.param('user_friendshipId', users.friendship);
  };
})();
