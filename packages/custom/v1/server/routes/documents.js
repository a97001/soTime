'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Document, app, auth, database) {
//   var documents = require('../controllers/documents')(Document, auth);
//   var buildings = require('../controllers/buildings')(Document);
//   var documentAuth = require('../authorizations/documents');
//   app.use(function (req, res, next) {
//       if (req.query.buildingId) {
//         buildings.building(req, res, next, req.query.buildingId);
//       } else {
//           next();
//       }
//   });
//
//   app.route('/storage/v1/documents/:document_documentId/name/:document_name')
//     .get(auth.requiresLogin, documents.showDocument);
//
//   app.route('/storage/v1/documents')
//     .get(auth.requiresLogin, documentAuth.checkBuildingSystemRead, documents.allDocuments);
//
//   app.route('/storage/v1/documents/cTags')
//     .get(auth.requiresLogin, documents.showCTags);
//
//   app.route('/storage/v1/documents/:document_documentId')
//   .put(auth.isMongoId, auth.requiresLogin, documents.updateDocument)
//   .delete(auth.isMongoId, auth.requiresLogin, documents.deleteDocument);
//
//   app.route('/storage/v1/documents/:document_documentId/versions')
//   .get(auth.requiresLogin, documents.allVersions);
//
//   app.route('/storage/v1/documents/:document_documentId/versions/:document_versionId')
//   .delete(auth.requiresLogin, documents.deleteVersion);
//
//   app.route('/storage/v1/documents/:document_documentId/versions/:document_versionId/name/:document_name')
//   .get(auth.requiresLogin, documents.showVersion);
//
//   app.param('document_documentId', documents.document);
//   app.param('document_versionId', documents.oldVersion);
};
