module.exports = function () {
  const jwt = require('jsonwebtoken');
  return {
    methods: {
      get: {
        secure: false,
        description: 'get current user',
        parameters: [],
        fn(req, res) {
          let token = req.headers.authorization.split('Bearer ')[1];
          if (!token) res.status(400).json({ err: 'AUTH_ERROR' });
          token = token.split('.');
          if (token.length < 3)
            return res.status(401).json({ error: 'AUTH_ERROR' });
          token = Buffer.from(token[1], 'base64').toString('utf8');
          const user = JSON.parse(token);
          let User = {
            email: user.email,
            nom: user.family_name,
            prenom: user.given_name,
            id: user.sub,
            roleActifList: ['guest'],
          };
          if (sys.models)
            if (sys.models.roles)
              return sys.models.roles
                .findAll({
                  where: {
                    user_id: User.id,
                  },
                })
                .then((data) => {
                  for (let i = 0; i < data.length; i++)
                    User.roleActifList.push(data[i].dataValues.role);
                  res.json(User);
                })
                .catch((err) => {
                  res.json(User);
                });
            else {
              res.json(User);
            }
          res.json(User);
        },
      },
    },
  };
};
