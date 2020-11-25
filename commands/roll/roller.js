const tens = arr => arr.filter(n => n === 10)
const last = arr => arr[arr.length - 1]
const countLetter = (letter, str) => str.split('').filter(l => l === letter).length
const countNumber = (num, array) => array.filter(n => n >= num).length
const pluralize = (string, num) => num > 1 ? `${string}s` : string

function rollDie (times = 1, sides = 10) {
  return new Array(times).fill('').map(() => {
    return Math.floor(Math.random() * sides) + 1
  })
}

function rollWithRerolls (count) {
  const results = [rollDie(count)]

  while (tens(last(results)).length > 0) {
    results.push(rollDie(tens(last(results)).length))
  }

  return results
}

class DiceRoller {
  static roll ({ count, target, enhancements }) {
    return new DiceRoller(rollWithRerolls(count), target, enhancements)
  }

  constructor (rolls = [], target = 8, enhancements = '') {
    this.rolls = rolls
    this.hits = countNumber(target, this.rolls.flat())
    this.negHits = countLetter('-', enhancements)
    this.bonusHits = countLetter('+', enhancements)
    this.ones = countNumber(1, this.rolls.flat())
  }

  isSuccess () {
    return this.hits - this.negHits
  }

  total () {
    const subtotal = this.hits - this.negHits

    if (subtotal > 0) {
      return subtotal + this.bonusHits
    } else {
      return subtotal
    }
  }

  type () {
    if (this.total() > 0) {
      return 'Success'
    } else if (this.ones.length > 0) {
      return 'Botch'
    } else {
      return 'Failure'
    }
  }

  toString () {
    const subtotal = this.hits - this.negHits
    const netEnhancements = this.negHits + this.bonusHits
    const hitString = this.hits + pluralize(' hit', this.hits)

    if (netEnhancements === 0) {
      return hitString
    } else if (subtotal < 1) {
      return [
        hitString,
        '-',
        this.negHits,
        pluralize('enhancement', this.negHits)
      ].join(' ')
    } else {
      return [
        hitString,
        netEnhancements > 0 ? '+' : '-',
        netEnhancements,
        pluralize('enhancement', netEnhancements)
      ].join(' ')
    }
  }
}

module.exports = {
  rollDie,
  rollWithRerolls,
  DiceRoller
}
