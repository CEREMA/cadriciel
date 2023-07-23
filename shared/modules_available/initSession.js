const { createClient } = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

/** init session */
if (process.env.SESSION) {
  redisClient = createClient({
    url: process.env.SESSION,
    legacyMode: true,
  });
  redisClient.on('error', function (err) {
    logger.error('Could not establish a connection with redis. ' + err);
  });
  redisClient.on('connect', function (err) {
    logger.info('Connected to session successfully');
  });
  redisClient.connect().catch(logger.error);
  var sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
    },
  });
  app.use(sessionMiddleware);

  module.exports = { sessionMiddleware };
}
