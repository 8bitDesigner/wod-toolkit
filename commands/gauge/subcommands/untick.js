const { Gauge } = require('../model.js')
const GaugeSubcommand = require('../gauge-subcommand.js')

module.exports = class UntickGaugeCommand extends GaugeSubcommand {
  name = 'untick'
  description = 'decrease a gauge by one'
  usage = `${this.router.prefix}${this.path} [name]`

  handle (name, msg) {
    const key = Gauge.keyFor(msg)

    if (!name) {
      msg.reply(this.errorToEmbed(new Error('Missing the name of the gauge you want to decrement')))
    } else {
      return Gauge.find(key, name)
        .then(gauge => gauge.remove(1))
        .then(gauge => msg.reply(gauge.toEmbed()))
        .then(reply => this.decorate(reply))
        .catch(err => msg.reply(this.errorToEmbed(err)))
    }
  }
}
