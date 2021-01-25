const { MessageEmbed } = require('discord.js')
const { blue, danger, info } = require('./colors.js')

module.exports = class Command {
  name = 'Command Name'
  description = 'Command Description'
  usage = 'Command Usage'

  constructor (router) {
    this.router = router
  }

  get key () {
    return this.name.toLowerCase().replace(/[^a-z 0-9]/g, '').replace(/[ _]/g, '-')
  }

  handle (input, message) {
    throw new Error(`No handler specified for \`${input}\``)
  }

  toString () {
    return `**${this.name}**: ${this.description}\n${this.usage}`
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

    console.log(error)
    return reply
  }
}
