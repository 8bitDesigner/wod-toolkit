const { Gauge } = require('../model.js')
const GaugeSubcommand = require('../gauge-subcommand.js')

module.exports = class ListGaugeCommand extends GaugeSubcommand {
  name = 'list'
  description = 'list out all gauges in the channel'
  usage = `${this.router.prefix}${this.path}`

  handle (input, msg) {
    const key = Gauge.keyFor(msg)

    return Gauge.all(key).then(gauges => {
      if (gauges.length === 0) {
        msg.reply('There are no gauges defined in this channel')
      } else {
        gauges.forEach(gauge => {
          msg.reply(gauge.toEmbed()).then(reply => this.decorate(reply))
        })
      }
    })
  }
}
