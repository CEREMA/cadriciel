const { Sequelize, Op } = require('sequelize');
if (!process.env.DB_URI) return false;
const db = new Sequelize(`${process.env.DB_URI}`, {
  logging: false,
  dialectOptions: {},
});
const query = function (sql, cb) {
  db.query(sql, { raw: true })
    .then(function (r) {
      r = r[0];
      cb(null, r);
    })
    .catch(function (e) {
      logger.error(e.message);
      if (cb) return cb({ error: e.message });
    });
};
const insert = (tableName, record, cb) => {
  const keys = Object.keys(record);
  const values = Object.values(record);

  const placeholders = keys.map((key, index) => `$${index + 1}`);

  const query = `
    INSERT INTO ${tableName} (${keys.map((key) => `"${key}"`).join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *;
  `;

  db.query(query, {
    raw: true,
    bind: values,
    type: Sequelize.QueryTypes.INSERT,
  })
    .then(function (r) {
      r = r[0];
      cb(null, r);
    })
    .catch(function (e) {
      let msg;
      if (global.logger) logger.error(e.message);
      if (e.message) msg = e.message;
      return cb({ msg });
    });
};
module.exports = {
  db,
  query,
  insert,
};
