const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { InputParser } = require('./input-parser.js')
const { DiceRoller } = require('./roller.js')
const { red, blue, orange } = require('../../lib/colors.js')

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
  Failure: red,
  Success: blue,
  Botch: orange
}

const toEmoji = num => emoji[num]

module.exports = class RollCommand extends Command {
  name = 'Path'
  description = 'Rolls a number of d10s, rerolling any 10s following Storypath rules'
  usage = `
Usage:
  \`!path 5\` roll 5 d10, 8s and above are successes
  \`!path 5++\` roll 5 d10 with two enhancment bonuses
  \`!path 5+-\` roll 5 d10 with one bonus enhancment and one negative enhancement
  \`!path 5 7\` roll 5 d10, 7s and above are successes
`

  handle (input, message) {
    let parsedInput, result, description

    if (input.trim() === '' || input.trim() === 'help') {
      return message.reply(this.helpToEmbed())
    }

    try {
      parsedInput = InputParser.parse(input)
      result = DiceRoller.roll(parsedInput)
      message.reply(this.resultToEmbed(result, message))

      this.handleMomentum(result, message)
      this.playRollSound(message)
      setTimeout(() => this.playResultSound(result, message), 400)
    } catch (err) {
      return message.reply(this.errorToEmbed(err))
    }
  }

  resultToEmbed (result, message) {
    const reply = new MessageEmbed()

    reply.setTitle(`@${message.author.username} - ${result.type()}`)
    reply.setColor(colors[result.type()])
    reply.setDescription(result.rolls.map(arr => arr.map(toEmoji).join(' ')).join(' + '))
    reply.setFooter(result.toString())

    return reply
  }

  handleMomentum (result, message) {
    if (result.type() === 'Failure') {
      this.router.route(message, 'gauge Momentum add 1')
    } else if (result.type() === 'Botch') {
      this.router.route(message, 'gauge Momentum add 3')
    }
  }

  playRollSound (message) {
    this.router.route(message, 'play roll')
  }

  playResultSound (result, message) {
    if (result.total() > 3) {
      this.router.route(message, 'play yay')
    } else if (result.type() === 'Botch') {
      this.router.route(message, 'play fart')
    }
  }
}
