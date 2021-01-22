const {hget, hset, hdel, hgetall} = require('../../lib/redis.js')

const emoji = {
  filled: ':white_square_button:',
  blank: ':white_large_square:'
}

function clamp (min, val, max) {
  if (val < min) {
    return min
  } else if (val > max) {
    return max
  } else {
    return val
  }
}

class Gauge {
  static find (key, name) {
    return hget(key, name).then(json => (
      new Gauge(key, name, JSON.parse(json)))
    )
  }

  static all (key) {
    return hgetall(key).then(result => {
      if (!result) {
        return []
      } else {
        return Object.entries(result).map(([name, json]) => {
          return new Gauge(key, name, JSON.parse(json))
        })
      }
    })
  }

  static create (key, name, segments) {
    return new Gauge(key, name, {segments}).save()
  }

  static get defaults () {
    return {
      segments: 4,
      completed: 0
    }
  }

  constructor (key, name, attributes) {
    this.key = key
    this.name = name
    this.attributes = Object.assign(Gauge.defaults, attributes)
  }

  save () {
    return hset(this.key, this.name, JSON.stringify(this.attributes)).then(() => {
      return this
    })
  }

  setCompleted (count) {
    const {segments, completed} = this.attributes
    this.attributes.completed = clamp(0, count, segments)
    return this
  }

  set (object = {}) {
    this.attributes = Object.assign(this.attributes, object)
    return this
  }

  delete () {
    return hdel(this.key, this.name)
  }

  toString () {
    const {segments, completed} = this.attributes
    const blank = segments - completed
    const pips = []

    if (completed > 0) {
      pips.push(...(new Array(completed).fill(emoji.filled)))
    }

    if (blank) {
      pips.push(...(new Array(blank).fill(emoji.blank)))
    }

    return pips.join(' ')
  }
}

module.exports.Gauge = Gauge
