const { keyFor, hexists, hget, hset, hdel, hgetall } = require('../../lib/redis.js')
const { MessageEmbed } = require('discord.js')
const { blue, red } = require('../../lib/colors.js')

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

class GaugeNotFoundError extends Error {}

class Gauge {
  static keyFor (message) {
    return keyFor(message, 'gauges')
  }

  static find (key, name) {
    return hexists(key, name).then(exists => {
      if (exists) {
        return hget(key, name).then(json => {
          return new Gauge(key, name, JSON.parse(json))
        })
      } else {
        throw new GaugeNotFound(`No gauge found with the name "${name}"`)
      }
    })
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

  add (count = 0) {
    return this.setCompleted(this.attributes.completed + count).save()
  }

  remove (count) {
    return this.setCompleted(this.attributes.completed - count).save()
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

  toEmbed () {
    const reply = new MessageEmbed()
    reply.setTitle(this.name)
    reply.setColor(blue)
    reply.setDescription(this.toString())
    reply.setFooter(`${this.attributes.completed} out of ${this.attributes.segments}`)

    return reply
  }
}

module.exports.Gauge = Gauge
module.exports.GaugeNotFoundError = GaugeNotFoundError
