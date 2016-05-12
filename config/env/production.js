'use strict';

module.exports = {
  db: 'mongodb://localhost/soTime',
  /**
   * Database options that will be passed directly to mongoose.connect
   * Below are some examples.
   * See http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
   * and http://mongoosejs.com/docs/connections.html for more information
   */
  dbOptions: {
    /*
    server: {
        socketOptions: {
            keepAlive: 1
        },
        poolSize: 5
    },
    replset: {
      rs_name: 'myReplicaSet',
      poolSize: 5
    },
    db: {
      w: 1,
      numberOfRetries: 2
    }
    */
  },
  hostname: 'http://localhost:3000',
  app: {
    name: 'soTime'
  },
  logging: {
    format: 'combined'
  },
  strategies: {
    local: {
      enabled: true
    },
    landingPage: '/',
    facebook: {
      clientID: '1686545874917425',
      clientSecret: '681ac1c217c1030a97678affb972a2be',
      callbackURL: 'http://localhost:3000/v1/auth/facebook/callback',
      enabled: true
    },
    twitter: {
      clientID: 'CONSUMER_KEY',
      clientSecret: 'CONSUMER_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/twitter/callback',
      enabled: false
    },
    github: {
      clientID: 'APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/github/callback',
      enabled: false
    },
    google: {
      clientID: 'APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:3000/v1/auth/google/callback',
      enabled: false
    },
    linkedin: {
      clientID: 'API_KEY',
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
