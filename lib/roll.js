module.exports = function roll (num, sides = 6) {
  return new Array(num).fill('').map(() => Math.floor(Math.random() * sides) + 1)
}
