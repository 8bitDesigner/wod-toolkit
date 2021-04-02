const fs = require('fs')
const path = require('path')
const Command = require('../../lib/command.js')

const cap = str => str[0].toUpperCase() + str.substring(1)

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

  options = [
    {
      type: 3, // string
      name: 'effect',
      description: 'name of the effect to play',
      required: true,
      choices: Object.keys(effects).map(name => ({name: name, value: name}))
    },
    {
      type: 3, // string
      name: 'modifier',
      description: 'name of the effect to play',
      required: false,
      choices: [{name: 'quietly', value: 'quietly'}]
    }
  ]

  main (member, effect, modifier) {
    if (!member.voice.channel) {
      if (modifier !== 'quietly') {
        return Promise.reject(
          new Error("You're not currently in a voice channel!")
        )
      } else {
        return Promise.resolve()
      }
    }

    return member.voice.channel.join().then(connection => {
      const readStream = fs.createReadStream(effect)
      const dispatcher = connection.play(readStream, {type: 'ogg/opus'})
      dispatcher.on('error', console.error)
    }).catch(err => {
      console.error(err)
    })
  }

  handle (input, message) {
    const [effectName, modifier] = input.split(' ')
    const effect = effects[effectName]

    if (!effect) {
      return message.reply(
        `I don't have a clip named \`${input}\`, I know the following clips:\n${Object.keys(effects).join(', ')}`
      )
    } else {
      return this.main(message.member, effect, modifier)
        .catch(error => message.reply(this.errorToEmbed(error)))
    }
  }

  handleSlash (request) {
    const { effect: effectName, modifier } = request.data
    const effect = effects[effectName]

    const responses = [
      'Got it!',
      'On it',
      'Playing...',
      'You got it dude',
      `${cap(effectName)}ing`,
      `${cap(effectName)}!`
    ]

    const reply = responses[Math.floor(Math.random() * responses.length)]

    return this.main(request.member, effect, modifier)
      .then(() => request.respond(reply).setEphemeral().send())
      .catch(error => request.respond(error.message).setEphemeral().send())
  }
}
