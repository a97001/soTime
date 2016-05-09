(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (V1, app, auth, database) {
    var uploads = require('../controllers/uploads')(V1);

    app.route('/v1/upload/document')
    .get(auth.requiresLogin, uploads.getUploadDocument)
    .post(auth.requiresLogin, uploads.postUploadDocument);

    app.route('/v1/upload/document/thumbnail/:upload_document_name')
    .get(auth.requiresLogin, uploads.getDocThumbnail);

    app.route('/v1/upload/document/:upload_document_name')
    .get(auth.requiresLogin, uploads.getDoc)
    .delete(auth.requiresLogin, uploads.deleteUploadDocument);

    // app.route('/v1/upload/form')
    // .post(auth.requiresLogin, upload.processUpload);

    app.param('upload_document_name', uploads.filename);



    // Setting up params
    // app.param('user_userId', users.user);
    // app.param('user_friendshipId', users.friendship);
  };
})();
