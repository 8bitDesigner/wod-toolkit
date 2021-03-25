const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { red, blue, orange, green } = require('../../lib/colors.js')
const roll = require('../../lib/roll.js')

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
  partial: orange,
  success: blue,
}

const toEmoji = num => emoji[num]

module.exports = class ApocCommand extends Command {
  name = 'apoc'
  description = 'Rolls a number of d6s using Apocalypse World parsing rules'
  usage = `
Usage:
  \`!apoc\` Roll two dice
  \`!apoc 2\` Roll two dice, and add 2 to the result
  \`!apoc +2\` Roll two dice, and add 2 to the result
  \`!apoc -1\` Roll two dice, and subtract 1 from the result
  \`!apoc help\` Show this message
`

  handle (input, message) {
    let modifier, result

    try {
      modifier = this.modifier(input)
      result = roll(2)
      message.reply(this.resultToEmbed(result, modifier, message))
      this.playRollSound(message)
    } catch (error) {
      message.reply(this.errorToEmbed(error))
    }
  }

  modifier (input) {
    const matches = input.match(/(?<modifier>[+-])?(?<dice>\d+)/)
    let modifier, sign

    if (matches === null) {
      return 0
    } else if (matches?.groups?.dice) {
      modifier = parseInt(matches.groups.dice, 10)
      sign = matches?.groups?.modifier

      return sign === '-' ? modifier * -1 : modifier 
    }
  }

  resultType (result, modifier) {
    const value = result.reduce((a, b) => a + b) + modifier
    const type = value > 9
      ? 'success'
      : value > 6
      ? 'partial'
      : 'failure'

    return type
  }

  resultToEmbed (result, modifier, message) {
    const reply = new MessageEmbed()
    const type = this.resultType(result, modifier)
    const description = result.map(toEmoji).join(' ')

    const sign = modifier && modifier > 0
      ? '+'
      : '-'

    reply.setTitle(`@${message.author.username} - ${initialCap(type)}`)
    reply.setColor(colors[type])

    if (modifier) {
      reply.setDescription(`${description} ${sign} ${emoji[Math.abs(modifier)]}`)
    } else {
      reply.setDescription(description)
    }

    return reply
  }

  playRollSound (message) {
    this.router.route(message, 'play roll quietly')
  }
}
