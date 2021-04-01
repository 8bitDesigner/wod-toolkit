const { Gauge } = require('../model.js')
const GaugeSubcommand = require('../gauge-subcommand.js')

module.exports = class DeleteGaugeCommand extends GaugeSubcommand {
  name = 'delete'
  description = 'delete a given gauge'
  usage = `${this.router.prefix}${this.path} [name]`

  handle (name, msg) {
    const key = Gauge.keyFor(msg)

    if (!name) {
      msg.reply(this.errorToEmbed(new Error('Missing the name of the gauge you want to delete')))
    } else {
      return Gauge.find(key, name)
        .then(gauge => gauge.delete())
        .then(gauge => msg.reply(`Deleted "${name}"`))
        .catch(err => msg.reply(this.errorToEmbed(err)))
    }
  }
}
