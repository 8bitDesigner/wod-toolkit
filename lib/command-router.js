const {list: listAliases} = require('./aliases.js')

module.exports = class CommandRouter {
  prefix = null
  commands = {}

  constructor ({prefix}) {
    this.prefix = prefix
  }

  shouldHandle (message) {
    return (!message.author.bot && message.content.startsWith(this.prefix))
  }

  addCommand (Klass) {
    const instance = new Klass(this)
    this.commands[instance.key] = instance
  }

  find (command) {
    return this.commands[command]
  }
  
  route (message, text) {
    // Allow overriding this for internal routing, but default to the message body
    if (!text) {
      text = message.content.slice(this.prefix.length)
    }

    const [commandName, ...args] = text.split(' ')
    let handler

    if (commandName === 'help') {
      handler = this.commands[args[0]]
    } else {
      handler = this.find(commandName)
    }

    if (commandName === 'help') {
      return this.help(handler, message)
    } else if (handler) {
      return handler.handle(args.join(' '), message)
    } else {
      this.findAlias(commandName, message).then(result => {
        if (result) {
          this.route(message, [result, ...args].join(' '))
        } else {
          return this.help(null, message)
        }
      })
    }
  }

  findAlias (command, message) {
    return listAliases(message)
      .then(aliases => aliases[command])
      .catch(err => message.reply(err.message))
  }

  help (command, message) {
    if (command && command.usage) {
      message.reply(command.toString())
    } else {
      const response = ['I know the following commands:\n']

      if (command) {
        response.unshift(`I'm afraid I don't know how to \`${command}\`.`)
      }

      Object.values(this.commands).forEach(cmd => {
        response.push(`- **${cmd.name}**: ${cmd.description}`)
      })

      message.reply(response.concat(`\nUse \`${this.prefix}[command]\` to learn more.`).join('\n'))
    }
  }
}
