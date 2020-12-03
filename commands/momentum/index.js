const { MessageEmbed } = require('discord.js')
const MomentumValue = require('./momentum-value.js')
const Command = require('../../lib/command.js')

const key = msg => [msg.guild.id, msg.guild.systemChannelID, 'momentum'].join(':')

module.exports = class MomentumCommand extends Command {
  name = 'Momentum'
  description = 'Tracks the party\'s momentum across sessions'
  usage = `
Usage:
  \`!momentum\` show current momentum
  \`!momentum add 1\` add 1 to the current set
  \`!momentum use 2\` remove 2 from the current momentum
  \`!momentum set 1\` replace the current momentum with 1
  \`!momentum reset\` reset momentum to 0
`

  handle (input, msg) {
    const [command, value] = input.split(' ')
    const int = parseInt(value)

    MomentumValue.find(key(msg))
    .then(value => {
      switch (command) {
        case 'set':
          return value.set(int)
        case 'add':
          return value.add(int)
        case 'use':
        case 'remove':
          return value.use(int)
        case 'reset':
          return value.reset()
        default:
          return value
      }
    })
    .then(result => msg.reply(this.reply(result)))
    .catch(err => msg.reply(this.errorReply(err)))
  }

  reply (value) {
    const reply = new MessageEmbed()
    reply.setTitle('Momentum')
    reply.setColor('#007bff')
    reply.setDescription(value.toString())
    reply.setFooter(`${value.current} out of ${value.max}`)

    return reply
  }

  errorReply (error) {
    const reply = new MessageEmbed()
    reply.setTitle('Momentum')
    reply.setColor('#dc3545')
    reply.setDescription(error.message)
    console.log(error)

    return reply
  }
}
