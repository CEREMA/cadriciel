if (!global.app) return;
/** passport strategies */
const chalk = require('chalk');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const passport = require('passport');
console.log(chalk.green('     * loading strategies'.padEnd(80, ' ')));
var strategies = {};
var ddir = fs.readdirSync(__dirname + '/../auth/');
for (var i = 0; i < ddir.length; i++) {
  if (ddir[i].indexOf('.js') > -1) {
    var unit = ddir[i].substring(ddir[i].lastIndexOf('/') + 1, ddir[i].length);
    unit = unit.substring(0, unit.lastIndexOf('.'));
    const strategy = require(__dirname + '/../auth/' + ddir[i]);
    strategies = Object.assign(strategies, strategy());
    console.log(
      chalk.green(
        '       - register strategy ' +
          path.machinasapiensname(ddir[i]).split('.js')[0]
      )
    );
  }
}

/** init passports */
function loadPassports() {
  sys.models.langs
    .findAll()
    .then(function (r) {
      var langs = [];
      for (var i = 0; i < r.length; i++) {
        langs.push(r[i].dataValues);
      }
      LANGS = langs;
    })
    .catch(function (e) {
      logger.error("Can't load langs... Reloading...");
      if (e) return setTimeout(loadPassports, 1000);
    });
  sys.models.auth
    .findAll()
    .then(function (r) {
      for (var i = 0; i < r.length; i++) {
        r[i].config.callbackURL =
          process.env.API_URI + '/auth/' + r[i].title + '/callback';
        passport.use(
          r[i].title,
          new strategies[r[i].title](r[i].config, function (...params) {
            params[params.length - 1](null, params[params.length - 2]);
          })
        );
      }
    })
    .catch(function (e) {
      logger.error("Can't load passports... Reloading...");
      if (e) return setTimeout(loadPassports, 1000);
    });
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

loadPassports();

/** AUTH api */
function passportjs(req, res, next) {
  return passport.authenticate(req.params.strategy, {
    failureMessage: true,
  })(req, res, next);
}
app.get('/auth/:strategy', function (req, res, next) {
  return passport.authenticate(req.params.strategy, {
    scope: 'openid email profile',
  })(req, res, next);
});
app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});
app.get('/auth/:strategy/callback', passportjs, function (req, res) {
  console.log(req.user);
  const payload = jwt.sign(JSON.stringify(req.user), process.env.API_JWT);
  res.redirect(`${process.env.CONSOLE_URI}/auth/login#${payload}`);
});

app.use(passport.initialize());
app.use(passport.session());

module.exports = {
  passport,
};
