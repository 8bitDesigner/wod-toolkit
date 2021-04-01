const Decorator = require('./decorator.js')
const Command = require('../../lib/command.js')

module.exports = class GaugeSubcommand extends Command {
  decorate (message) {
    const instance = new Decorator()
    return instance.decorate(message)
  }
}
