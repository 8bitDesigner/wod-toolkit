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

module.exports.name = 'Roll'
module.exports.description = 'Rolls a number of d10s, rerolling any 10s'
module.exports.usage = `
Usage:
  \`!roll 5\` roll 5 d10, 8s and above are successes
  \`!roll 5++\` roll 5 d10 with two enhancment bonuses
  \`!roll 5+-\` roll 5 d10 with one bonus enhancment and one negative enhancement
  \`!roll 5 7\` roll 5 d10, 7s and above are successes
`

module.exports.handle = function (input, msg) {
  let parsedInput, rollResult, description
  const reply = new MessageEmbed()

  if (input.trim() === '') { return msg.reply(module.exports.usage) }

  try {
    parsedInput = InputParser.parse(input)
    result = DiceRoller.roll(parsedInput)
  } catch (e) {
    return msg.reply(e.message)
  }

  reply.setTitle(`@${msg.author.username} - ${result.type()}`)
  reply.setColor(colors[result.type()])
  reply.setDescription(result.rolls.map(arr => arr.map(toEmoji).join(' ')).join(' + '))
  reply.setFooter(result.toString())

  msg.reply(reply)
}
