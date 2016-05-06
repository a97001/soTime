'use strict';
var mongoose = require('mongoose'),
  _ = require('lodash');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
  if (!req.isAuthenticated() || req.user.roles.indexOf('admin') < 0) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

/**
 * Generic validates if the first parameter is a mongo ObjectId
 */
exports.isMongoId = function(req, res, next) {
  if ((_.size(req.params) === 1) && (!mongoose.Types.ObjectId.isValid(_.values(req.params)[0]))) {
      return res.status(500).send('Parameter passed is not a valid Mongo ObjectId');
  }
  next();
};

/**
 * Check whether user is userAdmin
 */
exports.requiresUserAdmin = function(req, res, next) {
  if (!req.isAuthenticated() || !req.user.isAdminUser) {
    return res.status(403).json({err: 'User is not authorized'});
  }
  next();
};

//----------------------------------------

/**
 * Check Building HVAC Read 1
 */
exports.checkBuildingHVACRead = function(isAdminUser, permissions, buildingId) {
  var code = 1,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building HVAC Create 2
 */
exports.checkBuildingHVACCreate = function(isAdminUser, permissions, buildingId) {
  var code = 2,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building HVAC Update 3
 */
exports.checkBuildingHVACUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 3,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building HVAC Delete 4
 */
exports.checkBuildingHVACDelete = function(isAdminUser, permissions, buildingId) {
  var code = 4,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building FS Read 5
 */
exports.checkBuildingFSRead = function(isAdminUser, permissions, buildingId) {
  var code = 5,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building FS Create 6
 */
exports.checkBuildingFSCreate = function(isAdminUser, permissions, buildingId) {
  var code = 6,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building FS Update 7
 */
exports.checkBuildingFSUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 7,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building FS Delete 8
 */
exports.checkBuildingFSDelete = function(isAdminUser, permissions, buildingId) {
  var code = 8,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building P&D Read 9
 */
exports.checkBuildingPAndDRead = function(isAdminUser, permissions, buildingId) {
  var code = 9,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building P&D Create 10
 */
exports.checkBuildingPAndDCreate = function(isAdminUser, permissions, buildingId) {
  var code = 10,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building P&D Update 11
 */
exports.checkBuildingPAndDUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 11,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building P&D Delete 12
 */
exports.checkBuildingPAndDDelete = function(isAdminUser, permissions, buildingId) {
  var code = 12,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lift&Escalator Read 13
 */
exports.checkBuildingLiftAndEscalatorRead = function(isAdminUser, permissions, buildingId) {
  var code = 13,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lift&Escalator Create 14
 */
exports.checkBuildingLiftAndEscalatorCreate = function(isAdminUser, permissions, buildingId) {
  var code = 14,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lift&Escalator Update 15
 */
exports.checkBuildingLiftAndEscalatorUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 15,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lift&Escalator Delete 16
 */
exports.checkBuildingLiftAndEscalatorDelete = function(isAdminUser, permissions, buildingId) {
  var code = 16,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Electrical Read 17
 */
exports.checkBuildingElectricalRead = function(isAdminUser, permissions, buildingId) {
  var code = 17,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Electrical Create 18
 */
exports.checkBuildingElectricalCreate = function(isAdminUser, permissions, buildingId) {
  var code = 18,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Electrical Update 19
 */
exports.checkBuildingElectricalUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 19,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Electrical Delete 20
 */
exports.checkBuildingElectricalDelete = function(isAdminUser, permissions, buildingId) {
  var code = 20,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building BMS Read 21
 */
exports.checkBuildingBMSRead = function(isAdminUser, permissions, buildingId) {
  var code = 21,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building BMS Create 22
 */
exports.checkBuildingBMSCreate = function(isAdminUser, permissions, buildingId) {
  var code = 22,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building BMS Update 23
 */
exports.checkBuildingBMSUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 23,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building BMS Delete 24
 */
exports.checkBuildingBMSDelete = function(isAdminUser, permissions, buildingId) {
  var code = 24,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building ELV Read 25
 */
exports.checkBuildingELVRead = function(isAdminUser, permissions, buildingId) {
  var code = 25,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building ELV Create 26
 */
exports.checkBuildingELVCreate = function(isAdminUser, permissions, buildingId) {
  var code = 26,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building ELV Update 27
 */
exports.checkBuildingBMSUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 27,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building ELV Delete 28
 */
exports.checkBuildingELVDelete = function(isAdminUser, permissions, buildingId) {
  var code = 28,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lighting Read 29
 */
exports.checkBuildingLightingRead = function(isAdminUser, permissions, buildingId) {
  var code = 29,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lighting Create 30
 */
exports.checkBuildingLightingCreate = function(isAdminUser, permissions, buildingId) {
  var code = 30,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lighting Update 31
 */
exports.checkBuildingLightingUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 31,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Lighting Delete 32
 */
exports.checkBuildingLightingDelete = function(isAdminUser, permissions, buildingId) {
  var code = 32,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building General Read 33
 */
exports.checkBuildingGeneralRead = function(isAdminUser, permissions, buildingId) {
  var code = 33,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building General Create 34
 */
exports.checkBuildingGeneralCreate = function(isAdminUser, permissions, buildingId) {
  var code = 34,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building General Update 35
 */
exports.checkBuildingGeneralUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 35,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building General Delete 36
 */
exports.checkBuildingGeneralDelete = function(isAdminUser, permissions, buildingId) {
  var code = 36,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Sun Read 37
 */
exports.checkBuildingPassiveSunRead = function(isAdminUser, permissions, buildingId) {
  var code = 37,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Sun Create 38
 */
exports.checkBuildingPassiveSunCreate = function(isAdminUser, permissions, buildingId) {
  var code = 38,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Sun Update 39
 */
exports.checkBuildingPassiveSunUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 39,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Sun Delete 40
 */
exports.checkBuildingPassiveSunDelete = function(isAdminUser, permissions, buildingId) {
  var code = 40,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Light Read 41
 */
exports.checkBuildingPassiveLightRead = function(isAdminUser, permissions, buildingId) {
  var code = 41,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Light Create 42
 */
exports.checkBuildingPassiveLightCreate = function(isAdminUser, permissions, buildingId) {
  var code = 42,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Light Update 43
 */
exports.checkBuildingPassiveLightUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 43,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Light Delete 44
 */
exports.checkBuildingPassiveLightDelete = function(isAdminUser, permissions, buildingId) {
  var code = 44,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Wind Read 45
 */
exports.checkBuildingPassiveWindRead = function(isAdminUser, permissions, buildingId) {
  var code = 45,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Wind Create 46
 */
exports.checkBuildingPassiveWindCreate = function(isAdminUser, permissions, buildingId) {
  var code = 46,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Wind Update 47
 */
exports.checkBuildingPassiveWindUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 47,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Wind Delete 48
 */
exports.checkBuildingPassiveWindDelete = function(isAdminUser, permissions, buildingId) {
  var code = 48,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Others Read 49
 */
exports.checkBuildingPassiveOthersRead = function(isAdminUser, permissions, buildingId) {
  var code = 49,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Others Create 50
 */
exports.checkBuildingPassiveOthersCreate = function(isAdminUser, permissions, buildingId) {
  var code = 50,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Others Update 51
 */
exports.checkBuildingPassiveOthersUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 51,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Passive-Others Delete 52
 */
exports.checkBuildingPassiveOthersDelete = function(isAdminUser, permissions, buildingId) {
  var code = 52,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Solar Read 53
 */
exports.checkBuildingRenewableSolarRead = function(isAdminUser, permissions, buildingId) {
  var code = 53,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Solar Create 54
 */
exports.checkBuildingRenewableSolarCreate = function(isAdminUser, permissions, buildingId) {
  var code = 54,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Solar Update 55
 */
exports.checkBuildingRenewableSolarUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 55,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Solar Delete 56
 */
exports.checkBuildingRenewableSolarDelete = function(isAdminUser, permissions, buildingId) {
  var code = 56,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Biomass Read 57
 */
exports.checkBuildingRenewableBiomassRead = function(isAdminUser, permissions, buildingId) {
  var code = 57,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Biomass Create 58
 */
exports.checkBuildingRenewableBiomassCreate = function(isAdminUser, permissions, buildingId) {
  var code = 58,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Biomass Update 59
 */
exports.checkBuildingRenewableBiomassUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 59,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Biomass Delete 60
 */
exports.checkBuildingRenewableBiomassDelete = function(isAdminUser, permissions, buildingId) {
  var code = 60,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Wind Read 61
 */
exports.checkBuildingRenewableWindRead = function(isAdminUser, permissions, buildingId) {
  var code = 61,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Wind Create 62
 */
exports.checkBuildingRenewableWindCreate = function(isAdminUser, permissions, buildingId) {
  var code = 62,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Wind Update 63
 */
exports.checkBuildingRenewableWindUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 59,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Wind Delete 64
 */
exports.checkBuildingRenewableWindDelete = function(isAdminUser, permissions, buildingId) {
  var code = 64,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Geothermal Read 65
 */
exports.checkBuildingRenewableGeothermalRead = function(isAdminUser, permissions, buildingId) {
  var code = 65,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Geothermal Create 66
 */
exports.checkBuildingRenewableGeothermalCreate = function(isAdminUser, permissions, buildingId) {
  var code = 66,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Geothermal Update 67
 */
exports.checkBuildingRenewableGeothermalUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 67,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Geothermal Delete 68
 */
exports.checkBuildingRenewableGeothermalDelete = function(isAdminUser, permissions, buildingId) {
  var code = 68,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Hydropower Read 69
 */
exports.checkBuildingRenewableHydropowerRead = function(isAdminUser, permissions, buildingId) {
  var code = 69,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Hydropower Create 70
 */
exports.checkBuildingRenewableHydropowerCreate = function(isAdminUser, permissions, buildingId) {
  var code = 70,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Hydropower Update 71
 */
exports.checkBuildingRenewableHydropowerUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 71,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Hydropower Delete 72
 */
exports.checkBuildingRenewableHydropowerDelete = function(isAdminUser, permissions, buildingId) {
  var code = 68,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Others Read 73
 */
exports.checkBuildingRenewableOthersRead = function(isAdminUser, permissions, buildingId) {
  var code = 73,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Others Create 74
 */
exports.checkBuildingRenewableOthersCreate = function(isAdminUser, permissions, buildingId) {
  var code = 74,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Others Update 75
 */
exports.checkBuildingRenewableOthersUpdate = function(isAdminUser, permissions, buildingId) {
  var code = 75,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Renewable-Others Delete 76
 */
exports.checkBuildingRenewableOthersDelete = function(isAdminUser, permissions, buildingId) {
  var code = 76,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Submission-ISO 50001 Read 77
 */
exports.checkBuildingSubmissionISO50001Read = function(isAdminUser, permissions, buildingId) {
  var code = 77,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Submission-ISO 50001 Create 78
 */
exports.checkBuildingSubmissionISO50001Create = function(isAdminUser, permissions, buildingId) {
  var code = 78,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Submission-ISO 50001 Update 79
 */
exports.checkBuildingSubmissionISO50001Update = function(isAdminUser, permissions, buildingId) {
  var code = 79,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};

/**
 * Check Building Submission-ISO 50001 Delete 80
 */
exports.checkBuildingSubmissionISO50001Delete = function(isAdminUser, permissions, buildingId) {
  var code = 80,
      length = permissions.length,
      isFound = false,
      splitedPermission = [];
  if (!isAdminUser) {
    for (var i=0; i<length; i++) {
      splitedPermission = permissions[i].split('@');
      if (Number(splitedPermission[0]) === code && splitedPermission[1] === buildingId) {
        isFound = true;
        break
      }
    }
    return isFound;
  }
  return true;
};
