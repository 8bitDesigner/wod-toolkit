const roll = require('./roller.js')

module.exports = function (value, msg) {
  const count = parseInt(value)
  let result, response, success

  if (isNaN(count)) {
    return msg.reply(`"${value}" is not a number!\n  Usage: \`!roll 5\``)
  }

  result = roll(count)
  success = result.filter(n => n > 8)

  response = `[${result.join(', ')}]`

  if (success.count > 0) {
    response += ` ${success.count} successes`
  }

  msg.reply(response)
}
