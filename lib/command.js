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
}
