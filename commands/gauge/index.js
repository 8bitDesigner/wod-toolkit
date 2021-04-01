const path = require('path')
const { Gauge, GaugeNotFoundError } = require('./model.js')
const Command = require('../../lib/command.js')
const Decorator = require('./decorator.js')

module.exports = class GaugeCommand extends Command {
  name = 'gauge'
  description = 'Track progress with a gauge'

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

  handleReaction (reaction, user) {
    const emoji = reaction.emoji.name
    const embed = reaction.message.embeds[0]
    const channel = reaction.message.channel
    const decorator = new Decorator()

    // Bounce if our embed is untitled or the decorator can't handle this emoji
    if (!embed.title && !decorator.canHandle(emoji)) { return }

    Gauge.find(Gauge.keyFor(reaction.message), embed.title).then(gauge => {
      return decorator.handle(emoji, gauge, user).then(result => {
        if (result instanceof Gauge) {
          return channel.send(result.toEmbed()).then(reply => decorator.decorate(reply))
        } else {
          return channel.send(result)
        }
      })
    })
    .catch(err => {
      // Only surface errors if we can find the bloody Gauge
      if (!(err instanceof GaugeNotFoundError)) {
        channel.send(this.errorToEmbed(err))
      }
    })
  }
}
