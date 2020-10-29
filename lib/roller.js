const tens = arr => arr.filter(n => n === 10)
const last = arr => arr[arr.length - 1]

function roll (times = 1, sides = 10) {
  return new Array(times).fill('').map(() => {
    return Math.floor(Math.random() * sides) + 1
  })
}

module.exports.roll = function (count) {
  const results = [roll(count)]

  while (tens(last(results)).length > 0) {
    results.push(roll(tens(last(results)).length))
  }

  return results
}

module.exports.successes = function (nestedArr = [], target = 8) {
  return nestedArr.flat().filter(n => n >= target).count || 0
}
