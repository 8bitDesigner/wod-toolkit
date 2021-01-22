const { DiceRoller, rollWithRerolls } = require('./roller.js')

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

describe('rollWithRerolls', () => {
  it('should return an array of rollWithRerollss', () => {
    seedRandom(0.01)
    expect(rollWithRerolls(1)).toEqual([[1]])
  })

  it('should default to a single die', () => {
    seedRandom(0.01)
    expect(rollWithRerolls()).toEqual([[1]])
  })

  it('should rollWithRerolls multiple times, if asked', () => {
    seedRandom([0.05, 0.15])
    expect(rollWithRerolls(2)).toEqual([[1, 2]])
  })

  it('should rerollWithRerolls 10s', () => {
    seedRandom([0.05, 0.9, 0.05])
    expect(rollWithRerolls(2)).toEqual([[1, 10], [1]])
  })

  it('should recursively rerollWithRerolls 10s', () => {
    seedRandom([0.9, 0.9, 0.9, 0.9, 0.01])
    expect(rollWithRerolls(1)).toEqual([[10], [10], [10], [10], [1]])
  })
})

describe('DiceRoller', () => {
  it('should interpret a die roll', () => {
    const result = new DiceRoller([[10, 8, 9], [9]])

    expect(result.total()).toEqual(4)
    expect(result.type()).toEqual('Success')
    expect(result.toString()).toEqual('4 hits')
  })

  it('should let you change the target value', () => {
    const result = new DiceRoller([[1, 2, 3, 4]], 3)

    expect(result.total()).toEqual(2)
    expect(result.type()).toEqual('Success')
    expect(result.toString()).toEqual('2 hits')
  })

  it('should call out botches', () => {
    const result = new DiceRoller([[3, 1, 5], [1]])

    expect(result.total()).toEqual(0)
    expect(result.type()).toEqual('Botch')
    expect(result.toString()).toEqual('0 hits')
  })

  it('should add enhancements to successes', () => {
    const result = new DiceRoller([[10, 8, 5], [1]], 8, '++')

    expect(result.total()).toEqual(4)
    expect(result.type()).toEqual('Success')
    expect(result.toString()).toEqual('2 hits + 2 enhancements')
  })

  it('should only add enhancements when there are successes', () => {
    const result = new DiceRoller([[3, 2, 5], [6]], 8, '++')

    expect(result.total()).toEqual(0)
    expect(result.type()).toEqual('Failure')
    expect(result.toString()).toEqual('0 hits')
  })

  it('should decrease neg enhancements from successes', () => {
    const result = new DiceRoller([[10, 1, 5], [1]], 8, '-')

    expect(result.total()).toEqual(0)
    expect(result.type()).toEqual('Failure')
    expect(result.toString()).toEqual('1 hit - 1 enhancement')
  })

  it('should handle both neg enhancements and bonuses', () => {
    const result = new DiceRoller([[10, 1, 5], [9]], 8, '++-')

    expect(result.total()).toEqual(3)
    expect(result.type()).toEqual('Success')
    expect(result.toString()).toEqual('2 hits + 1 enhancement')
  })
})
