const { Sequelize, Op } = require('sequelize');
if (!process.env.DB_URI) return false;
const sequelize = new Sequelize(`${process.env.DB_URI}`, {
  logging: false,
  dialectOptions: {},
});
try {
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);
  const op = Op;
  module.exports = {
    models,
    op,
  };
} catch (e) {
  module.exports = {};
}
