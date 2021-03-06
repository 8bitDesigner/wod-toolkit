const Command = require('../../lib/command.js')
const { Gauge } = require('./model.js')
const { MessageEmbed } = require('discord.js')
const { keyFor } = require('../../lib/redis.js')
const key = msg => keyFor(msg, 'gauges')
const last = array => array[array.length - 1]
const { blue, red } = require('../../lib/colors.js')

module.exports = class GaugeCommand extends Command {
  name = 'Gauge'
  description = 'Track progress with a gauge'
  usage = `
Usage:
  \`!gauge new [name] [number of segments]\` creates a new gague and post it in the current channel
  \`!gauge [name]\` show a given gauge
  \`!gauge [name] show\` show a given gauge
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
    help: this.handleHelp,
    list: this.handleAll,
    show: this.handleShow,
    delete: this.handleDelete,
    tick: this.handleTick,
    untick: this.handleUntick,
    set: this.handleUpdate,
    add: this.handleAdd,
    use: this.handleRemove
  }

  reactions = {
    '⬆️': this.handleTick,
    '⬇️': this.handleUntick,
    '❌': this.removeOnReaction,
  }

  parseInput (input) {
    const words = input.split(' ')
    let command = 'show'
    let name = words.join(' ')
    let segmentCount = null

    // Does our words array start with 'new'
    if (words[0] === 'new') {
      command = words.shift()
      segmentCount = words.pop()
      name = words.join(' ')
    // Does our words array end with a number?
    } else if (!isNaN(parseInt(words[words.length - 1], 10))) {
      segmentCount = parseInt(words.pop(), 10)
      command = words.pop()
      name = words.join(' ')
    // Is the last word in the list a command name?
    } else if (Object.keys(this.commands).includes(last(words))) {
      command = words.pop()
      segmentCount = null
      name = words.join(' ')
    // Handle the weird cases
    } else if (words.join(' ').trim().length === 0) {
      command = 'list'
      name = null
    }

    return {command, name, segmentCount}
  }

  handle (input, msg) {
    const { command, name, segmentCount } = this.parseInput(input)
    const handler = this.commands[command || 'list']

    if (handler) {
      handler.call(this, name, segmentCount, msg).then(response => {
        if (!Array.isArray(response)) {
          response = [response]
        }

        response.forEach(obj => {
          if (obj instanceof Gauge) {
            return msg.reply(this.gaugeToEmbed(obj)).then(reply => this.decorate(reply))
          } else {
            return msg.reply(obj)
          }
        })
      }).catch(err => {
        msg.reply(this.errorToEmbed(err))
      })
    } else {
      msg.reply(this.errorToEmbed(new Error(`I don't know how to ${command}`)))
    }
  }

  handleReaction (reaction, user) {
    const emoji = reaction.emoji.name
    const handler = this.reactions[emoji]
    const embed = reaction.message.embeds[0]

    if (typeof handler === 'function' && embed.title) {
      Gauge.find(key(reaction.message), embed.title)
        .then(gauge => handler(reaction, user, gauge))
    }
  }

  decorate (message) {
    const emoji = Object.keys(this.reactions)
    return Promise.all(emoji.map(thing => message.react(thing)))
  }

  handleHelp () {
    return Promise.resolve(this.helpToEmbed())
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

  handleShow (name, segmentCount, msg) {
    return Gauge.find(key(msg), name).then(gauge => {
      if (!gauge) {
        throw new Error(`Couldn't find a gauge with the name \`${name}\``)
      } else {
        return gauge
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
      return Promise.reject(new Error(`You\'re missing either a name or new value.\n${usage}`))
    } else {
      return Gauge.find(key(msg), name).then(gauge => {
        return gauge.setCompleted(segmentCount).save()
      })
    }
  }

  handleDelete (name, segmentCount, msg) {
    if (!name) {
      return Promise.reject(new Error('Missing the name of the gauge you want to delete'))
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
      return Promise.reject(new Error(`Missing the name of the gauge you want to create\n${usage}`))
    } else if (isNaN(segmentCount)) {
      return Promise.reject(new Error(`Missing the number of segments the gauge should have\n${usage}`))
    } else {
      return Gauge.create(key(msg), name, segmentCount)
    }
  }

  removeOnReaction (reaction, user, gauge) {
    gauge.delete().then(() => {
      reaction.message.channel.send(`<@${user.id}>, Deleted "${gauge.name}"`)
    }).catch(err => {
      reaction.message.channel.send(this.errorToEmbed(err))
    })
  }

  gaugeToEmbed (gauge) {
    const reply = new MessageEmbed()
    reply.setTitle(gauge.name)
    reply.setColor(blue)
    reply.setDescription(gauge.toString())
    reply.setFooter(`${gauge.attributes.completed} out of ${gauge.attributes.segments}`)

    return reply
  }
}
