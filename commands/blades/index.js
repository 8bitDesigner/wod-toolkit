const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { inputParser } = require('./input-parser.js')
const descriptions = require('./descriptions.json')
const { rollWithContext } = require('./roller.js')
const { red, blue, orange, green } = require('../../lib/colors.js')

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
  failure: red,
  success: blue,
  partial: orange,
  critical: green
}

const toEmoji = num => emoji[num]

module.exports = class BladesCommand extends Command {
  name = 'blades'
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

    try {
      parsedInput = inputParser(input)
      result = rollWithContext(parsedInput.count)
      message.reply(this.resultToEmbed(result, parsedInput, message))
      this.playRollSound(message)
      if (result.type === 'critical') {
        setTimeout(() => this.router.route(message, 'play yay quietly'), 400)
      }
    } catch (e) {
      return message.reply(this.errorToEmbed(e))
    }
  }

  resultToEmbed (result, parsedInput, message) {
    const reply = new MessageEmbed()

    reply.setTitle(`@${message.author.username} - ${initialCap(result.type)}`)
    reply.setColor(colors[result.type])
    reply.setDescription(result.rolls.map(toEmoji).join(' '))

    if (parsedInput.type) {
      reply.setFooter(descriptions[parsedInput.type][result.type])
    }

    return reply
  }

  playRollSound (message) {
    this.router.route(message, 'play roll quietly')
  }
}
