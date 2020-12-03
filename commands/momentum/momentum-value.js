const redis = require('redis').createClient(process.env.REDIS_URL)
const promisify = require('util').promisify

const [get, set] = ['get', 'set'].map(func => {
  return promisify(redis[func].bind(redis))
})

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

module.exports = class MomentumValue {
  current = 0
  max = 6

  static find (key) {
    return get(key).then(({current = 0, max = 6}) => (
      new MomentumValue(key, current, max))
    )
  }

  constructor (key, current, max) {
    this.key = key
    this.current = current
    this.max = max
  }

  set (val) {
    this.current = val
    return set(this.key, this.toJSON()).then(() => this)
  }

  add (amount) {
    const newAmount = clamp(0, this.current + amount, this.max)
    return this.set(newAmount)
  }

  use (amount) {
    const newAmount = clamp(0, this.current - amount, this.max)
    return this.set(newAmount)
  }

  reset () {
    return this.set(0)
  }

  toJSON () {
    return JSON.stringify({
      current: this.current,
      max: this.max
    })
  }

  toString () {
    const blank = this.max - this.current
    const pips = []

    if (this.current) {
      pips.push(...(new Array(this.current).fill(emoji.filled)))
    }

    if (blank) {
      pips.push(...(new Array(blank).fill(emoji.blank)))
    }

    return pips.join(' ')
  }
}
