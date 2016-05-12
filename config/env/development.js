'use strict';

module.exports = {
  db: 'mongodb://ec2-52-24-35-225.us-west-2.compute.amazonaws.com/soTime',
  debug: true,
  logging: {
    format: 'tiny'
  },
  //  aggregate: 'whatever that is not false, because boolean false value turns aggregation off', //false
  aggregate: false,
  mongoose: {
    debug: false
  },
  hostname: 'http://localhost:3000',
  app: {
    name: 'soTime'
  },
  strategies: {
    local: {
      enabled: true
    },
    landingPage: '/',
    facebook: {
      clientID: '1686545874917425',
      clientSecret: '681ac1c217c1030a97678affb972a2be',
      callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
      enabled: true
    },
    twitter: {
      clientID: 'DEFAULT_CONSUMER_KEY',
      clientSecret: 'CONSUMER_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/twitter/callback',
      enabled: false
    },
    github: {
      clientID: 'DEFAULT_APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/github/callback',
      enabled: false
    },
    google: {
      clientID: 'DEFAULT_APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/google/callback',
      enabled: false
    },
    linkedin: {
      clientID: 'DEFAULT_API_KEY',
      clientSecret: 'SECRET_KEY',
      callbackURL: 'http://localhost:3000/v1/auth/linkedin/callback',
      enabled: false
    }
  },
  errorHandler: function(err, res) {
    if (!err.statusCode || err.statusCode === 500) {
      console.log(err);
      return res.status(500).end();
    }
    return res.status(err.statusCode).json(err.errorObject);
  },
  // emailFrom: '"Negawatt Utility" <noreply@negawatt.co>', // sender address like ABC <abc@example.com>
  // mailer: {
  //   host: 'smtp.negawatt.co',
  //   port: 1025,
  //   auth: {
  //     user:'noreply@negawatt.co',
  //     pass: 'buY!SW4Qaf'
  //   },
  //   tls: {
  //       rejectUnauthorized:false
  //   },
  //   pool: true,
  //   debug: true
  // },
  secret: 'SOME_TOKEN_SECRET'
};
