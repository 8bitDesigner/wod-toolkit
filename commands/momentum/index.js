const Command = require('../../lib/command.js')
const promisify = require('util').promisify
const redis = require('redis').createClient(process.env.REDIS_URL)

const [get, set, incrby, decrby] = ['get', 'set', 'incrby', 'decrby'].map(func => {
  return promisify(redis[func].bind(redis))
})

module.exports = class MomentumCommand extends Command {
  name = 'Momentum'
  description = 'Tracks the party\'s momentum across sessions'
  usage = `
Usage:
  \`!momentum\` show current momentum
  \`!momentum add 1\` add 1 to the current set
  \`!momentum use 2\` remove 2 from the current momentum
  \`!momentum set 1\` replace the current momentum with 1
  \`!momentum reset\` reset momentum to 0
`

  handle (input, msg) {
    const key = [msg.guild.id, msg.guild.systemChannelID, 'momentum'].join(':')
    const [command, value] = input.split(' ')
    const int = parseInt(value)

    let promise

    if (!command) {
      promise = this.get(key)
    } else if (command === 'set') {
      promise = this.set(key, int)
    } else if (command === 'add') {
      promise = this.incr(key, int)
    } else if (['use', 'remove'].includes(command)) {
      promise = this.decr(key, int)
    } else if (command === 'reset') {
      promise = this.reset(key)
    }

    if (!promise) return

    promise
    .then(result => msg.reply(result))
    .catch(err => msg.reply(`ERROR: ${err}`))
  }

  get (key) {
    return get(key).then(res => res || 0)
  }

  set (key, val) {
    return set(key, val).then(() => get(key))
  }

  incr (key, by) {
    return incrby(key, by)
  }

  decr (key, by) {
    return decrby(key, by)
  }

  reset (key) {
    return set(key, 0).then(() => get(key))
  }
}
