const Command = require('../../lib/command.js')
const { Gauge } = require('./model.js')
const { MessageEmbed } = require('discord.js')
const key = msg => [msg.guild.id, msg.guild.systemChannelID, 'gauges'].join(':')

module.exports = class GaugeCommand extends Command {
  name = 'Gauge'
  description = 'Track progress with a gauge'
  usage = `
Usage:
  \`!gauge new [name] [number of segments]\` creates a new gague and post it in the current channel
  \`!gauge [name] set [completed segments]\` changes the filled in segments on the gauge
  \`!gauge [name] tick\` advance this gauge by one
  \`!gauge [name] untick\` decrease this gauge by one
  \`!gauge [name] add [count]\` adds \`count\` to gauge
  \`!gauge [name] use [count]\` decrease this gauge by \`count\`
  \`!gauge [name] delete\` will delete a gauge'
  \`!gauge\` and \`!gauge list\` list out all gauges in the channel
`

  commands = {
    new: this.handleCreate,
    list: this.handleAll,
    delete: this.handleDelete,
    tick: this.handleTick,
    untick: this.handleUntick,
    set: this.handleUpdate,
    add: this.handleAdd,
    use: this.handleRemove
  }

  handle (input, msg) {
    const words = input.split(' ')
    let command, name, segmentCount

    // does our words array start with 'new'
    if (words[0] === 'new') {
      console.log({words})
      command = words.shift()
      segmentCount = words.pop()
      name = words.join(' ')
    // does our words array end with a number?
    } else if (!isNaN(parseInt(words[words.length - 1], 10))) {
      segmentCount = parseInt(words.pop(), 10)
      command = words.pop()
      name = words.join(' ')
    } else {
      command = words.pop()
      name = words.join(' ')
    }

    const handler = this.commands[command || 'list']

    console.log({handler, command, name, segmentCount})

    if (handler) {
      handler.call(this, name, segmentCount, msg).then(response => {
        if (Array.isArray(response)) {
          response.forEach(obj => msg.reply(this.gaugeToEmbed(obj)))
        } else if (response instanceof Gauge) {
          msg.reply(this.gaugeToEmbed(response))
        } else {
          msg.reply(response)
        }
      }).catch(err => {
        msg.reply(err.message)
      })
    } else {
      msg.reply(`I don't know how to ${command}`)
    }
  }

  handleAll (name, segmentCount, msg) {
    return Gauge.all(key(msg)).then(gauges => {
      if (gauges.length === 0) {
        return 'There are no gauges defined in this channel'
      } else {
        return gauges
      }
    })
  }

  handleTick (name, segmentCount, msg) {
    return Gauge.find(key(msg), name).then(gauge => {
      return gauge.setCompleted(gauge.attributes.completed + 1).save()
    })
  }

  handleUntick (name, segmentCountsg, msg) {
    return Gauge.find(key(msg), name).then(gauge => {
      return gauge.setCompleted(gauge.attributes.completed - 1).save()
    })
  }

  handleAdd (name, segmentCount, msg) {
    return Gauge.find(key(msg), name).then(gauge => {
      return gauge.setCompleted(gauge.attributes.completed + segmentCount).save()
    })
  }

  handleRemove (name, segmentCount, msg) {
    return Gauge.find(key(msg), name).then(gauge => {
      return gauge.setCompleted(gauge.attributes.completed - segmentCount).save()
    })
  }

  handleUpdate (name, segmentCount, msg) {
    const usage = `**Usage**: \`${this.router.prefix}gauges set [name] [number of segments]\``
    segmentCount = parseInt(segmentCount, 10)

    if (!name || isNaN(segmentCount)) {
      return Promise.resolve(`You\'re missing either a name or new value.\n${usage}`)
    } else {
      return Gauge.find(key(msg), name).then(gauge => {
        return gauge.setCompleted(segmentCount).save()
      })
    }
  }

  handleDelete (name, segmentCount, msg) {
    if (!name) {
      return Promise.resolve('Missing the name of the gauge you want to delete')
    } else {
      return Gauge.find(key(msg), name)
        .then(gauge => gauge.delete())
        .then(gauge => `Deleted "${name}"`)
    }
  }

  handleCreate (name, segmentCount, msg) {
    const usage = `**Usage**: \`${this.router.prefix}gauges new [name] [number of segments]\``
    segmentCount = parseInt(segmentCount, 10)

    if (!name) {
      return Promise.resolve(`Missing the name of the gauge you want to create\n${usage}`)
    } else if (isNaN(segmentCount)) {
      return Promise.resolve(`Missing the number of segments the gauge should have\n${usage}`)
    } else {
      return Gauge.create(key(msg), name, segmentCount)
    }
  }

  gaugeToEmbed (gauge) {
    const reply = new MessageEmbed()
    reply.setTitle(gauge.name)
    reply.setColor('#007bff')
    reply.setDescription(gauge.toString())
    reply.setFooter(`${gauge.attributes.completed} out of ${gauge.attributes.segments}`)

    return reply
  }
}
