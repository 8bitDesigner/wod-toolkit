const promisify = require('util').promisify
const redis = require('redis').createClient(process.env.REDIS_URL)

const [get, set, incrby, decrby] = ['get', 'set', 'incrby', 'decrby'].map(func => {
  return promisify(redis[func].bind(redis))
})

class Momentum {
  constructor (msg) {
    this.key = [
      msg.guild.id,
      msg.guild.systemChannelID,
      'momentum'
    ].join(':')
  }

  get () {
    return get(this.key).then(res => res || 0)
  }

  set (val) {
    return set(this.key, val).then(() => get(this.key))
  }

  incr (by) {
    return incrby(this.key, by)
  }

  decr (by) {
    return decrby(this.key, by)
  }

  reset () {
    return set(this.key, 0).then(() => get(this.key))
  }
}

module.exports.name = 'Momentum'
module.exports.description = 'Tracks the party\'s momentum across sessions'
module.exports.usage = `
Usage:
  \`!momentum\` show current momentum
  \`!momentum add 1\` add 1 to the current set
  \`!momentum use 2\` remove 2 from the current momentum
  \`!momentum set 1\` replace the current momentum with 1
  \`!momentum reset\` reset momentum to 0
`

module.exports.handle = function (input, msg) {
  const [command, value] = input.split(' ')
  const int = parseInt(value)
  const field = new Momentum(msg)

  let promise

  if (!command) {
    promise = field.get()
  } else if (command === 'set') {
    promise = field.set(int)
  } else if (command === 'add') {
    promise = field.incr(int)
  } else if (['use', 'remove'].includes(command)) {
    promise = field.decr(int)
  } else if (command === 'reset') {
    promise = field.reset()
  }

  if (!promise) return

  promise
  .then(result => msg.reply(result))
  .catch(err => msg.reply(`ERROR: ${err}`))
}
