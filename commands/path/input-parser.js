const parser = /(?<count>\d+)(?<enhancements>[+-]+)?(?<target> \d+)?/

module.exports.InputParser = class InputParser {
  static parse (string) {
    const match = string.match(parser)
    let count, target, enhancements

    if (!match) {
      throw new Error(`Could not parse input: \`${string}\``)
    } else if (isNaN(parseInt(match.groups.count, 10))) {
      throw new Error(`${match.groups.count}" is not a number! ${module.exports.usage}`)
    }

    count = parseInt(match.groups.count, 10)

    if (match.groups.target && !isNaN(parseInt(match.groups.target, 10))) {
      target = parseInt(match.groups.target, 10)
    }

    if (match.groups.enhancements) {
      enhancements = match.groups.enhancements
    }

    return new InputParser(count, target, enhancements)
  }

  constructor (count = 0, target = 8, enhancements = '') {
    this.count = count
    this.target = target
    this.enhancements = enhancements
  }
}
