function roll () {
  const result = Math.floor(Math.random() * 10) + 1
  if (result !== 10) {
    return result
  } else {
    return [result].concat(roll())
  }
}

module.exports = function (number = 1) {
  return new Array(number).fill('').flatMap(() => roll())
}
