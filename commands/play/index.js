const fs = require('fs')
const path = require('path')
const Command = require('../../lib/command.js')
const effects = {}
const ext = '.opus'

fs.readdirSync(path.join(__dirname, 'effects'))
.filter(file => path.extname(file) === ext)
.forEach(file => {
  effects[path.basename(file, ext)] = path.join(__dirname, 'effects', file)
})

module.exports = class PlayCommand extends Command {
  name = 'Play'
  description = 'Play a sound effect in the current voice channel'
  usage = `
Usage:
\`play [effect name]\``

  handle (input, message) {
    const effect = effects[input]

    if (!message.member.voice.channel) {
      return message.reply("You're not currently in a voice channel!")
    }

    if (!effect) {
      return message.reply(`I don't have a clip named \`${input}\`, I know the following clips:\n${Object.keys(effects).join(', ')}`)
    }

    message.member.voice.channel.join().then(connection => {
      const dispatcher = connection.play(effect)
      dispatcher.on('error', console.error);
    }).catch(err => {
      console.error(err)
    })
  }
}
