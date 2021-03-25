const { Gauge } = require('../model.js')
const Command = require('../../../lib/command.js')

module.exports = class AddGaugeCommand extends Command {
  name = 'add'
  description = 'adds [value] to a gauge'
  usage = `${this.router.prefix}${this.path} [name] [value]`

  parseInput (input) {
    const words = input.split(' ')
    const value = parseInt(words.pop(), 10)
    const name = words.join(' ')

    if (!name || isNaN(value)) {
      throw new Error(`You\'re missing either a name or new value.\n${this.usage}`)
    } else {
      return {name, value}
    }
  }

  handle (input, msg) {
    try {
      const {name, value} = this.parseInput(input)
      const key = Gauge.keyFor(msg)

      return Gauge.find(key, name)
        .then(gauge => gauge.add(value))
        .then(gauge => msg.reply(gauge.toEmbed()))
        .catch(err => msg.reply(this.errorToEmbed(err)))
    } catch (err) {
      msg.reply(this.errorToEmbed(err))
    }
  }
}
