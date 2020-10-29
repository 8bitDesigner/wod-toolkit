const { roll, successes } = require('./roller.js')

module.exports = function (value, msg) {
  const count = parseInt(value)
  let results

  if (isNaN(count)) {
    return msg.reply(`"${value}" is not a number!\n  Usage: \`!roll 5\``)
  }

  results = roll(count)
  msg.reply(`\`[${results.join(', ')}]\` Result: ${successes(results)}`)
}
