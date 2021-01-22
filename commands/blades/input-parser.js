const descriptions = require('./descriptions.json')

module.exports.inputParser = function inputParser (command) {
  const segments = command.trim().split(' ')
  let rollType, diceText, diceNum

  if (segments.length === 2) {
    [rollType, diceText] = segments
    rollType = rollType.toLowerCase()
  } else {
    rollType = null
    diceText = segments[0]
  }

  diceNum = parseInt(diceText, 10)

  if (isNaN(diceNum)) {
    throw new Error(`Hmm... I don't know how many dice to roll for "${diceText}"`)
  } else if (rollType != null && !Object.keys(descriptions).includes(rollType)) {
    throw new Error(`Hmm... I don't know how to handle a "${rollType}" roll`)
  } else {
    return {
      type: rollType,
      count: diceNum
    }
  }
}
