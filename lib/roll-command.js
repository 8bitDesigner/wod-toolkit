const { roll, successes } = require('./roller.js')
const format = arr => `[${arr.join(', ')}]`

module.exports.name = 'Roll'
module.exports.description = 'Rolls a number of d10s, rerolling any 10s'
module.exports.usage = `
Usage:
  \`!roll 5\` roll 5 d10, 8s and above are successes
  \`!roll 5 7\` roll 5 d10, 7s and above are successes
`

module.exports.handle = function (value = [], msg) {
  let [count, target] = value.map(val => parseInt(val, 10))

  if (isNaN(target)) {
    target = 8
  }

  if (isNaN(count)) {
    return msg.reply(`"${value}" is not a number! ${module.exports.usage}`)
  }

  const results = roll(count, target)

  msg.reply(`\`${results.map(format).join(', ')}\` Result: ${successes(results)}`)
}
