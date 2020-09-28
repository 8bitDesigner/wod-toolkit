const roll = require('./roller.js')

module.exports = function (value, msg) {
  const count = parseInt(value)

  if (isNaN(count)) {
    msg.reply(`"${value}" is not a number!\n  Usage: \`!roll 5\``)
  } else {
    msg.reply(`[${roll(count).join(', ')}]`)
  }
}
