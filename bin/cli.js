const prog = require('caporal');
prog
  .version(require('../package.json').version)
  .description('A simple program that says "biiiip"')
  // first command
  .command('api')
  .help('my help for the order command')
  .argument('<path>', 'Path to the api')
  .action(function (args, options) {
    console.log(args, options);
  })
  // second command
  .command('cancel')
  .help('my help for the cancel command') // here our custom help for the `cancel` command
  .action(function (args, options) {})
  .command('api', 'Our deploy command')
  .command('deploy2', 'Our deploy command')
  .action(function (args, options, logger) {
    console.log(args, options);
  });

prog.parse(process.argv);
