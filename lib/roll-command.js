const { roll, successes } = require('./roller.js')
const format = arr => `[${arr.join(', ')}]`

module.exports.name = 'Roll'
module.exports.description = 'Rolls a number of d10s, rerolling any 10s'
module.exports.usage = `
Usage:
  \`!roll 5\` roll 5 d10, 8s and above are successes
  \`!roll 5 7\` roll 5 d10, 7s and above are successes
`

module.exports.handle = function ([count, target], msg) {
  if (isNaN(parseInt(count, 10))) {
    return msg.reply(`"${count}" is not a number! ${module.exports.usage}`)
  } else {
    count = parseInt(count, 10)
  }

  target = isNaN(parseInt(target, 10)) ? 8 : parseInt(target, 10)

  const results = roll(count, target)

  msg.reply(`\`${results.map(format).join(', ')}\` Result: ${successes(results, target)}`)
}
