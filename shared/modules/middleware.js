if (!global.app) return;
const compression = require('compression');
const useragent = require('express-useragent');

app.use(function (req, res, next) {
  res.setHeader('x-cache-timeout', '1 hour');
  next();
});
app.use(compression());
app.use(useragent.express());
app.set('trust proxy', 1);
app.disable('x-powered-by');
