var auth = require('../../../../core/users/authorization');

/**
 * Check Building System Read
 */

exports.checkBuildingSystemRead = function(req, res, next) {
  var isAuthorized = false;
  if (!req.query.system) {
    return next();
  }
  switch(req.query.system) {
      case 'HVAC': isAuthorized = auth.checkBuildingHVACRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'FS': isAuthorized = auth.checkBuildingFSRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'P&D': isAuthorized = auth.checkBuildingPAndDRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Lift & Escalator': isAuthorized = auth.checkBuildingLiftAndEscalatorRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Electrical': isAuthorized = auth.checkBuildingElectricalRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'BMS': isAuthorized = auth.checkBuildingBMSRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'ELV': isAuthorized = auth.checkBuildingELVRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Lighting': isAuthorized = auth.checkBuildingLightingRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'General': isAuthorized = auth.checkBuildingGeneralRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Sun': isAuthorized = auth.checkBuildingPassiveSunRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Light': isAuthorized = auth.checkBuildingPassiveLightRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Wind(P)': isAuthorized = auth.checkBuildingPassiveWindRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Others(P)': isAuthorized = auth.checkBuildingPassiveOthersRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Solar': isAuthorized = auth.checkBuildingRenewableSolarRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Biomass': isAuthorized = auth.checkBuildingRenewableBiomassRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Wind(R)': isAuthorized = auth.checkBuildingRenewableWindRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Geothermal': isAuthorized = auth.checkBuildingRenewableGeothermalRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Hydropower': isAuthorized = auth.checkBuildingRenewableHydropowerRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'Others(R)': isAuthorized = auth.checkBuildingRenewableOthersRead(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
      case 'ISO 50001': isAuthorized = auth.checkBuildingSubmissionISO50001Read(req.user.isAdminUser, req.user.permissions, req.query.buildingId); break;
  }
  if (isAuthorized) {
    next();
  } else {
    return res.status(403).json({err: 'User is not authorized'});
  }
};

exports.getBuildingSystemRead = function(isAdminUser, permissions, buildingId) {
  buildingId = buildingId.toString();
  var systems = [];
  if (auth.checkBuildingHVACRead(isAdminUser, permissions, buildingId)) {
    systems.push('HVAC');
  }
  if (auth.checkBuildingFSRead(isAdminUser, permissions, buildingId)) {
    systems.push('FS');
  }
  if (auth.checkBuildingPAndDRead(isAdminUser, permissions, buildingId)) {
    systems.push('P&D');
  }
  if (auth.checkBuildingLiftAndEscalatorRead(isAdminUser, permissions, buildingId)) {
    systems.push('Lift & Escalator');
  }
  if (auth.checkBuildingElectricalRead(isAdminUser, permissions, buildingId)) {
    systems.push('Electrical');
  }
  if (auth.checkBuildingBMSRead(isAdminUser, permissions, buildingId)) {
    systems.push('BMS');
  }
  if (auth.checkBuildingELVRead(isAdminUser, permissions, buildingId)) {
    systems.push('ELV');
  }
  if (auth.checkBuildingLightingRead(isAdminUser, permissions, buildingId)) {
    systems.push('Lighting');
  }
  if (auth.checkBuildingGeneralRead(isAdminUser, permissions, buildingId)) {
    systems.push('General');
  }
  if (auth.checkBuildingPassiveSunRead(isAdminUser, permissions, buildingId)) {
    systems.push('Sun');
  }
  if (auth.checkBuildingPassiveLightRead(isAdminUser, permissions, buildingId)) {
    systems.push('Light');
  }
  if (auth.checkBuildingPassiveWindRead(isAdminUser, permissions, buildingId)) {
    systems.push('Wind(P)');
  }
  if (auth.checkBuildingPassiveOthersRead(isAdminUser, permissions, buildingId)) {
    systems.push('Others(P)');
  }
  if (auth.checkBuildingRenewableSolarRead(isAdminUser, permissions, buildingId)) {
    systems.push('Solar');
  }
  if (auth.checkBuildingRenewableBiomassRead(isAdminUser, permissions, buildingId)) {
    systems.push('Biomass');
  }
  if (auth.checkBuildingRenewableWindRead(isAdminUser, permissions, buildingId)) {
    systems.push('Wind(R)');
  }
  if (auth.checkBuildingRenewableGeothermalRead(isAdminUser, permissions, buildingId)) {
    systems.push('Geothermal');
  }
  if (auth.checkBuildingRenewableHydropowerRead(isAdminUser, permissions, buildingId)) {
    systems.push('Hydropower');
  }
  if (auth.checkBuildingRenewableOthersRead(isAdminUser, permissions, buildingId)) {
    systems.push('Others(R)');
  }
  if (auth.checkBuildingSubmissionISO50001Read(isAdminUser, permissions, buildingId)) {
    systems.push('ISO 50001');
  }
  return systems;
};
