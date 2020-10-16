const roll = require('./roller.js')

module.exports = function (value, msg) {
  const count = parseInt(value)
  let result, success

  if (isNaN(count)) {
    return msg.reply(`"${value}" is not a number!\n  Usage: \`!roll 5\``)
  }

  result = roll(count)
  success = result.filter(n => n > 7)
  msg.reply(`\`[${result.join(', ')}]\` Result: ${success.length}`)
}
