const roll = require('./roller.js')

function seedRandom (values) {
  if (!Array.isArray(values)) { values = [values] }

  const mockMath = Object.create(global.Math)
  mockMath.random = jest.fn()

  values.reduce(
    (fn, value) => fn.mockReturnValueOnce(value),
    mockMath.random
  )

  global.Math = mockMath
}

describe('roller', () => {
  it('should return an array of results', () => {
    seedRandom(0.01)
    expect(roll(1)).toEqual([1])
  })

  it('should default to a single die', () => {
    seedRandom(0.01)
    expect(roll()).toEqual([1])
  })

  it('should roll multiple times, if asked', () => {
    seedRandom([0.05, 0.15])
    expect(roll(2)).toEqual([1, 2])
  })

  it('should reroll 10s', () => {
    seedRandom([0.05, 0.9, 0.05])
    expect(roll(2)).toEqual([1, 10, 1])
  })

  it('should recursively reroll 10s', () => {
    seedRandom([0.9, 0.9, 0.9, 0.9, 0.01])
    expect(roll(1)).toEqual([10, 10, 10, 10, 1])
  })
})
