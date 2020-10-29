const { roll, successes } = require('./roller.js')
const format = arr => `[${arr.join(', ')}]`
const usage = `
Usage:
  \`!roll 5\` roll 5 d10, 8s and above are successes
  \`!roll 5 7\` roll 5 d10, 7s and above are successes
`

module.exports = function (value, msg) {
  const commands = value.split(' ').map(val => parseInt(val))
  const count = commands[0]
  const target = isNaN(commands[1]) ? 8 : commands[1]

  if (isNaN(count)) {
    return msg.reply(`"${value}" is not a number! ${usage}`)
  }

  const results = roll(count, target)

  msg.reply(`\`${results.map(format).join(', ')}\` Result: ${successes(results)}`)
}
