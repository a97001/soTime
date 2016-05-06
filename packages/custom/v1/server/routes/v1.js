(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (V1, app, auth, database) {

    app.get('/api/v1/example/anyone', function (req, res, next) {
      res.send('Anyone can access this');
    });

    app.get('/api/v1/example/auth', auth.requiresLogin, function (req, res, next) {
      res.send('Only authenticated users can access this');
    });

    app.get('/api/v1/example/admin', auth.requiresAdmin, function (req, res, next) {
      res.send('Only users with Admin role can access this');
    });

    app.get('/api/v1/example/render', function (req, res, next) {
      V1.render('index', {
        package: 'v1'
      }, function (err, html) {
        //Rendering a view from the Package server/views
        res.send(html);
      });
    });
  };
})();
