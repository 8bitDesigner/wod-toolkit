const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { InputParser } = require('./input-parser.js')
const { DiceRoller } = require('./roller.js')

const emoji = [
  '',
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
  ':seven:',
  ':eight:',
  ':nine:',
  ':keycap_ten:'
]

const colors = {
  Failure: '#dc3545',
  Success: '#007bff',
  Botch: '#fd7e14'
}

const toEmoji = num => emoji[num]

module.exports = class RollCommand extends Command {
  name = 'Roll'
  description = 'Rolls a number of d10s, rerolling any 10s'
  usage = `
Usage:
  \`!roll 5\` roll 5 d10, 8s and above are successes
  \`!roll 5++\` roll 5 d10 with two enhancment bonuses
  \`!roll 5+-\` roll 5 d10 with one bonus enhancment and one negative enhancement
  \`!roll 5 7\` roll 5 d10, 7s and above are successes
`

  handle (input, message) {
    let parsedInput, result, description
    const reply = new MessageEmbed()

    if (input.trim() === '') { return message.reply(this.usage) }

    try {
      parsedInput = InputParser.parse(input)
      result = DiceRoller.roll(parsedInput)
    } catch (e) {
      return message.reply(e.message)
    }

    reply.setTitle(`@${message.author.username} - ${result.type()}`)
    reply.setColor(colors[result.type()])
    reply.setDescription(result.rolls.map(arr => arr.map(toEmoji).join(' ')).join(' + '))
    reply.setFooter(result.toString())

    message.reply(reply)

    this.handleMomentum(result, message)

    this.playRollSound(message)
    setTimeout(() => this.playResultSound(result, message), 400)
  }

  handleMomentum (result, message) {
    if (result.type() === 'Failure') {
      this.router.find('momentum').handle('add 1', message)
    } else if (result.type() === 'Botch') {
      this.router.find('momentum').handle('add 3', message)
    }
  }

  playRollSound (message) {
    this.router.find('play').handle('roll', message)
  }

  playResultSound (result, message) {
    if (result.total() > 3) {
      this.router.find('play').handle('yay', message)
    } else if (result.type() === 'Botch') {
      this.router.find('play').handle('fart', message)
    }
  }
}
