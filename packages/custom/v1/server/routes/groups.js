(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (V1, app, auth, database) {
    var groups = require('../controllers/groups')(V1);

    app.route('/v1/groups')
       .get(auth.requiresLogin, groups.allGroups)
       .post(auth.requiresLogin, groups.createGroup);

    app.route('/v1/groups/followings')
       .get(auth.requiresLogin, groups.showFollowingGroups);

    app.route('/v1/groups/invitations')
        .get(auth.requiresLogin, groups.showInvitedGroups);

    app.route('/v1/groups/:group_groupId')
        .get(auth.requiresLogin, groups.showGroup)
        .put(auth.requiresLogin, groups.updateGroup)
        .delete(auth.requiresLogin, groups.exitGroup);

    app.route('/v1/groups/:group_groupId/icon')
        .get(auth.requiresLogin, groups.showGroupIcon)
        .put(auth.requiresLogin, groups.updateGroupIcon);

    app.route('/v1/groups/:group_groupId/events')
        .get(auth.requiresLogin, groups.allGroupEvents)
        .post(auth.requiresLogin, groups.createGroupEvent);

    app.route('/v1/groups/:group_groupId/followings')
        .get(auth.requiresLogin, groups.showGroupFollowers)
        .post(auth.requiresLogin, groups.createGroupFollower);
        // .delete(auth.requiresLogin, groups.deleteGroupFollower);

    app.route('/v1/groups/:group_groupId/invitations')
        .get(auth.requiresLogin, groups.showGroupInvitations)
        .post(auth.requiresLogin, groups.createGroupInvitation)
        .put(auth.requiresLogin, groups.makeGroupInvitationDecision);

    app.route('/v1/groups/:group_groupId/invitations/:group_userId')
      .delete(auth.requiresLogin, groups.deleteGroupInvitation);

    // Setting up params
    app.param('group_groupId', groups.group);
  };
})();
