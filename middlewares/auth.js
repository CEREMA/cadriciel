module.exports = (req, res, next) => {
  const jwt = require('jsonwebtoken');

  if (!req.headers.authorization)
    return res.status(401).json({ error: 'AUTH_ERROR' });
  const auth = req.headers.authorization.split('Bearer ')[1].split('.');
  if (auth.length < 3) return res.status(401).json({ error: 'AUTH_ERROR' });
  try {
    const token = Buffer.from(auth[1], 'base64').toString('utf8');
    const user = JSON.parse(token);
    // dev
    //user.roles = ['admin'];
    // prod
    user.roles = ['guest'];
    if (sys.models)
      if (sys.models.roles)
        sys.models.roles
          .findAll({
            where: {
              user_id: user.sub,
            },
          })
          .then((data) => {
            for (let i = 0; i < data.length; i++)
              user.roles.push(data[i].dataValues.role);
            req.current_user = user;
            req.user = user;
            req.user.id = user.sub;
            next();
          })
          .catch((err) => {
            console.log(err);
            req.current_user = user;
            req.user = user;
            req.user.id = user.sub;
            next();
          });
      else {
        req.current_user = user;
        req.user = user;
        req.user.id = user.sub;
        next();
      }
    else {
      req.current_user = user;
      req.user = user;
      req.user.id = user.sub;
      next();
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: 'AUTH_ERROR' });
  }
};
