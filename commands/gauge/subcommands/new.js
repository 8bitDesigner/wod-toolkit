const { Gauge } = require('../model.js')
const GaugeSubcommand = require('../gauge-subcommand.js')

module.exports = class NewGaugeCommand extends GaugeSubcommand {
  name = 'new'
  description = 'create a new gague and post it in the current channel'
  usage = `${this.router.prefix}${this.path} [name] [number of segments]`

  parseInput (input) {
    const words = input.split(' ')
    let name, segmentCount

    segmentCount = parseInt(words.pop(), 10)
    name = words.join(' ')

    if (!name) {
      throw new Error(`Missing the name of the gauge you want to create\n${this.usage}`)
    } else if (isNaN(segmentCount)) {
      throw new Error(`Missing the number of segments the gauge should have\n${this.usage}`)
    } else {
      return {name, segmentCount}
    }
  }

  handle (input, msg) {
    try {
      const {name, segmentCount} = this.parseInput(input)
      const key = Gauge.keyFor(msg)

      Gauge.create(key, name, segmentCount).then(obj => {
        msg.reply(obj.toEmbed()).then(reply => this.decorate(reply))
      })
    } catch (err) {
      msg.reply(this.errorToEmbed(err))
    }
  }
}
