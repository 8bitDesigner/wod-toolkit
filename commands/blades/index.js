const Command = require('../../lib/command.js')
const { MessageEmbed } = require('discord.js')
const { inputParser } = require('./input-parser.js')
const descriptions = require('./descriptions.json')
const { rollWithContext } = require('./roller.js')
const { red, blue, orange, green } = require('../../lib/colors.js')
const { roll: rollEffect, yay: yayEffect } = require('../../lib/sound.js')
const noop = () => {}

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

  options = [
    {
      type: 4, // integer
      name: 'count',
      description: 'number of dice to roll',
      required: true
    },
    {
      type: 3, // integer
      name: 'type',
      description: 'type of roll to perform',
      required: false,
      choices: [
        {name: 'controlled', value: 'controlled'},
        {name: 'risky', value: 'risky'},
        {name: 'desperate', value: 'desperate'},
        {name: 'fortune', value: 'fortune'}
      ]
    }
  ]

  handle (input, message) {
    let parsedInput, result

    try {
      parsedInput = inputParser(input)
      result = rollWithContext(parsedInput.count)
      message.reply(this.resultToEmbed(result, parsedInput.type))

      rollEffect.playTo(message.member).catch(noop)

      if (result.type === 'critical') {
        setTimeout(() => yayEffect.playTo(message.member).catch(noop), 400)
      }
    } catch (e) {
      return message.reply(this.errorToEmbed(e))
    }
  }

  handleSlash (request, response) {
    const { count, type } = request.data
    const result = rollWithContext(count)

    rollEffect.playTo(request.member).catch(noop)

    if (result.type === 'critical') {
      setTimeout(() => yayEffect.playTo(request.member).catch(noop), 400)
    }

    return response.addEmbed(this.resultToEmbed(result, type)).send()
  }

  resultToEmbed (result, type) {
    const reply = new MessageEmbed()

    reply.setTitle(initialCap(result.type))
    reply.setColor(colors[result.type])
    reply.setDescription(result.rolls.map(toEmoji).join(' '))

    if (type) {
      reply.setFooter(descriptions[type][result.type])
    }

    return reply
  }
}
