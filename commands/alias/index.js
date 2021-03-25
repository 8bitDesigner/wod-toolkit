const Command = require('../../lib/command.js')
const {create, destroy, list} = require('../../lib/aliases.js')

module.exports = class PlayCommand extends Command {
  name = 'alias'
  description = 'Create command aliases and shortcuts'
  usage = `
Usage:
\`alias [name] [command text]\` create an alias with \`[name]\` to run \`[command text]\`
\`alias "yay" "play yay"\`
\`alias delete [name]\` delete the aliase with the name \`[name]\`
\`alias list\` list all aliases`

  handle (input, msg) {
    const words = input.split(' ')
    const subcommand = words.shift()

    if (subcommand === 'delete') {
      this.handleDel(words[0], msg)
    } else if (subcommand === 'list' || input.length === 0) {
      this.handleList(msg)
    } else {
      this.handleCreate(input, msg)
    }
  }

  handleDel (name, msg) {
    destroy(msg, name)
      .then(result => msg.reply(`Deleted the alias \`${name}\``))
      .catch(err => msg.reply(err.message))
  }

  handleList (msg) {
    list(msg).then(aliases => {
      if (aliases) {
        const strings = Object.entries(aliases).map(([name, command]) => {
          return `\`${name}\` runs the command \`${command}\``
        })

        msg.reply(`This channel has the following aliases:\n${strings.join('\n')}`)
      } else {
        msg.reply('There are no aliases defined in this channel')
      }
    }).catch(err => {
      msg.reply(err.message)
    })
  }

  handleCreate (input, msg) {
    const groups = [...input.matchAll(/"([^"]+)"/g)]

    if (groups.length === 2) {
      create(msg, groups[0][1], groups[1][1])
        .then(result => this.handleList(msg))
        .catch(err => msg.reply(err.message))
    } else {
      msg.reply(`I couldn\'t find a pair of quoted strings in \`${input}\``)
    }
  }
}

