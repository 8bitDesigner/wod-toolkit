const { MessageEmbed } = require('discord.js')
const { blue, danger, info } = require('./colors.js')
const fs = require('fs')
const path = require('path')

module.exports = class Command {
  name = 'Command Name'
  description = 'Command Description'
  usage = 'Command Usage'
  subcommands = {}

  constructor (router, parent) {
    this.router = router
    this.parent = parent
  }

  mountSubcommandsFrom (directory) {
    fs.readdirSync(directory).forEach(commandFile => {
      const Klass = require(path.join(directory, commandFile))
      const instance = new Klass(this.router, this)
      this.subcommands[instance.name] = instance
    })
  }

  get key () {
    return this.name.toLowerCase().replace(/[^a-z 0-9]/g, '').replace(/[ _]/g, '-')
  }

  get path () {
    if (this.parent) {
      return [this.parent.key, this.key].join(' ')
    } else {
      return this.key
    }
  }

  handle (input, message) {
    const [commandName, ...args] = input.spit(' ')
    const subcommand = this.subcommands[commandName]

    if (input === 'help') {
      msg.reply(this.helpToEmbed())
    } else if (subcommand) {
      return subcommand.handle(args.join(' '), msg)
    } else {
      throw new Error(`No handler specified for \`${input}\``)
    }
  }

  toString () {
    let path

    if (this.parent) {
      path = `${this.parent.name} ${this.name}`
    } else {
      path = this.name
    }

    return `**${path}**: ${this.description}\n${this.usage}`
  }

  helpToEmbed () {
    const reply = new MessageEmbed()
    reply.setTitle('Usage')
    reply.setColor(info)
    reply.setDescription(`${this.description}\n${this.usage}`)

    return reply
  }

  errorToEmbed (error) {
    const reply = new MessageEmbed()
    reply.setTitle(error.name)
    reply.setColor(danger)
    reply.setDescription(error.message)

    return reply
  }

  toSlashCommand () {
    return {
      name: this.name,
      description: this.description,
      options: this.options
    }
  }

  registerGlobally () {
    const userId = this.router.client.user.id

    return this.router.client.api.applications(userId).commands.post({
      data: this.toSlashCommand()
    })
  }

  registerToGuild (guildId) {
    const userId = this.router.client.user.id

    return this.router.client.api.applications(userId).guilds(guildId).commands.post({
      data: this.toSlashCommand()
    })
  }
}
