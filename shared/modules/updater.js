const { Client } = require('pg');
const { exec } = require('child_process');

if (!process.env.DB_URI) return false;

const connectionString = process.env.DB_URI;

const client = new Client({
  connectionString: connectionString,
});

async function listenForSchemaChanges() {
  await client.connect();
  client.query('LISTEN ddl_changes');
  client.on('notification', (msg) => {
    logger.info('** CHANGE DETECTED **');
    console.log(msg.payload);
    exec('npm run db:model', (error, stdout, stderr) => {
      if (error) {
        logger.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.info(`stderr: ${stderr}`);
        return;
      }
      logger.info(`stdout: ${stdout}`);
    });
  });
}

listenForSchemaChanges();
