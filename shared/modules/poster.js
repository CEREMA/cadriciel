if (!global.app) return;
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
app.use(
  bodyParser.urlencoded({ limit: process.env.UPLOAD_MAX, extended: false })
);
app.use(bodyParser.json({ limit: process.env.UPLOAD_MAX }));
app.use(fileupload());
