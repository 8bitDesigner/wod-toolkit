const path = require('path')
const Command = require('../../lib/command.js')
const { Gauge } = require('./model.js')
const { keyFor } = require('../../lib/redis.js')
const key = msg => keyFor(msg, 'gauges')
const last = array => array[array.length - 1]

module.exports = class GaugeCommand extends Command {
  name = 'gauge'
  description = 'Track progress with a gauge'

  reactions = {
    '⬆️': this.handleReactionUp,
    '⬇️': this.handleReactionDown,
    '❌': this.handleReactionRemove,
  }

  constructor (router) {
    super(router)
    this.mountSubcommandsFrom(path.join(__dirname, 'subcommands'))
    this.usage = Object.values(this.subcommands).map(cmd => `  \`${cmd.usage}\``).join('\n')
  }

  handle (input, msg) {
    const knownCommands = Object.keys(this.subcommands)
    const words = input.split(' ')

    if (input === '') {
      this.subcommands.list.handle(input, msg)

    } else if (input === 'help') {
      msg.reply(this.helpToEmbed())

    // Leading command name
    } else if (knownCommands.includes(words[0])) {
      const command = words.shift()
      this.subcommands[command].handle(words.join(' '), msg)

    // Trailing command name
    } else if (knownCommands.includes(words[words.length - 1])) {
      const command = words.pop()
      this.subcommands[command].handle(words.join(' '), msg)

    // [gauge name] [command] [count] format
    } else if (
      knownCommands.includes(words[words.length - 2]) &&
      !isNaN(parseInt(words[words.length - 1]))
    ) {
      const command = words.splice(words.length - 2)
      this.subcommands[command].handle(words.join(' '), msg)

    } else {
      msg.reply(this.errorToEmbed(new Error(`I don't know how to "${input}"`)))
    }
  }

  decorate (message) {
    const emoji = Object.keys(this.reactions)
    return Promise.all(emoji.map(thing => message.react(thing)))
  }

  handleReaction (reaction, user) {
    const emoji = reaction.emoji.name
    const handler = this.reactions[emoji]
    const embed = reaction.message.embeds[0]
    const channel = reaction.message.channel

    // Bounce if we have no handler or our embed is untitled
    if (typeof handler !== 'function' || !embed.title) { return }

    Gauge.find(key(reaction.message), embed.title).then(gauge => {
      if (!gauge) { return }

      return handler.call(this, reaction, user, gauge).then(result => {
        if (result instanceof Gauge) {
          return channel.send(result.toEmbed()).then(reply => this.decorate(reply))
        } else {
          return channel.send(result)
        }
      })
    })
    .catch(err => channel.send(this.errorToEmbed(err)))
  }

  handleReactionUp (reaction, user, gauge) {
    return gauge.add(1)
  }

  handleReactionDown (reaction, user, gauge) {
    return gauge.remove(1)
  }

  handleReactionRemove (reaction, user, gauge) {
    return gauge.delete().then(() => `<@${user.id}>, Deleted "${gauge.name}"`)
  }
}
