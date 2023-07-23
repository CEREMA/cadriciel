module.exports = function () {
  const jwt = require('jsonwebtoken');
  const fs = require('fs');
  const yaml = require('yaml');
  return {
    methods: {
      get: {
        secure: true,
        description: 'get current user policy',
        parameters: [],
        fn(req, res) {
          var role = req.user.roles[0];
          let impersonate = req.query.impersonate;
          if (impersonate === 'null') impersonate = null;

          fs.readFile(
            `${__dirname}/../../api/.shield.yaml`,
            'utf8',
            (err, data) => {
              if (err) {
                return res.status(500).json({ error: 'INTERNAL_ERROR' });
              }
              if (impersonate ?? false) {
                if (role !== 'admin')
                  return res.status(401).json({ error: 'AUTH_ERROR' });
                role = impersonate;
              }
              const shield = yaml.parse(data);
              let policy;
              for (let i = 0; i < shield.role.length; i++) {
                for (let el in shield.role[i]) {
                  if (el == role) policy = shield.role[i][el];
                }
              }
              res.json({ uri: policy });
            }
          );
        },
      },
    },
  };
};
