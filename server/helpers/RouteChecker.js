const co = require('co');
const mongoose = require('mongoose');
const config = require('../../config/env');

const User = require('../models/user');

module.exports = {
  /**
   * check if user logged in
   */
  requiresLogin(req, res, next) {
    if (!req.me) {
      return res.status(401).end();
    }
    return next();
  },

  /**
   * check group privilege
   */
  checkGroupPrivilege(req, res, next) {
    co(function* () {
      if (!req.group) {
        return res.status(404).end();
      }
      const user = yield User.findOne({ _id: req.me._id }).lean().exec();
      const groupId = req.group._id.toString();
      req.groupPrivilege = 'x'; // non-member or not follower
      user.groups_id = JSON.parse(JSON.stringify(user.groups_id));
      user.follows_id = JSON.parse(JSON.stringify(user.follows_id));
      if (user.groups_id.indexOf(groupId) > -1) {
        req.groupPrivilege = 'm'; // member
      } else if (user.follows_id.indexOf(groupId) > -1) {
        req.groupPrivilege = 'f'; // follower
      }
      return next();
    }).catch((err) => {
      next(err);
    });
  }
};
