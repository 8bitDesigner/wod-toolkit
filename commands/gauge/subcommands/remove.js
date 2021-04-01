const { Gauge } = require('../model.js')
const GaugeSubcommand = require('../gauge-subcommand.js')

module.exports = class RemoveGaugeCommand extends GaugeSubcommand {
  name = 'remove'
  description = 'removes [value] from a gauge'
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
        .then(gauge => gauge.remove(value))
        .then(gauge => msg.reply(gauge.toEmbed()))
        .then(reply => this.decorate(reply))
        .catch(err => msg.reply(this.errorToEmbed(err)))
    } catch (err) {
      msg.reply(this.errorToEmbed(err))
    }
  }
}

