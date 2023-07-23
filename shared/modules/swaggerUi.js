if (!global.app) return;
/** API Docs */
const swaggerUi = require('swagger-ui-express');

app.use('/api-docs', swaggerUi.serve, function (req, res, next) {
  var Url = req.protocol + '://' + req.get('host');
  var options = {
    swaggerOptions: {
      url: `${Url}/api.json`,
    },
  };
  swaggerUi.setup(null, options)(req, res, next);
});

app.get('/api.json', function (req, res) {
  const currentScheme = req.headers['x-forwarded-proto'] || req.protocol;
  const allowedTypes = [
    'array',
    'boolean',
    'integer',
    'number',
    'object',
    'string',
  ];
  let swagger = {
    swagger: '2.0',
    info: {
      version: sys.package.version,
      title: sys.package.name,
      description: sys.package.description,
    },
    host: req.get('host'),
    machinasapiensPath: '/api',
    schemes: [currentScheme],
    consumes: ['application/json'],
    produces: ['application/json'],
    paths: {},
    tags: [
      {
        name: 'API',
        description: 'API project',
      },
    ],
    components: {
      securitySchemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://example.com/oauth/authorize',
              tokenUrl: 'https://example.com/oauth/token',
              scopes: {
                read: 'Grants read access',
                write: 'Grants write access',
                admin: 'Grants access to admin operations',
              },
            },
          },
        },
      },
    },
    parameters: {
      preferParams: {
        name: 'Prefer',
        description: 'Preference',
        required: false,
        in: 'header',
        type: 'string',
        enum: ['params=single-object'],
      },
      preferReturn: {
        name: 'Prefer',
        description: 'Preference',
        required: false,
        in: 'header',
        type: 'string',
        enum: ['return=representation', 'return=minimal', 'return=none'],
      },
      preferCount: {
        name: 'Prefer',
        description: 'Preference',
        required: false,
        in: 'header',
        type: 'string',
        enum: ['count=none'],
      },
      select: {
        name: 'select',
        description: 'Filtering Columns',
        required: false,
        in: 'query',
        type: 'string',
      },
      on_conflict: {
        name: 'on_conflict',
        description: 'On Conflict',
        required: false,
        in: 'query',
        type: 'string',
      },
      order: {
        name: 'order',
        description: 'Ordering',
        required: false,
        in: 'query',
        type: 'string',
      },
      range: {
        name: 'Range',
        description: 'Limiting and Pagination',
        required: false,
        in: 'header',
        type: 'string',
      },
      rangeUnit: {
        name: 'Range-Unit',
        description: 'Limiting and Pagination',
        required: false,
        default: 'items',
        in: 'header',
        type: 'string',
      },
      offset: {
        name: 'offset',
        description: 'Limiting and Pagination',
        required: false,
        in: 'query',
        type: 'string',
      },
      limit: {
        name: 'limit',
        description: 'Limiting and Pagination',
        required: false,
        in: 'query',
        type: 'string',
      },
      'body.todos': {
        name: 'todos',
        description: 'todos',
        required: false,
        schema: {
          $ref: '#/definitions/todos',
        },
        in: 'body',
      },
      'rowFilter.todos.id': {
        name: 'id',
        required: false,
        format: 'bigint',
        in: 'query',
        type: 'string',
      },
      'rowFilter.todos.user_id': {
        name: 'user_id',
        required: false,
        format: 'uuid',
        in: 'query',
        type: 'string',
      },
      'rowFilter.todos.task': {
        name: 'task',
        required: false,
        format: 'text',
        in: 'query',
        type: 'string',
      },
      'rowFilter.todos.is_complete': {
        name: 'is_complete',
        required: false,
        format: 'boolean',
        in: 'query',
        type: 'string',
      },
      'rowFilter.todos.inserted_at': {
        name: 'inserted_at',
        required: false,
        format: 'timestamp with time zone',
        in: 'query',
        type: 'string',
      },
    },
    definitions: {},
  };
  for (var i = 0; i < sys.api_models.tags.length; i++) {
    const name = sys.api_models.tags[i].name;
    swagger.definitions[name] = {
      required: [],
      properties: {},
    };
    for (let el in sys.models[name]) {
      for (let i in sys.models[name].rawAttributes) {
        const item = sys.models[name].rawAttributes[i];
        const Type = item.type.toString();
        //console.log(item);
        let _type = '';
        let format = '';
        if (Type == 'UUID') {
          format = 'uuid';
          _type = 'string';
        }
        if (Type.indexOf('VARCHAR') > -1) {
          _type = 'string';
          format = 'string';
        }
        if (Type == 'TIMESTAMP WITH TIME ZONE') {
          format = 'timestamptz';
          _type = 'string';
        }
        if (Type == 'TEXT') {
          format = 'text';
          _type = 'string';
        }
        if (Type == 'TIMESTAMP') {
          format = 'timestamp';
          _type = 'string';
        }
        if (Type == 'INTEGER') {
          _type = 'integer';
          format = 'int';
        }
        if (Type == 'JSONB') {
          _type = 'object';
          format = 'object';
        }
        if (_type == '') {
          _type = 'string';
          format = Type;
        }
        console.log('-->', item.defaultValue);
        swagger.definitions[name].properties[item.field] = {
          type: _type,
          format: format,
          description: item.comment,
        };
        if (item.allowNull === false) {
          if (swagger.definitions[name].required.indexOf(item.field) == -1)
            swagger.definitions[name].required.push(item.field);
        }
      }
    }

    swagger.tags.push({
      name: 'model: ' + name,
      description: sys.api_models.tags[i].description,
    });
    swagger.paths['/db/models/' + name] = {
      get: {
        tags: ['model: ' + name],
        security: [{ OAuth2: [] }],
        parameters: [
          {
            $ref: '#/parameters/select',
          },
          {
            $ref: '#/parameters/order',
          },
          {
            $ref: '#/parameters/range',
          },
          {
            $ref: '#/parameters/rangeUnit',
          },
          {
            $ref: '#/parameters/offset',
          },
          {
            $ref: '#/parameters/limit',
          },
          {
            $ref: '#/parameters/preferCount',
          },
        ],
        //summary: 'return data about ' + sys.api_models.tags[i].name,
        //description: 'no description',
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['model: ' + sys.api_models.tags[i].name],
        security: [{ OAuth2: [] }],
        //summary: 'no summary - please provide one',
        //description: 'no description',
        responses: { 200: { description: 'OK' } },
      },
      put: {
        tags: ['model: ' + sys.api_models.tags[i].name],
        security: [{ OAuth2: [] }],
        //summary: 'no summary - please provide one',
        //description: 'no description',
        responses: { 200: { description: 'OK' } },
      },
      patch: {
        tags: ['model: ' + sys.api_models.tags[i].name],
        security: [{ OAuth2: [] }],
        //summary: 'no summary - please provide one',
        //description: 'no description',
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['model: ' + sys.api_models.tags[i].name],
        security: [{ OAuth2: [] }],
        //summary: 'no summary - please provide one',
        //description: 'no description',
        responses: { 200: { description: 'OK' } },
      },
    };
  }

  for (var el in sys.api) {
    swagger.paths[el] = {};
    for (var method in sys.api[el]) {
      swagger.paths[el][method] = sys.api[el][method];
    }
  }
  res.json(swagger);
});
