/* globals require */
'use strict';

/**
 * Module dependencies.
 */
var mean = require('meanio'),
  compression = require('compression'),
  consolidate = require('consolidate'),
  express = require('express'),
  helpers = require('view-helpers'),
  flash = require('connect-flash'),
  modRewrite = require('connect-modrewrite'),
  // seo = require('mean-seo'),
  config = mean.loadConfig(),
  expressJwt = require('express-jwt'),
  bodyParser = require('body-parser');

module.exports = function(app, db) {

  app.use(bodyParser.json(config.bodyParser.json));
  app.use(bodyParser.urlencoded(config.bodyParser.urlencoded));

  app.set('showStackError', true);

  // Prettify HTML
  app.locals.pretty = true;

  // cache=memory or swig dies in NODE_ENV=production
  app.locals.cache = 'memory';

  // Should be placed before express.static
  // To ensure that all assets and data are compressed (utilize bandwidth)
  app.use(compression({
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
  }));

  // Enable compression on bower_components
  app.use('/bower_components', express.static(config.root + '/bower_components'));

  // Adds logging based on logging config in config/env/ entry
  require('./middlewares/logging')(app, config.logging);

  // assign the template engine to .html files
  app.engine('html', consolidate[config.templateEngine]);

  // set .html as the default extension
  app.set('view engine', 'html');


  // Dynamic helpers
  app.use(helpers(config.app.name));

  // Connect flash for flash messages
  app.use(flash());

  app.use(modRewrite([

    '!^/auth/.*|^/admin/.*|^/energy/.*|^/api/.*|^/test/.*|^/v1/.*|\\_getModules|\\.html|\\.js|\\.css|\\.swf|\\.jp(e?)g|\\.png|\\.ico|\\.gif|\\.svg|\\.eot|\\.ttf|\\.woff|\\.txt|\\.pdf$ / [L]'

  ]));

  // We are going to protect /api routes with JWT
  app.use(['/v1', '/asset', '/storage', '/admin', '/energy', '/api', '/test', '/chilleranalyser'], expressJwt({
    secret: config.secret,
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
          return req.query.token;
        }
        return null;
      }
  }), function(req, res, next) {
      if (req.user) req.user = JSON.parse(decodeURI(req.user));
      next();
  });

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
  }).options('*', function(req, res, next){
    res.end();
  });

  app.disable('x-powered-by');
  // app.use(seo());
};
