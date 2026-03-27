const chalk = require('./dareal-chalk/index.js');

console.log("If everything worked, you should see styled console text matching Chalk outputs:\n");

console.log(chalk.blue('Hello') + ' World' + chalk.red('!'));
console.log(chalk.blue.bgRed.bold('Chainable API: Hello world!'));
console.log(chalk.blue('Multiple:', 'World!', 'Foo', 'bar', 'biz', 'baz'));
console.log(chalk.red('Nesting styles!', chalk.underline.bgBlue('inner nested section') + '!'));
console.log(chalk.green(
  'I am a green line ' +
  chalk.blue.underline.bold('with a blue substring') +
  ' that becomes green again!'
));
console.log(`
Template Literals
CPU: ${chalk.red('90%')}
RAM: ${chalk.green('40%')}
DISK: ${chalk.yellow('70%')}
`);

console.log('\n--- Property Validations ---');
console.log('Includes bold modifier:', chalk.modifierNames.includes('bold'));
console.log('Includes pink background:', chalk.backgroundColorNames.includes('pink'));
console.log('Current terminal level:', chalk.level);
