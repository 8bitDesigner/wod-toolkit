const fs = require('fs')
const path = require('path')
const Command = require('../../lib/command.js')

const effects = {}
const ext = '.opus'
const assetPath = path.join(__dirname, '..', '..', 'assets', 'effects')

fs.readdirSync(assetPath)
.filter(file => path.extname(file) === ext)
.forEach(file => {
  effects[path.basename(file, ext)] = path.join(assetPath, file)
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
      const dispatcher = connection.play(fs.createReadStream(effect), {type: 'ogg/opus'})
      dispatcher.on('error', console.error);
    }).catch(err => {
      console.error(err)
    })
  }
}
