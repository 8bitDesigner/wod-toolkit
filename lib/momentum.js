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

module.exports = function (args = [], msg) {
  const [command, value] = args
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
