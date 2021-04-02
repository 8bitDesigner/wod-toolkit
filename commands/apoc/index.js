const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { red, blue, orange, green } = require('../../lib/colors.js')
const { roll: rollEffect } = require('../../lib/sound.js')
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

  options = [
    {
      type: 4, // integer
      name: 'modifier',
      description: 'amount to add or subtract from the roll',
      required: false
    }
  ]

  main (modifier = 0) {
    if (Math.abs(modifier) > 6) {
      throw new Error(`You can't modify a roll by more than 6!`)
    } else {
      return this.resultToEmbed(roll(2), modifier)
    }
  }

  handle (input, message) {
    try {
      const embed = this.main(this.modifier(input))
      rollEffect.playTo(message.member).catch(() => {})
      return message.reply(embed)
    } catch (error) {
      return message.reply(this.errorToEmbed(error))
    }
  }

  handleSlash (request, response) {
    const modifier = request.data.modifier || 0

    try {
      const embed = this.main(modifier)
      rollEffect.playTo(request.member).catch(() => {})
      return response.addEmbed(embed).send()
    } catch (error) {
      return response.setContent(error.message).setEphemeral().send()
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

  resultToEmbed (result, modifier) {
    const reply = new MessageEmbed()
    const type = this.resultType(result, modifier)
    const description = result.map(toEmoji).join(' ')

    const sign = modifier && modifier > 0
      ? '+'
      : '-'

    reply.setTitle(initialCap(type))
    reply.setColor(colors[type])

    if (modifier) {
      reply.setDescription(`${description} ${sign} ${emoji[Math.abs(modifier)]}`)
    } else {
      reply.setDescription(description)
    }

    return reply
  }
}
