module.exports = (config) => {
  return JSON.parse(require('fs').readFileSync(config.source, 'utf-8'));
};
