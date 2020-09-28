const roll = require('./roller.js')
const prefix = '!'

module.exports = function (msg) {
  if (msg.author.bot) return
  if (!msg.content.startsWith(prefix)) return

  const [command, value] = msg.content.split(' ')
  const count = parseInt(value)

  if (command && command === '!roll') {
    if (isNaN(count)) {
      msg.reply(`"${value}" is not a number!\n  Usage: \`!roll 5\``)
    } else {
      msg.reply(`[${roll(count).join(', ')}]`)
    }
  }
}
