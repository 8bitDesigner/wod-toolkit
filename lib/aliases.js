const {hget, hset, hdel, hgetall, keyFor} = require('./redis.js')
const key = msg => keyFor(msg, 'aliases')

module.exports = {
  key (msg) {
    return key(msg)
  },

  create (msg, from, to) {
    if (!to && !from) {
      throw new Error("Need both a source and destination for an alias")
    } else {
      return hset(key(msg), from, to)
    }
  },
  
  destroy (msg, name) {
    return hdel(key(msg), name)
  },

  list (msg) {
    return hgetall(key(msg))
  }
}
