const Command = require('../../lib/command.js')
const effects = require('../../lib/sound.js')

const cap = str => str[0].toUpperCase() + str.substring(1)

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
    }
  ]

  main (member, effectName, modifier) {
    const effect = effects[effectName]

    if (!effect) {
      return Promise.reject(
        new Error(
          `I don't have a clip named \`${input}\`, I know the following clips:\n` +
          Object.keys(effects).join(', ')
        )
      )
    } else {
      return effect.playTo(member)
    }
  }

  handle (input, message) {
    const effectName = input

    return this.main(message.member, effectName, modifier)
      .catch(error => message.reply(error))
  }

  handleSlash (request, response) {
    const { effect: effectName, modifier } = request.data

    const responses = [
      'Got it!',
      'On it',
      'Playing...',
      'You got it dude',
      `${cap(effectName)}ing`,
      `${cap(effectName)}!`
    ]

    const reply = responses[Math.floor(Math.random() * responses.length)]

    return this.main(request.member, effectName, modifier)
      .then(() => response.setContent(reply).setEphemeral().send())
      .catch(error => response.setContent(error.message).setEphemeral().send())
  }
}
