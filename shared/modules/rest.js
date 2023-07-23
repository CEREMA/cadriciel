if (!global.app) return;
if (!sys.models) return;

const url = require('url');
const { Sequelize, Op } = require('sequelize');
const { Parser } = require('json2csv');
const sequelizeErd = require('sequelize-erd');

if (!process.env.DB_URI) return false;

const parseConditions = (input) => {
  // Remove the leading and trailing parentheses
  const strippedInput = input.slice(1, -1);

  // Split by the closing and opening parentheses to get each condition
  const conditions = strippedInput.split(')(');

  return conditions.map((condition) => {
    // Split each condition into the operator and the rest
    const [operator, rest] = condition.split('=');

    // Split the rest into the key and value(s)
    const [key, valuesStr] = rest.split(';');
    const values = valuesStr.split(',');

    // If there's only one value, don't use an array
    const value = values.length === 1 ? values[0] : values;

    return { operator, key, value };
  });
};

const parseURL = (queryString) => {
  const convertStringToArray = (str) => {
    return str
      .slice(str.indexOf('(') + 1, str.indexOf(')'))
      .split(',')
      .map((pair) => {
        const [key, value] = pair.split('=');
        return { [key || '']: value || '' };
      });
  };

  const setCmd = (cmd, o) => {
    const commands = {
      select: o ? { attributes: o.split(',').filter(Boolean) } : undefined,
      limit: { limit: o },
      offset: { offset: o },
    };
    return commands[cmd];
  };

  const queryParams = url.parse(queryString, true).query;
  let o = {};
  for (let el in queryParams) {
    if (['select', 'limit', 'offset'].indexOf(el) > -1) {
      o = Object.assign(o, setCmd(el, queryParams[el]));
    } else {
      if (el == 'in') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.in]: queryParams[el].split(';')[1].split(','),
          },
        });
      }
      if (el == 'eq') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.eq]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'match') {
        if (!o.where) o.where = {};
        const match = JSON.parse(queryParams[el]);
        for (let el in match) {
          o.where = Object.assign(o.where, {
            [el]: {
              [Op.eq]: match[el],
            },
          });
        }
      }
      if (el == 'neq') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.ne]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'like') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.like]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'notLike') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.notLike]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'iLike') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.iLike]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'notILike') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.notILike]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'is') {
        if (!o.where) o.where = {};
        if (queryParams[el].split(';')[1] == 'NULL') {
          o.where = Object.assign(o.where, {
            [queryParams[el].split(';')[0]]: {
              [Op.is]: null,
            },
          });
        } else {
          o.where = Object.assign(o.where, {
            [queryParams[el].split(';')[0]]: {
              [Op.is]: queryParams[el].split(';')[1],
            },
          });
        }
      }
      if (el == 'not') {
        if (!o.where) o.where = {};
        if (queryParams[el].split(';')[1] == 'NULL')
          return (o.where = Object.assign(o.where, {
            [queryParams[el].split(';')[0]]: {
              [Op.not]: 'null',
            },
          }));
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.not]: queryParams[el].split(';')[1],
          },
        });
      }
      if (el == 'any') {
        if (!o.where) o.where = {};
        o.where = Object.assign(o.where, {
          [queryParams[el].split(';')[0]]: {
            [Op.any]: queryParams[el].split(';')[1].split(','),
          },
        });
      }
      if (el == 'or') {
        if (!o.where) o.where = {};
        let arr = [];
        let conditions = parseConditions(queryParams[el]);
        conditions.forEach((condition) => {
          arr.push({
            [condition.key]: {
              [Op[condition.operator]]: condition.value,
            },
          });
        });
        o.where = Object.assign(o.where, {
          [Op.or]: arr,
        });
      }
      if (el == 'order') {
        if (!o.order) o.order = [];
        let arr = [];
        let conditions = queryParams[el].split('.');
        conditions[1] = conditions[1].toUpperCase();
        o.order.push(conditions);
      }
      if (el == 'and') {
        if (!o.where) o.where = {};
        let arr = [];
        let conditions = parseConditions(queryParams[el]);
        conditions.forEach((condition) => {
          if (condition.operator == 'neq') condition.operator = 'ne';
          arr.push({
            [condition.key]: {
              [Op[condition.operator]]: condition.value,
            },
          });
        });
        o.where = Object.assign(o.where, {
          [Op.and]: arr,
        });
      }
    }
  }
  console.log(o);
  return o;
};

/** DB Model Rest */
for (let el in sys.models) {
  if (!global.sys.api_models) global.sys.api_models = { tags: [] };
  global.sys.api_models.tags.push({
    name: el,
    description: '',
  });
}

app.get('/db/erd.svg', async (req, res) => {
  const sequelize = new Sequelize(`${process.env.DB_URI}`, {
    logging: false,
    dialectOptions: {},
  });
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);
  const svg = await sequelizeErd({ source: sequelize });
  res.setHeader('Content-Type', 'image/svg+xml');
  res.end(svg);
});

app.get('/db/models/(*)', global.auth, async (req, res) => {
  if (!req.user.roles) req.user.roles = [];
  let role = req.user.roles[0];
  if (!role) role = process.env.DEFAULT_ROLE;
  if (req.headers.impersonate && role == 'admin')
    role = req.headers.impersonate;

  /** connexion à Sequelize */
  const sequelize = new Sequelize(`${process.env.DB_URI}`, {
    logging: console.log,
    dialectOptions: {},
  });
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);
  try {
    // Définir le rôle pour cette connexion

    await sequelize.query(`SET request.email TO '${req.user.email}'`);
    await sequelize.query(`SET request.department TO '${req.user.department}'`);
    await sequelize.query(
      `SET request.username TO '${req.user.preferred_username}'`
    );
    await sequelize.query(`SET request.name TO '${req.user.name}'`);
    await sequelize.query(`SET request.uuid TO '${req.user.id}'`);
    await sequelize.query(`SET request.role TO '${req.user.role}'`);

    await sequelize.query(`SET ROLE ${role}`);
    const model = req.url.split('/db/models/')[1].split('?')[0];
    if (req.user.roles.indexOf('admin') == -1) return;
    if (!models[model])
      return res.status(404).json({ error: 'model not found' });
    let o = parseURL(req.url);
    let response = 'json';
    if (req.query.response == 'csv') response = 'csv';

    const data = await models[model].findAll(o);
    if (response == 'csv') {
      const json2csvParser = new Parser({ header: true });
      const csv = json2csvParser.parse(JSON.parse(JSON.stringify(data)));
      res.header('Content-Type', 'application/json');
      return res.json({ csv });
    }
    res.header('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    //await sequelize.close();
  }
});

app.put('/db/models/(*)', global.auth, async (req, res) => {
  if (!req.user.roles) req.user.roles = [];
  const role = req.user.roles[0];
  if (!role) role = process.env.DEFAULT_ROLE;

  /** connexion à Sequelize */
  const sequelize = new Sequelize(`${process.env.DB_URI}`, {
    logging: console.log,
    dialectOptions: {},
  });
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);

  const upsert = async (name, data) => {
    try {
      let q = null;
      if (data.id)
        q = await models[name].findOne({
          where: { id: data.id },
        });

      if (q) {
        // effectuer une mise à jour
        const [rowsAffected] = await models[name].update(data, {
          where: { id: data.id },
        });
        if (rowsAffected > 0) {
          return {
            success: true,
            type: 'update',
            message: 'success',
            rowsAffected: rowsAffected,
          };
        } else {
          return {
            success: false,
            message: 'failed',
          };
        }
      } else {
        // effectuer une insertion
        const response = await models[name].create(data);
        return { success: true, type: 'insert', fields: response };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  };

  try {
    // Définir le rôle pour cette connexion
    await sequelize.query(`SET request.email TO '${req.user.email}'`);
    await sequelize.query(`SET request.department TO '${req.user.department}'`);
    await sequelize.query(
      `SET request.username TO '${req.user.preferred_username}'`
    );
    await sequelize.query(`SET request.name TO '${req.user.name}'`);
    await sequelize.query(`SET request.uuid TO '${req.user.id}'`);
    await sequelize.query(`SET request.role TO '${req.user.role}'`);

    await sequelize.query(`SET ROLE ${role}`);

    const model = req.url.split('/db/models/')[1].split('?')[0];
    if (!models[model])
      return res.status(404).json({ error: 'model not found' });
    const data = await upsert(model, req.body);
    const response = JSON.parse(JSON.stringify(data));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    //await sequelize.close();
  }
});

app.post('/db/models/(*)', global.auth, async (req, res) => {
  if (!req.user.roles) req.user.roles = [];
  const role = req.user.roles[0];
  if (!role) role = process.env.DEFAULT_ROLE;

  /** connexion à Sequelize */
  const sequelize = new Sequelize(`${process.env.DB_URI}`, {
    logging: false,
    dialectOptions: {},
  });
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);
  try {
    // Définir le rôle pour cette connexion
    await sequelize.query(`SET request.email TO '${req.user.email}'`);
    await sequelize.query(`SET request.department TO '${req.user.department}'`);
    await sequelize.query(
      `SET request.username TO '${req.user.preferred_username}'`
    );
    await sequelize.query(`SET request.name TO '${req.user.name}'`);
    await sequelize.query(`SET request.uuid TO '${req.user.id}'`);
    await sequelize.query(`SET request.role TO '${req.user.role}'`);

    await sequelize.query(`SET ROLE ${role}`);

    const model = req.url.split('/db/models/')[1].split('?')[0];
    if (!models[model])
      return res.status(404).json({ error: 'model not found' });
    const data = await models[model].create(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ body: req.body, error: err.message });
  } finally {
    //await sequelize.close();
  }
});

app.patch('/db/models/(*)', global.auth, async (req, res) => {
  if (!req.user.roles) req.user.roles = [];
  const role = req.user.roles[0];
  if (!role) role = process.env.DEFAULT_ROLE;

  /** connexion à Sequelize */
  const sequelize = new Sequelize(`${process.env.DB_URI}`, {
    logging: false,
    dialectOptions: {},
  });
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);
  try {
    // Définir le rôle pour cette connexion
    await sequelize.query(`SET request.email TO '${req.user.email}'`);
    await sequelize.query(`SET request.department TO '${req.user.department}'`);
    await sequelize.query(
      `SET request.username TO '${req.user.preferred_username}'`
    );
    await sequelize.query(`SET request.name TO '${req.user.name}'`);
    await sequelize.query(`SET request.uuid TO '${req.user.id}'`);
    await sequelize.query(`SET request.role TO '${req.user.role}'`);

    await sequelize.query(`SET ROLE ${role}`);

    const model = req.url.split('/db/models/')[1].split('?')[0];
    if (!models[model])
      return res.status(404).json({ error: 'model not found' });
    const o = parseURL(req.url);
    const data = await models[model].update(req.body, o);
    console.log(req.body, o);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    //await sequelize.close();
  }
});

app.delete('/db/models/(*)', global.auth, async (req, res) => {
  if (!req.user.roles) req.user.roles = [];
  const role = req.user.roles[0];
  if (!role) role = process.env.DEFAULT_ROLE;

  /** connexion à Sequelize */
  const sequelize = new Sequelize(`${process.env.DB_URI}`, {
    logging: false,
    dialectOptions: {},
  });
  const initModels = require('../../db/models/init-models');
  const models = initModels(sequelize);
  try {
    // Définir le rôle pour cette connexion
    await sequelize.query(`SET request.email TO '${req.user.email}'`);
    await sequelize.query(`SET request.department TO '${req.user.department}'`);
    await sequelize.query(
      `SET request.username TO '${req.user.preferred_username}'`
    );
    await sequelize.query(`SET request.name TO '${req.user.name}'`);
    await sequelize.query(`SET request.uuid TO '${req.user.id}'`);
    await sequelize.query(`SET request.role TO '${req.user.role}'`);

    await sequelize.query(`SET ROLE ${role}`);

    const model = req.url.split('/db/models/')[1].split('?')[0];
    if (!sys.models[model])
      return res.status(404).json({ error: 'model not found' });
    const o = parseURL(req.url);
    const data = await models[model].destroy(o);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    //await sequelize.close();
  }
});
