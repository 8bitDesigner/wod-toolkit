const roll = require('../../lib/roll.js')

function rollWithContext (num) {
  const isDesperate = num < 1
  const rolls = roll(isDesperate ? 2 : num).sort().reverse()
  const key = isDesperate ? Math.min(...rolls) : Math.max(...rolls)
  const sixes = rolls.filter(n => n === 6)

  if (sixes.length > 1 && isDesperate === false) {
    return {rolls, type: 'critical'}
  } else if (key === 6) {
    return {rolls, type: 'success'}
  } else if ([5, 4].includes(key)) {
    return {rolls, type: 'partial'}
  } else {
    return {rolls, type: 'failure'}
  }
}

module.exports = {
  roll,
  rollWithContext
}
