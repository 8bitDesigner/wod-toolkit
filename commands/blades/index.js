const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { inputParser } = require('./input-parser.js')
const descriptions = require('./descriptions.json')
const { rollWithContext } = require('./roller.js')
const initialCap = word => word[0].toUpperCase() + word.substring(1, word.length)

const emoji = [
  '',
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:'
]

const colors = {
  failure: '#dc3545',
  success: '#007bff',
  partial: '#fd7e14',
  critical: '#7289da'
}

const toEmoji = num => emoji[num]

module.exports = class RollCommand extends Command {
  name = 'Blades'
  description = 'Rolls a number of d6s using Blades in the Darks parsing rules'
  usage = `
Usage:
  \`!blades risky 2\` Roll two dice with a risky posture
  \`!blades fortune 1\` Roll a fortune die
  \`!blades 0\` Roll two dice and take the lower value
  \`!blades 1 \` Roll a single die
`

  handle (input, message) {
    let parsedInput, result, description
    const reply = new MessageEmbed()

    if (input.trim() === '') { return message.reply(this.usage) }

    try {
      parsedInput = inputParser(input)
      result = rollWithContext(parsedInput.count)
    } catch (e) {
      return message.reply(e.message)
    }

    reply.setTitle(`@${message.author.username} - ${initialCap(result.type)}`)
    reply.setColor(colors[result.type])
    reply.setDescription(result.rolls.map(toEmoji).join(' '))

    if (parsedInput.type) {
      reply.setFooter(descriptions[parsedInput.type][result.type])
    }

    message.reply(reply)
    this.playRollSound(message)
  }

  playRollSound (message) {
    this.router.find('play').handle('roll', message)
  }
}
